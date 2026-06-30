import { useState, useEffect } from "react";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Mail, Trash2, Users, Calendar, TrendingUp } from "lucide-react";

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  is_active: number;
  created_at: string;
}

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/subscribers");
      const data = await res.json();
      setSubscribers(data);
    } catch (e) {
      console.error("Failed to fetch subscribers:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this subscriber?")) return;
    
    try {
      await fetch(`/api/subscribers/${id}`, { method: "DELETE" });
      setSubscribers(subscribers.filter(s => s.id !== id));
    } catch (e) {
      console.error("Failed to delete subscriber:", e);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Stats
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter(s => s.is_active).length;
  const thisMonth = subscribers.filter(s => {
    const subDate = new Date(s.created_at);
    const now = new Date();
    return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-semibold text-black">Email Subscribers</h1>
          <p className="text-gray text-sm mt-1">People who signed up for your email list</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-black/10 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-black">{totalSubscribers}</p>
                <p className="text-xs text-gray">Total Subscribers</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-black/10 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-black">{activeSubscribers}</p>
                <p className="text-xs text-gray">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-black/10 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-black">{thisMonth}</p>
                <p className="text-xs text-gray">This Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribers List */}
        <div className="bg-white border border-black/10 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray">Loading subscribers...</div>
          ) : subscribers.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-gray/30 mx-auto mb-3" />
              <p className="text-gray">No subscribers yet</p>
              <p className="text-gray/70 text-sm mt-1">When people sign up on your site, they'll appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-black/10">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray uppercase tracking-wider px-4 py-3">Email</th>
                    <th className="text-left text-xs font-medium text-gray uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Joined</th>
                    <th className="text-left text-xs font-medium text-gray uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-gold" />
                          </div>
                          <div>
                            <p className="font-medium text-black text-sm">{subscriber.email}</p>
                            <p className="text-xs text-gray sm:hidden">{formatDate(subscriber.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray hidden sm:table-cell">
                        {formatDate(subscriber.created_at)}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                          subscriber.is_active 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {subscriber.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(subscriber.id)}
                          className="text-gray hover:text-red-600 transition-colors p-1"
                          title="Remove subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
