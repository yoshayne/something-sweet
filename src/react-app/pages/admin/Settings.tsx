import { useState, useEffect } from "react";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import { Switch } from "@/react-app/components/ui/switch";
import { Save, Store, Clock, Share2, ShoppingBag, Loader2, Check } from "lucide-react";

interface Settings {
  business_name: string;
  tagline: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  pinterest_url: string;
  hours_monday: string;
  hours_tuesday: string;
  hours_wednesday: string;
  hours_thursday: string;
  hours_friday: string;
  hours_saturday: string;
  hours_sunday: string;
  min_order_notice_days: number;
  is_accepting_orders: boolean;
  order_message: string;
  tax_rate: number;
}

const defaultSettings: Settings = {
  business_name: "",
  tagline: "",
  owner_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  instagram_url: "",
  facebook_url: "",
  tiktok_url: "",
  pinterest_url: "",
  hours_monday: "",
  hours_tuesday: "",
  hours_wednesday: "",
  hours_thursday: "",
  hours_friday: "",
  hours_saturday: "",
  hours_sunday: "",
  min_order_notice_days: 3,
  is_accepting_orders: true,
  order_message: "",
  tax_rate: 7.25,
};

export default function Settings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings({ ...defaultSettings, ...data, is_accepting_orders: Boolean(data.is_accepting_orders) });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#C9920E]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#0C0C0C]">Settings</h1>
          <p className="text-zinc-500 mt-1 text-sm sm:text-base">Manage your business information and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0C0C0C] hover:bg-zinc-800 text-white w-full sm:w-auto"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Business Information */}
      <SettingsSection icon={Store} title="Business Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={settings.business_name}
              onChange={(e) => updateField("business_name", e.target.value)}
              placeholder="Something Sweet by Erica"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={settings.tagline}
              onChange={(e) => updateField("tagline", e.target.value)}
              placeholder="Handcrafted with Love"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_name">Owner Name</Label>
            <Input
              id="owner_name"
              value={settings.owner_name}
              onChange={(e) => updateField("owner_name", e.target.value)}
              placeholder="Erica"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="hello@somethingsweetbyerica.com"
            />
          </div>
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="(704) 555-0123"
            />
          </div>
        </div>
        <div className="mt-4 sm:mt-6 space-y-2">
          <Label>Address</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Input
              className="sm:col-span-2"
              value={settings.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Street Address"
            />
            <Input
              value={settings.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="City"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={settings.state}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="State"
              />
              <Input
                value={settings.zip}
                onChange={(e) => updateField("zip", e.target.value)}
                placeholder="ZIP"
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Business Hours */}
      <SettingsSection icon={Clock} title="Business Hours">
        <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
          {[
            { key: "hours_monday", label: "Monday" },
            { key: "hours_tuesday", label: "Tuesday" },
            { key: "hours_wednesday", label: "Wednesday" },
            { key: "hours_thursday", label: "Thursday" },
            { key: "hours_friday", label: "Friday" },
            { key: "hours_saturday", label: "Saturday" },
            { key: "hours_sunday", label: "Sunday" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3 sm:gap-4">
              <Label className="w-20 sm:w-24 text-zinc-600 text-sm shrink-0">{label}</Label>
              <Input
                value={settings[key as keyof Settings] as string}
                onChange={(e) => updateField(key as keyof Settings, e.target.value)}
                placeholder="9 AM - 5 PM"
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Social Media */}
      <SettingsSection icon={Share2} title="Social Media">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input
              id="facebook"
              value={settings.facebook_url}
              onChange={(e) => updateField("facebook_url", e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              value={settings.instagram_url}
              onChange={(e) => updateField("instagram_url", e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pinterest">Pinterest URL</Label>
            <Input
              id="pinterest"
              value={settings.pinterest_url}
              onChange={(e) => updateField("pinterest_url", e.target.value)}
              placeholder="https://pinterest.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktok">TikTok URL</Label>
            <Input
              id="tiktok"
              value={settings.tiktok_url}
              onChange={(e) => updateField("tiktok_url", e.target.value)}
              placeholder="https://tiktok.com/@..."
            />
          </div>
        </div>
      </SettingsSection>

      {/* Order Settings */}
      <SettingsSection icon={ShoppingBag} title="Order Settings">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg gap-4">
            <div className="min-w-0">
              <Label className="text-base font-medium">Accept Orders</Label>
              <p className="text-sm text-zinc-500 mt-1">
                Turn off to temporarily stop accepting new orders
              </p>
            </div>
            <Switch
              checked={settings.is_accepting_orders}
              onCheckedChange={(checked) => updateField("is_accepting_orders", checked)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="notice_days">Minimum Order Notice (days)</Label>
              <Input
                id="notice_days"
                type="number"
                min="1"
                value={settings.min_order_notice_days}
                onChange={(e) => updateField("min_order_notice_days", parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-zinc-500">
                How many days in advance customers must order
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                value={settings.tax_rate}
                onChange={(e) => updateField("tax_rate", parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-zinc-500">
                Applied to invoice totals
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_message">Order Page Message</Label>
            <Textarea
              id="order_message"
              value={settings.order_message}
              onChange={(e) => updateField("order_message", e.target.value)}
              placeholder="Special message to show on the order page (e.g., holiday notice, booking status)"
              rows={3}
            />
          </div>
        </div>
      </SettingsSection>
      </div>
    </AdminLayout>
  );
}

function SettingsSection({ 
  icon: Icon, 
  title, 
  children 
}: { 
  icon: React.ElementType; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 bg-gradient-to-br from-[#9A6F0A] to-[#C9920E] rounded-lg shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-[#0C0C0C]">{title}</h2>
      </div>
      {children}
    </div>
  );
}
