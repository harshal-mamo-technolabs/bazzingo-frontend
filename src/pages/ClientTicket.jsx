import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import MainLayout from '../components/Layout/MainLayout';
import PageHeader from '../components/tickets/PageHeader';
import TicketForm from '../components/tickets/TicketForm';
import TicketsTable from '../components/tickets/TicketsTable';
import useHelpScout from '../hooks/useHelpScout';
import { selectSubscriptionData } from '../app/subscriptionSlice';

function App() {
    const subscriptionData = useSelector(selectSubscriptionData);
    const beaconId = import.meta.env.VITE_HELPSCOUT_BEACON_ID;

    const helpScoutAttributes = useMemo(() => {
        const attributes = {};
        
        if (subscriptionData?.planName) {
            attributes.subscriptionPlan = subscriptionData.planName;
        }
        
        if (subscriptionData?.subscriptionStatus) {
            attributes.subscriptionStatus = subscriptionData.subscriptionStatus;
        }
        
        if (subscriptionData?.status) {
            attributes.planStatus = subscriptionData.status;
        }
        
        return attributes;
    }, [subscriptionData]);

    useHelpScout(beaconId, {
        customAttributes: helpScoutAttributes
    });

    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [issueTypes, setIssueTypes] = useState({
        bug: false,
        account: false,
        billing: false,
        gameIssue: false,
        otherIssue: false
    });

    const handleIssueTypeChange = (type) => {
        setIssueTypes(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const handleSubmit = () => {};

    const tickets = [
        {
            id: '#34251',
            subject: 'Game not loading',
            status: 'In Progress',
            date: '20/05/2025',
            statusClass: 'status--inprogress'
        },
        {
            id: '#34212',
            subject: 'Password issue',
            status: 'Resolved',
            date: '18/05/2025',
            statusClass: 'status--resolved'
        },
        {
            id: '#34212',
            subject: 'Password issue',
            status: 'Resolved',
            date: '18/05/2025',
            statusClass: 'status--resolved'
        }
    ];

    return (
        <MainLayout>
            <div className="bg-white min-h-screen" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                <style>{`
                    iframe[src*="helpscout"],
                    iframe[src*="beacon"],
                    [class*="Beacon"],
                    [id*="beacon"],
                    [id*="Beacon"] {
                        z-index: 999999 !important;
                        pointer-events: auto !important;
                    }
                    
                    #beacon-container,
                    .BeaconContainer,
                    [class*="BeaconContainer"] {
                        z-index: 999999 !important;
                        pointer-events: auto !important;
                    }
                    
                    .BeaconFabButtonFrame,
                    [class*="BeaconFabButtonFrame"],
                    button[class*="Beacon"] {
                        z-index: 999999 !important;
                        pointer-events: auto !important;
                        cursor: pointer !important;
                    }
                    
                    [class*="BeaconModal"],
                    [class*="BeaconFrame"],
                    [data-beacon-modal] {
                        z-index: 999999 !important;
                        pointer-events: auto !important;
                    }
                    
                    iframe[src*="helpscout"] *,
                    iframe[src*="beacon"] * {
                        pointer-events: auto !important;
                    }
                `}</style>
                
                <main>
                    <PageHeader />

                    <div className="mx-auto px-4 lg:px-12 py-4 lg:py-4">
                        <div className="flex flex-col lg:flex-row" style={{ gap: '24px' }}>
                            <div className="w-full lg:flex-none" style={{ flex: '0 0 400px' }}>
                                <TicketForm
                                    subject={subject}
                                    setSubject={setSubject}
                                    description={description}
                                    setDescription={setDescription}
                                    issueTypes={issueTypes}
                                    onIssueTypeChange={handleIssueTypeChange}
                                    onSubmit={handleSubmit}
                                />
                            </div>

                            <div className="pl-30 flex-1 hidden lg:block">
                                <TicketsTable tickets={tickets} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}

export default App;
