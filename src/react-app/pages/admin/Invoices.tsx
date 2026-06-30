import { useEffect, useState } from "react";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Search, Filter, Plus, Eye, Trash2, Send, ExternalLink } from "lucide-react";
import { Link } from "react-router";

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  due_date: string;
  created_at: string;
}

const statusOptions = [
  { value: "all", label: "All Invoices" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const url = statusFilter === "all" 
        ? "/api/invoices" 
        : `/api/invoices?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await fetch(`/api/invoices/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchInvoices();
    } catch (error) {
      console.error("Failed to update invoice status:", error);
    }
  }

  async function deleteInvoice(id: number) {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      fetchInvoices();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  }

  const filteredInvoices = invoices.filter((inv) =>
    inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      sent: "bg-blue-100 text-blue-700",
      paid: "bg-green-100 text-green-700",
      overdue: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-500",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#0C0C0C]">Invoices</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Create and manage customer invoices.</p>
          </div>
          <Link
            to="/admin/invoices/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 text-black font-medium rounded-lg hover:from-gold-500 hover:to-gold-400 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm sm:text-base"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 appearance-none bg-white sm:min-w-[160px] text-sm sm:text-base"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No invoices found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? "Try adjusting your search" : "Create your first invoice to get started."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[#0C0C0C]">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500 truncate">{invoice.customer_name}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize shrink-0 ${getStatusBadge(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-500">{invoice.customer_email}</span>
                      <span className="font-semibold">${(invoice.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      Due: {invoice.due_date || "—"}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Link
                        to={`/admin/invoices/${invoice.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <a
                        href={`/invoice/${invoice.invoice_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gold-100 text-gold-700 hover:bg-gold-200 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Share
                      </a>
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#0C0C0C]">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{invoice.customer_name}</p>
                        <p className="text-sm text-gray-500">{invoice.customer_email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        ${(invoice.total || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {invoice.due_date || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/invoices/${invoice.id}`}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <a
                            href={`/invoice/${invoice.invoice_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Customer View"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                          {invoice.status === "draft" && (
                            <button
                              onClick={() => updateStatus(invoice.id, "sent")}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as Sent"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
