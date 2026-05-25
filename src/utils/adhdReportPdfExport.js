import { toPng } from 'html-to-image';

/**
 * Adds a PNG (any height) to jsPDF, tiling vertically across A4 pages when needed.
 */
export function appendSplitPngToPdf(pdf, dataUrl, pageWmm, pageHmm, startNewSectionPage) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scaledHmm = (img.height * pageWmm) / img.width;
        let heightLeft = scaledHmm;
        let position = 0;

        if (startNewSectionPage) pdf.addPage();

        pdf.addImage(dataUrl, 'PNG', 0, position, pageWmm, scaledHmm, undefined, 'FAST');
        heightLeft -= pageHmm;

        while (heightLeft >= 0) {
          position = heightLeft - scaledHmm;
          pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', 0, position, pageWmm, scaledHmm, undefined, 'FAST');
          heightLeft -= pageHmm;
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Snapshot one ADHD report section node at full height (no single-page clip).
 */
export async function snapshotAdhdReportSection(node, widthPx) {
  const h = Math.ceil(
    Math.max(node.scrollHeight, node.getBoundingClientRect().height),
  );
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    width: widthPx,
    height: h,
    style: {
      width: `${widthPx}px`,
      height: `${h}px`,
    },
  });
}
