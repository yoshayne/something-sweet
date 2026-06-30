import { useState } from "react";

export default function EmailSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="py-12 sm:py-20 px-5 sm:px-6 lg:px-16 bg-gradient-to-br from-gold-pale via-[#fff8e1] to-gold-pale border-y-2 border-gold/20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 sm:gap-10 lg:gap-16 items-center">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-black leading-tight mb-2">
            Be the First to Know
            <br />
            <em className="italic font-light text-gold-slide">
              About Specials & New Designs
            </em>
          </h3>
          <p className="text-[12px] sm:text-[13px] text-gray leading-[1.7]">
            Join the list and get weekly updates on new creations, seasonal
            offerings, and exclusive deals.
          </p>
        </div>

        {/* Form */}
        {status === "success" ? (
          <div className="flex items-center justify-center lg:justify-start w-full lg:min-w-[380px] py-4">
            <p className="text-gold font-medium text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full lg:min-w-[380px]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 sm:px-5 py-3.5 sm:py-4 font-sans text-[13px] border border-black/15 sm:border-r-0 outline-none bg-white text-black placeholder:text-gray-light focus:border-gold transition-colors"
              required
              disabled={status === "loading"}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-gold text-white text-xs font-medium tracking-[0.2em] uppercase px-6 sm:px-7 py-3.5 sm:py-4 whitespace-nowrap mt-2 sm:mt-0 disabled:opacity-70"
            >
              <span>{status === "loading" ? "Subscribing..." : "Subscribe"}</span>
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm mt-2">{message}</p>
        )}
      </div>
    </section>
  );
}
