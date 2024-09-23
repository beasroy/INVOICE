import { Route, BrowserRouter as Router,Routes } from "react-router-dom";
import InvoiceForm from "./Invoice/InvoiceForm";
import { Toaster } from "@/components/ui/toaster"
import InvoicePdfPage from "./Invoice/InvoicePdfPage";
import FinancialDashboard from "./Dashboard/Dashboard";

function App() {
  return (
    <Router>
           <Toaster />
      <Routes>
        <Route path="/" element={<FinancialDashboard />} />
        <Route path="/invoice/:id" element={<InvoicePdfPage />} />
        <Route path="/invoice" element={<InvoiceForm />} />
      </Routes>
    </Router>
  );
}

export default App;
