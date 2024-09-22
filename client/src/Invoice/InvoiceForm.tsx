"use client"
import axios from "axios"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Trash2 } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';


interface ItemRow {
    id: number
    item: string
    qty: number
    unit: string
    priceUnit: number
    discountPercent: number
    discountAmount: number
    taxPercent: number
    taxAmount: number
    amount: number
    taxType: 'GST' | 'IGST',
}

export default function InvoiceForm() {
    const { toast } = useToast()
    const [isSaved, setIsSaved] = useState(false);
    const [isCredit, setIsCredit] = useState(true)
    const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date())
    const [items, setItems] = useState<ItemRow[]>([
        { id: 1, item: "", qty: 0, unit: "NONE", priceUnit: 0, discountPercent: 0, discountAmount: 0, taxPercent: 0, taxAmount: 0, amount: 0, taxType: 'GST' },
    ])
    const [roundOff, setRoundOff] = useState(false);
    const [roundedAmount, setRoundedAmount] = useState(0);
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [balanceDue, setBalanceDue] = useState(0);
    const [custname, setCustname] = useState("");
    const [billAdd, setBillAdd] = useState("");
    const [phone, setPhone] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState<string>("");
    const [stateofSupply, setStateofSupply] = useState("");
    const [paymentType, setPaymentType] = useState("");
    const navigate = useNavigate();

    const handleRoundOffChange = () => {
        setRoundOff(prev => !prev);
        if (!roundOff) {
            const total = parseFloat(totalAmount);
            const rounded = Math.round(total);
            const roundedDiff = (total - rounded).toFixed(2);
            setRoundedAmount(parseFloat(roundedDiff));
            handleItemChange(0, 'amount', rounded); // Assuming we use a dummy item for this purpose
            setBalanceDue(rounded - receivedAmount);
        } else {
            setRoundedAmount(0);
            handleItemChange(0, 'amount', totalAmount);
            setBalanceDue(parseFloat(totalAmount) - receivedAmount);
        }
    };

    const handleReceivedAmountChange = (value: number) => {
        setReceivedAmount(value);
        const total = roundOff ? parseFloat(totalAmount) - roundedAmount : parseFloat(totalAmount);
        setBalanceDue(total - value);
    };

    const addRow = () => {
        const newRow: ItemRow = {
            id: items.length + 1,
            item: "",
            qty: 0,
            unit: "NONE",
            priceUnit: 0,
            discountPercent: 0,
            discountAmount: 0,
            taxPercent: 0,
            taxAmount: 0,
            amount: 0,
            taxType: "GST"
        }
        setItems([...items, newRow])
    }

    const deleteRow = (id: number) => {
        setItems(items.filter(item => item.id !== id))
    }

    const calculateAmounts = (item: ItemRow) => {
        const itemAmount = item.qty* item.priceUnit
        const discountAmount = (itemAmount * (item.discountPercent / 100)).toFixed(2)
        const taxablePrice = (itemAmount - parseFloat(discountAmount)).toFixed(2)
        const taxAmount = (parseFloat(taxablePrice) * (item.taxPercent / 100)).toFixed(2)
        const totalAmount = (parseFloat(taxablePrice) + parseFloat(taxAmount)).toFixed(2)

        return {
            discountAmount: parseFloat(discountAmount),
            taxAmount: parseFloat(taxAmount),
            totalAmount: parseFloat(totalAmount),
        }
    }
    const handleTaxChange = (item: ItemRow, value: string) => {
        const percent = parseFloat(value.split('@')[1].replace('%', ''));
        const type = value.startsWith('IGST') ? 'IGST' : 'GST';
        const updatedItem = { ...item, taxPercent: percent, taxType: type as 'GST' | 'IGST' };
        const { discountAmount, taxAmount, totalAmount } = calculateAmounts(updatedItem);

        handleItemChange(item.id, 'taxPercent', percent);
        handleItemChange(item.id, 'taxType', type as 'GST' | 'IGST');
        handleItemChange(item.id, 'discountAmount', discountAmount);
        handleItemChange(item.id, 'taxAmount', taxAmount);
        handleItemChange(item.id, 'amount', totalAmount);
    };

    const handleItemChange = (id: number, field: keyof ItemRow, value: any) => {
        setItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value }
                    const { discountAmount, taxAmount, totalAmount } = calculateAmounts(updatedItem)
                    return {
                        ...updatedItem,
                        discountAmount,
                        taxAmount,
                        amount: totalAmount,
                    }
                }
                return item
            })
        )
    }

    const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
    const totalDiscountAmount = items.reduce((sum, item) => sum + item.discountAmount, 0).toFixed(2)
    const totalTaxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2)
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)

    const generateInvoiceNumber = () => {
        const uuid = uuidv4();
        return uuid.split('-').join('').substring(0, 8);
    };

    useEffect(() => {
        setInvoiceNumber(generateInvoiceNumber());
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const customerData = {
            name: custname,
            billingAddress: billAdd,
            phone: phone

        };

        const invoiceData = {
            invoiceDate: invoiceDate,
            invoiceNumber: invoiceNumber,
            receivedAmount: receivedAmount,
            stateOfSupply: stateofSupply,
            paymentType: paymentType,
            transactionType: "Sale"
        };

        const itemsData = items.map(item => ({
            itemName: item.item,
            quantity: item.qty,
            unit: item.unit,
            unitPrice: item.priceUnit,
            discountPercentage: item.discountPercent,
            taxType: `${item.taxType}@${item.taxPercent}%`,
        }));

        const invoicePayload = {
            customerData,
            invoiceData,
            itemsData,
        };

        try {
            const response = await axios.post('http://localhost:8000/api/invoice/create', invoicePayload);
            console.log('Invoice submitted successfully:', response.data);
            toast({
                title: "Invoice created successfully!"
            })
            setIsSaved(true);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error submitting invoice:', error.message);
            } else if (axios.isAxiosError(error) && error.response) {
                console.error('Error submitting invoice:', error.response.data);
            } else {
                console.error('An unknown error occurred while submitting invoice');
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                })
            }
        }
    };

    const handleGenerateInvoice = () => {
        const invoiceId = invoiceNumber; // Replace with the actual invoice ID
        navigate(`/invoice/${invoiceId}`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 bg-gray-100 min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                        <h2 className="text-2xl font-bold mr-4">Sale</h2>
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm ${isCredit ? "text-blue-600" : "text-gray-500"}`}>Credit</span>
                            <Switch checked={isCredit} onCheckedChange={setIsCredit} />
                            <span className={`text-sm ${!isCredit ? "text-blue-600" : "text-gray-500"}`}>Cash</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label htmlFor="customer">Customer *</Label>
                            <Input id="cust_name" value={custname} onChange={(e) => { setCustname(e.target.value) }} placeholder="xianinfotec" />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone No</Label>
                            <Input id="phone" value={phone} onChange={(e) => { setPhone(e.target.value) }} placeholder="Ex. 81299935578" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label htmlFor="address">Billing Address</Label>
                            <Textarea id="address" value={billAdd} onChange={(e) => { setBillAdd(e.target.value) }} placeholder="xianinfotec llp&#10;perinthalmanna&#10;kerala" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="invoice-number">Invoice Number</Label>
                                <Input id="invoice-number" value={invoiceNumber} />
                            </div>
                            <div>
                                <Label htmlFor="invoice-date">Invoice Date</Label>
                                <div className="relative">
                                    <DatePicker
                                        selected={invoiceDate}
                                        onChange={(date) => setInvoiceDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        customInput={<Input id="invoice-date" className="w-full" />}
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="state-of-supply">State of supply</Label>
                                <Select value={stateofSupply} onValueChange={setStateofSupply}>
                                    <SelectTrigger id="state-of-supply">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Kerala">Kerala</SelectItem>
                                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                                        <SelectItem value="Delhi">Delhi</SelectItem>
                                        <SelectItem value="Gujarat">Gujarat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                    </div>

                    <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2 text-left">#</th>
                                    <th className="border p-2 text-left">ITEM</th>
                                    <th className="border p-2 text-left">QTY</th>
                                    <th className="border p-2 text-left">UNIT</th>
                                    <th className="border p-2 text-left">PRICE/UNIT</th>
                                    <th className="border p-2 text-left" colSpan={2}>DISCOUNT</th>
                                    <th className="border p-2 text-left" colSpan={2}>TAX</th>
                                    <th className="border p-2 text-left">AMOUNT</th>
                                    <th className="border p-2 text-left"></th>
                                </tr>
                                <tr className="bg-gray-100">
                                    {/* Extra row to split the DISCOUNT and TAX columns */}
                                    <th colSpan={5}></th>
                                    <th className="border p-2 text-left">%</th>
                                    <th className="border p-2 text-left">Amount</th>
                                    <th className="border p-2 text-left">%</th>
                                    <th className="border p-2 text-left">Amount</th>
                                    <th colSpan={2}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="border p-2">{index + 1}</td>
                                        <td className="border p-2">
                                            <Input
                                                value={item.item}
                                                onChange={(e) => handleItemChange(item.id, 'item', e.target.value)}
                                            />
                                        </td>
                                        <td className="border p-2">
                                            <Input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="border p-2">
                                            <Select
                                                value={item.unit}
                                                onValueChange={(value) => handleItemChange(item.id, 'unit', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pac">Pac</SelectItem>
                                                    <SelectItem value="Bag">Bag</SelectItem>
                                                    <SelectItem value="NONE">NONE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="border p-2">
                                            <Input
                                                type="number"
                                                value={item.priceUnit}
                                                onChange={(e) => handleItemChange(item.id, 'priceUnit', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="border p-2">
                                            <Input
                                                type="number"
                                                value={item.discountPercent}
                                                onChange={(e) => handleItemChange(item.id, 'discountPercent', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="border p-2">
                                            <Input
                                                type="number"
                                                value={item.discountAmount}
                                                onChange={(e) => handleItemChange(item.id, 'discountAmount', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="border p-2">
                                            <Select
                                                value={`${item.taxType}@${item.taxPercent}%`}
                                                onValueChange={(value) => handleTaxChange(item, value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GST@18%">GST@18%</SelectItem>
                                                    <SelectItem value="IGST@12%">IGST@12%</SelectItem>
                                                    <SelectItem value="GST@6%">GST@6%</SelectItem>
                                                    <SelectItem value="GST@10%">GST@10%</SelectItem>
                                                    <SelectItem value="IGST@9%">IGST@9%</SelectItem>
                                                    <SelectItem value="IGST@18%">IGST@18%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>


                                        <td className="border p-2">
                                            <Input
                                                type="number"
                                                value={item.taxAmount}
                                                onChange={(e) => handleItemChange(item.id, 'taxAmount', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="border p-2">
                                            <Input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => handleItemChange(item.id, 'amount', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="border p-2">
                                            <Button variant="ghost" size="icon" onClick={() => deleteRow(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={11} className="p-2">
                                        <Button variant="outline" onClick={addRow}>
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            ADD ROW
                                        </Button>
                                    </td>
                                </tr>
                                <tr className="bg-gray-100">
                                    <td colSpan={2} className="border p-2 font-bold">TOTAL</td>
                                    <td className="border p-2">{totalQty}</td>
                                    <td colSpan={3} className="border p-2"></td>
                                    <td className="border p-2">{totalDiscountAmount}</td>
                                    <td className="border p-2"></td>
                                    <td className="border p-2">{totalTaxAmount}</td>
                                    <td className="border p-2">{totalAmount}</td>
                                    <td className="border p-2"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label htmlFor="payment-type">Payment Type</Label>
                            <Select defaultValue="cash" value={paymentType} onValueChange={setPaymentType}>
                                <SelectTrigger id="payment-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Card">Card</SelectItem>
                                    <SelectItem value="Online">Online</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="link" className="mt-2 p-0">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Payment type
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <input type="checkbox" id="round-off" className="mr-2" checked={roundOff} onChange={handleRoundOffChange} />
                                    <Label htmlFor="round-off">Round Off</Label>
                                </div>
                                <Input type="number" value={roundedAmount.toFixed(2)} className="w-24" readOnly />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label>Total</Label>
                                <Input type="number" value={roundOff ? (parseFloat(totalAmount) - roundedAmount).toFixed(2) : totalAmount} className="w-24" readOnly />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <input type="checkbox" id="received" className="mr-2" />
                                    <Label htmlFor="received">Received</Label>
                                </div>
                                <Input
                                    type="number"
                                    value={receivedAmount}
                                    onChange={(e) => handleReceivedAmountChange(parseFloat(e.target.value))}
                                    className="w-24"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label>Balance</Label>
                                <Input type="number" value={balanceDue.toFixed(2)} className="w-24" readOnly />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 space-x-2">
                        <Button variant="outline">
                            ADD DESCRIPTION
                        </Button>
                        <Button variant="outline">
                            ADD IMAGE
                        </Button>
                        <Button variant="outline">
                            ADD DOCUMENT
                        </Button>
                    </div>

                    <div className="flex justify-end mt-4 space-x-2">
                        <Button variant="outline"   onClick={handleGenerateInvoice} disabled={!isSaved} >Generate e-Invoice</Button>
                        <Button typeof="submit">Save</Button>
          </div>
                </div>
            </div>
        </form>
    )
}