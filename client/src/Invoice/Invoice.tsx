
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toWords } from 'number-to-words';



// Define types for invoice and items
interface Customer {
  name: string;
  billingAddress: string;
  phone: string;
}

interface InvoiceItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  unit:string;
  discountAmount: number;
  discountPercentage:number;
  amountBeforeTax: number;
  cgstPercentage: number;
  sgstPercentage: number;
  igstPercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  amountAfterTax: number;
}


interface Invoice {
  customer: Customer;
  items: InvoiceItem[];
  invoiceNumber: string;
  invoiceDate: string;
  roundOffAmount:number;
  receivedAmount:number;
  balanceDue:number;
}

export default function Invoice() {
  const { id } = useParams<{ id: string }>(); // Typing useParams to get the id as a string
  const [invoice, setInvoice] = useState<Invoice | null>(null); // Invoice is initially null


  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/invoice/${id}`);
        setInvoice(response.data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      }
    };
    fetchInvoice();
  }, [id]);

  if (!invoice) {
    return <div>Loading...</div>; // Handle loading state
  }

  const totalTaxable = invoice.items.reduce((sum, item) => sum + item.amountBeforeTax, 0);
  const totalIgst = invoice.items.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalCgst = invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSgst = invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalAmount = invoice.items.reduce((sum, item) => sum + item.amountAfterTax, 0);

  const totalDiscountAmount = invoice.items.reduce((sum,item)=>sum + item.discountAmount,0)

  const totalTaxableIgst = invoice.items
  .filter((item) => item.igstPercentage > 0)
  .reduce((sum, item) => sum + item.amountBeforeTax, 0);

  const totalTaxableIgstPercentage = invoice.items
  .filter((item) => item.igstPercentage > 0)
  .reduce((sum, item) => sum + item.igstPercentage, 0);

  const totalTaxableGstPercentage = invoice.items
  .filter((item) => item.cgstPercentage > 0)
  .reduce((sum, item) => sum + item.cgstPercentage, 0);


  const totalTaxableCgstSgst = invoice.items
  .filter((item) => item.cgstPercentage > 0 || item.sgstPercentage > 0)
  .reduce((sum, item) => sum + item.amountBeforeTax, 0);

  const totalRoundedAmount = totalAmount-invoice.roundOffAmount;
  const amountInWords = toWords(totalRoundedAmount.toFixed(2));
  
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}-${month}-${year}`;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div className="border-b-2 border-purple-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-center">Tax Invoice</h1>
        <div className="flex justify-between items-start">
          <div className="w-20 h-20 bg-gray-300 flex items-center justify-center text-gray-600">LOGO</div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">My Company</h2>
            <p className="text-sm text-gray-600">Phone no.: 7356215382</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Bill To</h3>
          <p>{invoice.customer.name}</p>
          <p>{invoice.customer.billingAddress}</p>
          <p>Contact No.: {invoice.customer.phone}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Invoice Details</h3>
          <p>Invoice No.: {invoice.invoiceNumber}</p>
          <p>Date: {formatDate(invoice.invoiceDate)}</p>
        </div>
      </div>

      <table className="w-full mb-4">
        <thead className="bg-purple-200">
          <tr>
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Item name</th>
            <th className="p-2 text-left">Quantity</th>
            <th className="p-2 text-left">Unit</th>
            <th className="p-2 text-left">Price/ Unit</th>
            <th className="p-2 text-left">Discount</th>
            <th className="p-2 text-left">Taxable amount</th>
            <th className="p-2 text-left">IGST</th>
            <th className="p-2 text-left">CGST</th>
            <th className="p-2 text-left">SGST</th>
            <th className="p-2 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item: InvoiceItem, index: number) => (
            <tr key={index} className="border-b">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{item.itemName}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">{item.unit}</td>
              <td className="p-2">₹{item.unitPrice.toFixed(2)}</td>
              <td className="p-2">₹{item.discountAmount.toFixed(2)} ({item.discountPercentage}%)</td>
              <td className="p-2">₹{item.amountBeforeTax.toFixed(2)}</td>
              <td className="p-2">₹{item.igstAmount.toFixed(2)} ({item.igstPercentage}%)</td>
              <td className="p-2">₹{item.cgstAmount.toFixed(2)} ({item.cgstPercentage}%)</td>
              <td className="p-2">₹{item.sgstAmount.toFixed(2)} ({item.sgstPercentage}%)</td>
              <td className="p-2">₹{item.amountAfterTax.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-purple-100">
          <tr>
            <td colSpan={5} className="p-2 font-semibold text-right">Total</td>
            <td className="p-2">₹{totalDiscountAmount.toFixed(2)}</td> 
            <td className="p-2">₹{totalTaxable.toFixed(2)}</td>
            <td className="p-2">₹{totalIgst.toFixed(2)}</td>
            <td className="p-2">₹{totalCgst.toFixed(2)}</td>
            <td className="p-2">₹{totalSgst.toFixed(2)}</td>
            <td className="p-2">₹{totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>    
       <div className="grid grid-cols-2 gap-4 mb-4">
         <div className="bg-purple-100 p-4 rounded">
           <h3 className="font-semibold mb-2">Tax Summary</h3>
           <table className="w-full">
             <thead>
               <tr>
                 <th className="text-left">Tax type</th>
                 <th className="text-left">Taxable amount</th>
                 <th className="text-left">Rate</th>
                 <th className="text-left">Tax amount</th>
               </tr>
             </thead>
             <tbody>
       
               <tr>
                 <td>IGST</td>
                 <td>₹{totalTaxableIgst.toFixed(2)}</td>
                 <td>{totalTaxableIgstPercentage}%</td>
                 <td>₹{totalIgst.toFixed(2)}</td>
               </tr>
               
               <tr >
                 <td>SGST</td>
                 <td>₹{totalTaxableCgstSgst.toFixed(2)}</td>
                 <td>{totalTaxableGstPercentage}%</td>
                 <td>₹{totalSgst.toFixed(2)}</td>
            </tr>
           
               <tr >
                 <td>CGST</td>
                <td>₹{totalTaxableCgstSgst.toFixed(2)}</td>
                <td>{totalTaxableGstPercentage}%</td>
                <td>₹{totalCgst.toFixed(2)}</td>
              </tr>

            </tbody>
         </table>
        </div>
       <div className="bg-purple-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Amount Details</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td>Sub Total</td>
                <td>₹{totalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Round off</td>
                <td>₹{invoice.roundOffAmount.toFixed(2)}</td>
             </tr>
             <tr className="font-semibold">
                <td>Total</td>
               <td>₹{totalRoundedAmount.toFixed(2)}</td>
              </tr>
               <tr>
                 <td>Received</td>
                 <td>₹{invoice.receivedAmount.toFixed(2)}</td>
               </tr>
               <tr>
                 <td>Balance</td>
                 <td>₹₹{invoice.balanceDue.toFixed(2)}</td>
               </tr>
             </tbody>
           </table>
           <p className="mt-2">You Saved: ₹{totalDiscountAmount.toFixed(2)}</p>
         </div>
       </div>
        
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Invoice Amount in Words</h3>
          <p>{amountInWords} Rupees only</p>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Terms and Conditions</h3>
          <p>Thanks for doing business with us!</p>
        </div>
      </div>

      <div className="text-right mt-8">
        <p>For: My Company</p>
        <p className="mt-4">Authorized Signatory</p>
      </div>
    </div>
   
  )};