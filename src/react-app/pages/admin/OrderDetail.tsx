import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Clock, Package, FileText, Image, ExternalLink } from "lucide-react";

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_type: string;
  flavor: string;
  size: string;
  quantity: number;
  occasion: string;
  pickup_date: string;
  pickup_time: string;
  is_delivery: boolean;
  delivery_address: string;
  special_requests: string;
  inspiration_links: string;
  inspiration_images: string;
  status: string;
  total_amount: number;
  deposit_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-amber-500" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-purple-500" },
  { value: "ready", label: "Ready", color: "bg-green-500" },
  { value: "completed", label: "Completed", color: "bg-gray-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: string) {
    setSaving(true);
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrder((prev) => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setSaving(false);
    }
  }

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="bg-white rounded-xl h-96"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-gray-500">Order not found</p>
          <Link to="/admin/orders" className="text-gold-600 hover:underline mt-2 inline-block">
            Back to orders
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-3xl text-[#0C0C0C]">Order #{order.id}</h1>
            <p className="text-gray-500 mt-1">
              Created {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusBadge(order.status)}`}>
            {order.status?.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-display text-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gold-500" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${order.customer_email}`} className="text-gold-600 hover:underline">
                    {order.customer_email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${order.customer_phone}`} className="text-gold-600 hover:underline">
                    {order.customer_phone}
                  </a>
                </div>
                {order.is_delivery && order.delivery_address && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{order.delivery_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-display text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-gold-500" />
                Order Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Product</p>
                  <p className="font-medium capitalize">{order.product_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Flavor</p>
                  <p className="font-medium">{order.flavor || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Size</p>
                  <p className="font-medium">{order.size || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quantity</p>
                  <p className="font-medium">{order.quantity || 1}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Occasion</p>
                  <p className="font-medium">{order.occasion || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fulfillment</p>
                  <p className="font-medium">{order.is_delivery ? "Delivery" : "Pickup"}</p>
                </div>
              </div>
              
              {order.special_requests && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Special Requests</p>
                  <p className="text-gray-700">{order.special_requests}</p>
                </div>
              )}

              {/* Inspiration Section */}
              {(() => {
                const images = order.inspiration_images ? JSON.parse(order.inspiration_images) : [];
                const links = order.inspiration_links ? JSON.parse(order.inspiration_links) : [];
                if (images.length === 0 && links.length === 0) return null;
                
                return (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Inspiration Photos & Links
                    </p>
                    
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {images.map((url: string, index: number) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gold-500 transition-colors"
                          >
                            <img
                              src={url}
                              alt={`Inspiration ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {links.length > 0 && (
                      <div className="space-y-2">
                        {links.map((link: string, index: number) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-gold-600 hover:text-gold-700 hover:underline"
                          >
                            <ExternalLink className="w-4 h-4 shrink-0" />
                            <span className="truncate">{link}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Pickup/Delivery */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-display text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-500" />
                {order.is_delivery ? "Delivery" : "Pickup"} Information
              </h2>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                    <p className="font-medium">{order.pickup_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Time</p>
                    <p className="font-medium">{order.pickup_time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-display text-lg mb-4">Update Status</h2>
              <div className="space-y-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateStatus(opt.value)}
                    disabled={saving}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      order.status === opt.value
                        ? "border-gold-500 bg-gold-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${opt.color}`}></div>
                    <span className={order.status === opt.value ? "font-medium" : ""}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-display text-lg mb-4">Pricing</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Deposit</span>
                  <span className="font-medium">${(order.deposit_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg border-t border-gray-100 pt-3">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold text-gold-600">${(order.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
              
              <Link
                to={`/admin/invoices/new?orderId=${order.id}`}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0C0C0C] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <FileText className="w-4 h-4" />
                Create Invoice
              </Link>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-display text-lg mb-4">Admin Notes</h2>
                <p className="text-gray-700 text-sm">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
