import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import BazzingoLoader from "../components/Loading/BazzingoLoader";
import AssessmentGrid from '../components/assessments/AssessmentGrid';
import RecentAssessments from '../components/assessments/RecentAssessments';
import AssessmentCompletionModal from '../components/assessments/AssessmentCompletionModal.jsx';
// import { getAllAssessment } from '../services/dashbaordService'; // Import the API function
import { getAllAssessment ,getRecentAssessmentActivity } from '../services/dashbaordService';

const Assessments = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recentActivity, setRecentActivity] = useState([]);
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
                                assessments={assessments} // Use API data instead of static data
                                onAssessmentClick={handleAssessmentClick}
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
            </div>
        </MainLayout>
    );
};

export default Assessments;