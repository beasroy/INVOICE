import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "InvoiceItem" }],
    invoiceDate: { type: Date, default: Date.now },
    stateOfSupply: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    totalTaxAmount: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    roundOffAmount: { type: Number, required: true },
    receivedAmount: { type: Number, default: 0 },
    paymentType: { type: String, enum: ['Cash', 'Card', 'Online'], required: true },
    transactionType: { type: String, enum: ['Sale', 'Return'], required: true },
    balanceDue: { type: Number, required: true },
    invoiceNumber: { type: String, required: true }, },
    {timestamps: true});

export default mongoose.model("Invoice", invoiceSchema);

