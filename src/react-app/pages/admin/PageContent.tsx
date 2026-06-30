import { useState, useEffect } from "react";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Save, Check } from "lucide-react";

interface PageContentData {
  [key: string]: string;
}

const pageTabs = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "order", label: "Order" },
  { id: "seasonal", label: "Seasonal" },
  { id: "contact", label: "Contact" },
];

const pageFields: Record<string, { key: string; label: string; type: "text" | "textarea"; placeholder: string }[]> = {
  home: [
    { key: "home_announcement", label: "Announcement Bar", type: "text", placeholder: "e.g., Now taking orders for Valentine's Day! 💕" },
    { key: "home_hero_headline", label: "Hero Headline", type: "text", placeholder: "e.g., Handcrafted with Love" },
    { key: "home_hero_subheadline", label: "Hero Subheadline", type: "textarea", placeholder: "e.g., Custom cakes, cupcakes, and cookies made fresh for your special moments" },
    { key: "home_special_title", label: "This Week's Special - Title", type: "text", placeholder: "e.g., Lavender Honey Cake" },
    { key: "home_special_description", label: "This Week's Special - Description", type: "textarea", placeholder: "Describe this week's featured item..." },
    { key: "home_process_title", label: "How It Works - Section Title", type: "text", placeholder: "e.g., How It Works" },
    { key: "home_cta_headline", label: "Bottom CTA - Headline", type: "text", placeholder: "e.g., Ready to Order Something Sweet?" },
    { key: "home_cta_text", label: "Bottom CTA - Text", type: "textarea", placeholder: "e.g., Let's create something special together..." },
  ],
  about: [
    { key: "about_page_title", label: "Page Title", type: "text", placeholder: "e.g., About Erica" },
    { key: "about_headline", label: "Story Headline", type: "text", placeholder: "e.g., A Passion for Baking" },
    { key: "about_story", label: "Story Text", type: "textarea", placeholder: "Share your story..." },
    { key: "about_values_title", label: "Values Section Title", type: "text", placeholder: "e.g., What Sets Us Apart" },
    { key: "about_quote", label: "Featured Quote", type: "textarea", placeholder: "A quote that represents your philosophy..." },
  ],
  gallery: [
    { key: "gallery_page_title", label: "Page Title", type: "text", placeholder: "e.g., Gallery" },
    { key: "gallery_description", label: "Page Description", type: "textarea", placeholder: "e.g., Browse our collection of custom creations..." },
  ],
  order: [
    { key: "order_page_title", label: "Page Title", type: "text", placeholder: "e.g., Place Your Order" },
    { key: "order_description", label: "Page Description", type: "textarea", placeholder: "e.g., Every order is made fresh just for you..." },
    { key: "order_cakes_intro", label: "Cakes Tab - Intro Text", type: "textarea", placeholder: "Describe your cake offerings..." },
    { key: "order_cupcakes_intro", label: "Cupcakes Tab - Intro Text", type: "textarea", placeholder: "Describe your cupcake offerings..." },
    { key: "order_cookies_intro", label: "Cookies Tab - Intro Text", type: "textarea", placeholder: "Describe your cookie offerings..." },
  ],
  seasonal: [
    { key: "seasonal_page_title", label: "Page Title", type: "text", placeholder: "e.g., Seasonal Specials" },
    { key: "seasonal_description", label: "Page Description", type: "textarea", placeholder: "e.g., Limited-time offerings for every season..." },
  ],
  contact: [
    { key: "contact_page_title", label: "Page Title", type: "text", placeholder: "e.g., Get In Touch" },
    { key: "contact_intro", label: "Intro Text", type: "textarea", placeholder: "e.g., Have questions? Ready to place an order? We'd love to hear from you!" },
    { key: "contact_hours_note", label: "Hours Note", type: "text", placeholder: "e.g., Orders require 48-hour notice" },
  ],
};

export default function PageContent() {
  const [activeTab, setActiveTab] = useState("home");
  const [content, setContent] = useState<PageContentData>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/page-content");
      if (res.ok) {
        const data = await res.json();
        // Convert array to object keyed by content_key
        const contentMap: PageContentData = {};
        data.forEach((item: { content_key: string; content_value: string }) => {
          contentMap[item.content_key] = item.content_value;
        });
        setContent(contentMap);
      }
    } catch (err) {
      console.error("Failed to fetch content:", err);
    }
  };

  const handleChange = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/page-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save content:", err);
    } finally {
      setSaving(false);
    }
  };

  const currentFields = pageFields[activeTab] || [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display text-charcoal">Page Content</h1>
            <p className="text-charcoal/60 mt-1">Edit the text that appears on each page of your website</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold flex items-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save All Changes"}
              </>
            )}
          </Button>
        </div>

        {/* Page Tabs */}
        <div className="flex gap-1 mb-8 bg-light-gray/50 p-1 rounded-lg w-fit">
          {pageTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[length:200%_100%] animate-gold-slide text-black shadow-sm"
                  : "text-charcoal/70 hover:text-charcoal hover:bg-white/50"
              }`}
              style={activeTab === tab.id ? {
                backgroundImage: 'linear-gradient(90deg, #9A6F0A, #C4941A, #F5C842, #C4941A, #9A6F0A)'
              } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Fields */}
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <h2 className="font-display text-lg text-charcoal mb-6 pb-4 border-b border-light-gray">
            {pageTabs.find(t => t.id === activeTab)?.label} Page Content
          </h2>
          
          <div className="space-y-6">
            {currentFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  {field.label}
                </label>
                {field.type === "text" ? (
                  <Input
                    value={content[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full"
                  />
                ) : (
                  <textarea
                    value={content[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none"
                  />
                )}
                <p className="text-xs text-charcoal/50 mt-1">
                  Leave blank to use the default text
                </p>
              </div>
            ))}
          </div>

          {currentFields.length === 0 && (
            <p className="text-charcoal/60 text-center py-8">
              No editable content for this page yet.
            </p>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gold-pale/30 border border-gold/20 rounded-lg">
          <p className="text-sm text-charcoal/70">
            <strong className="text-charcoal">Tip:</strong> Changes won't appear on your live website until you click "Save All Changes". 
            Leave any field blank to keep the default text.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
