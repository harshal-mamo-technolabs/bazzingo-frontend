import React, { forwardRef } from 'react';
import { QRCodeCanvas } from "qrcode.react";
import { Brain } from 'lucide-react';
import { calculateCertificateValues, generateCertificateId, generateReportUrl } from '../../utils/certificationUtils';

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
      className={`relative overflow-hidden ${className}`} 
      style={{
        width: '900px', 
        height: '1273px', 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 30%, #8b5cf6 70%, #f97316 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        ...style
      }}
    >
      {/* Main Certificate Card - 90% height */}
      <div className="flex items-center justify-center h-full p-8">
        <div 
          className="bg-white rounded-lg shadow-2xl flex flex-col"
          style={{
            width: '95%',
            height: '90%',
            padding: '60px'
          }}
        >
          {/* Header with Logo */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#f97316] rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#1e3a8a] tracking-wider">
                BAZINGO
              </div>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-16">
            <div className="text-5xl font-bold text-[#1e3a8a] tracking-wide mb-2">
              CERTIFICATE OF
            </div>
            <div className="text-5xl font-bold text-[#1e3a8a] tracking-wide">
              IQ ACHIEVEMENT
            </div>
          </div>

          {/* Certificate Content */}
          <div className="text-center flex-grow flex flex-col justify-center">
            <div className="text-xl text-gray-700 mb-6">This certifies that</div>
            
            <div className="text-6xl font-bold text-[#1e3a8a] mb-8">{userName}</div>
            
            <div className="text-xl text-gray-700 mb-6">has achieved a Full Scale IQ score of</div>
            
            <div className="text-9xl font-bold text-[#f97316] mb-4">{iq}</div>
            
            <div className="text-lg text-gray-600 mb-2">Confidence Interval {ciLow}—{ciHigh}</div>
            <div className="text-lg text-gray-600 mb-12">Percentile Rank {percentile}</div>

            {/* Domain Score Cards */}
            <div className="grid grid-cols-4 gap-4 mb-16">
              {[
                {label:'Reasoning', value: reasoning, gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'},
                {label:'Verbal', value: verbal, gradient: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)'},
                {label:'Memory', value: memory, gradient: 'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)'},
                {label:'Processing\nSpeed', value: speed, gradient: 'linear-gradient(135deg, #7c3aed 0%, #1e3a8a 100%)'},
              ].map((domain, idx) => (
                <div 
                  key={idx} 
                  className="rounded-lg shadow-lg overflow-hidden text-white"
                  style={{
                    background: domain.gradient,
                    minHeight: '120px'
                  }}
                >
                  <div className="p-4 h-full flex flex-col justify-between">
                    <div className="text-lg font-semibold text-center whitespace-pre-line">
                      {domain.label}
                    </div>
                    <div className="text-4xl font-bold text-center">
                      {domain.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between mt-auto pt-0">
            <div className="flex items-end gap-6">
              <QRCodeCanvas 
                value={reportUrl} 
                size={80} 
                bgColor="#ffffff" 
                fgColor="#000000" 
                includeMargin 
                level="M" 
              />
              <div className="text-sm text-gray-700 max-w-[300px]">
                <div className="font-medium mb-2">Certificate ID {certificateId}</div>
                <div className="text-gray-600 leading-relaxed text-xs">
                  This score is based on a normative sample with a mean of 
                  100 and a standard deviation of 15.
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-semibold text-[#1e3a8a] mb-1" style={{fontFamily: 'cursive'}}>
                Daniel Foster
              </div>
              <div className="h-px w-48 bg-gray-400 mb-2"></div>
              <div className="text-sm text-gray-600">Chief Psychologist</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificateComponent.displayName = 'CertificateComponent';

export default CertificateComponent;