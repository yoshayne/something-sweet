import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { Check, Clock, AlertCircle, FileText, Phone, Mail, MapPin, CreditCard, Loader2 } from "lucide-react";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  due_date: string;
  notes: string;
  created_at: string;
  items: InvoiceItem[];
}

export default function CustomerInvoice() {
  const { invoiceNumber } = useParams();
  const [searchParams] = useSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/number/${invoiceNumber}`);
        if (!res.ok) throw new Error("Invoice not found");
        const data = await res.json();
        setInvoice(data);
      } catch (err) {
        setError("Invoice not found or is no longer available.");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceNumber]);

  const handlePayNow = async () => {
    if (!invoice) return;
    setPaymentLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/checkout`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Unable to start payment. Please try again.");
        setPaymentLoading(false);
      }
    } catch (err) {
      alert("Unable to start payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "paid":
        return { icon: Check, color: "bg-green-100 text-green-700", label: "Paid" };
      case "sent":
        return { icon: Clock, color: "bg-blue-100 text-blue-700", label: "Awaiting Payment" };
      case "overdue":
        return { icon: AlertCircle, color: "bg-red-100 text-red-700", label: "Overdue" };
      default:
        return { icon: FileText, color: "bg-gray-100 text-gray-700", label: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-[#0C0C0C] mb-2">Invoice Not Found</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[#0C0C0C] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(invoice.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-[#0C0C0C] text-white p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-3xl mb-1">Something Sweet</h1>
                <p className="text-gold-400 tracking-[0.15em] text-sm">BY ERICA</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-medium text-sm">{statusInfo.label}</span>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice Number</p>
                <p className="text-xl font-semibold text-[#0C0C0C]">{invoice.invoice_number}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice Date</p>
                <p className="font-medium">{new Date(invoice.created_at).toLocaleDateString()}</p>
                {invoice.due_date && (
                  <>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-3 mb-1">Due Date</p>
                    <p className="font-medium">{invoice.due_date}</p>
                  </>
                )}
              </div>
            </div>
            
            {/* Bill To */}
            <div className="mb-8">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-semibold text-lg">{invoice.customer_name}</p>
              <p className="text-gray-600">{invoice.customer_email}</p>
              {invoice.customer_phone && (
                <p className="text-gray-600">{invoice.customer_phone}</p>
              )}
            </div>

            {/* Line Items */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Qty</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Price</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-[#0C0C0C]">{item.description}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-4 text-right text-gray-600">${item.unit_price.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right font-medium">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${(invoice.subtotal || 0).toFixed(2)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-medium">${invoice.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t border-gray-200 text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-gold-600">${(invoice.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-gray-700">{invoice.notes}</p>
              </div>
            )}

            {/* Payment Info */}
            {invoice.status !== "paid" && (
              <div className="bg-gold-50 border border-gold-200 rounded-lg p-6">
                {paymentStatus === "cancelled" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-center">
                    <p className="text-amber-800 text-sm">Payment was cancelled. You can try again when you're ready.</p>
                  </div>
                )}
                <p className="font-display text-lg text-[#0C0C0C] mb-4 text-center">Payment Options</p>
                
                {/* Pay Online Button */}
                <div className="mb-6">
                  <button
                    onClick={handlePayNow}
                    disabled={paymentLoading}
                    className="w-full flex items-center justify-center gap-2 bg-[#0C0C0C] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecting to checkout...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay ${(invoice.total || 0).toFixed(2)} Now
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-2">Secure payment powered by Stripe</p>
                </div>
                
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gold-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gold-50 text-gray-500">or pay another way</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 text-center">
                  Contact us to arrange payment via Venmo, Zelle, or cash at pickup.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                  <a href="mailto:hello@somethingsweetbyerica.com" className="flex items-center gap-2 text-gold-700 hover:underline">
                    <Mail className="w-4 h-4" />
                    hello@somethingsweetbyerica.com
                  </a>
                  <a href="tel:+15551234567" className="flex items-center gap-2 text-gold-700 hover:underline">
                    <Phone className="w-4 h-4" />
                    (555) 123-4567
                  </a>
                </div>
              </div>
            )}

            {invoice.status === "paid" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="font-display text-lg text-green-800">Payment Received</p>
                <p className="text-green-700 text-sm">Thank you for your payment!</p>
                {paymentStatus === "success" && (
                  <p className="text-green-600 text-sm mt-2">Your payment confirmation has been sent to your email.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Something Sweet by Erica</p>
          <p className="flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            Charlotte, NC
          </p>
        </div>
      </div>
    </div>
  );
}
