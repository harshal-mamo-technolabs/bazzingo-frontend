import React, { useState, useEffect } from 'react';
import {MedalIcon} from "../../utils/dashboard-image.js";
import { getDailyAssessmentRecommendation } from '../../services/dashbaordService';
import { loadStripe } from '@stripe/stripe-js';
import { API_CONNECTION_HOST_URL } from '../../utils/constant';

export default function AssessmentUpsellCard() {
    const [assessmentData, setAssessmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchAssessmentData = async () => {
            try {
                console.log('🔄 Fetching daily assessment recommendation...');
                setLoading(true);
                const response = await getDailyAssessmentRecommendation();
                console.log('📊 API Response:', response);
                setAssessmentData(response.data);
                setError(null);
                console.log('✅ Assessment data set successfully');
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
                console.log('🏁 Loading state set to false');
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

    // Handle payment flow (same as assessment page)
    const handleStartCertifiedTest = async () => {
        console.log('🚀 Starting payment flow...');
        
        if (!assessmentData) {
            console.error('❌ No assessment data available');
            return;
        }
        
        console.log('📊 Assessment data:', assessmentData);
        
        try {
            setProcessing(true);
            console.log('⏳ Setting processing state to true');
            
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('👤 User data:', user);
            
            const token = user?.accessToken;
            console.log('🔑 Token:', token ? 'Present' : 'Missing');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('💳 Loading Stripe...');
            const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
            console.log('✅ Stripe loaded:', stripe ? 'Success' : 'Failed');
            
            const successUrl = `${window.location.origin}/payment/success`;
            const cancelUrl = `${window.location.origin}/payment/cancel`;
            console.log('🔗 URLs:', { successUrl, cancelUrl });
            
            const requestBody = {
                assessmentId: assessmentData.assessmentId,
                successUrl,
                cancelUrl,
            };
            console.log('📤 Request body:', requestBody);
            
            console.log('🌐 Making API call to:', `${API_CONNECTION_HOST_URL}/stripe/checkout/session`);
            const response = await fetch(`${API_CONNECTION_HOST_URL}/stripe/checkout/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
            
            const payload = await response.json().catch(() => ({}));
            console.log('📋 Response payload:', payload);
            
            if (!response.ok) {
                throw new Error(payload?.message || `Request failed (${response.status})`);
            }

            const resp = payload?.data;
            console.log('📊 Response data:', resp);

            // A) Checkout fallback -> redirect
            if (resp?.url) {
                console.log('🔄 Redirecting to Stripe Checkout:', resp.url);
                window.location.href = resp.url;
                return;
            }

            // B) One-click succeeded / processing
            if (resp?.orderId && (resp.status === 'succeeded' || resp.status === 'processing')) {
                console.log('✅ Payment succeeded/processing, redirecting to success page');
                window.location.href = `${successUrl}?order_id=${encodeURIComponent(resp.orderId)}`;
                return;
            }

            // C) One-click requires 3DS — MUST pass payment_method
            if (resp?.requiresAction && resp?.clientSecret) {
                console.log('🔐 Payment requires 3DS authentication');
                console.log('🔐 Client secret:', resp.clientSecret);
                console.log('🔐 Payment method ID:', resp.paymentMethodId);
                
                if (!resp.paymentMethodId) {
                    throw new Error('Missing payment method for 3DS confirmation. Please retry the payment.');
                }
                
                const result = await stripe.confirmCardPayment(resp.clientSecret, {
                    payment_method: resp.paymentMethodId,
                });
                
                console.log('🔐 3DS confirmation result:', result);
                
                if (result.error) {
                    throw new Error(result.error.message || 'Authentication failed. Please try again.');
                }
                
                console.log('✅ 3DS authentication successful, redirecting to success page');
                window.location.href = `${successUrl}?order_id=${encodeURIComponent(resp.orderId)}`;
                return;
            }

            throw new Error('Unexpected response from server.');
        } catch (error) {
            console.error('💥 Payment error:', error);
            console.error('💥 Error stack:', error.stack);
            alert(`Payment failed: ${error.message}. Please try again.`);
        } finally {
            console.log('🏁 Setting processing state to false');
            setProcessing(false);
        }
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
                    onClick={(e) => {
                        console.log('🖱️ Button clicked!', e);
                        console.log('📊 Current assessment data:', assessmentData);
                        console.log('⏳ Processing state:', processing);
                        handleStartCertifiedTest();
                    }}
                    disabled={processing}
                >
                    {processing ? 'Processing...' : 'Start Certified Test'}
                </button>
            </div>
        </div>
    )
}