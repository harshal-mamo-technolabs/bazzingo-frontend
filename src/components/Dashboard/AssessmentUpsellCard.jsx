import React, { useState, useEffect } from 'react';
import {MedalIcon} from "../../utils/dashboard-image.js";
import { getDailyAssessmentRecommendation } from '../../services/dashbaordService';
import AssessmentStripeElementsModal from '../assessments/AssessmentStripeElementsModal';

export default function AssessmentUpsellCard() {
    const [assessmentData, setAssessmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

    useEffect(() => {
        const fetchAssessmentData = async () => {
            try {
                setLoading(true);
                const response = await getDailyAssessmentRecommendation();
                setAssessmentData(response.data);
                setError(null);
            } catch (err) {
                console.error("❌ Failed to fetch assessment recommendation:", err);
                console.error("❌ Error details:", {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data
                });
                setError("Failed to load assessment data");
            } finally {
                setLoading(false);
            }
        };

        fetchAssessmentData();
    }, []);

    // Calculate actual price from unitAmount (smallest currency unit)
    const getActualPrice = (unitAmount, currency) => {
        const amount = unitAmount / 100; // Convert from cents to main currency unit
        return `${currency === 'EUR' ? '€' : currency}${amount.toFixed(2)}`;
    };

    // Generate dynamic description based on available features
    const getDescription = (isAvailReport, isAvailCertification) => {
        if (isAvailReport && isAvailCertification) {
            return "Please try this test to get detailed analysed report to know better your performance and the certificate to share";
        } else if (isAvailReport) {
            return "Please try this test to get detailed analysed report to know better your performance";
        } else {
            return "Please try this test to get detailed analysed report to know better your performance";
        }
    };

    // Handle payment flow - open Stripe Elements modal
    const handleStartCertifiedTest = () => {
        if (!assessmentData) {
            console.error('❌ No assessment data available');
            return;
        }
        
        // Open the Stripe Elements payment modal
        setIsStripeModalOpen(true);
    };

    const handleCloseStripeModal = () => {
        setIsStripeModalOpen(false);
    };

    if (loading) {
        return (
            <div className="col-span-1 md:col-span-2 lg:col-span-1 relative bg-white rounded-lg p-3 shadow-sm border border-orange-400 h-auto flex flex-col justify-center items-center overflow-hidden">
                <div className="text-sm text-gray-500">Loading assessment...</div>
            </div>
        );
    }

    if (error || !assessmentData) {
        return (
            <div className="col-span-1 md:col-span-2 lg:col-span-1 relative bg-white rounded-lg p-3 shadow-sm border border-orange-400 h-auto flex flex-col justify-center items-center overflow-hidden">
                <div className="text-sm text-gray-500">Failed to load assessment data</div>
            </div>
        );
    }

    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-1 relative bg-white rounded-lg p-3 shadow-sm border border-orange-400 h-auto flex flex-col justify-between overflow-hidden">
            <img src={MedalIcon} alt="Medal Icon" className="w-9 h-9 object-contain mb-2 md:mb-0 mt-[-10px]" />
            <div className="flex items-start mb-2 md:mb-0 mt-0">
                <p className="text-[13px] text-gray-700 leading-snug">
                    {getDescription(assessmentData.isAvailReport, assessmentData.isAvailCertification)}
                </p>
            </div>
            <div className="flex items-center gap-4 mt-2 mb-1">
                <div className="flex flex-col leading-none">
                    <span className="text-xs text-gray-500">Only</span>
                    <span className="text-md font-bold text-black">
                        {getActualPrice(assessmentData.price.unitAmount, assessmentData.price.currency)}
                    </span>
                </div>
                <button
                    className="bg-[#ff6b35] hover:bg-[#ff5a1c] text-white text-xs w-full font-medium py-2 px-4 rounded-[5px] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    onClick={handleStartCertifiedTest}
                    disabled={processing || !assessmentData}
                >
                    {processing ? 'Processing...' : 'Start Certified Test'}
                </button>
            </div>

            {/* Stripe Elements Payment Modal */}
            {assessmentData && (
                <AssessmentStripeElementsModal
                    isOpen={isStripeModalOpen}
                    onClose={handleCloseStripeModal}
                    assessment={{
                        _id: assessmentData.assessmentId,
                        id: assessmentData.assessmentId,
                        title: assessmentData.title || 'Certified Test',
                        name: assessmentData.title || 'Certified Test',
                    }}
                />
            )}
        </div>
    )
}