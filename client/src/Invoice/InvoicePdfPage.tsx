
import Invoice from "./Invoice";
import html2pdf from 'html2pdf.js';
import { useRef } from 'react';
import { useNavigate } from "react-router-dom";

const InvoicePdfPage = () => {
    const navigate = useNavigate();
    const invoiceRef = useRef<HTMLDivElement>(null); 
  
    const handleDownloadPdf = () => {
      if (invoiceRef.current) {
        const element = invoiceRef.current;
        
        const options = {
            margin: [0, 0, 0, 0],  
            filename: 'invoice.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3 }, 
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },  
          };
          
  
        html2pdf()
          .from(element) // Pass the element you want to convert to PDF
          .set(options)
          .save();
      }
    };
  
    return (
      <div className="max-w-6xl my-10 mx-auto p-4 bg-white shadow-lg rounded-lg flex flex-col">
        <div className="flex  flex-row gap-5 justify-end mb-4">
          <button
            onClick={handleDownloadPdf}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Download PDF
          </button>
          <button
            onClick={()=>navigate("/")}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
          Save
          </button>
        </div>
    
        

  
        {/* Ref points to this div containing the Invoice component */}
        <div ref={invoiceRef}>
          <Invoice />
        </div>
      </div>
    );
  };
  export default InvoicePdfPage;