import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import CertificateComponent from '../Certificate/CertificateComponent.jsx';
import ReportComponent from '../Report/ReportComponent.jsx';

const AssessmentDownloader = forwardRef(({ assessment, onDownloadStart, onDownloadEnd }, ref) => {
  const certificateRef = useRef(null);
  const reportRef = useRef(null);

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    onDownloadStart(`certificate-${assessment._id}`);
    try {
      await new Promise(r => setTimeout(r, 300));
      const dataUrl = await toPng(certificateRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, 
        backgroundColor: "#f5f2ec" 
      });
      const link = document.createElement('a');
      link.download = `Certificate-${assessment.assessmentId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      onDownloadEnd();
    }
  };

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    
    onDownloadStart(`report-${assessment._id}`);
    
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
      pdf.save(`Report-${assessment.assessmentId || assessment._id}.pdf`);
      
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
        link.download = `Report-${assessment.assessmentId || assessment._id}.png`;
        link.href = dataUrl;
        link.click();
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        alert("Unable to generate report. Please try again or use a different browser.");
      }
    } finally {
      onDownloadEnd();
    }
  };

  // Expose download functions to parent
  useImperativeHandle(ref, () => ({
    downloadCertificate: handleDownloadCertificate,
    downloadReport: handleDownloadReport
  }));

  return (
    <div 
      className="pdf-render-container"
      style={{ 
        position: 'absolute', 
        left: '-9999px', 
        top: '-9999px', 
        width: '850px', 
        opacity: 0,
        pointerEvents: 'none',
        backgroundColor: '#fff'
      }}
    >
      <CertificateComponent
        ref={certificateRef}
        scoreData={{
          _id: assessment._id,
          totalScore: assessment.totalScore,
          outOfScore: assessment.totalQuestions,
          date: assessment.date,
          byCategory: assessment.byCategory,
          mainCategory: assessment.mainCategory
        }}
        assessmentId={assessment.assessmentId}
        userName={assessment.userName}
        totalScoreofAssessment={assessment.programScore}
        programScores={{ [assessment.mainCategory]: assessment.programScore }}
        mainCategory={assessment.mainCategory}
      />
      <ReportComponent
        ref={reportRef}
        scoreData={{
          _id: assessment._id,
          totalScore: assessment.totalScore,
          outOfScore: assessment.totalQuestions,
          date: assessment.date,
          byCategory: assessment.byCategory,
          mainCategory: assessment.mainCategory
        }}
        assessmentId={assessment.assessmentId}
        assessmentName={assessment.assessmentName}
        userName={assessment.userName}
        userAge={assessment.userAge}
        mainCategory={assessment.mainCategory}
        totalQuestions={assessment.totalQuestions}
        programScores={{ [assessment.mainCategory]: assessment.programScore }}
      />
    </div>
  );
});

AssessmentDownloader.displayName = 'AssessmentDownloader';

export default AssessmentDownloader;
