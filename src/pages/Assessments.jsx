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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                setLoading(true);
                const response = await getAllAssessment();
                // Expecting: { data: { items: [...] } }
                const items = response?.data?.items || [];
                setAssessments(items);
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

    // Show loading state if needed
    if (loading) {
        return (
            <MainLayout>
                <div style={{fontFamily: 'Roboto, sans-serif', fontSize: '12px'}}>
                    <div className="mx-auto px-4 lg:px-12 py-4 lg:py-8">
                        <div className="p-6">
                            <BazzingoLoader message="Loading assessments..." />
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