import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { toPng } from 'html-to-image';
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
    } finally {
      onDownloadEnd();
    }
  };

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    
    onDownloadStart(`report-${assessment._id}`);
    try {
      // Create a new window with the report content
      const printWindow = window.open('', '_blank');
      const reportContent = reportRef.current.outerHTML;
      
      // Get all CSS from the current page
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            // Handle cross-origin stylesheets
            const link = styleSheet.ownerNode;
            if (link && link.href) {
              return `@import url("${link.href}");`;
            }
            return '';
          }
        })
        .join('\n');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${assessment.assessmentName} Report</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              ${styles}
              
              /* Additional print-specific styles */
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                .print\\:shadow-none { box-shadow: none !important; }
                .print\\:w-\\[210mm\\] { width: 210mm !important; }
                .print\\:min-h-\\[297mm\\] { min-height: 297mm !important; }
              }
              
              /* Ensure proper styling */
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.5;
                color: #000;
                background: #fff;
              }
            </style>
          </head>
          <body>
            ${reportContent}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content and styles to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
      
    } catch (error) {
      console.error("Error generating report:", error);
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
    <div style={{ 
      position: 'fixed', 
      left: '-10000px', 
      top: 0, 
      width: '1000px', 
      zIndex: -1 
    }}>
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
