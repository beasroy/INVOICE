import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    unit: { type: String, required: true }, 
    taxType: { type: String, required: true },
    discountPercentage: { type: Number, default: 0 },
    amountBeforeTax: { type: Number, required: true },
    cgstPercentage: { type: Number, default: 0 },
    sgstPercentage: { type: Number, default: 0 },
    igstPercentage: { type: Number, default: 0 }, 
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    amountAfterTax: { type: Number, required: true },
});

export default mongoose.model("InvoiceItem", invoiceItemSchema);
