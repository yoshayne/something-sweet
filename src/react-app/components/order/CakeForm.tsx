import { useState } from "react";
import {
  cakeSizes,
  cakeFlavors,
  frostingTypes,
  occasions,
} from "@/data/orderOptions";
import FormField from "./FormField";
import FormSelect from "./FormSelect";
import FormTextarea from "./FormTextarea";
import InspirationUpload from "./InspirationUpload";

export default function CakeForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    occasion: "",
    size: "",
    flavor: "",
    frosting: "",
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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          product_type: "cake",
          flavor: `${formData.flavor} with ${formData.frosting}`,
          size: formData.size,
          quantity: 1,
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
        <span className="text-5xl block mb-4">✨</span>
        <h3 className="font-display text-2xl font-semibold text-black mb-3">
          Request Received!
        </h3>
        <p className="text-sm text-gray max-w-md mx-auto leading-relaxed">
          Thank you for your cake order request. I'll review the details and 
          send you a quote within 24-48 hours.
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
              size: "",
              flavor: "",
              frosting: "",
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
        <span className="text-3xl">🎂</span>
        <div>
          <h2 className="font-display text-xl font-semibold text-black">
            Custom Cake Order
          </h2>
          <p className="text-xs text-gray">Starting at $65</p>
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

        {/* Cake Details */}
        <div className="pt-4 border-t border-light-gray">
          <h3 className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-5">
            Cake Details
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
              label="Cake Size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              options={cakeSizes.map((s) => ({
                value: s.value,
                label: `${s.label} (serves ${s.serves}) — ${s.price}`,
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <FormSelect
              label="Cake Flavor"
              name="flavor"
              value={formData.flavor}
              onChange={handleChange}
              options={cakeFlavors.map((f) => ({ value: f, label: f }))}
              required
            />
            <FormSelect
              label="Frosting Type"
              name="frosting"
              value={formData.frosting}
              onChange={handleChange}
              options={frostingTypes.map((f) => ({ value: f, label: f }))}
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
            label="Describe Your Vision"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Colors, theme, decorations, text on cake, etc."
            rows={4}
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
