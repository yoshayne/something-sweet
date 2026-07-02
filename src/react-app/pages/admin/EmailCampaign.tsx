import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Send, FileText, Sparkles, Gift, Heart, PartyPopper, Megaphone, ImagePlus, X } from "lucide-react";

interface Template {
  id: string;
  name: string;
  icon: React.ReactNode;
  subject: string;
  message: string;
}

const templates: Template[] = [
  {
    id: "new-specials",
    name: "New Specials",
    icon: <Sparkles className="w-5 h-5" />,
    subject: "✨ New Sweet Treats Just Dropped!",
    message: `Hey there, sweet friend!\n\nI've been busy in the kitchen creating some amazing new treats just for you. Stop by the site to see what's fresh this week!\n\nFrom cupcakes to custom cakes, there's something special waiting with your name on it.\n\nCan't wait to sweeten your day!\n\nXOXO,\nErica`,
  },
  {
    id: "seasonal",
    name: "Seasonal Update",
    icon: <Gift className="w-5 h-5" />,
    subject: "🍂 Seasonal Flavors Are Here!",
    message: `Hello, lovely!\n\nThe seasons are changing, and so are my flavors! I've got some exciting seasonal specials that you won't want to miss.\n\nThese limited-time treats are only available while supplies last, so don't wait too long to place your order!\n\nSweet wishes,\nErica`,
  },
  {
    id: "holiday",
    name: "Holiday Special",
    icon: <PartyPopper className="w-5 h-5" />,
    subject: "🎉 Holiday Treats - Order Early!",
    message: `Happy holidays, friend!\n\nThe holiday season is almost here, and I'm taking orders for all your celebration needs! Whether it's a stunning cake for your gathering or sweet treats for gifting, I've got you covered.\n\nSpots fill up fast during the holidays, so reach out soon to reserve your order date!\n\nWarmly,\nErica`,
  },
  {
    id: "thank-you",
    name: "Thank You",
    icon: <Heart className="w-5 h-5" />,
    subject: "💛 A Sweet Thank You!",
    message: `Hey there!\n\nI just wanted to take a moment to say THANK YOU. Your support means the world to me and makes Something Sweet possible.\n\nEvery order, every share, every kind word - it all matters so much. I'm so grateful to have you as part of this sweet journey!\n\nWith love and buttercream,\nErica`,
  },
  {
    id: "announcement",
    name: "Announcement",
    icon: <Megaphone className="w-5 h-5" />,
    subject: "📣 Exciting News from Something Sweet!",
    message: `Hey sweet friend!\n\nI've got some exciting news to share with you...\n\n[Add your announcement here]\n\nThank you for being part of the Something Sweet family!\n\nXOXO,\nErica`,
  },
];

export default function EmailCampaign() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get subscriber count
    fetch("/api/subscribers")
      .then(res => res.json())
      .then(data => {
        const active = data.filter((s: any) => s.is_active).length;
        setSubscriberCount(active);
      })
      .catch(() => {});
  }, []);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template.id);
    setSubject(template.subject);
    setMessage(template.message);
    setImageUrl(null);
    setResult(null);
    setError(null);
  };

  const handleCustom = () => {
    setSelectedTemplate("custom");
    setSubject("");
    setMessage("");
    setImageUrl(null);
    setResult(null);
    setError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("Image must be less than 25MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/campaign-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setImageUrl(data.url);
      setImageError(false);
    } catch (e: any) {
      setError(e.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    setImageError(false);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Please fill in both subject and message");
      return;
    }

    if (!confirm(`Send this email to ${subscriberCount} subscribers?`)) {
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/email-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, imageUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send");
      }

      setResult({ sent: data.sent, failed: data.failed });
      setSubject("");
      setMessage("");
      setImageUrl(null);
      setSelectedTemplate(null);
    } catch (e: any) {
      setError(e.message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-semibold text-black">Send Email Campaign</h1>
          <p className="text-gray text-sm mt-1">
            Send an email to all {subscriberCount} active subscribers
          </p>
        </div>

        {/* Success/Error Messages */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">Campaign sent successfully!</p>
            <p className="text-green-700 text-sm mt-1">
              ✅ {result.sent} emails delivered
              {result.failed > 0 && ` • ❌ ${result.failed} failed`}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Template Selection */}
        <div className="bg-white border border-black/10 rounded-lg p-6">
          <h2 className="font-medium text-black mb-4">Choose a Template</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  selectedTemplate === template.id
                    ? "border-gold bg-gold/5"
                    : "border-black/10 hover:border-gold/50"
                }`}
              >
                <div className={`mx-auto mb-2 ${selectedTemplate === template.id ? "text-gold" : "text-gray"}`}>
                  {template.icon}
                </div>
                <p className="text-xs font-medium text-black">{template.name}</p>
              </button>
            ))}
            <button
              onClick={handleCustom}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                selectedTemplate === "custom"
                  ? "border-gold bg-gold/5"
                  : "border-black/10 hover:border-gold/50"
              }`}
            >
              <div className={`mx-auto mb-2 ${selectedTemplate === "custom" ? "text-gold" : "text-gray"}`}>
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-black">Custom</p>
            </button>
          </div>
        </div>

        {/* Email Composer */}
        {selectedTemplate && (
          <div className="bg-white border border-black/10 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-black">Compose Your Email</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-4 py-2.5 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={12}
                placeholder="Write your message..."
                className="w-full px-4 py-3 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold resize-none"
              />
              <p className="text-xs text-gray mt-1">
                Line breaks will be preserved in the email
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray mb-1">Image (optional)</label>
              {imageUrl ? (
                <div className="relative inline-block">
                  {imageError ? (
                    <div className="max-w-xs h-40 flex flex-col items-center justify-center rounded-lg border border-red-300 bg-red-50 px-4">
                      <p className="text-red-600 text-sm font-medium mb-1">Image failed to load</p>
                      <p className="text-red-500 text-xs text-center">The uploaded image couldn't be displayed. Try uploading again.</p>
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Campaign image"
                      className="max-w-xs h-40 object-cover rounded-lg border border-black/10"
                      onError={() => setImageError(true)}
                    />
                  )}
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="campaign-image"
                  />
                  <label
                    htmlFor="campaign-image"
                    className={`flex items-center gap-2 px-4 py-2.5 border border-dashed border-black/20 rounded-lg cursor-pointer hover:border-gold hover:bg-gold/5 transition-all ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                        <span className="text-sm text-gray">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-5 h-5 text-gray" />
                        <span className="text-sm text-gray">Add an image to your email</span>
                      </>
                    )}
                  </label>
                </div>
              )}
              <p className="text-xs text-gray mt-1">
                Image will appear at the top of your email
              </p>
            </div>

            {/* Preview */}
            <div className="border-t border-black/10 pt-4">
              <h3 className="text-sm font-medium text-gray mb-3">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-black/5">
                <p className="font-medium text-black text-sm mb-2">{subject || "Subject line"}</p>
                {imageUrl && !imageError && (
                  <img
                    src={imageUrl}
                    alt="Campaign"
                    className="w-full max-w-md h-48 object-cover rounded-lg mb-3"
                    onError={() => setImageError(true)}
                  />
                )}
                {imageUrl && imageError && (
                  <div className="w-full max-w-md h-48 flex items-center justify-center rounded-lg mb-3 border border-red-300 bg-red-50">
                    <p className="text-red-500 text-sm">Image failed to load</p>
                  </div>
                )}
                <div className="text-sm text-gray whitespace-pre-wrap">
                  {message || "Your message will appear here..."}
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
                className="btn-gold px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send to {subscriberCount} Subscribers
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* No Template Selected */}
        {!selectedTemplate && (
          <div className="bg-white border border-black/10 rounded-lg p-12 text-center">
            <Send className="w-12 h-12 text-gray/30 mx-auto mb-3" />
            <p className="text-gray">Select a template above or create a custom email</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
