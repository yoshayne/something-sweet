import { useState } from "react";
import Navbar from "@/react-app/components/layout/Navbar";
import Footer from "@/react-app/components/layout/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Header */}
      <header className="bg-black py-12 sm:py-16 px-5 sm:px-6 lg:px-16 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 30px,
              rgba(201,146,14,0.08) 30px,
              rgba(201,146,14,0.08) 31px
            )`,
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block text-[10px] font-medium tracking-[0.4em] uppercase text-gold-mid mb-4">
            Get in Touch
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Contact <em className="italic font-light text-gold-slide">Erica</em>
          </h1>
          <p className="text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
            Have a question about your order or want to discuss a custom creation? 
            I'd love to hear from you!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-10 sm:py-16 px-5 sm:px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Direct Contact */}
              <div>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-5">
                  Direct <em className="italic font-light">Contact</em>
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <a
                    href="mailto:somethingsweetbyerica@gmail.com"
                    className="flex items-start gap-4 group"
                  >
                    <span className="w-10 h-10 flex items-center justify-center bg-off-white border border-light-gray text-gold-deep flex-shrink-0">
                      ✉
                    </span>
                    <div>
                      <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-gray block mb-1">
                        Email
                      </span>
                      <span className="text-sm text-black group-hover:text-gold-deep transition-colors">
                        somethingsweetbyerica@gmail.com
                      </span>
                    </div>
                  </a>

                  <a href="tel:+18037183346" className="flex items-start gap-4 group">
                    <span className="w-10 h-10 flex items-center justify-center bg-off-white border border-light-gray text-gold-deep flex-shrink-0">
                      ☎
                    </span>
                    <div>
                      <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-gray block mb-1">
                        Phone
                      </span>
                      <span className="text-sm text-black group-hover:text-gold-deep transition-colors">
                        (803) 718-3346
                      </span>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 flex items-center justify-center bg-off-white border border-light-gray text-gold-deep flex-shrink-0">
                      ◎
                    </span>
                    <div>
                      <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-gray block mb-1">
                        Location
                      </span>
                      <span className="text-sm text-black">
                        Winnsboro, South Carolina
                      </span>
                      <span className="text-xs text-gray block mt-0.5">
                        Pickup & local delivery available
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-5">
                  Business <em className="italic font-light">Hours</em>
                </h2>
                <div className="bg-off-white border border-light-gray p-4 sm:p-5">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray">Monday – Friday</span>
                      <span className="text-black font-medium">9am – 5pm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray">Saturday</span>
                      <span className="text-black font-medium">10am – 3pm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray">Sunday</span>
                      <span className="text-black font-medium">Closed</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-light-gray">
                    <p className="text-xs text-gray leading-relaxed">
                      Orders require 48-72 hours notice. For rush orders, please 
                      call directly to check availability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-5">
                  Follow <em className="italic font-light">Along</em>
                </h2>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-10 h-10 flex items-center justify-center bg-black text-white hover:bg-gold-deep transition-colors text-sm"
                    aria-label="Instagram"
                  >
                    IG
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 flex items-center justify-center bg-black text-white hover:bg-gold-deep transition-colors text-sm"
                    aria-label="Facebook"
                  >
                    FB
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 flex items-center justify-center bg-black text-white hover:bg-gold-deep transition-colors text-sm"
                    aria-label="Pinterest"
                  >
                    PI
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-off-white border border-light-gray p-5 sm:p-8">
                <h2 className="font-display text-lg sm:text-xl font-semibold text-black mb-2">
                  Send a <em className="italic font-light">Message</em>
                </h2>
                <p className="text-[11px] sm:text-xs text-gray mb-5 sm:mb-6">
                  For order inquiries, custom designs, or general questions
                </p>

                {submitted ? (
                  <div className="text-center py-8 sm:py-12">
                    <span className="text-3xl sm:text-4xl block mb-3 sm:mb-4">💌</span>
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-black mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-[13px] sm:text-sm text-gray">
                      Thanks for reaching out! I'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block text-[10px] font-medium tracking-[0.2em] uppercase text-gray mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-light-gray text-sm text-black focus:outline-none focus:border-gold-deep transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium tracking-[0.2em] uppercase text-gray mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-light-gray text-sm text-black focus:outline-none focus:border-gold-deep transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block text-[10px] font-medium tracking-[0.2em] uppercase text-gray mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-light-gray text-sm text-black focus:outline-none focus:border-gold-deep transition-colors"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium tracking-[0.2em] uppercase text-gray mb-2">
                          Subject *
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-light-gray text-sm text-black focus:outline-none focus:border-gold-deep transition-colors"
                        >
                          <option value="">Select a topic</option>
                          <option value="order">Order Question</option>
                          <option value="custom">Custom Design Request</option>
                          <option value="pricing">Pricing Inquiry</option>
                          <option value="delivery">Delivery/Pickup</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium tracking-[0.2em] uppercase text-gray mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-white border border-light-gray text-sm text-black focus:outline-none focus:border-gold-deep transition-colors resize-none"
                        placeholder="Tell me about your event, design ideas, or any questions you have..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold w-full text-white text-xs font-medium tracking-[0.2em] uppercase px-8 py-4 hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-16 bg-black">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-mid mb-3 sm:mb-4 block">
            Common Questions
          </span>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-6 sm:mb-8">
            Quick <em className="italic font-light text-gold-slide">Answers</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
            <div className="bg-white/5 border border-white/10 p-4 sm:p-5">
              <h3 className="text-[13px] sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
                How far in advance should I order?
              </h3>
              <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                Most orders require 48-72 hours notice. For wedding cakes or large 
                orders, please contact me 2-4 weeks in advance.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 sm:p-5">
              <h3 className="text-[13px] sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
                Do you offer delivery?
              </h3>
              <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                Yes! Local delivery is available within 25 miles of Winnsboro. 
                Pickup is also available by appointment.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 sm:p-5">
              <h3 className="text-[13px] sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
                Can you accommodate dietary restrictions?
              </h3>
              <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                I offer gluten-free and vegan options for most items. Please mention 
                any allergies or restrictions when ordering.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 sm:p-5">
              <h3 className="text-[13px] sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
                What's your cancellation policy?
              </h3>
              <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                Deposits are non-refundable. Cancellations made 72+ hours before 
                pickup receive a credit for future orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
