import React, { useState } from 'react';
import { generateReceiptPDF, numberToIndianWords } from './pdfGenerator';
import './ReceiptViewer.css';

export default function ReceiptViewer({ data }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = () => {
    generateReceiptPDF(data);
  };

  // Destructure and assign defaults to match original screenshot/PDF structure
  const {
    DocNum = "D16IP26501501127",
    Date: DocDate = "08-06-2026",
    CardCode = "R250521953",
    CardName = "Gurpreet Singh Sekhon",
    Amount = 1.0,
    Through = "Cash in Hand SR",
    CompanyName = "DADA MOTOR ENTERPRISES LLP",
    BranchBlock = "Mahindra Sirhind, OPP CHEEMA HAVELI, G.T.Road,",
    BranchCity = "Village-Harbanspura,Fatehgarh Sahib, Sirhind",
    Branch_State = "Punjab",
    BranchZipCode = "140406",
    Branch_State_Code = "03",
    RowDocNum = "RBR26D005425 Dated: 13-03-2026",
    DocRemarks = "",
    UTRNO = "",
  } = data || {};

  // Formulate Address Line 2
  const addressLine2 = (BranchCity.includes("India") || BranchZipCode.includes("India"))
    ? `${BranchCity} ${BranchZipCode}`
    : `${BranchCity}, ${Branch_State} - ${BranchZipCode} India`;

  // Formulate On Account Of text
  const onAccountOfText = DocRemarks ? `${RowDocNum} - ${DocRemarks}` : RowDocNum;

  // Format Amount to standard decimal representation
  const formattedAmount = Amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="receipt-container">
      {/* Landing / Control Card */}
      <div className="receipt-controls">
        <h1>Receipt Document System</h1>
        <p className="subtitle">
          Generate, verify, and export official company receipts. Click below to view the receipt preview and download the PDF.
        </p>
        
        {/* Trigger Button to Open Popup */}
        <button className="preview-trigger-btn" onClick={() => setIsModalOpen(true)}>
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View Receipt Preview
        </button>
      </div>

      {/* Modal / Popup Overlay */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
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
                <button className="close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close Preview">
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
                
                {/* Header Section */}
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

                {/* Main Boxed Layout */}
                <div className="content-box">
                  
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
                          <span className="value-account">{CardCode} .{CardName}</span>
                        </div>
                        
                        {/* Space pusher */}
                        <div className="vertical-spacer"></div>

                        <div className="bottom-particulars">
                          <div className="field-row">
                            <span className="field-label">Through :</span>
                            <span className="field-value">{Through}</span>
                          </div>
                          <div className="field-row">
                            <span className="field-label">On Account of :</span>
                            <span className="field-value">{onAccountOfText}</span>
                          </div>
                          <div className="field-row">
                            <span className="field-label">UTR No. :</span>
                            <span className="field-value">{UTRNO}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Amount */}
                      <div className="right-column text-right">
                        <div className="amount-value">{formattedAmount}</div>
                        
                        <div className="vertical-spacer"></div>

                        <div className="total-section">
                          <div className="total-border"></div>
                          <div className="total-value">{formattedAmount}</div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Bottom Section - Amount in Words and Authorized Signatory */}
                  <div className="bottom-row">
                    <div className="words-col">
                      <span className="field-label">Amount (in Words) :</span>
                      <span className="field-value">{numberToIndianWords(Amount)}</span>
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
      )}
    </div>
  );
}
