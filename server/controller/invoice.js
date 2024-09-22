import Invoice from "../models/Invoice.js";
import InvoiceItem from "../models/InvoiceItems.js";
import Customer from "../models/customer.js";
import mongoose from "mongoose";


export const createInvoice = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try{

        const{customerData, invoiceData, itemsData} = req.body;

        const customer = new Customer(customerData);
        await customer.save({ session });
        
        const invoiceItems = await Promise.all(
            itemsData.map(async item=>{
                let cgstPercentage = 0;
                let sgstPercentage = 0;
                let igstPercentage = 0;
                if (item.taxType.includes('GST') && !item.taxType.includes('IGST')) {
                    const gstPercentage = parseFloat(item.taxType.match(/\d+/)[0]); // Extract the percentage number
                    cgstPercentage = sgstPercentage = gstPercentage / 2 || 0;
                } else if (item.taxType.includes('IGST')) {
                    igstPercentage = parseFloat(item.taxType.match(/\d+/)[0]) || 0;
                    cgstPercentage = 0;
                    sgstPercentage = 0;
                }
                const totalPrice = item.unitPrice * item.quantity;

         
                const discountAmount = (totalPrice * item.discountPercentage) / 100;
                const amountBeforeTax = totalPrice - discountAmount;
                const cgstAmount = (amountBeforeTax * cgstPercentage) / 100;
                const sgstAmount = (amountBeforeTax * sgstPercentage) / 100;
                const igstAmount = (amountBeforeTax * igstPercentage) / 100;
                const amountAfterTax = amountBeforeTax + cgstAmount + sgstAmount + igstAmount;
                const invoiceItem = new InvoiceItem({
                    ...item,
                    invoice: null,
                    amountBeforeTax,
                    cgstPercentage,
                    sgstPercentage,
                    igstPercentage,
                    cgstAmount,
                    sgstAmount,
                    igstAmount,
                    amountAfterTax
                });
                return invoiceItem.save({session});
            })
        );

        const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amountBeforeTax, 0);
        const totalTaxAmount = invoiceItems.reduce((sum, item) => sum + item.cgstAmount + item.sgstAmount + item.igstAmount, 0);
        const finalAmount = totalAmount + totalTaxAmount;
        const roundOffAmount = finalAmount - Math.floor(finalAmount);
        const receivedAmount = invoiceData.receivedAmount || 0;
        const balanceDue = (finalAmount - roundOffAmount) - receivedAmount;

        const invoice = new Invoice({
            ...invoiceData,
            customer: customer._id,
            totalAmount,
            totalTaxAmount,
            finalAmount,
            roundOffAmount,
            receivedAmount,
            balanceDue,
            items: invoiceItems.map(item => item._id) // Associate item IDs with the invoice
          });        
          await invoice.save({session});

        await Promise.all(
            invoiceItems.map(async (item) => {
                item.invoice = invoice._id; // Set the invoice reference
                await item.save({ session });
            })
        );

        await session.commitTransaction();
        res.status(201).json({message: "Invoice created successfully", invoice});
    }catch(error){
        await session.abortTransaction();
        res.status(500).json({message: error.message});
    }finally {
        session.endSession();
    }

};

export const getInvoice = async (req, res) => {
    try{
        const invoice = await Invoice.findOne({ invoiceNumber: req.params.id })
        .populate('items')
        .populate('customer', 'name billingAddress phone');

        if(!invoice){   
            return res.status(404).json({message: "Invoice not found"});
        }

        const invoiceItems = await Promise.all(
            invoice.items.map(async (itemId)=>{
                const item = await InvoiceItem.findById(itemId);
                return{
                    itemName: item.itemName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    unit:item.unit,
                    discountPercentage:item.discountPercentage,
                    amountBeforeTax: item.amountBeforeTax,
                    cgstPercentage: item.cgstPercentage,
                    sgstPercentage: item.sgstPercentage,
                    igstPercentage: item.igstPercentage,
                    cgstAmount: item.cgstAmount,
                    sgstAmount: item.sgstAmount,
                    igstAmount: item.igstAmount,
                    amountAfterTax: item.amountAfterTax,
                    discountAmount: (((item.unitPrice * item.quantity) * item.discountPercentage) / 100)
                };
            })
        );

        res.status(200).json({
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            stateOfSupply: invoice.stateOfSupply,
            customer: invoice.customer,
            items: invoiceItems,
            totalAmount: invoice.totalAmount,
            totalTaxAmount: invoice.totalTaxAmount,
            finalAmount: invoice.finalAmount,
            roundOffAmount: invoice.roundOffAmount,
            receivedAmount: invoice.receivedAmount,
            paymentType: invoice.paymentType,
            transactionType: invoice.transactionType,
            balanceDue: invoice.balanceDue,
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message: error.message});
    }

};

