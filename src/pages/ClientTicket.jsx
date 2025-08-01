import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import PageHeader from '../components/tickets/PageHeader';
import TicketForm from '../components/tickets/TicketForm';
import TicketsTable from '../components/tickets/TicketsTable';

function App() {
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

    const handleSubmit = () => {
        // Handle form submission logic here
        console.log('Submitting ticket:', { subject, description, issueTypes });
    };

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
                {/* Main Content */}
                <main>
                    {/* Page Header */}
                    <PageHeader />

                    {/* Content Container */}
                    <div className="mx-auto px-4 lg:px-12 py-4 lg:py-4">
                        <div className="flex flex-col lg:flex-row" style={{ gap: '24px' }}>
                            {/* Left Column - New Ticket Form */}
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

                            {/* Right Column - Tickets Table */}
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