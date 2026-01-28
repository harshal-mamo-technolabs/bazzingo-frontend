import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import BazzingoLoader from "../components/Loading/BazzingoLoader";
import AssessmentGrid from '../components/assessments/AssessmentGrid';
import RecentAssessments from '../components/assessments/RecentAssessments';
import AssessmentCompletionModal from '../components/assessments/AssessmentCompletionModal.jsx';
import AssessmentPurchaseModal from '../components/assessments/AssessmentPurchaseModal.jsx';
import AssessmentStripeElementsModal from '../components/assessments/AssessmentStripeElementsModal.jsx';
import AssessmentStartConfirmationModal from '../components/assessments/AssessmentStartConfirmationModal.jsx';
// import { getAllAssessment } from '../services/dashbaordService'; // Import the API function
import { getAllAssessment ,getRecentAssessmentActivity } from '../services/dashbaordService';
import { isAssessmentPaymentEnabled } from '../config/accessControl';
import TranslatedText from '../components/TranslatedText.jsx';

const Assessments = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [processingAssessmentId, setProcessingAssessmentId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isStripeElementsModalOpen, setIsStripeElementsModalOpen] = useState(false);
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

    const handlePurchaseAssessment = () => {
        // Close the info modal and open Stripe Elements payment modal
        setIsPurchaseModalOpen(false);
        setIsStripeElementsModalOpen(true);
    };

    const handleClosePurchaseModal = () => {
        setIsPurchaseModalOpen(false);
        setSelectedAssessmentForPurchase(null);
    };

    const handleCloseStripeElementsModal = () => {
        setIsStripeElementsModalOpen(false);
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
                
                // Find the assessment in the list
                let targetAssessment = assessmentsList.find(
                    assessment => assessment._id === autoStartAssessmentId || assessment.id === autoStartAssessmentId
                );
                
                // If not found in list, fetch assessment details from API
                if (!targetAssessment) {
                    targetAssessment = await fetchAssessmentById(autoStartAssessmentId);
                }
                
                if (targetAssessment) {
                    
                    // Clear the stored ID so it doesn't auto-start again
                    localStorage.removeItem('autoStartAssessmentId');
                    
                    // Always assume purchased since user just completed payment
                    // Auto-open the confirmation modal
                    setTimeout(() => {
                        setSelectedAssessmentForConfirmation(targetAssessment);
                        setIsConfirmationModalOpen(true);
                    }, 1000); // Small delay to ensure UI is ready
                } else {
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
                    isProcessing={false}
                />

                <AssessmentStripeElementsModal
                    isOpen={isStripeElementsModalOpen}
                    assessment={selectedAssessmentForPurchase}
                    onClose={handleCloseStripeElementsModal}
                    onSuccess={(data) => {
                        // Modal will handle redirect to success page
                    }}
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