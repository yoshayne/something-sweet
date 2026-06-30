import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { ArrowLeft, ExternalLink, Send, Check, Clock, AlertCircle, FileText, Loader2, RefreshCw } from "lucide-react";

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
  order_id: number | null;
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

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700" },
  { value: "sent", label: "Sent", color: "bg-blue-100 text-blue-700" },
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-700" },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
];

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  async function fetchInvoice() {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new Error("Invoice not found");
      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      setError("Invoice not found");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: string) {
    if (!invoice) return;
    setUpdating(true);
    try {
      await fetch(`/api/invoices/${invoice.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setInvoice({ ...invoice, status });
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  }

  async function resendInvoice() {
    if (!invoice) return;
    setResending(true);
    setResendSuccess(false);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/resend`, {
        method: "POST",
      });
      if (res.ok) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to resend invoice:", err);
    } finally {
      setResending(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return Check;
      case "sent": return Clock;
      case "overdue": return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusStyle = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-2" />
            <p className="text-gray-500">Loading invoice...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
          <Link to="/admin/invoices" className="text-gold-600 hover:underline">
            ← Back to Invoices
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const StatusIcon = getStatusIcon(invoice.status);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/invoices"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-[#0C0C0C]">
                {invoice.invoice_number}
              </h1>
              <p className="text-gray-500 text-sm">
                Created {new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/invoice/${invoice.invoice_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Customer View
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-lg mb-4">Customer</h2>
              <div className="space-y-2">
                <p className="font-medium text-[#0C0C0C]">{invoice.customer_name}</p>
                <p className="text-gray-600">{invoice.customer_email}</p>
                {invoice.customer_phone && (
                  <p className="text-gray-600">{invoice.customer_phone}</p>
                )}
              </div>
              {invoice.order_id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/admin/orders/${invoice.order_id}`}
                    className="text-gold-600 hover:underline text-sm"
                  >
                    View Original Order →
                  </Link>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-lg">Line Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28">Price</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">{item.description}</td>
                        <td className="px-4 py-4 text-center text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-4 text-right text-gray-600">${item.unit_price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">${(invoice.subtotal || 0).toFixed(2)}</span>
                    </div>
                    {invoice.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax</span>
                        <span className="font-medium">${invoice.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200 text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-gold-600">${(invoice.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-lg mb-3">Notes</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-lg mb-4">Status</h2>
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 ${getStatusStyle(invoice.status)}`}>
                <StatusIcon className="w-5 h-5" />
                <span className="font-medium capitalize">{invoice.status}</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-3">Update Status:</p>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateStatus(option.value)}
                    disabled={updating || invoice.status === option.value}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      invoice.status === option.value
                        ? "bg-gray-100 text-gray-400"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-lg mb-2">Due Date</h2>
              <p className="text-gray-600">{invoice.due_date || "Not set"}</p>
            </div>

            {/* Quick Actions */}
            {invoice.status === "draft" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
                <button
                  onClick={() => updateStatus("sent")}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Mark as Sent
                </button>
              </div>
            )}
            
            {/* Resend Invoice */}
            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
                <button
                  onClick={resendInvoice}
                  disabled={resending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {resending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {resending ? "Sending..." : "Resend Invoice"}
                </button>
                {resendSuccess && (
                  <p className="text-sm text-green-600 mt-2 text-center">
                    ✓ Invoice resent successfully
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
