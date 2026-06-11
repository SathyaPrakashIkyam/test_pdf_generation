import { jsPDF } from 'jspdf';
import { logoBase64 } from '../logo_base64';

/**
 * Converts a numeric amount into standard Indian English Words.
 * (e.g. 48300 -> "Rupees Forty Eight Thousand Three Hundred Only")
 * 
 * @param {number} amount 
 * @returns {string} Words representation of the amount
 */
export const numberToIndianWords = (amount) => {
  if (amount === 0) return 'Rupees Zero Only';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

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

  let num = Math.floor(absAmount);

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
  return `Rupees ${isNegative ? "Minus " : ""}${words} Only`;
};

/**
 * Generates a pixel-perfect receipt PDF matching the exact layout and dimensions
 * of the screenshot and sample PDF.
 * 
 * @param {Object} data - Receipt transaction data object
 */
export const generateReceiptPDF = (data = {}) => {
  // Ensure data is array
  const items = Array.isArray(data) ? data : (data ? [data] : []);
  const firstItem = items[0] || {};
  const lastItem = items[items.length - 1] || {};

  const {
    DocNum = "",
    Date: DocDate = "",
    CompanyName = "",
    BranchBlock = "",
    BranchCity = "",
    Branch_State = "",
    BranchZipCode = "",
    Branch_State_Code = "",
    BranchName = "",
    B_Name = "",
    B_Block = "",
    BranchCountry = "India"
  } = firstItem;

  // Extract total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.Amount || 0), 0);

  // Extract unique/merged Through and UTRNO from all items
  const Through = items.map(item => item.Through).filter(Boolean).join(", ") || firstItem.Through || "";
  const UTRNO = items.map(item => item.UTRNO).filter(Boolean).join(", ") || firstItem.UTRNO || "";
  
  // Display On Account of using the DocRemarks of the last item in the list
  const DocRemarks = lastItem.DocRemarks || "";
  const RowDocNum = lastItem.RowDocNum || "";

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
  const logoDataUrl = (() => {
    if (!logoBase64 || logoBase64.includes("PASTE_YOUR_BASE64_HERE")) return null;
    if (logoBase64.startsWith("data:image")) return logoBase64;
    return `data:image/png;base64,${logoBase64}`;
  })();

  if (logoDataUrl) {
    // Render the premium image logo
    doc.addImage(logoDataUrl, 'PNG', 12, 13, 28, 9);
  } else {
    // Fallback text if base64 is missing
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('DADA', 12, 22);
  }

  // Centered Company Information
  const centerX = 105;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(CompanyName, centerX, 15, { align: 'center' });

  // Formulate Address Line 1 and 2 safely to match screenshot
  const branchNameText = BranchName || B_Name || "";
  const blockText = BranchBlock || B_Block || "";
  const cityText = BranchCity || "";
  const zipText = BranchZipCode || "";
  const stateText = Branch_State || "";
  const countryText = BranchCountry || "India";

  let addressLine1 = "";
  let addressLine2 = "";

  if (blockText.includes("G.T.Road,")) {
    const splitIndex = blockText.indexOf("G.T.Road,") + "G.T.Road,".length;
    const part1 = blockText.substring(0, splitIndex).trim();
    const part2 = blockText.substring(splitIndex).trim();
    
    addressLine1 = branchNameText ? `${branchNameText}, ${part1}` : part1;
    addressLine2 = `${part2} ${cityText} ${stateText} - ${zipText} ${countryText}`.replace(/\s+/g, ' ').trim();
  } else {
    addressLine1 = branchNameText ? `${branchNameText}, ${blockText}` : blockText;
    addressLine2 = `${cityText} ${stateText} - ${zipText} ${countryText}`.replace(/\s+/g, ' ').trim();
  }

  // Address line 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(addressLine1, centerX, 20, { align: 'center' });

  // Address line 2 safely
  doc.text(addressLine2, centerX, 24, { align: 'center' });

  // State Name & Code
  doc.text(`State Name : ${Branch_State}      Code : ${Branch_State_Code}`, centerX, 29, { align: 'center' });

  // "Receipt" Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Receipt', centerX, 36, { align: 'center' });

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
  let currentY = 63;
  items.forEach((item) => {
    // "Account :"
    doc.setFont('helvetica', 'bold');
    doc.text('Account :', startX + 2, currentY);

    // Account details (Indented text) - no dot, just space to match design screenshot
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.CardCode || ""} ${item.CardName || ""}`, startX + 25, currentY + 5);

    // Right-aligned amount for the account
    const itemAmount = item.Amount || 0;
    const formattedItemAmount = itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    doc.text(formattedItemAmount, endX - 2, currentY, { align: 'right' });

    currentY += 12; // Advance to next account item
  });

  // "Through : "
  doc.setFont('helvetica', 'bold');
  doc.text('Through : ', startX + 2, 102);
  const throughLabelWidth = doc.getTextWidth('Through : ');
  doc.setFont('helvetica', 'normal');
  doc.text(Through, startX + 2 + throughLabelWidth, 102);

  // Formulate On Account Of text
  let onAccountOfText = "";
  if (DocRemarks) {
    if (RowDocNum && RowDocNum === "Payment On Account") {
      onAccountOfText = `${RowDocNum} - ${DocRemarks}`;
    } else {
      onAccountOfText = DocRemarks;
    }
  } else {
    onAccountOfText = RowDocNum;
  }

  // "On Account of : "
  doc.setFont('helvetica', 'bold');
  doc.text('On Account of : ', startX + 2, 108);
  const onAccountLabelWidth = doc.getTextWidth('On Account of : ');
  doc.setFont('helvetica', 'normal');
  doc.text(onAccountOfText, startX + 2 + onAccountLabelWidth, 108);

  // "UTR No. :" (render only if present)
  if (UTRNO) {
    doc.setFont('helvetica', 'bold');
    doc.text('UTR No. : ', startX + 2, 114);
    const utrLabelWidth = doc.getTextWidth('UTR No. : ');
    doc.setFont('helvetica', 'normal');
    doc.text(UTRNO, startX + 2 + utrLabelWidth, 114);
  }

  // --- Total Separator & Value (Inside Amount column) ---

  // Horizontal line above total amount (only in the right column, Y=112)
  doc.line(colSeparatorX, 112, endX, 112);

  // Total amount value (Y=117)
  doc.setFont('helvetica', 'bold');
  const formattedTotalAmount = totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  doc.text(formattedTotalAmount, endX - 2, 117, { align: 'right' });


  // --- Box Bottom Row Separator (Y=120) ---
  doc.line(startX, 120, endX, 120);


  // --- Bottom Section ---

  // "Amount (in Words) : "
  const amountWordsText = numberToIndianWords(totalAmount);
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
