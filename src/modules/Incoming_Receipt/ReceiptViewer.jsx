import React from 'react';
import { generateReceiptPDF, numberToIndianWords } from './pdfGenerator';
import { logoBase64 } from '../logo_base64';
import './ReceiptViewer.css';

export default function ReceiptViewer({ data, onClose }) {
  const handleDownload = () => {
    generateReceiptPDF(data);
  };

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

  // Construct Logo Data URL
  const logoDataUrl = (() => {
    if (!logoBase64 || logoBase64.includes("PASTE_YOUR_BASE64_HERE")) return null;
    if (logoBase64.startsWith("data:image")) return logoBase64;
    return `data:image/png;base64,${logoBase64}`;
  })();

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

  // Format Amount to standard decimal representation
  const formattedTotalAmount = totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Prevent click inside content from closing modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header Bar */}
        <div className="modal-header">
          <h3>Receipt Document Preview</h3>
          
          <div className="modal-actions">
            {/* Download Button inside Modal */}
            <button className="download-btn-sm" onClick={handleDownload}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
            
            {/* Close Button */}
            <button className="close-btn" onClick={onClose} aria-label="Close Preview">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Paper Receipt Preview */}
        <div className="modal-body">
          <div className="receipt-paper">
            
            {/* Main Boxed Layout */}
            <div className="content-box">
              
              {/* Header Section inside Box */}
              <div className="paper-header">
                {logoDataUrl ? (
                  <div className="logo-section logo-img-container">
                    <img src={logoDataUrl} alt="DADA Logo" className="logo-image" />
                  </div>
                ) : (
                  <div className="logo-section">DADA</div>
                )}
                <div className="company-info">
                  <h2>{CompanyName}</h2>
                  <p>{addressLine1}</p>
                  <p>{addressLine2}</p>
                  <p className="state-info">State Name : {Branch_State} &nbsp;&nbsp;&nbsp;&nbsp; Code : {Branch_State_Code}</p>
                </div>
              </div>

              <div className="document-title">Receipt</div>
              <div className="header-divider"></div>

              {/* Info Row: No. & Date */}
              <div className="info-row">
                <span className="receipt-no">No. : {DocNum}</span>
                <span className="receipt-date">
                  Date : &nbsp;<strong>{DocDate}</strong>
                </span>
              </div>

              {/* Column Header Row */}
              <div className="table-header-row">
                <div className="col-particulars">Particulars</div>
                <div className="col-amount text-right">Amount</div>
              </div>

              {/* Main Table Content */}
              <div className="table-body">
                <div className="table-grid-container">
                  {/* Account rows */}
                  {items.map((item, idx) => (
                    <div key={idx} className="particulars-row">
                      <div className="particulars-left">
                        <div className="account-section">
                          <span className="label-account">Account :</span>
                          <span className="value-account">{item.CardCode || ""} {item.CardName || ""}</span>
                        </div>
                      </div>
                      <div className="particulars-right text-right">
                        <span className="amount-value">
                          {(item.Amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Continuous vertical line spacer */}
                  <div className="particulars-spacer-row">
                    <div className="particulars-left spacer-cell"></div>
                    <div className="particulars-right spacer-cell"></div>
                  </div>

                  {/* Bottom particulars */}
                  <div className="particulars-bottom-row">
                    <div className="particulars-left">
                      <div className="bottom-particulars">
                        <div className="field-row">
                          <span className="field-label">Through :</span>
                          <span className="field-value">{Through}</span>
                        </div>
                        <div className="field-row">
                          <span className="field-label">On Account of :</span>
                          <span className="field-value">{onAccountOfText}</span>
                        </div>
                        {UTRNO && (
                          <div className="field-row">
                            <span className="field-label">UTR No. :</span>
                            <span className="field-value">{UTRNO}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="particulars-right text-right">
                      <div className="total-section">
                        <div className="total-border"></div>
                        <div className="total-value">{formattedTotalAmount}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Amount in Words and Authorized Signatory */}
              <div className="bottom-row">
                <div className="words-col">
                  <span className="field-label">Amount (in Words) :</span>
                  <span className="field-value">{numberToIndianWords(totalAmount)}</span>
                </div>
                
                <div className="signature-col text-right">
                  <div className="company-footer-name">For {CompanyName}</div>
                  <div className="sig-space"></div>
                  <div className="sig-label">Authorised Signatory</div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
