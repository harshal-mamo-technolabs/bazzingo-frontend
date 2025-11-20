import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import BazzingoLoader from "../components/Loading/BazzingoLoader";
import AssessmentGrid from '../components/assessments/AssessmentGrid';
import RecentAssessments from '../components/assessments/RecentAssessments';
import AssessmentCompletionModal from '../components/assessments/AssessmentCompletionModal.jsx';
import AssessmentPurchaseModal from '../components/assessments/AssessmentPurchaseModal.jsx';
import AssessmentStartConfirmationModal from '../components/assessments/AssessmentStartConfirmationModal.jsx';
// import { getAllAssessment } from '../services/dashbaordService'; // Import the API function
import { getAllAssessment ,getRecentAssessmentActivity } from '../services/dashbaordService';
import { API_CONNECTION_HOST_URL } from '../utils/constant';
import { loadStripe } from '@stripe/stripe-js';
import { isAssessmentPaymentEnabled } from '../config/accessControl';
import TranslatedText from '../components/TranslatedText.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Assessments = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [processingAssessmentId, setProcessingAssessmentId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedAssessmentForPurchase, setSelectedAssessmentForPurchase] = useState(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [selectedAssessmentForConfirmation, setSelectedAssessmentForConfirmation] = useState(null);
    const assessmentPaymentsEnabled = isAssessmentPaymentEnabled();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                setLoading(true);
                const response = await getAllAssessment();
                // Expecting: { data: { items: [...] } }
                const items = response?.data?.items || [];
                setAssessments(items);
                
                // Check for auto-start assessment after assessments are loaded
                await checkAutoStartAssessment(items);
            } catch (error) {
                console.error("Error fetching assessments:", error);
                // Keep the empty array if API fails
                setAssessments([]);
            } finally {
                setLoading(false);
            }
        };

        const fetchRecent = async () => {
            try {
                const res = await getRecentAssessmentActivity();
                const scores = (res?.data?.scores || [])
                  .slice()
                  .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                const mapped = scores.slice(0, 2).map((s, idx) => ({
                    id: idx,
                    // map to RecentAssessmentCard props
                    title: s.assessmentName || 'Assessment',
                    status: s.type === 'quick' ? 'Quick' : 'Completed',
                    score: s.totalScore ?? 0,
                    type: s.type === 'quick' ? 'car' : 'message',
                }));
                setRecentActivity(mapped);
            } catch (e) {
                setRecentActivity([]);
            }
        };

        fetchAssessments();
        fetchRecent();
    }, []);

    const startAssessmentNavigation = (assessment) => {
        setSelectedAssessment(assessment);
        navigate('/assessments/visual-reasoning', {
            state: { assessmentId: assessment._id }
        });
    };

    const handleAssessmentClick = (assessment) => {
        startAssessmentNavigation(assessment);
    };

    const handleDirectStart = async (assessment) => {
        const id = assessment?._id || assessment?.id;
        if (!id) return;
        setProcessingAssessmentId(id);
        try {
            startAssessmentNavigation(assessment);
        } finally {
            // In case navigation is blocked, clear after a short delay
            setTimeout(() => setProcessingAssessmentId(null), 2000);
        }
    };

    const handleStartCertifiedTest = async (assessment) => {
        // When payment flow is disabled from accessControl,
        // we still want the "start test" confirmation modal
        // for already-purchased assessments, but skip any
        // purchase / Stripe flow for unpaid ones.
        if (!assessmentPaymentsEnabled) {
            if (assessment?.isAssessmentPurchased) {
                setSelectedAssessmentForConfirmation(assessment);
                setIsConfirmationModalOpen(true);
            } else {
                handleDirectStart(assessment);
            }
            return;
        }

        // If already purchased, show confirmation modal
        if (assessment?.isAssessmentPurchased) {
            setSelectedAssessmentForConfirmation(assessment);
            setIsConfirmationModalOpen(true);
            return;
        }

        // If not purchased, show purchase modal
        setSelectedAssessmentForPurchase(assessment);
        setIsPurchaseModalOpen(true);
    };

    const handlePurchaseAssessment = async () => {
        const assessment = selectedAssessmentForPurchase;
        if (!assessment) return;

        const id = assessment?._id || assessment?.id;
        if (!id) return;
        setProcessingAssessmentId(id);

        // Mirror the flow from AssessmentPaymentDemo, but get token from storage and URLs from current origin
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const successUrl = `${origin}/payment/success`;
        const cancelUrl = `${origin}/payment/cancel`;

        let token = '';
        try {
            const raw = localStorage.getItem('user');
            if (raw) {
                const stored = JSON.parse(raw);
                token = stored?.accessToken || stored?.user?.token || '';
            }
        } catch {}

        const assessmentId = id;
        if (!token || !assessmentId) {
            console.error('Missing token or assessmentId for checkout');
            setProcessingAssessmentId(null);
            return;
        }

        try {
            const res = await fetch(`${API_CONNECTION_HOST_URL}/stripe/checkout/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ assessmentId, successUrl, cancelUrl }),
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`);

            const resp = payload?.data;

            // A) Checkout fallback -> redirect
            if (resp?.url) {
                window.location.href = resp.url;
                return;
            }

            // B) One-click succeeded / processing
            if (resp?.orderId && (resp.status === 'succeeded' || resp.status === 'processing')) {
                window.location.href = `${successUrl}?order_id=${encodeURIComponent(resp.orderId)}`;
                return;
            }

            // C) One-click requires 3DS — MUST pass payment_method
            if (resp?.requiresAction && resp?.clientSecret) {
                const stripe = await stripePromise;
                if (!stripe) throw new Error('Stripe not loaded');
                if (!resp.paymentMethodId) {
                    throw new Error('Missing payment method for 3DS confirmation. Please retry the payment.');
                }
                const result = await stripe.confirmCardPayment(resp.clientSecret, {
                    payment_method: resp.paymentMethodId,
                });
                if (result.error) throw new Error(result.error.message || 'Authentication failed. Please try again.');
                window.location.href = `${successUrl}?order_id=${encodeURIComponent(resp.orderId)}`;
                return;
            }

            throw new Error('Unexpected response from server.');
        } catch (err) {
            console.error('[Assessment Checkout] Error:', err);
        } finally {
            setProcessingAssessmentId(null);
        }
    };

    const handleClosePurchaseModal = () => {
        setIsPurchaseModalOpen(false);
        setSelectedAssessmentForPurchase(null);
    };

    const handleConfirmStartAssessment = () => {
        const assessment = selectedAssessmentForConfirmation;
        if (assessment) {
            handleDirectStart(assessment);
        }
        setIsConfirmationModalOpen(false);
        setSelectedAssessmentForConfirmation(null);
    };

    const handleCloseConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
        setSelectedAssessmentForConfirmation(null);
    };

    // Check for auto-start assessment from payment success
    const checkAutoStartAssessment = async (assessmentsList) => {
        try {
            const autoStartAssessmentId = localStorage.getItem('autoStartAssessmentId');
            if (autoStartAssessmentId) {
                console.log('🎯 [AUTO-START] Found assessment ID to auto-start:', autoStartAssessmentId);
                
                // Find the assessment in the list
                let targetAssessment = assessmentsList.find(
                    assessment => assessment._id === autoStartAssessmentId || assessment.id === autoStartAssessmentId
                );
                
                // If not found in list, fetch assessment details from API
                if (!targetAssessment) {
                    console.log('🔍 [AUTO-START] Assessment not in list, fetching from API...');
                    targetAssessment = await fetchAssessmentById(autoStartAssessmentId);
                }
                
                if (targetAssessment) {
                    console.log('✅ [AUTO-START] Found target assessment:', targetAssessment);
                    
                    // Clear the stored ID so it doesn't auto-start again
                    localStorage.removeItem('autoStartAssessmentId');
                    
                    // Always assume purchased since user just completed payment
                    // Auto-open the confirmation modal
                    setTimeout(() => {
                        setSelectedAssessmentForConfirmation(targetAssessment);
                        setIsConfirmationModalOpen(true);
                    }, 1000); // Small delay to ensure UI is ready
                } else {
                    console.log('❌ [AUTO-START] Assessment not found anywhere');
                    // Clear the stored ID if assessment not found
                    localStorage.removeItem('autoStartAssessmentId');
                }
            }
        } catch (error) {
            console.error('❌ [AUTO-START] Error checking auto-start assessment:', error);
            // Clear the stored ID on error
            localStorage.removeItem('autoStartAssessmentId');
        }
    };

    // Fetch assessment by ID from API
    const fetchAssessmentById = async (assessmentId) => {
        try {
            const userData = localStorage.getItem("user");
            if (!userData) return null;

            const parsedUserData = JSON.parse(userData);
            const token = parsedUserData?.accessToken;
            if (!token) return null;

            const response = await fetch(`${API_CONNECTION_HOST_URL}/assessment/${assessmentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch assessment:', response.status);
                return null;
            }

            const data = await response.json();
            console.log('📋 [AUTO-START] Fetched assessment from API:', data);

            // Return assessment in expected format
            if (data.status === 'success' && data.data) {
                return {
                    _id: data.data._id || assessmentId,
                    id: data.data.id || assessmentId,
                    title: data.data.title || 'Assessment',
                    description: data.data.description || 'No description available',
                    questions: data.data.questions || 0,
                    isAssessmentPurchased: true, // Assume purchased since user just paid
                    isAvailCertification: data.data.isAvailCertification || false,
                    isAvailReport: data.data.isAvailReport || false
                };
            }

            return null;
        } catch (error) {
            console.error('❌ [AUTO-START] Error fetching assessment by ID:', error);
            return null;
        }
    };

    // Show loading state if needed
    if (loading) {
        return (
            <MainLayout>
                <div style={{fontFamily: 'Roboto, sans-serif', fontSize: '12px'}}>
                    <div className="mx-auto px-4 lg:px-12 py-4 lg:py-8">
                        <div className="p-6">
                            <BazzingoLoader message={<TranslatedText text="Loading assessments..." />} />
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div style={{fontFamily: 'Roboto, sans-serif', fontSize: '12px'}}>
                {/* Main Content */}
                <div className="mx-auto px-4 lg:px-12 py-4 lg:py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Section - Assessments */}
                        <div className="flex-1">
                            <AssessmentGrid
                                assessments={assessments}
                                onAssessmentClick={handleAssessmentClick}
                                onStartCertifiedTest={handleStartCertifiedTest}
                                processingAssessmentId={processingAssessmentId}
                            />
                        </div>

                        {/* Right Section - Recent Assessments - Hidden on mobile */}
                        <div className="hidden lg:block w-full lg:w-[340px]">
                            <RecentAssessments assessments={recentActivity}/>
                        </div>
                    </div>
                </div>

                <AssessmentCompletionModal
                    isOpen={isModalOpen}
                    selectedAssessment={selectedAssessment}
                    onClose={() => setIsModalOpen(false)}
                />

                <AssessmentPurchaseModal
                    isOpen={isPurchaseModalOpen}
                    assessment={selectedAssessmentForPurchase}
                    onClose={handleClosePurchaseModal}
                    onBuy={handlePurchaseAssessment}
                    isProcessing={processingAssessmentId === (selectedAssessmentForPurchase?._id || selectedAssessmentForPurchase?.id)}
                />

                <AssessmentStartConfirmationModal
                    isOpen={isConfirmationModalOpen}
                    assessment={selectedAssessmentForConfirmation}
                    onClose={handleCloseConfirmationModal}
                    onConfirm={handleConfirmStartAssessment}
                    isProcessing={processingAssessmentId === (selectedAssessmentForConfirmation?._id || selectedAssessmentForConfirmation?.id)}
                />
            </div>
        </MainLayout>
    );
};

export default Assessments;