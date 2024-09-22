import { Route, BrowserRouter as Router,Routes } from "react-router-dom";
import InvoiceForm from "./Invoice/InvoiceForm";
import { Toaster } from "@/components/ui/toaster"
import Invoice from "./Invoice/Invoice";

function App() {
  return (
    <Router>
           <Toaster />
      <Routes>
        <Route path="/" element={<InvoiceForm />} />
        <Route path="//invoice/:id" element={<Invoice />} />
      </Routes>
    </Router>
  );
}

export default App;
