import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { BrainSilhouetteIcon, CertificateLightIcon, SunnyEffectImage, ConquerBadge } from "../../../public/assessment";
import axios from 'axios';
import { API_CONNECTION_HOST_URL } from '../../utils/constant';
import { toPng } from "html-to-image";
import { useReactToPrint } from "react-to-print";
import CertificateComponent from '../Certificate/CertificateComponent';
import ReportComponent from '../Report/ReportComponent';

const AssessmentCompletionModal = ({ 
  isOpen, 
  onClose, 
  score = 0, 
  totalQuestions = 0, 
  assessmentId, 
  fullScoreData,
  scoreId, // Add scoreId prop
  isAvailCertification = false, 
  isAvailReport = false 
}) => {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const [downloading, setDownloading] = useState("");
  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [scoreDetails, setScoreDetails] = useState(null);
  const certificateRef = useRef(null);
  const reportRef = useRef(null);

  // Fetch assessment details when modal opens
  useEffect(() => {
    if (isOpen && assessmentId) {
      const fetchAssessmentDetails = async () => {
        try {
          const res = await axios.get(`${API_CONNECTION_HOST_URL}/assessment/${assessmentId}`);
          setAssessmentDetails(res.data?.data || null);
        } catch (error) {
          console.error("Failed to fetch assessment details:", error);
        }
      };
      fetchAssessmentDetails();
    }
  }, [isOpen, assessmentId]);

  // Fetch score details when modal opens and scoreId is available
  useEffect(() => {
    if (isOpen && scoreId) {
      const fetchScoreDetails = async () => {
        try {
          const res = await axios.get(`${API_CONNECTION_HOST_URL}/assessment/score/${scoreId}`);
          setScoreDetails(res.data?.data?.score || null);
        } catch (error) {
          console.error("Failed to fetch score details:", error);
        }
      };
      fetchScoreDetails();
    }
  }, [isOpen, scoreId]);

  // Get assessment type for dynamic content
  const assessmentType = assessmentDetails?.mainCategory || "IQ Test";
  const assessmentName = assessmentDetails?.title || "Cognitive Assessment";

  // Use scoreDetails if available, otherwise fall back to fullScoreData
  const scoreDataToUse = scoreDetails || fullScoreData;
  const mainCategory = scoreDataToUse?.mainCategory || assessmentDetails?.mainCategory || "iq-test";
  const userName = scoreDataToUse?.userName || "User";
  const userAge = scoreDataToUse?.userAge || "";
  const totalScoreofAssessment = scoreDataToUse?.totalScore || "0";


  const handleDownloadCertificate = async () => {
    if(!certificateRef.current) return;
    setDownloading("certificate");
    try {
      await new Promise(r => setTimeout(r, 300));
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: "#f5f2ec" });
      const link = document.createElement('a');
      link.download = `Certificate-${assessmentId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setDownloading("");
    }
  };

  // Report functions
  const handleDownloadReport = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `${assessmentName}-Report-${assessmentId}`,
    onBeforeGetContent: () => {
      setDownloading("report");
      return Promise.resolve();
    },
    onAfterPrint: () => setDownloading("")
  });


  // Keyboard and focus management
  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current = document.activeElement;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      const last = lastFocusedRef.current;
      if (last && typeof last.focus === 'function') last.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="acm-title"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        className="
          relative bg-white rounded-lg shadow-xl
          w-full max-w-md
          transform transition-all duration-200 ease-out
          scale-100 opacity-100
          flex flex-col
        "
      >
        <div className="relative w-full h-32">
          <div
            className="absolute inset-0 rounded-t-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${SunnyEffectImage})` }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
            <img
              src={ConquerBadge}
              alt="Conquer badge"
              className="object-contain w-16 h-16"
            />
          </div>
        </div>

        <div className="w-full text-center mt-2">
          <span className="inline-block bg-[#FF6947] text-white text-sm font-medium px-8 py-1 rounded-full">
            Assessment Complete
          </span>
        </div>

        <div className="w-full text-center mt-1">
          <h2 id="acm-title" className="text-center text-3xl font-bold italic text-[#208900]">
            Well Done!
          </h2>
        </div>

        <div className="mt-3 mx-5">
          <div className="bg-[#FFF4F2] border border-[#FF6947] rounded-lg p-2">
            <p className="text-center text-lg font-semibold text-gray-800">Your Score</p>
            <p className="text-center text-4xl font-bold text-[#FF6947]">{score}/{totalQuestions}</p>
          </div>
        </div>

        <hr className="border-t border-gray-200 mx-5 mt-4 mb-3" />

        <div className="px-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested for You</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {isAvailCertification || isAvailReport ? (
            <div className="flex flex-col gap-3">
              {isAvailCertification && (
                <div className="bg-white border border-orange-300 rounded-lg overflow-hidden shadow-sm w-full">
                  <div className="bg-[#ffd9ce] w-full px-3 py-2">
                    <div className="flex items-center gap-3">
                      <img src={CertificateLightIcon} alt="Certificate" className="w-10 h-10 rounded p-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Download Certificate</p>
                        <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                          Your certified result is available
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-end">
                    <button
                      className="px-4 py-1.5 text-[13px] bg-[#FF6B3D] text-white rounded-md font-semibold"
                      onClick={handleDownloadCertificate}
                      disabled={downloading === "certificate"}
                    >
                      {downloading === "certificate" ? "Generating..." : "Download"}
                    </button>
                  </div>
                </div>
              )}

              {isAvailReport && (
                <div className="bg-white border border-orange-300 rounded-lg overflow-hidden shadow-sm w-full">
                  <div className="bg-[#ffd9ce] w-full px-3 py-2">
                    <div className="flex items-center gap-3">
                      <img src={BrainSilhouetteIcon} alt="Report" className="w-10 h-10 rounded p-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Download Report</p>
                        <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                          Detailed performance report is available
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-end">
                    <button
                      className="px-4 py-1.5 text-[13px] bg-[#FF6B3D] text-white rounded-md font-semibold"
                      onClick={handleDownloadReport}
                      disabled={downloading === "report"}
                    >
                      {downloading === "report" ? "Generating..." : "Download"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-orange-300 rounded-lg overflow-hidden shadow-sm w-full">
              <div className="bg-[#ffd9ce] w-full px-3 py-2">
                <div className="flex items-center gap-3">
                  <img src={BrainSilhouetteIcon} alt="General Cognitive test" className="w-10 h-10 rounded p-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">General Cognitive test</p>
                    <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                      Mini Test, 5-10 Question
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-start gap-2 text-[13px] text-gray-700">
                  <img src={CertificateLightIcon} alt="Certification" className="w-5 h-5 mt-0.5" />
                  <p className="text-xs">
                    Get a certified result you can share on LinkedIn or with employers.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-gray-700">
                    <p>Only</p>
                    <p className="text-lg font-bold text-black">€0.99</p>
                  </div>
                  <button className="px-4 py-1.5 text-[13px] bg-[#FF6B3D] text-white rounded-md font-semibold">
                    Start Certified Test
                  </button>
                </div>
                </div>
            </div>
          )}
        </div>

        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Hidden certificate and report elements for download */}
      <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '1000px', zIndex: -1 }}>
        <CertificateComponent
          ref={certificateRef}
          scoreData={scoreDataToUse}
          assessmentId={assessmentId}
          userName={userName}
          totalScoreofAssessment={totalScoreofAssessment}
        />
        <ReportComponent
          ref={reportRef}
          scoreData={scoreDataToUse}
          assessmentId={assessmentId}
          assessmentName={assessmentName}
          userName={userName}
          userAge={userAge}
          mainCategory={mainCategory}
          totalQuestions={totalQuestions}
        />
      </div>

      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          html, body { background: #fff; }
          .print\\:hidden { display: none !important; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        }
           @media print {
    .break-inside-avoid { 
      break-inside: avoid; 
      page-break-inside: avoid;
      margin-bottom: 0.5rem !important;
    }
    .cognitive-breakdown-grid {
      gap: 0.25rem !important;
    }
    .cognitive-item {
      padding: 0.5rem !important;
      margin-bottom: 0.25rem;
    }
  }
      `}</style>
    </div>
  );
};

export default AssessmentCompletionModal;