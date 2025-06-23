import React, { useState } from 'react';
import { ArrowLeft, Bell, Menu } from 'lucide-react';

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

    const unreadCount = 3;

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            {/* Header */}
            <nav className="bg-[#F2F2F2] border-b border-gray-200">
                <div className="max-w-[1500px] mx-auto px-4 md:px-12">
                    <div className="flex justify-between items-center" style={{ height: '56px' }}>
                        {/* Logo */}
                        <div className="flex items-center">
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: "2px" }}>
                                <span className="text-[#FF6B3E]">B</span>
                                <span className="text-black">AZIN</span>
                                <span className="text-[#FF6B3E]">G</span>
                                <span className="text-[#FF6B3E]">O</span>
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex" style={{ gap: '28px' }}>
                            <a href="#" className="text-gray-700 hover:text-gray-900" style={{ fontSize: '12px', fontWeight: '500' }}>Games</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900" style={{ fontSize: '12px', fontWeight: '500' }}>Assessments</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900" style={{ fontSize: '12px', fontWeight: '500' }}>Statistics</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900" style={{ fontSize: '12px', fontWeight: '500' }}>Leaderboard</a>
                        </nav>

                        {/* Right side icons */}
                        <div className="flex items-center" style={{ gap: '14px' }}>
                            <div className="relative hidden lg:block">
                                <Bell style={{ height: '18px', width: '18px' }} className="text-gray-600" />
                                {unreadCount > 0 && (
                                    <span
                                        className="absolute bg-[#FF6B3E] text-white rounded-full flex items-center justify-center"
                                        style={{
                                            top: '-2px',
                                            right: '-2px',
                                            height: '12px',
                                            width: '12px',
                                            fontSize: '8px',
                                            lineHeight: '1'
                                        }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div
                                className="bg-black text-white rounded-full flex items-center justify-center hidden lg:flex"
                                style={{ height: '28px', width: '28px', fontSize: '12px', fontWeight: '500' }}
                            >
                                A
                            </div>
                            {/* Mobile hamburger menu */}
                            <Menu className="lg:hidden text-gray-600" style={{ height: '24px', width: '24px' }} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {/* Page Header */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-5" style={{ paddingTop: '28px', paddingBottom: '20px' }}>
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600" />
                        <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: '600' }}>Support Tickets</h2>
                    </div>
                    <p className="text-gray-600" style={{ fontSize: '11px' }}>Need help? Raise a ticket and our support team will get back to you shortly.</p>
                </div>

                {/* Content Container */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-5">
                    <div className="flex flex-col lg:flex-row" style={{ gap: '24px' }}>
                        {/* Left Column - New Ticket Form */}
                        <div className="w-full lg:flex-none" style={{ flex: '0 0 400px' }}>
                            <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Raise a New Ticket</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Subject Field */}
                                <div>
                                    <label className="block text-gray-700" style={{ fontSize: '11px', fontWeight: '500', marginBottom: '6px' }}>Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Enter Subject"
                                        className="w-full border border-[#D0D5DD] focus:outline-none focus:border-blue-500"
                                        style={{
                                            height: '32px',
                                            padding: '0 10px',
                                            borderRadius: '3px',
                                            fontSize: '11px'
                                        }}
                                    />
                                </div>

                                {/* Issue Type */}
                                <div>
                                    <label className="block text-gray-700" style={{ fontSize: '11px', fontWeight: '500', marginBottom: '6px' }}>Issue Type</label>
                                    <div className="flex flex-wrap gap-3">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={issueTypes.bug}
                                                onChange={() => handleIssueTypeChange('bug')}
                                                className="border-gray-300 rounded"
                                                style={{ height: '14px', width: '14px', marginRight: '6px' }}
                                            />
                                            <span className="text-gray-700" style={{ fontSize: '11px' }}>Bug</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={issueTypes.account}
                                                onChange={() => handleIssueTypeChange('account')}
                                                className="border-gray-300 rounded"
                                                style={{ height: '14px', width: '14px', marginRight: '6px' }}
                                            />
                                            <span className="text-gray-700" style={{ fontSize: '11px' }}>Account</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={issueTypes.billing}
                                                onChange={() => handleIssueTypeChange('billing')}
                                                className="border-gray-300 rounded"
                                                style={{ height: '14px', width: '14px', marginRight: '6px' }}
                                            />
                                            <span className="text-gray-700" style={{ fontSize: '11px' }}>Billing</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={issueTypes.gameIssue}
                                                onChange={() => handleIssueTypeChange('gameIssue')}
                                                className="border-gray-300 rounded"
                                                style={{ height: '14px', width: '14px', marginRight: '6px' }}
                                            />
                                            <span className="text-gray-700" style={{ fontSize: '11px' }}>Game Issue</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={issueTypes.otherIssue}
                                                onChange={() => handleIssueTypeChange('otherIssue')}
                                                className="border-gray-300 rounded"
                                                style={{ height: '14px', width: '14px', marginRight: '6px' }}
                                            />
                                            <span className="text-gray-700" style={{ fontSize: '11px' }}>Other Issue</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="block text-gray-700" style={{ fontSize: '11px', fontWeight: '500', marginBottom: '6px' }}>Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter Description"
                                        rows={4}
                                        className="w-full border border-[#D0D5DD] focus:outline-none focus:border-blue-500 resize-none"
                                        style={{
                                            padding: '8px 10px',
                                            borderRadius: '3px',
                                            fontSize: '11px',
                                            minHeight: '96px'
                                        }}
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    className="bg-[#FF6B3E] text-white border-none hover:bg-[#e55a35] transition-colors duration-200 flex items-center justify-center w-full"
                                    style={{
                                        height: '32px',
                                        borderRadius: '3px',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Submit Ticket
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Tickets Table */}
                        <div className="flex-1 hidden lg:block">
                            <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Your Tickets</h3>

                            <table className="w-4/5" style={{ borderCollapse: 'collapse', minWidth: '520px' }}>
                                <thead className="bg-[#EDEDED]">
                                    <tr style={{ height: '32px' }}>
                                        <th
                                            className="text-left text-gray-700 border border-[#E5E7EB]"
                                            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '600' }}
                                        >
                                            Ticket ID
                                        </th>
                                        <th
                                            className="text-left text-gray-700 border border-[#E5E7EB]"
                                            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '600' }}
                                        >
                                            Subject
                                        </th>
                                        <th
                                            className="text-left text-gray-700 border border-[#E5E7EB]"
                                            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '600' }}
                                        >
                                            Status
                                        </th>
                                        <th
                                            className="text-left text-gray-700 border border-[#E5E7EB]"
                                            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '600' }}
                                        >
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket, index) => (
                                        <tr
                                            key={index}
                                            style={{
                                                backgroundColor: index % 2 === 1 ? '#FAFAFA' : 'white',
                                                height: '32px'
                                            }}
                                        >
                                            <td
                                                className="text-gray-900 border border-[#E5E7EB]"
                                                style={{ padding: '6px 12px', fontSize: '11px' }}
                                            >
                                                {ticket.id}
                                            </td>
                                            <td
                                                className="text-gray-900 border border-[#E5E7EB]"
                                                style={{ padding: '6px 12px', fontSize: '11px' }}
                                            >
                                                {ticket.subject}
                                            </td>
                                            <td
                                                className="border border-[#E5E7EB]"
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    fontWeight: '500',
                                                    color: ticket.statusClass === 'status--inprogress' ? '#FF6B3E' : '#28A745'
                                                }}
                                            >
                                                {ticket.status}
                                            </td>
                                            <td
                                                className="text-gray-900 border border-[#E5E7EB]"
                                                style={{ padding: '6px 12px', fontSize: '11px' }}
                                            >
                                                {ticket.date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;