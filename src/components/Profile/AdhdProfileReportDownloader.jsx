import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { jsPDF } from 'jspdf';
import AdhdReport from '../Report/AdhdReport/AdhdReport.jsx';
import { A4_WIDTH_PX } from '../Report/AdhdReport/parts.jsx';
import { snapshotAdhdReportSection } from '../../utils/adhdReportPdfExport.js';

function waitLayout() {
  return new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r)),
  );
}

/**
 * Hidden renderer + PDF generator for ADHD reports on Profile (past submissions).
 */
const AdhdProfileReportDownloader = forwardRef(
  (
    {
      apiData,
      reportListId,
      onDownloadStart,
      onDownloadEnd,
    },
    ref,
  ) => {
    const reportContainerRef = useRef(null);

    const handleDownloadReport = useCallback(async () => {
      if (!apiData) return;
      const id = reportListId || apiData?.assessmentMeta?.reportId || 'adhd';

      onDownloadStart?.(`report-${id}`);
      try {
        await waitLayout();
        await new Promise((r) => setTimeout(r, 450));

        const node = reportContainerRef.current;
        if (!node) throw new Error('Report preview is not ready yet.');

        const dataUrl = await snapshotAdhdReportSection(node, A4_WIDTH_PX);

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

        const pdfWidth = 210;
        const margin = 10;
        const contentWidth = pdfWidth - margin * 2;
        const scaledHeight = (img.height * contentWidth) / img.width;
        const pdfHeight = scaledHeight + margin * 2;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfWidth, pdfHeight] });
        pdf.addImage(dataUrl, 'PNG', margin, margin, contentWidth, scaledHeight);

        const first = apiData?.userInfo?.firstName
          ? `${String(apiData.userInfo.firstName).replace(/[^\w\-]+/g, '')}-`
          : '';
        const rid = apiData?.assessmentMeta?.reportId || id;
        pdf.save(`ADHD-Report-${first}${rid}.pdf`);
      } catch (e) {
        console.error(e);
        alert(e?.message || 'Could not generate ADHD report.');
      } finally {
        onDownloadEnd?.();
      }
    }, [apiData, reportListId, onDownloadStart, onDownloadEnd]);

    useImperativeHandle(
      ref,
      () => ({
        downloadCertificate: () => {},
        downloadReport: handleDownloadReport,
      }),
      [handleDownloadReport],
    );

    if (!apiData || typeof apiData !== 'object') return null;

    return (
      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: '-200vw',
          top: 0,
          zIndex: -1,
          opacity: 0,
          pointerEvents: 'none',
          width: A4_WIDTH_PX,
        }}
      >
        <AdhdReport
          ref={reportContainerRef}
          apiData={apiData}
        />
      </div>
    );
  },
);

AdhdProfileReportDownloader.displayName = 'AdhdProfileReportDownloader';

export default AdhdProfileReportDownloader;
