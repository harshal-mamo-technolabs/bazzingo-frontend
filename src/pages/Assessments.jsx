import React, { useState } from 'react';
import { ArrowLeft, Bell, Menu, Brain, Car } from 'lucide-react';


const Assessments = () => {
  const assessments = [
    {
      id: 1,
      title: "General Cognitive Test",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 2,
      title: "General Cognitive Test",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 3,
      title: "General Cognitive Test",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 4,
      title: "General Cognitive Test",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 5,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 6,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 7,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 8,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 8,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    }
  ];

  const recentAssessments = [
    {
      id: 1,
      title: "General Cognitive",
      status: "Completed",
      score: 124,
      iconBg: "bg-orange-100",
      type: "brain"
    },
    {
      id: 2,
      title: "Driving License",
      status: "Completed",
      score: 124,
      icon: Car,
      iconBg: "bg-orange-100",
      type: "car"
    }
  ];

  const unreadCount = 3;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
      {/* Header */}
      <nav className="bg-[#F2F2F2] border-b border-gray-200">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-12">
          <div className="flex justify-between items-center" style={{ height: '56px' }}>
            {/* Logo */}
            <div className="flex items-center">
              <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
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
      <div className="max-w-[1500px] mx-auto px-4 lg:px-12 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section - Assessments */}
          <div className="flex-1">
            {/* Hide background on mobile, show on desktop */}
            <div className="lg:bg-[#E8E8E8] lg:rounded-lg lg:p-6">
              <h2 className="text-black font-semibold mb-6 hidden lg:block" style={{ fontSize: '16px' }}>
                Assessments
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {assessments.map((assessment) => {
                  return (
                    <div key={assessment.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      {/* Icon and Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`${assessment.iconBg} rounded-lg flex items-center justify-center overflow-hidden`} style={{ width: '32px', height: '32px' }}>
                          <img
                            src="/bazzingo-head.png"
                            alt="Brain icon"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-[#FF6B3E] font-bold" style={{ fontSize: '16px', lineHeight: '1.2' }}>
                          {assessment.title}
                        </h3>
                      </div>

                      {/* Question count */}
                      <p className="text-black font-medium mb-2" style={{ fontSize: '12px' }}>
                        {assessment.questions} Question
                      </p>

                      {/* Description */}
                      <p className="text-gray-600 mb-4" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                        {assessment.description}
                      </p>

                      {/* Button */}
                      <button className="w-full bg-[#FF6B3E] text-white rounded-md py-2 px-4 font-medium hover:bg-[#e55a35] transition-colors" style={{ fontSize: '12px' }}>
                        Start Certified Test
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Section - Recent Assessments - Hidden on mobile */}
          <div className="hidden lg:block w-full lg:w-[340px]">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <h2 className="text-black font-semibold mb-6 text-[18px]">
                Recent Assessments
              </h2>

              <div className="space-y-6">
                {recentAssessments.map((a) => (
                  <div            /* 1 white card (row) */
                    key={a.id}
                    className="flex items-start justify-between bg-white rounded-xl px-5 py-4"
                  >
                    {/* ── left: icon + text + badge ── */}
                    <div className="flex items-start gap-4">
                      {/* icon square */}
                      <div
                        className={`${a.iconBg} rounded-md flex items-center justify-center overflow-hidden`}
                        style={{ width: '56px', height: '56px' }}          /* 56×56px */
                      >
                        {a.type === 'car' ? (
                          <img src="/car.png" alt="" className="w-[45%] h-[45%] object-cover" />
                        ) : (
                          <img src="/message.png" alt="" className="w-[45%] h-[45%] object-cover" />
                        )}
                      </div>

                      {/* title + badge */}
                      <div>
                        <h3 className="text-black font-bold text-[16px] self-start">
                          {a.title}
                        </h3>

                        {/* green pill */}
                        <span
                          className="
                  inline-block
                  rounded-lg border-2 border-[#118C24]
                  bg-gradient-to-b from-[#E2F8E0] via-[#CDEDC8] to-[#DAF3D5]
                  px-2 py-1 mt-1
                  text-[#118C24] font-bold text-[12px] leading-none
                "
                        >
                          Completed
                        </span>
                      </div>
                    </div>

                    {/* ── right: score ── */}
                    <span className="text-black font-bold text-[17px] self-start">
                      {a.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;
