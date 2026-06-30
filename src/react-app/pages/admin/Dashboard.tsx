import { useEffect, useState } from "react";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Package, Clock, CheckCircle, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "react-router";

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  revenue: number;
}

interface Order {
  id: number;
  customer_name: string;
  product_type: string;
  pickup_date: string;
  status: string;
  total_amount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/orders/stats"),
          fetch("/api/orders"),
        ]);
        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { 
      label: "Total Orders", 
      value: stats?.total || 0, 
      icon: Package, 
      color: "bg-blue-500/10 text-blue-600",
      iconBg: "bg-blue-500"
    },
    { 
      label: "Pending", 
      value: stats?.pending || 0, 
      icon: Clock, 
      color: "bg-amber-500/10 text-amber-600",
      iconBg: "bg-amber-500"
    },
    { 
      label: "Confirmed", 
      value: stats?.confirmed || 0, 
      icon: CheckCircle, 
      color: "bg-green-500/10 text-green-600",
      iconBg: "bg-green-500"
    },
    { 
      label: "Revenue", 
      value: `$${(stats?.revenue || 0).toFixed(2)}`, 
      icon: DollarSign, 
      color: "bg-gold-500/10 text-gold-600",
      iconBg: "bg-gold-500"
    },
  ];

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
          <h1 className="font-display text-2xl sm:text-3xl text-[#0C0C0C]">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Welcome back! Here's what's happening with your orders.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-semibold text-[#0C0C0C]">
                {loading ? "—" : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display text-lg sm:text-xl text-[#0C0C0C]">Recent Orders</h2>
            <Link 
              to="/admin/orders" 
              className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Orders will appear here when customers place them.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                      <span className="text-gold-600 font-medium text-xs sm:text-sm">
                        {order.customer_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#0C0C0C] text-sm sm:text-base truncate">{order.customer_name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 capitalize">{order.product_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-500">{order.pickup_date}</p>
                      <p className="font-medium text-[#0C0C0C]">${order.total_amount?.toFixed(2) || "0.00"}</p>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium capitalize whitespace-nowrap ${getStatusBadge(order.status)}`}>
                      {order.status?.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
