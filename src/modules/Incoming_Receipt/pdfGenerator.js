import { jsPDF } from 'jspdf';

/**
 * Generates a pixel-perfect receipt PDF matching the exact layout and dimensions
 * of the screenshot and sample PDF.
 * 
 * @param {Object} options 
 * @param {Object} options.data - Data to populate (for now hardcoded, but flexible for future integration)
 */
export const generateReceiptPDF = (options = {}) => {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set draw color to black and line width to 0.2mm for crisp borders
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.setTextColor(0, 0, 0);

  // --- Header Section ---
  
  // "DADA" Logo on top-left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('DADA', 12, 22);

  // Centered Company Information
  const centerX = 105;
  
  // "DADA MOTOR ENTERPRISES LLP"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DADA MOTOR ENTERPRISES LLP', centerX, 15, { align: 'center' });

  // Address line 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Mahindra Sirhind, OPP CHEEMA HAVELI, G.T.Road,', centerX, 20, { align: 'center' });

  // Address line 2
  doc.text('Village-Harbanspura,Fatehgarh Sahib, Sirhind Punjab - 140406 India', centerX, 24, { align: 'center' });

  // State Name & Code
  doc.text('State Name : Punjab      Code : 03', centerX, 29, { align: 'center' });

  // "Receipt" Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Receipt', centerX, 37, { align: 'center' });


  // --- Main Content Boxed Area ---
  
  // Outer rectangle border
  // Starting at X=10, Y=44, Width=190, Height=112
  const startX = 10;
  const startY = 44;
  const boxWidth = 190;
  const boxHeight = 112;
  const endX = startX + boxWidth; // 200
  const endY = startY + boxHeight; // 156
  
  doc.rect(startX, startY, boxWidth, boxHeight);

  // Line 1: Border below No. & Date row (Y=51)
  doc.line(startX, 51, endX, 51);

  // Receipt No (Left side)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('No. : D16IP26501501127', startX + 2, 48.5);

  // Date (Right side with bold date value)
  const dateVal = '08-06-2026';
  const dateLabel = 'Date : ';
  
  doc.setFont('helvetica', 'bold');
  doc.text(dateVal, endX - 2, 48.5, { align: 'right' });
  const dateValWidth = doc.getTextWidth(dateVal);
  
  doc.setFont('helvetica', 'normal');
  doc.text(dateLabel, endX - 2 - dateValWidth, 48.5, { align: 'right' });


  // Line 2: Border below Column Headers (Y=58)
  doc.line(startX, 58, endX, 58);

  // Header "Particulars"
  doc.text('Particulars', startX + 2, 55);

  // Header "Amount"
  doc.text('Amount', endX - 2, 55, { align: 'right' });


  // Vertical column separator (X=152)
  // Starts below headers row (Y=51) and ends at bottom of table body row (Y=120)
  const colSeparatorX = 152;
  doc.line(colSeparatorX, 51, colSeparatorX, 120);


  // --- Table Body (Y=58 to Y=120) ---

  // "Account :"
  doc.setFont('helvetica', 'bold');
  doc.text('Account :', startX + 2, 63);

  // Account details (Indented text)
  doc.setFont('helvetica', 'normal');
  doc.text('R250521953 .Gurpreet Singh Sekhon', startX + 25, 68);

  // Right-aligned amount for the account
  doc.text('1.00', endX - 2, 63, { align: 'right' });

  // "Through : Cash in Hand SR"
  doc.setFont('helvetica', 'bold');
  doc.text('Through : ', startX + 2, 102);
  const throughLabelWidth = doc.getTextWidth('Through : ');
  doc.setFont('helvetica', 'normal');
  doc.text('Cash in Hand SR', startX + 2 + throughLabelWidth, 102);

  // "On Account of : RBR26D005425 Dated: 13-03-2026"
  doc.setFont('helvetica', 'bold');
  doc.text('On Account of : ', startX + 2, 108);
  const onAccountLabelWidth = doc.getTextWidth('On Account of : ');
  doc.setFont('helvetica', 'normal');
  doc.text('RBR26D005425 Dated: 13-03-2026', startX + 2 + onAccountLabelWidth, 108);

  // "UTR No. :"
  doc.setFont('helvetica', 'bold');
  doc.text('UTR No. :', startX + 2, 114);


  // --- Total Separator & Value (Inside Amount column) ---

  // Horizontal line above total amount (only in the right column, Y=112)
  doc.line(colSeparatorX, 112, endX, 112);

  // Total amount value (Y=117)
  doc.setFont('helvetica', 'bold');
  doc.text('1.00', endX - 2, 117, { align: 'right' });


  // --- Box Bottom Row Separator (Y=120) ---
  doc.line(startX, 120, endX, 120);


  // --- Bottom Section ---

  // "Amount (in Words) : Rupees One Only" (Left side, Y=128)
  doc.setFont('helvetica', 'bold');
  doc.text('Amount (in Words) : ', startX + 2, 128);
  const amountWordsWidth = doc.getTextWidth('Amount (in Words) : ');
  doc.setFont('helvetica', 'normal');
  doc.text('Rupees One Only', startX + 2 + amountWordsWidth, 128);

  // "For DADA MOTOR ENTERPRISES LLP" (Right side, Y=126)
  doc.setFont('helvetica', 'bold');
  doc.text('For DADA MOTOR ENTERPRISES LLP', endX - 2, 126, { align: 'right' });

  // "Authorised Signatory" (Right side, Y=150)
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', endX - 2, 150, { align: 'right' });

  // Trigger download
  doc.save('Receipt_D16IP26501501127.pdf');
};
