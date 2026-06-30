import { useEffect, useState } from "react";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Calendar, Clock, Eye } from "lucide-react";
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
}

export default function AdminSchedule() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      // Filter for non-completed/cancelled orders and sort by pickup_date
      const upcoming = data
        .filter((o: Order) => !["completed", "cancelled"].includes(o.status))
        .sort((a: Order, b: Order) => {
          const dateA = new Date(a.pickup_date + " " + (a.pickup_time || "00:00"));
          const dateB = new Date(b.pickup_date + " " + (b.pickup_time || "00:00"));
          return dateA.getTime() - dateB.getTime();
        });
      setOrders(upcoming);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      ready: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { 
      weekday: "short",
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  const getDaysUntil = (dateStr: string) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pickup = new Date(dateStr + "T00:00:00");
    const diff = Math.ceil((pickup.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getUrgencyStyle = (daysUntil: number | null) => {
    if (daysUntil === null) return "border-gray-200";
    if (daysUntil < 0) return "border-red-400 bg-red-50";
    if (daysUntil === 0) return "border-red-400 bg-red-50";
    if (daysUntil === 1) return "border-orange-400 bg-orange-50";
    if (daysUntil <= 3) return "border-amber-400 bg-amber-50";
    return "border-gray-200 bg-white";
  };

  const getUrgencyLabel = (daysUntil: number | null) => {
    if (daysUntil === null) return null;
    if (daysUntil < 0) return <span className="text-red-600 font-semibold">OVERDUE</span>;
    if (daysUntil === 0) return <span className="text-red-600 font-semibold">TODAY</span>;
    if (daysUntil === 1) return <span className="text-orange-600 font-semibold">TOMORROW</span>;
    if (daysUntil <= 3) return <span className="text-amber-600 font-medium">{daysUntil} days</span>;
    return <span className="text-gray-500">{daysUntil} days</span>;
  };

  // Group orders by date
  const groupedOrders = orders.reduce((acc, order) => {
    const date = order.pickup_date || "No Date";
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#0C0C0C]">Schedule</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Upcoming orders sorted by pickup date
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-600">
              {orders.filter(o => getDaysUntil(o.pickup_date) === 0).length}
            </p>
            <p className="text-sm text-red-600/70">Due Today</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-600">
              {orders.filter(o => getDaysUntil(o.pickup_date) === 1).length}
            </p>
            <p className="text-sm text-orange-600/70">Due Tomorrow</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-600">
              {orders.filter(o => {
                const d = getDaysUntil(o.pickup_date);
                return d !== null && d >= 2 && d <= 7;
              }).length}
            </p>
            <p className="text-sm text-amber-600/70">This Week</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-700">{orders.length}</p>
            <p className="text-sm text-gray-500">Total Upcoming</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading schedule...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming orders</p>
              <p className="text-sm text-gray-400 mt-1">
                Your schedule will populate as orders come in.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedOrders).map(([date, dateOrders]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="bg-gray-50 px-4 sm:px-6 py-3 flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{formatDate(date)}</span>
                    <span className="text-sm text-gray-500">
                      ({dateOrders.length} order{dateOrders.length !== 1 ? "s" : ""})
                    </span>
                    {getUrgencyLabel(getDaysUntil(date))}
                  </div>
                  
                  {/* Orders for this date */}
                  {dateOrders
                    .sort((a, b) => (a.pickup_time || "").localeCompare(b.pickup_time || ""))
                    .map((order) => (
                    <div 
                      key={order.id} 
                      className={`p-4 sm:px-6 border-l-4 ${getUrgencyStyle(getDaysUntil(order.pickup_date))}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium text-[#0C0C0C]">
                              {order.customer_name}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(order.status)}`}>
                              {order.status?.replace("_", " ")}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {order.pickup_time || "No time set"}
                            </span>
                            <span className="capitalize">{order.product_type}</span>
                            {order.flavor && (
                              <span className="hidden sm:inline">{order.flavor}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            ${order.total_amount?.toFixed(2) || "0.00"}
                          </span>
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
