
// export const generatePDF = (elementId: string, filename: string) => {
//   const element = document.getElementById(elementId);
//   if (!element) {
//     console.error(`Element with id "${elementId}" not found`);
//     return;
//   }

//   // Create a print-specific stylesheet that matches the UI format
//   const printStyles = `
//     @media print {
//       * {
//         -webkit-print-color-adjust: exact !important;
//         color-adjust: exact !important;
//         print-color-adjust: exact !important;
//       }

//       body {
//         margin: 0;
//         padding: 20px;
//         font-family: Arial, sans-serif;
//         font-size: 12pt;
//         line-height: 1.5;
//         color: #000;
//         background: white;
//       }

//       .no-print {
//         display: none !important;
//       }

//       .question-paper-content {
//         max-width: none;
//         margin: 0;
//         padding: 0;
//         box-shadow: none;
//         border: none;
//       }

//       .header {
//         text-align: center;
//         margin-bottom: 25px;
//         page-break-inside: avoid;
//       }

//       .header img {
//         max-height: 80px;
//         margin-bottom: 10px;
//       }

//       .header h2 {
//         font-size: 18pt;
//         font-weight: bold;
//         margin: 8px 0;
//         color: #000;
//       }

//       .header h3 {
//         font-size: 16pt;
//         font-weight: 600;
//         margin: 8px 0 20px 0;
//         color: #333;
//       }

//       .exam-details {
//         display: flex;
//         justify-content: space-between;
//         border-bottom: 2px solid #000;
//         padding-bottom: 8px;
//         margin-bottom: 25px;
//         font-size: 11pt;
//         font-weight: normal;
//       }

//       .section-title {
//         font-size: 14pt;
//         font-weight: bold;
//         text-decoration: underline;
//         margin: 20px 0 15px 0;
//         color: #000;
//         page-break-after: avoid;
//       }

//       .question {
//         margin-bottom: 18px;
//         page-break-inside: avoid;
//         orphans: 2;
//         widows: 2;
//       }

//       .question-header {
//         display: block;
//         margin-bottom: 8px;
//       }

//       .question-number {
//         font-weight: bold;
//         font-size: 12pt;
//         display: inline;
//         margin-right: 8px;
//       }

//       .difficulty-badge {
//         background: #f5f5f5 !important;
//         padding: 2px 6px;
//         border-radius: 8px;
//         font-size: 9pt;
//         border: 1px solid #ddd;
//         display: inline-block;
//         margin-left: 8px;
//       }

//       .question-text {
//         font-size: 12pt;
//         line-height: 1.4;
//         margin: 8px 0;
//         color: #000;
//         display: inline;
//       }

//       .question-options {
//         margin: 8px 0 8px 20px;
//         font-size: 11pt;
//       }

//       .question-options div {
//         margin-bottom: 3px;
//       }

//       .sub-questions {
//         margin-left: 25px;
//         margin-top: 8px;
//         border-left: 2px solid #ddd;
//         padding-left: 15px;
//       }

//       .sub-question {
//         margin-bottom: 6px;
//         font-size: 11pt;
//         display: flex;
//         justify-content: space-between;
//         align-items: flex-start;
//       }

//       .marks {
//         font-weight: bold;
//         color: #000;
//         font-size: 11pt;
//         white-space: nowrap;
//         margin-left: 10px;
//       }

//       .unit-info {
//         font-size: 10pt;
//         color: #666;
//         font-style: italic;
//         margin-top: 4px;
//       }

//       .footer {
//         margin-top: 25px;
//         padding-top: 10px;
//         border-top: 1px solid #ccc;
//         text-align: center;
//         font-size: 10pt;
//         color: #666;
//         page-break-inside: avoid;
//       }

//       @page {
//         margin: 0.75in;
//         size: A4;
//       }

//       h1, h2, h3, h4 {
//         page-break-after: avoid;
//       }

//       /* Ensure proper spacing and layout */
//       .flex {
//         display: block !important;
//       }

//       .flex-col, .flex-row {
//         display: block !important;
//       }

//       .justify-between {
//         display: block !important;
//       }

//       .items-center, .items-start {
//         display: block !important;
//       }

//       /* Override any grid layouts for print */
//       .grid {
//         display: block !important;
//       }
//     }
//   `;

//   // Clone the element to avoid modifying the original
//   const clonedElement = element.cloneNode(true) as HTMLElement;

//   // Create a new window for printing
//   const printWindow = window.open('', '_blank', 'width=800,height=600');

//   if (!printWindow) {
//     console.error('Failed to open print window');
//     return;
//   }

//   // Build the complete HTML document
//   const htmlContent = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>${filename}</title>
//       <style>${printStyles}</style>
//     </head>
//     <body>
//       ${clonedElement.innerHTML}
//     </body>
//     </html>
//   `;

//   printWindow.document.write(htmlContent);
//   printWindow.document.close();

//   // Wait for the content to load, then print
//   printWindow.onload = () => {
//     setTimeout(() => {
//       printWindow.print();
//       // Close the window after printing (optional)
//       setTimeout(() => {
//         printWindow.close();
//       }, 1000);
//     }, 500);
//   };
// };



import html2canvas from "html2canvas";
import jsPDF from "jspdf";





export const generatePDF = async (elementId: string, filename: string): Promise<Blob | undefined> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Your custom styling equivalent to html2pdf config
  const marginInInches = 0.5;
  const pdf = new jsPDF({
    unit: 'in',
    format: 'letter', // equivalent to A4 in US
    orientation: 'portrait',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Convert element to canvas with scale and CORS support
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const imgWidth = pageWidth - 2 * marginInInches;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = marginInInches;

  pdf.addImage(imgData, 'JPEG', marginInInches, y, imgWidth, imgHeight);

  // Add pages if image overflows
  while (y + imgHeight > pageHeight) {
    y -= pageHeight - 2 * marginInInches;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', marginInInches, y, imgWidth, imgHeight);
  }

  // Save or return as Blob
  return pdf.output('blob') as Blob;
};


