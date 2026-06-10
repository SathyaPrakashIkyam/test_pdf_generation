import React from 'react';
import { generateReceiptPDF, numberToIndianWords } from './pdfGenerator';
import './ReceiptViewer.css';

export default function ReceiptViewer({ data, onClose }) {
  const handleDownload = () => {
    generateReceiptPDF(data);
  };

  // Destructure and assign empty defaults if values are missing
  const {
    DocNum = "",
    Date: DocDate = "",
    CardCode = "",
    CardName = "",
    Amount = 0,
    Through = "",
    CompanyName = "",
    B_Name = "",
    B_Block = "",
    BranchBlock = "",
    BranchCity = "",
    Branch_State = "",
    BranchZipCode = "",
    Branch_State_Code = "",
    DocRemarks = "",
  } = data || {};

  // Formulate Address Line 2: "B_Name, B_Block BranchCity Branch_State - BranchZipCode"
  let addressLine2 = "";
  if (B_Name || BranchCity || BranchZipCode) {
    const prefix = B_Name ? `${B_Name}, ` : "";
    const mid = B_Block ? `${B_Block} ` : "";
    addressLine2 = `${prefix}${mid}${BranchCity} ${Branch_State} - ${BranchZipCode}`.trim();
  }

  // Format Amount to standard decimal representation
  const formattedAmount = Amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
                <div className="logo-section">DADA</div>
                <div className="company-info">
                  <h2>{CompanyName}</h2>
                  <p>{BranchBlock}</p>
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
                <div className="table-columns">
                  
                  {/* Left Column - Particulars */}
                  <div className="left-column">
                    <div className="account-section">
                      <span className="label-account">Account :</span>
                      <span className="value-account">{CardCode} {CardName}</span>
                    </div>
                  </div>

                  {/* Right Column - Amount */}
                  <div className="right-column text-right">
                    <div className="amount-value">{formattedAmount}</div>
                  </div>

                </div>

                {/* Total & Through Row */}
                <div className="total-through-row">
                  <div className="through-col">
                    <span className="field-label">Through :</span>
                    <span className="field-value">{Through}</span>
                  </div>
                  <div className="total-amount-col text-right">
                    {formattedAmount}
                  </div>
                </div>
              </div>

              {/* Bottom Section - Amount in Words and Authorized Signatory */}
              <div className="bottom-row">
                <div className="words-col">
                  <div className="field-row">
                    <span className="field-label">On Account of :</span>
                    <span className="field-value">{DocRemarks}</span>
                  </div>
                  <div className="field-row">
                    <span className="field-label">Amount (in Words) :</span>
                    <span className="field-value">{numberToIndianWords(Amount)}</span>
                  </div>
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
