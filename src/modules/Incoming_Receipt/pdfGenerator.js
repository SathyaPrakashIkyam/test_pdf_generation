import { jsPDF } from 'jspdf';

/**
 * Converts a numeric amount into standard Indian English Words.
 * (e.g. 48300 -> "Rupees Forty Eight Thousand Three Hundred Only")
 * 
 * @param {number} amount 
 * @returns {string} Words representation of the amount
 */
export const numberToIndianWords = (amount) => {
  if (amount === 0) return 'Rupees Zero Only';

  const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const doubleDigits = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  function getTwoDigitWord(n) {
    if (n === 0) return "";
    if (n < 10) return singleDigits[n];
    if (n < 20) return teens[n - 10];
    const digit1 = Math.floor(n / 10);
    const digit2 = n % 10;
    return doubleDigits[digit1] + (digit2 > 0 ? " " + singleDigits[digit2] : "");
  }

  function getThreeDigitWord(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let word = "";
    if (hundred > 0) {
      word += singleDigits[hundred] + " Hundred";
    }
    if (rest > 0) {
      word += (word !== "" ? " " : "") + getTwoDigitWord(rest);
    }
    return word;
  }

  let num = Math.floor(amount);

  let crore = Math.floor(num / 10000000);
  num %= 10000000;
  let lakh = Math.floor(num / 100000);
  num %= 100000;
  let thousand = Math.floor(num / 1000);
  num %= 1000;
  let hundred = num;

  let words = "";

  if (crore > 0) {
    words += getThreeDigitWord(crore) + " Crore ";
  }
  if (lakh > 0) {
    words += getTwoDigitWord(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    words += getTwoDigitWord(thousand) + " Thousand ";
  }
  if (hundred > 0) {
    words += getThreeDigitWord(hundred);
  }

  words = words.trim();
  return `Rupees ${words} Only`;
};

/**
 * Generates a pixel-perfect receipt PDF matching the exact layout and dimensions
 * of the screenshot and sample PDF.
 * 
 * @param {Object} data - Receipt transaction data object
 */
export const generateReceiptPDF = (data = {}) => {
  // Destructure and assign empty defaults if values are missing
  const {
    DocNum = "",
    Date: DocDate = "",
    CardCode = "",
    CardName = "",
    Amount = 0,
    Through = "",
    CompanyName = "",
    BranchBlock = "",
    BranchCity = "",
    Branch_State = "",
    BranchZipCode = "",
    Branch_State_Code = "",
    RowDocNum = "",
    DocRemarks = "",
    UTRNO = "",
  } = data || {};

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

  // --- Main Content Boxed Area ---
  const startX = 10;
  const startY = 10; // Box starts at Y=10
  const boxWidth = 190;
  const boxHeight = 146; // Box height extended to Y=156
  const endX = startX + boxWidth; // 200
  const endY = startY + boxHeight; // 156

  // Draw the outer rectangle enclosing the entire receipt content
  doc.rect(startX, startY, boxWidth, boxHeight);

  // --- Header Section inside Box ---

  // "DADA" Logo on top-left (inside box)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('DADA', 12, 22);

  // Centered Company Information
  const centerX = 105;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(CompanyName, centerX, 15, { align: 'center' });

  // Address line 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(BranchBlock, centerX, 20, { align: 'center' });

  // Address line 2 safely
  let addressLine2 = "";
  if (BranchCity || BranchZipCode) {
    const cityText = BranchCity || "";
    const zipText = BranchZipCode || "";
    const stateText = Branch_State ? `, ${Branch_State}` : "";

    if (cityText.includes("India") || zipText.includes("India")) {
      addressLine2 = `${cityText} ${zipText}`.trim();
    } else {
      addressLine2 = `${cityText}${stateText}${zipText ? " - " + zipText : ""} India`.trim();
    }
  }
  doc.text(addressLine2, centerX, 24, { align: 'center' });

  // State Name & Code
  doc.text(`State Name : ${Branch_State}      Code : ${Branch_State_Code}`, centerX, 29, { align: 'center' });

  // "Receipt" Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Receipt', centerX, 36, { align: 'center' });

  // Line 1: Divider below Header Section (Y=41)


  // Receipt No (Left side)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`No. : ${DocNum}`, startX + 2, 45.5);

  // Date (Right side with bold date value)
  doc.setFont('helvetica', 'bold');
  doc.text(DocDate, endX - 2, 45.5, { align: 'right' });
  const dateValWidth = doc.getTextWidth(DocDate);

  doc.setFont('helvetica', 'normal');
  doc.text('Date : ', endX - 2 - dateValWidth, 45.5, { align: 'right' });

  // Line 2: Divider below No. & Date row (Y=48)
  doc.line(startX, 48, endX, 48);

  // Header "Particulars" (Y=52.5)
  doc.text('Particulars', startX + 2, 52.5);

  // Header "Amount" (Y=52.5)
  doc.text('Amount', endX - 2, 52.5, { align: 'right' });

  // Line 3: Divider below Column Headers (Y=55)
  doc.line(startX, 55, endX, 55);

  // Vertical column separator (X=152)
  // Starts below No. & Date row (Y=48) and ends at bottom of table body row (Y=120)
  const colSeparatorX = 152;
  doc.line(colSeparatorX, 48, colSeparatorX, 120);



  // --- Table Body (Y=58 to Y=120) ---

  // "Account :"
  doc.setFont('helvetica', 'bold');
  doc.text('Account :', startX + 2, 63);

  // Account details (Indented text)
  doc.setFont('helvetica', 'normal');
  doc.text(`${CardCode} .${CardName}`, startX + 25, 68);

  // Right-aligned amount for the account
  const formattedAmount = Amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  doc.text(formattedAmount, endX - 2, 63, { align: 'right' });

  // "Through : Cash in Hand SR"
  doc.setFont('helvetica', 'bold');
  doc.text('Through : ', startX + 2, 102);
  const throughLabelWidth = doc.getTextWidth('Through : ');
  doc.setFont('helvetica', 'normal');
  doc.text(Through, startX + 2 + throughLabelWidth, 102);

  // "On Account of : RBR26D005425 Dated: 13-03-2026"
  // Combine RowDocNum and DocRemarks nicely if present
  let onAccountOfText = RowDocNum;
  if (DocRemarks) {
    onAccountOfText = `${RowDocNum} - ${DocRemarks}`;
  }
  doc.setFont('helvetica', 'bold');
  doc.text('On Account of : ', startX + 2, 108);
  const onAccountLabelWidth = doc.getTextWidth('On Account of : ');
  doc.setFont('helvetica', 'normal');
  doc.text(onAccountOfText, startX + 2 + onAccountLabelWidth, 108);

  // "UTR No. :"
  doc.setFont('helvetica', 'bold');
  doc.text(`UTR No. : ${UTRNO}`, startX + 2, 114);


  // --- Total Separator & Value (Inside Amount column) ---

  // Horizontal line above total amount (only in the right column, Y=112)
  doc.line(colSeparatorX, 112, endX, 112);

  // Total amount value (Y=117)
  doc.setFont('helvetica', 'bold');
  doc.text(formattedAmount, endX - 2, 117, { align: 'right' });


  // --- Box Bottom Row Separator (Y=120) ---
  doc.line(startX, 120, endX, 120);


  // --- Bottom Section ---

  // "Amount (in Words) : Rupees One Only" (Left side, Y=128)
  const amountWordsText = numberToIndianWords(Amount);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount (in Words) : ', startX + 2, 128);
  const amountWordsWidth = doc.getTextWidth('Amount (in Words) : ');
  doc.setFont('helvetica', 'normal');
  doc.text(amountWordsText, startX + 2 + amountWordsWidth, 128);

  // "For DADA MOTOR ENTERPRISES LLP" (Right side, Y=126)
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${CompanyName}`, endX - 2, 126, { align: 'right' });

  // "Authorised Signatory" (Right side, Y=150)
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', endX - 2, 150, { align: 'right' });

  // Trigger download
  doc.save(`Receipt_${DocNum}.pdf`);
};
