import { useEffect, useState } from "react";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Search, Filter, MoreVertical, Eye, Trash2, FileText } from "lucide-react";
import { Link } from "react-router";

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_type: string;
  flavor: string;
  size: string;
  quantity: number;
  pickup_date: string;
  pickup_time: string;
  status: string;
  total_amount: number;
  created_at: string;
}

const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const url = statusFilter === "all" 
        ? "/api/orders" 
        : `/api/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(id: number, status: string) {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
      setActiveMenu(null);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  }

  async function deleteOrder(id: number) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      fetchOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  }

  const filteredOrders = orders.filter((order) =>
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      ready: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl text-[#0C0C0C]">Orders</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage and track all customer orders.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm sm:text-base"
              />
            </div>
            
            {/* Status Filter */}
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

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? "Try adjusting your search" : "Orders will appear here when customers place them."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[#0C0C0C] truncate">{order.customer_name}</p>
                        <p className="text-sm text-gray-500 truncate">{order.customer_email}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize shrink-0 ${getStatusBadge(order.status)}`}>
                        {order.status?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Product:</span>{" "}
                        <span className="capitalize">{order.product_type}</span>
                      </div>
                      <div className="font-medium">${order.total_amount?.toFixed(2) || "0.00"}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{order.pickup_date} • {order.pickup_time}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <Link
                        to={`/admin/invoices/new?orderId=${order.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gold-100 text-gold-700 hover:bg-gold-200 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Invoice
                      </Link>
                      <button
                        onClick={() => deleteOrder(order.id)}
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
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pickup</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#0C0C0C]">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="capitalize">{order.product_type}</p>
                        <p className="text-sm text-gray-500">{order.flavor} • {order.size}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p>{order.pickup_date}</p>
                        <p className="text-sm text-gray-500">{order.pickup_time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(order.status)}`}>
                          {order.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ${order.total_amount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 relative">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Order"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/admin/invoices/new?orderId=${order.id}`}
                            className="p-2 text-gray-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                            title="Create Invoice"
                          >
                            <FileText className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {activeMenu === order.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-10 min-w-[160px]">
                              <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">Update Status</p>
                              {statusOptions.slice(1).map((opt) => (
                                <button
                                  key={opt.value}
                                  onClick={() => updateOrderStatus(order.id, opt.value)}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${order.status === opt.value ? 'text-gold-600 font-medium' : 'text-gray-700'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                              <div className="border-t border-gray-100 mt-2 pt-2">
                                <button
                                  onClick={() => deleteOrder(order.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Order
                                </button>
                              </div>
                            </div>
                          )}
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
