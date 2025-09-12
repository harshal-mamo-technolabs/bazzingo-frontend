import React, { forwardRef } from 'react';
import { QRCodeCanvas } from "qrcode.react";
import { calculateCertificateValues, generateCertificateId, generateReportUrl } from '../../utils/certificationUtils.jsx';

/**
 * Reusable Certificate Component
 * Can be used for download, display, or printing
 */
const CertificateComponent = forwardRef(({ 
  scoreData, 
  assessmentId, 
  userName = "User",
  className = "",
  style = {}
}, ref) => {
  const {
    total,
    dateStr,
    iq,
    percentile,
    ciLow,
    ciHigh,
    reasoning,
    verbal,
    memory,
    speed
  } = calculateCertificateValues(scoreData, assessmentId);

  const certificateId = generateCertificateId(assessmentId);
  const reportUrl = generateReportUrl(scoreData?._id, assessmentId);

  return (
    <div 
      ref={ref} 
      className={`relative overflow-hidden rounded-lg ${className}`} 
      style={{
        width: '900px', 
        height: '1273px', 
        background: 'linear-gradient(135deg,#28457a,#f5f2ec 35%,#e15e2a)',
        ...style
      }}
    >
      <div 
        className="absolute inset-6 bg-[#fbfaf7] rounded-md" 
        style={{
          boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.4), inset 0 0 0 12px rgba(0,0,0,0.05)'
        }} 
      />
      
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="px-14 pt-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/bazzingo-logo.png" alt="Bazzingo" className="h-12" />
            <div className="text-2xl tracking-wider font-semibold">BAZINGO</div>
          </div>
          <div className="text-sm text-gray-600">{dateStr}</div>
        </div>

        {/* Main Certificate Content */}
        <div className="px-14 text-center mt-6">
          <div className="text-4xl font-extrabold tracking-wider">CERTIFICATE OF IQ ACHIEVEMENT</div>
          <div className="mt-8 text-gray-600 text-lg">This certifies that</div>
          <div className="mt-2 text-5xl font-bold">{userName}</div>
          <div className="mt-5 text-gray-700 text-lg">has achieved a Full Scale IQ score of</div>
          <div className="mt-3 text-8xl font-extrabold text-orange-600">{iq}</div>
          <div className="mt-3 text-gray-700 text-base">Confidence Interval {ciLow}—{ciHigh}</div>
          <div className="text-gray-700 text-base">Percentile Rank {percentile}</div>
        </div>

        {/* Domain Scores */}
        <div className="mt-12 px-14 grid grid-cols-4 gap-6">
          {[
            {label:'Reasoning', value: reasoning},
            {label:'Verbal', value: verbal},
            {label:'Memory', value: memory},
            {label:'Processing Speed', value: speed},
          ].map((b,idx)=> (
            <div 
              key={idx} 
              className="rounded-xl p-6 text-center text-white" 
              style={{
                background: 'linear-gradient(180deg,#f36d3a,#be4a84 70%, #2f5fb6)'
              }}
            >
              <div className="text-sm opacity-95">{b.label}</div>
              <div className="mt-3 text-5xl font-extrabold leading-none">{b.value}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto px-14 pb-12 pt-10 flex items-end justify-between">
          <div className="flex items-center gap-5">
            <QRCodeCanvas 
              value={reportUrl} 
              size={110} 
              bgColor="#ffffff" 
              fgColor="#000000" 
              includeMargin 
              level="M" 
            />
            <div className="text-sm text-gray-700">
              <div className="font-medium">Certificate ID {certificateId}</div>
              <div className="mt-1 text-gray-600 max-w-[360px]">
                This score is based on a normative sample with a mean of 100 and a standard deviation of 15.
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-signature italic">Bazzingo</div>
            <div className="h-0.5 w-56 bg-gray-400 mb-2" />
            <div className="text-sm">Chief Psychologist</div>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificateComponent.displayName = 'CertificateComponent';

export default CertificateComponent;
