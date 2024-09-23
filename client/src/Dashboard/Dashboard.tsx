import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChartIcon, FileSpreadsheetIcon, PrinterIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Define types for transaction data
interface Transaction {
  invoiceDate: string;
  invoiceNumber: string;
  customer: {
    name: string;
  };
  transactionType: string;
  paymentType: string;
  totalAmount: number;
  balanceDue: number;
  finalAmount:number;
}

export default function FinancialDashboard() {
  const [startDate, setStartDate] = useState<string>('01/09/2024');
  const [endDate, setEndDate] = useState<string>('30/09/2024');
  const [selectedFirm, setSelectedFirm] = useState<string>('ALL FIRMS');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get<Transaction[]>('http://localhost:8000/api/invoice/all'); 
        setTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const navigate = useNavigate();

  
  const AllSaleTotalAmount = transactions.reduce((sum, item) => sum + item.totalAmount, 0);
  const AllSaleBalanceDue= transactions.reduce((sum, item) => sum + item.balanceDue, 0);
  const AllPaidAmount = AllSaleBalanceDue-AllSaleTotalAmount;

  if (loading) {
    return <p>Loading...</p>;
  }


  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Select value={selectedFirm} onValueChange={setSelectedFirm}>
            <option value="ALL FIRMS">ALL FIRMS</option>
          </Select>
          <span>This Month</span>
          <span>Between</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-36"
          />
          <span>To</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-36"
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <BarChartIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <FileSpreadsheetIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <PrinterIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Paid</h3>
          <p className="text-2xl font-bold">₹ {AllPaidAmount.toFixed(2)}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Unpaid</h3>
          <p className="text-2xl font-bold">₹ {AllSaleBalanceDue.toFixed(2)}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Total</h3>
          <p className="text-2xl font-bold">₹{AllSaleTotalAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className='mt-20 shadow-lg border-2 p-2'>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">TRANSACTIONS</h2>
          <Button onClick={()=>navigate("/invoice")}>Add Sale</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DATE</TableHead>
                <TableHead>INVOICE NO.</TableHead>
                <TableHead>PARTY NAME</TableHead>
                <TableHead>TRANSACTION TYPE</TableHead>
                <TableHead>PAYMENT TYPE</TableHead>
                <TableHead>AMOUNT</TableHead>
                <TableHead>BALANCE DUE</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.invoiceDate}</TableCell>
                  <TableCell>{transaction.invoiceNumber}</TableCell>
                  <TableCell>{transaction.customer.name}</TableCell>
                  <TableCell>{transaction.transactionType}</TableCell>
                  <TableCell>{transaction.paymentType}</TableCell>
                  <TableCell>{transaction.totalAmount}</TableCell>
                  <TableCell>{transaction.balanceDue}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <PrinterIcon className="h-4 w-4 mr-2" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileSpreadsheetIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
