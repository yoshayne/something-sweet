import { useState } from "react";
import {
  cookieQuantities,
  cookieStyles,
  occasions,
} from "@/data/orderOptions";
import FormField from "./FormField";
import FormSelect from "./FormSelect";
import FormTextarea from "./FormTextarea";
import InspirationUpload from "./InspirationUpload";

export default function CookieForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    occasion: "",
    quantity: "",
    style: "",
    description: "",
  });
  const [inspirationLinks, setInspirationLinks] = useState<string[]>([]);
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const quantityNum = parseInt(formData.quantity) || 12;
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          product_type: "cookies",
          flavor: formData.style,
          size: formData.quantity,
          quantity: quantityNum,
          occasion: formData.occasion,
          pickup_date: formData.eventDate,
          pickup_time: "TBD",
          is_delivery: false,
          delivery_address: "",
          special_requests: formData.description,
          inspiration_links: inspirationLinks,
          inspiration_images: inspirationImages,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to submit order");
      setSubmitted(true);
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("Something went wrong. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-12 text-center border border-light-gray">
        <span className="text-5xl block mb-4">🍪</span>
        <h3 className="font-display text-2xl font-semibold text-black mb-3">
          Request Received!
        </h3>
        <p className="text-sm text-gray max-w-md mx-auto leading-relaxed">
          Thank you for your cookie order request. I'll send you a quote
          within 24-48 hours.
        </p>
        <p className="text-xs text-gray/90 max-w-md mx-auto leading-relaxed mt-4 bg-off-white border border-light-gray rounded-md px-4 py-3">
          📩 A confirmation email is on its way. If you don't see it, please
          check your <strong>spam/junk</strong> folder, mark it "Not Spam," and
          add <strong>erica@somethingsweet.shop</strong> to your contacts so you
          receive your quote and order updates.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              eventDate: "",
              occasion: "",
              quantity: "",
              style: "",
              description: "",
            });
            setInspirationLinks([]);
            setInspirationImages([]);
          }}
          className="mt-6 text-xs font-medium tracking-[0.15em] uppercase text-gold-deep hover:text-black transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 border border-light-gray">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-light-gray">
        <span className="text-3xl">🍪</span>
        <div>
          <h2 className="font-display text-xl font-semibold text-black">
            Cookie Order
          </h2>
          <p className="text-xs text-gray">Starting at $2.50/cookie</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            label="Your Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <FormField
            label="Event Date"
            name="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Cookie Details */}
        <div className="pt-4 border-t border-light-gray">
          <h3 className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-5">
            Cookie Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormSelect
              label="Occasion"
              name="occasion"
              value={formData.occasion}
              onChange={handleChange}
              options={occasions.map((o) => ({ value: o, label: o }))}
              required
            />
            <FormSelect
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              options={cookieQuantities.map((q) => ({
                value: q.value,
                label: `${q.label} — ${q.price}`,
              }))}
              required
            />
          </div>

          <div className="mt-5">
            <FormSelect
              label="Cookie Style"
              name="style"
              value={formData.style}
              onChange={handleChange}
              options={cookieStyles.map((s) => ({
                value: s.value,
                label: `${s.label} — ${s.description}`,
              }))}
              required
            />
          </div>
        </div>

        {/* Design Details */}
        <div className="pt-4 border-t border-light-gray">
          <h3 className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-5">
            Design Details
          </h3>

          <FormTextarea
            label="Describe Your Design"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Colors, shapes, themes, text, characters, etc."
            rows={3}
            required
          />
        </div>

        {/* Inspiration Section */}
        <div className="pt-4 border-t border-light-gray">
          <h3 className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-5">
            Inspiration
          </h3>
          <InspirationUpload
            inspirationLinks={inspirationLinks}
            inspirationImages={inspirationImages}
            onLinksChange={setInspirationLinks}
            onImagesChange={setInspirationImages}
          />
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold w-full text-white text-xs font-medium tracking-[0.2em] uppercase py-4 hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? "Submitting..." : "Request Quote"}</span>
          </button>
          <p className="text-[11px] text-gray text-center mt-4">
            By submitting, you agree to be contacted about your order.
          </p>
        </div>
      </div>
    </form>
  );
}
