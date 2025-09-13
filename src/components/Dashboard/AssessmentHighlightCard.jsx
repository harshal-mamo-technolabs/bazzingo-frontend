import { BrainSilhouetteOrangeIcon } from "../../utils/dashboard-image.js";
import React, { useState, useEffect } from "react";
import { getQuickAssessment } from "../../services/dashbaordService";

export default function AssessmentHighlightCard({ onAssessmentClick }) {
    const [assessmentData, setAssessmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuickAssessment = async () => {
            try {
                setLoading(true);
                const response = await getQuickAssessment();
                setAssessmentData(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch quick assessment:", err);
                setError("Failed to load assessment data");
            } finally {
                setLoading(false);
            }
        };

        fetchQuickAssessment();
    }, []);

    const handleCardClick = () => {
        if (!assessmentData || !onAssessmentClick) return;
        
        // Pass the assessment data to the parent component
        onAssessmentClick(assessmentData);
    };

    if (loading) {
        return (
            <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-[#ffece6] rounded-lg p-2 h-[140px] flex items-center">
                <div className="w-[110px] h-[110px] bg-[#ff5722] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <div className="w-[100px] h-[100px] bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded animate-pulse w-24"></div>
                </div>
            </div>
        );
    }

    if (error || !assessmentData) {
        return (
            <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-[#ffece6] rounded-lg p-2 h-[140px] flex items-center">
                <div className="w-[110px] h-[110px] bg-[#ff5722] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <img
                        src={BrainSilhouetteOrangeIcon}
                        alt="Head silhouette with brain"
                        className="w-[100px] h-[100px] object-contain"
                    />
                </div>
                <div className="flex flex-col justify-center">
                    <div className="text-[16px] font-semibold text-gray-800 leading-snug">
                        {assessmentData.assessment.title || "Certified Cognitive Assessment"}
                    </div>
                    <div className="bg-[#e5cec8] text-black rounded-md px-2 py-[2px] text-[9px] border border-gray-400 font-medium inline-block mt-1 w-fit">
                        Mini Test, 5-10 Question
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`col-span-1 md:col-span-2 lg:col-span-1 rounded-lg p-2 h-[140px] flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                assessmentData.isCompleted 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300' 
                    : 'bg-[#ffece6] hover:bg-[#ffe0d6]'
            }`}
            onClick={handleCardClick}
        >
            <div className={`w-[110px] h-[110px] rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
                assessmentData.isCompleted ? 'bg-green-500' : 'bg-[#ff5722]'
            }`}>
                <img
                    src={BrainSilhouetteOrangeIcon}
                    alt="Head silhouette with brain"
                    className="w-[100px] h-[100px] object-contain"
                />
            </div>
            <div className="flex flex-col justify-center">
                <div className="text-[16px] font-semibold text-gray-800 leading-snug">
                    {assessmentData.assessment.title || "Certified Cognitive Assessment"}
                </div>
                <div className={`rounded-md px-2 py-[2px] text-[9px] border font-medium inline-block mt-1 w-fit ${
                    assessmentData.isCompleted 
                        ? 'bg-green-200 text-green-800 border-green-400' 
                        : 'bg-[#e5cec8] text-black border-gray-400'
                }`}>
                    {assessmentData.isCompleted ? "✓ Completed Today" : "Mini Test, 5–10 Question"}
                </div>
                {assessmentData.isCompleted && (
                    <div className="text-[10px] text-green-700 font-medium mt-1">
                        Great job! Your daily mini test is completed
                    </div>
                )}
            </div>
        </div>
    );
}