import React from 'react';
import ReceiptViewer from './modules/Incoming_Receipt/ReceiptViewer';
import './App.css';

function App() {
  const receiptData = {
    status: "success",
    data: [
      {
        DocNum: "D01IP26500000204",
        Date: "06-04-2026",
        CardCode: "R261544370",
        CardName: "VICKY SHARMA S/O MOHAN LAL",
        Amount: 48300.0,
        CheckNum: null,
        Through: "ICICI Bank Ltd-336705000554",
        CompanyAddress: "Grand Trunk Road, Dholewal Chowk,",
        CompanyCity: "Ludhiana-141003 ",
        RowDocNum: "Payment On Account",
        C_Email: "sapdme@dadamotors.com",
        CompanyName: "DADA MOTOR ENTERPRISES LLP",
        Employee: "",
        DocRemarks: "UPI Payment agt RC Fee",
        DocTotal: 48300.0,
        B_Block: "Savitri-III, G.T.Road, Dholewal Chowk,",
        B_Name: "Bajaj Ludhiana",
        BranchZipCode: "141003",
        BranchBlock: "Savitri-III, G.T.Road, Dholewal Chowk,",
        BranchCity: "Ludhiana",
        BranchCountry: "India",
        Branch_State: "Punjab",
        Branch_State_Code: "03",
        Branch_GSTIN: "03AARFD7944D1ZD",
        Branch_PAN: "AARFD7944D",
        BranchName: "Bajaj Ludhiana",
        Status: "OPEN",
        UTRNO: "864326228780",
        id__: 1,
      },
    ],
  };

  return (
    <div className="app-container">
      <ReceiptViewer data={receiptData.data[0]} />
    </div>
  );
}

export default App;
