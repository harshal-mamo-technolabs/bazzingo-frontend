import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AssessmentGrid from '../components/assessments/AssessmentGrid';
import RecentAssessments from '../components/assessments/RecentAssessments';
import AssessmentCompletionModal from '../components/assessments/AssessmentCompletionModal.jsx';
import { recentAssessments } from "../utils/assessmentStaticData.js";
import { getAllAssessment } from '../services/dashbaordService'; // Import the API function

const Assessments = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                setLoading(true);
                const response = await getAllAssessment();
                // Set the assessments from API response
                setAssessments(response.data.items || []);
            } catch (error) {
                console.error("Error fetching assessments:", error);
                // Keep the empty array if API fails
                setAssessments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAssessments();
    }, []);

    const handleAssessmentClick = (assessment) => {
        setSelectedAssessment(assessment);
        // Pass the assessmentId to the visual reasoning page
        navigate('/assessments/visual-reasoning', { 
            state: { assessmentId: assessment._id } 
        });
    };

    // Show loading state if needed
    if (loading) {
        return (
            <MainLayout>
                <div style={{fontFamily: 'Roboto, sans-serif', fontSize: '12px'}}>
                    <div className="mx-auto px-4 lg:px-12 py-4 lg:py-8">
                        <div className="flex justify-center items-center h-64">
                            <p>Loading assessments...</p>
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
                                assessments={assessments} // Use API data instead of static data
                                onAssessmentClick={handleAssessmentClick}
                            />
                        </div>

                        {/* Right Section - Recent Assessments - Hidden on mobile */}
                        <div className="hidden lg:block w-full lg:w-[340px]">
                            <RecentAssessments assessments={recentAssessments}/>
                        </div>
                    </div>
                </div>

                <AssessmentCompletionModal
                    isOpen={isModalOpen}
                    selectedAssessment={selectedAssessment}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>
        </MainLayout>
    );
};

export default Assessments;