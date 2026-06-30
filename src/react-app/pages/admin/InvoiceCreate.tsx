import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { ArrowLeft, Plus, Trash2, Save, Send } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_type: string;
  flavor: string;
  size: string;
  quantity: number;
  total_amount: number;
}

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0, amount: 0 }
  ]);

  // Load order data if orderId is provided
  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  async function loadOrder(id: string) {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const order: Order = await res.json();
        setCustomerName(order.customer_name || "");
        setCustomerEmail(order.customer_email || "");
        setCustomerPhone(order.customer_phone || "");
        
        // Create line item from order
        const description = `${order.product_type} - ${order.flavor || ""} ${order.size || ""}`.trim();
        setItems([{
          id: crypto.randomUUID(),
          description,
          quantity: order.quantity || 1,
          unit_price: order.total_amount || 0,
          amount: order.total_amount || 0,
        }]);
      }
    } catch (error) {
      console.error("Failed to load order:", error);
    }
  }

  function addItem() {
    setItems([
      ...items,
      { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0, amount: 0 }
    ]);
  }

  function removeItem(id: string) {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems(items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate amount with proper rounding to avoid floating point errors
        if (field === "quantity" || field === "unit_price") {
          updated.amount = Math.round(updated.quantity * updated.unit_price * 100) / 100;
        }
        return updated;
      }
      return item;
    }));
  }

  // Round totals to avoid floating point precision issues
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
  const taxRate = 0; // No tax for now
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  async function saveInvoice(status: "draft" | "sent") {
    if (!customerName || !customerEmail) {
      alert("Please fill in customer name and email.");
      return;
    }

    if (items.every((item) => !item.description)) {
      alert("Please add at least one line item.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId ? parseInt(orderId) : null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          status,
          due_date: dueDate || null,
          notes,
          items: items.filter((item) => item.description).map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount,
          })),
        }),
      });
      
      if (res.ok) {
        navigate("/admin/invoices");
      } else {
        throw new Error("Failed to save invoice");
      }
    } catch (error) {
      console.error("Failed to save invoice:", error);
      alert("Failed to save invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/invoices")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-3xl text-[#0C0C0C]">Create Invoice</h1>
            <p className="text-gray-500 mt-1">
              {orderId ? `Creating invoice for order #${orderId}` : "Create a new invoice"}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-display text-lg mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                placeholder="(555) 555-5555"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-display text-lg mb-4">Line Items</h2>
          
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Items */}
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || ""}
                    onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                    placeholder="1"
                  />
                </div>
                <div className="col-span-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price || ""}
                      onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="px-3 py-2 font-medium">${item.amount.toFixed(2)}</p>
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={addItem}
            className="mt-4 flex items-center gap-2 text-gold-600 hover:text-gold-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Line Item
          </button>
          
          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-gray-100">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-gold-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-display text-lg mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 resize-none"
              placeholder="Additional notes for the customer..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => saveInvoice("draft")}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            Save as Draft
          </button>
          <button
            onClick={() => saveInvoice("sent")}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-black font-medium rounded-lg hover:from-gold-500 hover:to-gold-400 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            Save & Send
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
