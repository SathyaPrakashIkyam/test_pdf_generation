import React from 'react';
import { generateChequePDF, chequeNumberToWords } from './pdfGenerator';
import './ReceiptViewer.css';

export default function ChequeViewer({ data, onClose }) {
  const handleDownload = () => {
    generateChequePDF(data);
  };

  const {
    Y1 = "", Y2 = "", Y3 = "", Y4 = "",
    M1 = "", M2 = "",
    D1 = "", D2 = "",
    VendorName = "",
    TotalWords = "",
    CheckSum = 0,
  } = data || {};

  const calculatedWords = chequeNumberToWords(CheckSum) || TotalWords;
  const formattedAmount = `*** ${CheckSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cheque-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Cheque Document Preview</h3>
          <div className="modal-actions">
            <button className="download-btn-sm" onClick={handleDownload}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close Preview">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="modal-body cheque-body">
          <div className="cheque-paper portrait-feed-blank">
            
            {/* A/C Payee Only */}
            <div className="cheque-val-vertical ac-payee-vert">
              A/C Payee Only
            </div>

            {/* Date boxes vertical layout */}
            <div className="cheque-date-vertical-blank">
              <div className="date-char-vert">{D1}</div>
              <div className="date-char-vert">{D2}</div>
              <div className="date-char-vert">{M1}</div>
              <div className="date-char-vert">{M2}</div>
              <div className="date-char-vert">{Y1}</div>
              <div className="date-char-vert">{Y2}</div>
              <div className="date-char-vert">{Y3}</div>
              <div className="date-char-vert">{Y4}</div>
            </div>

            {/* Payee name row */}
            <div className="cheque-val-vertical payee-name-vert">
              {VendorName}
            </div>

            {/* Amount words row */}
            <div className="cheque-val-vertical payee-words-vert">
              {calculatedWords}
            </div>

            {/* Amount in figures box */}
            <div className="cheque-val-vertical amount-val-vert">
              {formattedAmount}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
