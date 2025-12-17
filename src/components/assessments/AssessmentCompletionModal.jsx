import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrainSilhouetteIcon, CertificateLightIcon, SunnyEffectImage, ConquerBadge } from "../../../public/assessment";
import axios from 'axios';
import { API_CONNECTION_HOST_URL } from '../../utils/constant';
import { toPng } from "html-to-image";
import { jsPDF } from 'jspdf';
import CertificateComponent from '../Certificate/CertificateComponent';
import ReportComponent from '../Report/ReportComponent';
import { isComponentVisible } from '../../config/accessControl';
import TranslatedText from '../TranslatedText.jsx';

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
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const [downloading, setDownloading] = useState("");
  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [programScores, setProgramScores] = useState(null);
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

  // Fetch program scores when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchProgramScores = async () => {
        try {
          const stored = localStorage.getItem('user');
          if (!stored) return;
          
          const userData = JSON.parse(stored);
          const accessToken = userData?.accessToken || userData?.user?.token;
          if (!accessToken) return;

          const res = await axios.get(`${API_CONNECTION_HOST_URL}/assessment/program-scores-only`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (res.data?.status === 'success') {
            setProgramScores(res.data?.data || {});
          }
        } catch (error) {
          console.error("Failed to fetch program scores:", error);
        }
      };
      fetchProgramScores();
    }
  }, [isOpen]);

  // Get assessment type for dynamic content
  const assessmentType = assessmentDetails?.mainCategory || "IQ Test";
  const assessmentName = assessmentDetails?.title || "Cognitive Assessment";

  // Use scoreDetails if available, otherwise fall back to fullScoreData
  const scoreDataToUse = scoreDetails || fullScoreData;
  const mainCategory = scoreDataToUse?.mainCategory || assessmentDetails?.mainCategory || "iq-test";
  const userName = scoreDataToUse?.userName || "User";
  const userAge = scoreDataToUse?.userAge || "";
  const totalScoreofAssessment = scoreDataToUse?.totalScore || "0";

  // Visibility toggle for upsell section
  const showUpsell = isComponentVisible('assessmentCompletionUpsell');


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

  // Report download - uses html-to-image + jsPDF for proper PDF generation on all devices
  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    
    setDownloading("report");
    
    try {
      // Wait for any pending renders
      await new Promise(r => setTimeout(r, 300));
      
      // Generate image from the report using html-to-image
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      // Create image element to get dimensions
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // A4 width in mm, but custom height to fit all content
      const pdfWidth = 210;
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      
      // Calculate height based on image aspect ratio
      const imgAspectRatio = img.width / img.height;
      const scaledImgHeight = contentWidth / imgAspectRatio;
      const pdfHeight = scaledImgHeight + (margin * 2);
      
      // Create PDF with custom height to fit all content on one page
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight] // Custom page size
      });
      
      // Add the full image - no page breaks, no cut content
      pdf.addImage(dataUrl, 'PNG', margin, margin, contentWidth, scaledImgHeight);
      
      // Download the PDF
      pdf.save(`Report-${assessmentId}.pdf`);
      
    } catch (error) {
      console.error("Error generating report PDF:", error);
      
      // Fallback: Download as PNG image
      try {
        const dataUrl = await toPng(reportRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.download = `Report-${assessmentId}.png`;
        link.href = dataUrl;
        link.click();
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        alert("Unable to generate report. Please try again or use a different browser.");
      }
    } finally {
      setDownloading("");
    }
  };


  // Keyboard and focus management
  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current = document.activeElement;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
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

  const handleClose = () => {
    onClose();
    navigate('/assessments');
  };

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
        className="absolute inset-0"
        aria-label="Close"
        onClick={handleClose}
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
            <TranslatedText text="Assessment Complete" />
          </span>
        </div>

        <div className="w-full text-center mt-1">
          <h2 id="acm-title" className="text-center text-3xl font-bold italic text-[#208900]">
            <TranslatedText text="Well Done!" />
          </h2>
        </div>

        <div className="mt-3 mx-5">
          <div className="bg-[#FFF4F2] border border-[#FF6947] rounded-lg p-2">
            <p className="text-center text-lg font-semibold text-gray-800">
              <TranslatedText text="Your Score" />
            </p>
            <p className="text-center text-4xl font-bold text-[#FF6947]">{score}/{totalQuestions}</p>
          </div>
        </div>

        <hr className="border-t border-gray-200 mx-5 mt-4 mb-3" />

        <div className="px-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <TranslatedText text="Suggested for You" />
          </h3>
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
                        <p className="text-sm font-semibold text-gray-800">
                          <TranslatedText text="Download Certificate" />
                        </p>
                        <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                          <TranslatedText text="Your certified result is available" />
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
                      {downloading === "certificate"
                        ? <TranslatedText text="Generating..." />
                        : <TranslatedText text="Download" />}
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
                        <p className="text-sm font-semibold text-gray-800">
                          <TranslatedText text="Download Report" />
                        </p>
                        <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                          <TranslatedText text="Detailed performance report is available" />
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
                      {downloading === "report"
                        ? <TranslatedText text="Generating..." />
                        : <TranslatedText text="Download" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={showUpsell ? "w-full" : "w-full invisible"}>
              <div className="bg-white border border-orange-300 rounded-lg overflow-hidden shadow-sm w-full">
                <div className="bg-[#ffd9ce] w-full px-3 py-2">
                  <div className="flex items-center gap-3">
                    <img src={BrainSilhouetteIcon} alt="General Cognitive test" className="w-10 h-10 rounded p-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        <TranslatedText text="General Cognitive test" />
                      </p>
                      <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                        <TranslatedText text="Mini Test, 5-10 Question • Certified" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 flex flex-col gap-2">
                  <div className="flex items-start gap-2 text-[13px] text-gray-700">
                    <img src={CertificateLightIcon} alt="Certification" className="w-5 h-5 mt-0.5" />
                    <p className="text-xs">
                      <TranslatedText text="Get a certified result you can share on LinkedIn or with employers." />
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-gray-700">
                      <p>
                        <TranslatedText text="Only" />
                      </p>
                      <p className="text-lg font-bold text-black">€0.99</p>
                    </div>
                    <button className="px-4 py-1.5 text-[13px] bg-[#FF6B3D] text-white rounded-md font-semibold">
                      <TranslatedText text="Start Certified Test" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          ref={closeBtnRef}
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Hidden certificate and report elements for download */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '850px', opacity: 0, pointerEvents: 'none', backgroundColor: '#fff' }}>
        <CertificateComponent
          ref={certificateRef}
          scoreData={scoreDataToUse}
          assessmentId={assessmentId}
          userName={userName}
          totalScoreofAssessment={totalScoreofAssessment}
          programScores={programScores}
          mainCategory={mainCategory}
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
          programScores={programScores}
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


