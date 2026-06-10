import { jsPDF } from 'jspdf';

/**
 * Converts a numeric check amount into words specifically formatted for cheques.
 * (e.g. 10 -> "Ten only", 100 -> "Hundred only")
 * 
 * @param {number} amount 
 * @returns {string} Words representation of the amount
 */
export const chequeNumberToWords = (amount) => {
  if (!amount || isNaN(amount)) return "";

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
  if (!words) return "";

  // Override specific cases as requested by USER
  if (words === "One Hundred") {
    return "Hundred only";
  }

  return `${words} only`;
};

/**
 * Generates a pixel-perfect Cheque Printout PDF matching standard portrait A4 format
 * with vertical printed text lines matching the physical printer feed.
 * 
 * @param {Object} data - Cheque transactional data object
 */
export const generateChequePDF = (data = {}) => {
  const {
    Y1 = "", Y2 = "", Y3 = "", Y4 = "",
    M1 = "", M2 = "",
    D1 = "", D2 = "",
    VendorName = "",
    TotalWords = "",
    CheckSum = 0,
  } = data || {};

  // Standard A4 dimensions: 210mm x 297mm (Portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setTextColor(0, 0, 0);

  // 1. --- A/C Payee Only (X = 75mm, Y = 50mm) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('A/C Payee Only', 145, 49, { angle: 270 });

  // 2. --- Date Digits (X = 180mm, Y = 145mm) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.6);

  const dateDigits = [D1, D2, M1, M2, Y1, Y2, Y3, Y4];
  const dateX = 148;
  const dateStartY = 164;
  const dateSpacing = 5.5;

  dateDigits.forEach((digit, index) => {
    doc.text(digit || "", dateX, dateStartY + (index * dateSpacing), { angle: 270 });
  });

  // 3. --- Payee Name (VendorName) (X = 60mm, Y = 50mm) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.7);
  doc.text(VendorName, 133.5, 20, { angle: 270 });

  // 4. --- Amount in Words (TotalWords) (X = 45mm, Y = 95mm) ---
  const calculatedWords = chequeNumberToWords(CheckSum) || TotalWords;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(calculatedWords, 124.8, 31.9, { angle: 270 });

  // 5. --- Amount in Figures (CheckSum) (X = 165mm, Y = 150mm) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const formattedAmount = `***     `;
  doc.text(formattedAmount, 114, 165, { angle: 270 });
  doc.setFontSize(11);
  const formattedAmount2 = `${CheckSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.text(formattedAmount2, 115, 174, { angle: 270 });

  // Trigger download
  const sanitizedVendor = VendorName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`Cheque_${sanitizedVendor}_${CheckSum}.pdf`);
};