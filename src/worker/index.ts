import { Hono } from "hono";
import Stripe from "stripe";
import { DB } from "../server/db";
import { R2_BUCKET } from "../server/bucket";
import { EMAILS } from "../server/email";

const app = new Hono<{ Bindings: Env }>();

// TODO: SECURE ADMIN — every /api route below (including the admin-only ones:
// orders, invoices, settings, gallery upload/delete, site-images, subscribers,
// email-campaign) is currently unauthenticated, matching the original Mocha app.
// Gate the admin API routes behind auth before/at go-live.

// Cloudflare injected bindings on c.env; Node does not. Attach the drop-in
// shims (Postgres/D1, S3/R2, Brevo/EMAILS) plus Stripe secrets onto c.env for
// every request so the existing route bodies keep working unchanged.
app.use("*", async (c, next) => {
  c.env = {
    DB,
    R2_BUCKET,
    EMAILS,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  await next();
});

// Email template helpers
const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #f8f7f5; font-family: Arial, Helvetica, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5;">
    ${content}
  </div>
</body>
</html>
`;

const emailHeader = (title: string) => `
<div style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #e5e5e5; background: linear-gradient(135deg, #0C0C0C 0%, #1a1a1a 100%);">
  <div style="font-family: Georgia, serif; font-size: 20px; color: #C9920E; margin-bottom: 8px; font-style: italic;">Something Sweet</div>
  <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff;">${title}</h1>
</div>
`;

const emailBody = (content: string) => `
<div style="padding: 32px 40px;">
  ${content}
</div>
`;

const emailFooter = (text: string) => `
<div style="padding: 24px 40px; border-top: 1px solid #e5e5e5; background-color: #fafaf9;">
  <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">${text}</p>
</div>
`;

// Where owner notifications are delivered, and the Reply-To on customer emails.
// Configurable via env; defaults to the domain address.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "erica@somethingsweet.shop";
const ADMIN_SMS = process.env.ADMIN_SMS || "8037183346@vtext.com";

// Helper to send email to admin
const sendToAdmin = async (
  env: Env,
  params: { subject: string; html_body: string; text_body: string; reply_to?: string },
) => {
  // Send email notification (reply_to, when provided, lets Erica reply directly
  // to the person who triggered it — e.g. a contact-form sender).
  await (env.EMAILS as any).send({
    to: ADMIN_EMAIL,
    ...params,
  });
  // Send SMS notification (shorter text-only version)
  await (env.EMAILS as any).send({
    to: ADMIN_SMS,
    subject: params.subject,
    text_body: params.text_body,
  });
};

// Upload inspiration image
app.post("/api/upload/inspiration", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type. Please upload a JPG, PNG, GIF, or WebP image." }, 400);
    }
    
    // Validate file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      return c.json({ error: "File too large. Maximum size is 25MB." }, 400);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop() || "jpg";
    const key = `inspiration/${timestamp}-${randomId}.${ext}`;
    
    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.R2_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    return c.json({ 
      success: true, 
      key,
      url: `/api/files/${key}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Upload campaign image for email marketing
app.post("/api/upload/campaign-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type. Please upload a JPG, PNG, GIF, or WebP image." }, 400);
    }
    
    if (file.size > 25 * 1024 * 1024) {
      return c.json({ error: "File too large. Maximum size is 25MB." }, 400);
    }
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop() || "jpg";
    const key = `campaign/${timestamp}-${randomId}.${ext}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const putResult = await c.env.R2_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Verify the file was actually stored
    if (!putResult) {
      console.error("R2 put returned null for key:", key);
      return c.json({ error: "Failed to store file in storage" }, 500);
    }
    
    // Double-check by trying to head the object
    const headCheck = await c.env.R2_BUCKET.head(key);
    if (!headCheck) {
      console.error("R2 head check failed for key:", key);
      return c.json({ error: "File storage verification failed" }, 500);
    }
    
    console.log("Campaign image uploaded successfully:", key, "size:", headCheck.size);
    
    // Return full URL for emails (relative URLs won't work in emails)
    const baseUrl = new URL(c.req.url).origin;
    return c.json({ 
      success: true, 
      key,
      url: `${baseUrl}/api/files/${key}`,
    });
  } catch (error) {
    console.error("Campaign image upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Serve uploaded files from R2
app.get("/api/files/*", async (c) => {
  const key = c.req.path.replace("/api/files/", "");
  const object = await c.env.R2_BUCKET.get(key);
  
  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000");
  
  return new Response(object.body, { headers });
});

// ============ CONTACT FORM ============

// Handle a Contact page submission: notify admin (email + SMS, reply-to the
// sender) and send the sender a confirmation.
app.post("/api/contact", async (c) => {
  const body = await c.req.json();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return c.json({ error: "Name, email, and message are required." }, 400);
  }

  const subjectMap: Record<string, string> = {
    order: "Order Question",
    custom: "Custom Design Request",
    pricing: "Pricing Inquiry",
    delivery: "Delivery/Pickup",
    other: "Other",
  };
  const topic = subjectMap[body.subject] || body.subject || "General Inquiry";
  const firstName = name.split(" ")[0];

  // Notify admin — reply_to is the sender so Erica can reply directly.
  try {
    await sendToAdmin(c.env, {
      subject: `📨 New Message: ${topic} — ${name}`,
      reply_to: email,
      html_body: emailTemplate(`
        ${emailHeader("New Contact Message")}
        ${emailBody(`
          <div style="background-color: #fafaf9; padding: 20px; margin-bottom: 20px; border-left: 3px solid #C9920E;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Name:</strong> <span style="color: #3f3f46;">${name}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Email:</strong> <span style="color: #3f3f46;">${email}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Phone:</strong> <span style="color: #3f3f46;">${phone || "Not provided"}</span></p>
            <p style="margin: 0; font-size: 14px;"><strong style="color: #0C0C0C;">Topic:</strong> <span style="color: #3f3f46;">${topic}</span></p>
          </div>
          <div style="background-color: #fafaf9; padding: 20px; border-left: 3px solid #C9920E;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Message:</strong></p>
            <p style="margin: 0; font-size: 14px; color: #3f3f46; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #71717a;">
            Just reply to this email to respond to ${firstName} directly.
          </p>
        `)}
        ${emailFooter("Something Sweet by Erica")}
      `),
      text_body: `New contact message (${topic})\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\n${message}`,
    });
  } catch (e) {
    console.error("Failed to send contact admin notification:", e);
    return c.json({ error: "Failed to send message. Please try again." }, 500);
  }

  // Confirmation to the sender
  try {
    await (c.env.EMAILS as unknown as { send: (params: { to: string; subject: string; html_body: string; text_body: string; reply_to?: string }) => Promise<void> }).send({
      to: email,
      subject: "We got your message! 💌",
      reply_to: ADMIN_EMAIL,
      html_body: emailTemplate(`
        ${emailHeader("Message Received")}
        ${emailBody(`
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            Hi ${firstName},
          </p>
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            Thank you for reaching out to Something Sweet by Erica! I've received your message and will get back to you within 24 hours.
          </p>
          <div style="background-color: #fafaf9; padding: 20px; margin-bottom: 24px; border-left: 3px solid #C9920E;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Your message:</strong></p>
            <p style="margin: 0; font-size: 14px; color: #3f3f46; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #3f3f46;">
            With love,<br>
            <strong style="color: #0C0C0C;">Erica</strong><br>
            <span style="color: #C9920E; font-style: italic;">Something Sweet by Erica</span>
          </p>
        `)}
        ${emailFooter("Something Sweet by Erica · Made with love 💛")}
      `),
      text_body: `Hi ${firstName},\n\nThank you for reaching out! I've received your message and will get back to you within 24 hours.\n\nYour message:\n${message}\n\nWith love,\nErica`,
    });
  } catch (e) {
    console.error("Failed to send contact confirmation:", e);
    // Non-fatal — admin was already notified.
  }

  return c.json({ success: true });
});

// Get all orders with optional status filter
app.get("/api/orders", async (c) => {
  const status = c.req.query("status");
  let query = "SELECT * FROM orders ORDER BY created_at DESC";
  const params: string[] = [];
  
  if (status && status !== "all") {
    query = "SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC";
    params.push(status);
  }
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

// Get order stats for dashboard
app.get("/api/orders/stats", async (c) => {
  const totalResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders").first();
  const pendingResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").first();
  const confirmedResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'confirmed'").first();
  const completedResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'").first();
  const revenueResult = await c.env.DB.prepare("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'").first();
  
  return c.json({
    total: totalResult?.count || 0,
    pending: pendingResult?.count || 0,
    confirmed: confirmedResult?.count || 0,
    completed: completedResult?.count || 0,
    revenue: revenueResult?.total || 0,
  });
});

// Get single order
app.get("/api/orders/:id", async (c) => {
  const id = c.req.param("id");
  const order = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first();
  
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }
  
  return c.json(order);
});

// Create new order
app.post("/api/orders", async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  
  const result = await c.env.DB.prepare(`
    INSERT INTO orders (
      customer_name, customer_email, customer_phone,
      product_type, flavor, size, quantity, occasion,
      pickup_date, pickup_time, is_delivery, delivery_address,
      special_requests, inspiration_links, inspiration_images,
      status, total_amount, deposit_amount, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.customer_name || null,
    body.customer_email || null,
    body.customer_phone || null,
    body.product_type || null,
    body.flavor || null,
    body.size || null,
    body.quantity || null,
    body.occasion || null,
    body.pickup_date || null,
    body.pickup_time || null,
    body.is_delivery ? 1 : 0,
    body.delivery_address || null,
    body.special_requests || null,
    JSON.stringify(body.inspiration_links || []),
    JSON.stringify(body.inspiration_images || []),
    "pending",
    body.total_amount || 0,
    body.deposit_amount || 0,
    body.notes || null,
    now,
    now
  ).run();
  
  const orderId = result.meta.last_row_id;
  const formattedDate = body.pickup_date ? new Date(body.pickup_date).toLocaleDateString("en-US", { 
    weekday: "long", year: "numeric", month: "long", day: "numeric" 
  }) : "TBD";
  
  // Send notification email to admin
  try {
    await sendToAdmin(c.env, {
      subject: `🎂 New Order Request from ${body.customer_name}`,
      html_body: emailTemplate(`
        ${emailHeader("New Order Request!")}
        ${emailBody(`
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            You have a new order request. Here are the details:
          </p>
          
          <div style="background-color: #fafaf9; padding: 20px; margin-bottom: 20px; border-left: 3px solid #C9920E;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Customer:</strong> <span style="color: #3f3f46;">${body.customer_name}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Email:</strong> <span style="color: #3f3f46;">${body.customer_email}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Phone:</strong> <span style="color: #3f3f46;">${body.customer_phone}</span></p>
          </div>
          
          <div style="background-color: #fafaf9; padding: 20px; margin-bottom: 20px; border-left: 3px solid #C9920E;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Product:</strong> <span style="color: #3f3f46; text-transform: capitalize;">${body.product_type}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Flavor:</strong> <span style="color: #3f3f46;">${body.flavor || "Not specified"}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Size/Quantity:</strong> <span style="color: #3f3f46;">${body.size || body.quantity || "Not specified"}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Occasion:</strong> <span style="color: #3f3f46;">${body.occasion || "Not specified"}</span></p>
            <p style="margin: 0; font-size: 14px;"><strong style="color: #0C0C0C;">Event Date:</strong> <span style="color: #3f3f46;">${formattedDate}</span></p>
          </div>
          
          ${body.special_requests ? `
          <div style="background-color: #fafaf9; padding: 20px; margin-bottom: 20px; border-left: 3px solid #C9920E;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Special Requests:</strong></p>
            <p style="margin: 0; font-size: 14px; color: #3f3f46; white-space: pre-wrap;">${body.special_requests}</p>
          </div>
          ` : ""}
          
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #71717a;">
            Order ID: #${orderId}
          </p>
        `)}
        ${emailFooter("Something Sweet by Erica · Charlotte, NC")}
      `),
      text_body: `New order from ${body.customer_name} (${body.customer_email})\n\nProduct: ${body.product_type}\nFlavor: ${body.flavor}\nDate: ${formattedDate}\n\nSpecial Requests: ${body.special_requests || "None"}`,
    });
  } catch (e) {
    console.error("Failed to send admin notification:", e);
  }
  
  // Send confirmation email to customer
  try {
    await (c.env.EMAILS as unknown as { send: (params: { to: string; subject: string; html_body: string; text_body: string; reply_to?: string }) => Promise<void> }).send({
      to: body.customer_email,
      subject: "We received your order request! ✨",
      reply_to: ADMIN_EMAIL,
      html_body: emailTemplate(`
        ${emailHeader("Order Request Received")}
        ${emailBody(`
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            Hi ${body.customer_name.split(" ")[0]},
          </p>
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            Thank you for your order request! I've received it and will review the details carefully.
          </p>
          <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            <strong style="color: #0C0C0C;">Expect a personalized quote within 24-48 hours.</strong>
          </p>
          
          <div style="background-color: #fafaf9; padding: 20px; margin-bottom: 24px; border-left: 3px solid #C9920E;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Your Order Summary:</strong></p>
            <p style="margin: 8px 0 4px 0; font-size: 14px; color: #3f3f46; text-transform: capitalize;">• ${body.product_type}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #3f3f46;">• ${body.flavor || "Flavor to be discussed"}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #3f3f46;">• ${body.occasion || "Special occasion"}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #3f3f46;">• Event Date: ${formattedDate}</p>
          </div>
          
          <div style="background-color: #fffbeb; padding: 16px 20px; margin-bottom: 20px; border-left: 3px solid #C9920E;">
            <p style="margin: 0; font-size: 14px; color: #3f3f46;">
              📩 <strong style="color: #0C0C0C;">Don't miss your quote!</strong> My replies sometimes land in
              <strong>spam</strong> or the <strong>Promotions</strong> tab. Please add
              <strong>erica@somethingsweet.shop</strong> to your contacts, and if this email
              was in spam, mark it "Not Spam" so you get your quote and updates.
            </p>
          </div>

          <p style="margin: 0 0 8px 0; font-size: 14px; color: #3f3f46;">
            If you have any questions or need to make changes, just reply to this email!
          </p>
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #3f3f46;">
            With love,<br>
            <strong style="color: #0C0C0C;">Erica</strong><br>
            <span style="color: #C9920E; font-style: italic;">Something Sweet by Erica</span>
          </p>
        `)}
        ${emailFooter("Something Sweet by Erica · Charlotte, NC · Made with love 💛")}
      `),
      text_body: `Hi ${body.customer_name.split(" ")[0]},\n\nThank you for your order request! I've received it and will review the details.\n\nExpect a personalized quote within 24-48 hours.\n\nTIP: My replies sometimes land in spam or the Promotions tab. Please add erica@somethingsweet.shop to your contacts (and mark this "Not Spam" if it landed there) so you receive your quote and updates.\n\nYour Order:\n- ${body.product_type}\n- ${body.flavor}\n- ${body.occasion}\n- Event Date: ${formattedDate}\n\nWith love,\nErica\nSomething Sweet by Erica`,
    });
  } catch (e) {
    console.error("Failed to send customer confirmation:", e);
  }
  
  return c.json({ id: orderId, success: true });
});

// Update order status
app.patch("/api/orders/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json();
  const now = new Date().toISOString();
  
  // Get order details first
  const order = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first() as Record<string, unknown> | null;
  
  await c.env.DB.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, now, id)
    .run();
  
  // Send status update email to customer
  if (order && order.customer_email) {
    const statusMessages: Record<string, { subject: string; title: string; message: string }> = {
      confirmed: {
        subject: "Your order has been confirmed! 🎉",
        title: "Order Confirmed",
        message: "Great news! Your order has been confirmed. I'll be working on creating something special just for you.",
      },
      in_progress: {
        subject: "Your order is being prepared! 🍰",
        title: "Order In Progress",
        message: "Your sweet treats are currently being made with love and care. I'll let you know when they're ready!",
      },
      ready: {
        subject: "Your order is ready for pickup! ✨",
        title: "Ready for Pickup",
        message: "Exciting news! Your order is ready and waiting for you. Please pick it up at your scheduled time.",
      },
      completed: {
        subject: "Thank you for your order! 💛",
        title: "Order Complete",
        message: "Thank you so much for choosing Something Sweet by Erica! I hope your treats bring joy to your celebration. I'd love to hear how everything turned out!",
      },
      cancelled: {
        subject: "Your order has been cancelled",
        title: "Order Cancelled",
        message: "Your order has been cancelled. If this was a mistake, or if you'd like to place a new order or discuss other options, just reply to this email — I'm happy to help!",
      },
    };
    
    const statusInfo = statusMessages[status];
    if (statusInfo) {
      const formattedDate = order.pickup_date ? new Date(order.pickup_date as string).toLocaleDateString("en-US", { 
        weekday: "long", year: "numeric", month: "long", day: "numeric" 
      }) : "TBD";
      
      try {
        await (c.env.EMAILS as unknown as { send: (params: { to: string; subject: string; html_body: string; text_body: string; reply_to?: string }) => Promise<void> }).send({
          to: order.customer_email as string,
          subject: statusInfo.subject,
          reply_to: ADMIN_EMAIL,
          html_body: emailTemplate(`
            ${emailHeader(statusInfo.title)}
            ${emailBody(`
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Hi ${(order.customer_name as string).split(" ")[0]},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                ${statusInfo.message}
              </p>
              
              <div style="background-color: #fafaf9; padding: 20px; margin-bottom: 24px; border-left: 3px solid #C9920E;">
                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Order Details:</strong></p>
                <p style="margin: 8px 0 4px 0; font-size: 14px; color: #3f3f46; text-transform: capitalize;">• ${order.product_type}</p>
                <p style="margin: 4px 0; font-size: 14px; color: #3f3f46;">• ${order.flavor || "Custom flavor"}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #3f3f46;">• ${order.is_delivery ? "Delivery" : "Pickup"}: ${formattedDate}${order.pickup_time ? ` at ${order.pickup_time}` : ""}</p>
              </div>
              
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #3f3f46;">
                Questions? Just reply to this email!
              </p>
              <p style="margin: 24px 0 0 0; font-size: 14px; color: #3f3f46;">
                With love,<br>
                <strong style="color: #0C0C0C;">Erica</strong><br>
                <span style="color: #C9920E; font-style: italic;">Something Sweet by Erica</span>
              </p>
            `)}
            ${emailFooter("Something Sweet by Erica · Charlotte, NC · Made with love 💛")}
          `),
          text_body: `Hi ${(order.customer_name as string).split(" ")[0]},\n\n${statusInfo.message}\n\nOrder: ${order.product_type}\nDate: ${formattedDate}\n\nWith love,\nErica`,
        });
      } catch (e) {
        console.error("Failed to send status update email:", e);
      }
    }
  }
  
  return c.json({ success: true });
});

// Update order details
app.put("/api/orders/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE orders SET
      customer_name = ?, customer_email = ?, customer_phone = ?,
      product_type = ?, flavor = ?, size = ?, quantity = ?, occasion = ?,
      pickup_date = ?, pickup_time = ?, is_delivery = ?, delivery_address = ?,
      special_requests = ?, total_amount = ?, deposit_amount = ?, notes = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
    body.customer_name,
    body.customer_email,
    body.customer_phone,
    body.product_type,
    body.flavor,
    body.size,
    body.quantity,
    body.occasion,
    body.pickup_date,
    body.pickup_time,
    body.is_delivery ? 1 : 0,
    body.delivery_address,
    body.special_requests,
    body.total_amount,
    body.deposit_amount,
    body.notes,
    now,
    id
  ).run();
  
  return c.json({ success: true });
});

// Delete order
app.delete("/api/orders/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// ============ INVOICES ============

// Generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${year}${month}-${random}`;
}

// Get all invoices
app.get("/api/invoices", async (c) => {
  const status = c.req.query("status");
  let query = "SELECT * FROM invoices ORDER BY created_at DESC";
  const params: string[] = [];
  
  if (status && status !== "all") {
    query = "SELECT * FROM invoices WHERE status = ? ORDER BY created_at DESC";
    params.push(status);
  }
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

// Get single invoice with items
app.get("/api/invoices/:id", async (c) => {
  const id = c.req.param("id");
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ?").bind(id).first();
  
  if (!invoice) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  
  const { results: items } = await c.env.DB.prepare(
    "SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id"
  ).bind(id).all();
  
  return c.json({ ...invoice, items });
});

// Get invoice by invoice number (for customer view)
app.get("/api/invoices/number/:invoiceNumber", async (c) => {
  const invoiceNumber = c.req.param("invoiceNumber");
  const invoice = await c.env.DB.prepare(
    "SELECT * FROM invoices WHERE invoice_number = ?"
  ).bind(invoiceNumber).first();
  
  if (!invoice) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  
  const { results: items } = await c.env.DB.prepare(
    "SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id"
  ).bind(invoice.id).all();
  
  return c.json({ ...invoice, items });
});

// Create invoice with items
app.post("/api/invoices", async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  const invoiceNumber = generateInvoiceNumber();
  
  // Create invoice
  const result = await c.env.DB.prepare(`
    INSERT INTO invoices (
      order_id, invoice_number, customer_name, customer_email,
      subtotal, tax, total, status, due_date, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.order_id || null,
    invoiceNumber,
    body.customer_name,
    body.customer_email,
    body.subtotal || 0,
    body.tax_amount || 0,
    body.total_amount || 0,
    body.status || "draft",
    body.due_date,
    body.notes,
    now,
    now
  ).run();
  
  const invoiceId = result.meta.last_row_id;
  
  // Create invoice items
  if (body.items && body.items.length > 0) {
    for (const item of body.items) {
      await c.env.DB.prepare(`
        INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, amount, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        invoiceId,
        item.description,
        item.quantity,
        item.unit_price,
        item.amount,
        now,
        now
      ).run();
    }
  }
  
  // If status is "sent", send the invoice email and update order status
  const status = body.status || "draft";
  if (status === "sent") {
    // Update linked order status to "confirmed" and total if there's an order_id
    if (body.order_id) {
      await c.env.DB.prepare("UPDATE orders SET status = ?, total_amount = ?, updated_at = ? WHERE id = ?")
        .bind("confirmed", body.total_amount || 0, now, body.order_id)
        .run();
    }
    
    if (body.customer_email) {
    const customerName = (body.customer_name || "").split(" ")[0] || "there";
    const totalAmount = (body.total_amount || 0).toFixed(2);
    const dueDate = body.due_date ? new Date(body.due_date).toLocaleDateString("en-US", { 
      month: "long", day: "numeric", year: "numeric" 
    }) : "Upon receipt";
    
    // Send invoice to customer
    try {
      await (c.env.EMAILS as unknown as { send: (params: { to: string; subject: string; html_body: string; text_body: string; reply_to?: string }) => Promise<void> }).send({
        to: body.customer_email,
        subject: `Invoice ${invoiceNumber} from Something Sweet by Erica`,
        reply_to: ADMIN_EMAIL,
        html_body: emailTemplate(`
          ${emailHeader("Your Invoice is Ready")}
          ${emailBody(`
            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
              Hi ${customerName},
            </p>
            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
              Here's your invoice for your recent order. Please review the details below.
            </p>
            
            <div style="background-color: #fafaf9; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Invoice Number</p>
              <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #0C0C0C;">${invoiceNumber}</p>
              
              <div>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
                <p style="margin: 0; font-size: 28px; font-weight: 600; color: #C9920E;">$${totalAmount}</p>
              </div>
              
              <p style="margin: 16px 0 0 0; font-size: 14px; color: #3f3f46;">
                <strong>Due Date:</strong> ${dueDate}
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://somethingsweet.shop/invoice/${invoiceNumber}" style="display: inline-block; background: linear-gradient(135deg, #C9920E 0%, #F5C842 50%, #C9920E 100%); color: #0C0C0C; padding: 16px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 4px;">
                View & Pay Invoice Online
              </a>
            </div>
            
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #3f3f46; text-align: center;">
              Pay securely with credit card, debit card, or Cash App
            </p>
            <p style="margin: 24px 0 0 0; font-size: 14px; color: #3f3f46;">
              Thank you for your business!<br><br>
              <strong style="color: #0C0C0C;">Erica</strong><br>
              <span style="color: #C9920E; font-style: italic;">Something Sweet by Erica</span>
            </p>
          `)}
          ${emailFooter("Something Sweet by Erica · Charlotte, NC")}
        `),
        text_body: `Hi ${customerName},\n\nHere's your invoice for your recent order.\n\nInvoice: ${invoiceNumber}\nAmount Due: $${totalAmount}\nDue Date: ${dueDate}\n\nView & Pay Online: https://somethingsweet.shop/invoice/${invoiceNumber}\n\nPay securely with credit card, debit card, or Cash App.\n\nThank you!\nErica`,
      });
    } catch (e) {
      console.error("Failed to send invoice email:", e);
    }
    
    // Also notify admin
    try {
      await sendToAdmin(c.env, {
        subject: `Invoice ${invoiceNumber} sent to ${body.customer_name}`,
        html_body: emailTemplate(`
          ${emailHeader("Invoice Sent")}
          ${emailBody(`
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
              Invoice <strong>${invoiceNumber}</strong> has been sent to ${body.customer_name} (${body.customer_email}).
            </p>
            <div style="background-color: #fafaf9; padding: 20px; border-left: 3px solid #C9920E;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Amount:</strong> <span style="color: #3f3f46;">$${totalAmount}</span></p>
              <p style="margin: 0; font-size: 14px;"><strong style="color: #0C0C0C;">Due Date:</strong> <span style="color: #3f3f46;">${dueDate}</span></p>
            </div>
          `)}
          ${emailFooter("Something Sweet by Erica")}
        `),
        text_body: `Invoice ${invoiceNumber} sent to ${body.customer_name} (${body.customer_email})\nAmount: $${totalAmount}\nDue: ${dueDate}`,
      });
    } catch (e) {
      console.error("Failed to send admin notification:", e);
    }
    }
  }
  
  return c.json({ id: invoiceId, invoice_number: invoiceNumber, success: true });
});

// Update invoice status
app.patch("/api/invoices/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json();
  const now = new Date().toISOString();
  
  // Get invoice details first
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ?").bind(id).first() as Record<string, unknown> | null;
  
  await c.env.DB.prepare("UPDATE invoices SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, now, id)
    .run();
  
  // Update linked order status and total when invoice is sent
  if (status === "sent" && invoice && invoice.order_id) {
    await c.env.DB.prepare("UPDATE orders SET status = ?, total_amount = ?, updated_at = ? WHERE id = ?")
      .bind("confirmed", invoice.total || 0, now, invoice.order_id)
      .run();
  }
  
  // Send email notifications based on status change
  if (invoice && invoice.customer_email) {
    const invoiceNumber = invoice.invoice_number as string;
    const customerName = (invoice.customer_name as string).split(" ")[0];
    const totalAmount = (invoice.total as number).toFixed(2);
    const dueDate = invoice.due_date ? new Date(invoice.due_date as string).toLocaleDateString("en-US", { 
      month: "long", day: "numeric", year: "numeric" 
    }) : "Upon receipt";
    
    if (status === "sent") {
      // Send invoice to customer
      try {
        await (c.env.EMAILS as unknown as { send: (params: { to: string; subject: string; html_body: string; text_body: string; reply_to?: string }) => Promise<void> }).send({
          to: invoice.customer_email as string,
          subject: `Invoice ${invoiceNumber} from Something Sweet by Erica`,
          reply_to: ADMIN_EMAIL,
          html_body: emailTemplate(`
            ${emailHeader("Your Invoice is Ready")}
            ${emailBody(`
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Hi ${customerName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Here's your invoice for your recent order. Please review the details below.
              </p>
              
              <div style="background-color: #fafaf9; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Invoice Number</p>
                <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #0C0C0C;">${invoiceNumber}</p>
                
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
                    <p style="margin: 0; font-size: 28px; font-weight: 600; color: #C9920E;">$${totalAmount}</p>
                  </div>
                </div>
                
                <p style="margin: 16px 0 0 0; font-size: 14px; color: #3f3f46;">
                  <strong>Due Date:</strong> ${dueDate}
                </p>
              </div>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #3f3f46;">
                Please reply to this email with any questions, or to arrange payment.
              </p>
              <p style="margin: 24px 0 0 0; font-size: 14px; color: #3f3f46;">
                Thank you for your business!<br><br>
                <strong style="color: #0C0C0C;">Erica</strong><br>
                <span style="color: #C9920E; font-style: italic;">Something Sweet by Erica</span>
              </p>
            `)}
            ${emailFooter("Something Sweet by Erica · Charlotte, NC")}
          `),
          text_body: `Hi ${customerName},\n\nHere's your invoice for your recent order.\n\nInvoice: ${invoiceNumber}\nAmount Due: $${totalAmount}\nDue Date: ${dueDate}\n\nView & Pay Online: https://somethingsweet.shop/invoice/${invoiceNumber}\n\nPay securely with credit card, debit card, or Cash App.\n\nThank you!\nErica`,
        });
      } catch (e) {
        console.error("Failed to send invoice email:", e);
      }
      
      // Also notify admin
      try {
        await sendToAdmin(c.env, {
          subject: `Invoice ${invoiceNumber} sent to ${invoice.customer_name}`,
          html_body: emailTemplate(`
            ${emailHeader("Invoice Sent")}
            ${emailBody(`
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Invoice <strong>${invoiceNumber}</strong> has been sent to ${invoice.customer_name} (${invoice.customer_email}).
              </p>
              <div style="background-color: #fafaf9; padding: 20px; border-left: 3px solid #C9920E;">
                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Amount:</strong> <span style="color: #3f3f46;">$${totalAmount}</span></p>
                <p style="margin: 0; font-size: 14px;"><strong style="color: #0C0C0C;">Due Date:</strong> <span style="color: #3f3f46;">${dueDate}</span></p>
              </div>
            `)}
            ${emailFooter("Something Sweet by Erica")}
          `),
          text_body: `Invoice ${invoiceNumber} sent to ${invoice.customer_name} (${invoice.customer_email})\nAmount: $${totalAmount}\nDue: ${dueDate}`,
        });
      } catch (e) {
        console.error("Failed to send admin notification:", e);
      }
    } else if (status === "paid") {
      // Send payment confirmation to customer
      try {
        await (c.env.EMAILS as unknown as { send: (params: { to: string; subject: string; html_body: string; text_body: string; reply_to?: string }) => Promise<void> }).send({
          to: invoice.customer_email as string,
          subject: "Payment received - Thank you! 💛",
          reply_to: ADMIN_EMAIL,
          html_body: emailTemplate(`
            ${emailHeader("Payment Received")}
            ${emailBody(`
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Hi ${customerName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Thank you! Your payment of <strong style="color: #C9920E;">$${totalAmount}</strong> for invoice ${invoiceNumber} has been received.
              </p>
              
              <div style="background-color: #f0fdf4; padding: 20px; margin-bottom: 24px; border-left: 3px solid #22c55e;">
                <p style="margin: 0; font-size: 16px; color: #166534; font-weight: 600;">✓ Payment Complete</p>
              </div>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #3f3f46;">
                I'm excited to create something sweet for you! You'll receive updates as your order progresses.
              </p>
              <p style="margin: 24px 0 0 0; font-size: 14px; color: #3f3f46;">
                With gratitude,<br><br>
                <strong style="color: #0C0C0C;">Erica</strong><br>
                <span style="color: #C9920E; font-style: italic;">Something Sweet by Erica</span>
              </p>
            `)}
            ${emailFooter("Something Sweet by Erica · Charlotte, NC · Made with love 💛")}
          `),
          text_body: `Hi ${customerName},\n\nThank you! Your payment of $${totalAmount} for invoice ${invoiceNumber} has been received.\n\nI'm excited to create something sweet for you!\n\nWith gratitude,\nErica`,
        });
      } catch (e) {
        console.error("Failed to send payment confirmation:", e);
      }
      
      // Notify admin of payment
      try {
        await sendToAdmin(c.env, {
          subject: `💰 Payment received: $${totalAmount} from ${invoice.customer_name}`,
          html_body: emailTemplate(`
            ${emailHeader("Payment Received!")}
            ${emailBody(`
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Great news! You've received a payment.
              </p>
              <div style="background-color: #f0fdf4; padding: 24px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Amount Received</p>
                <p style="margin: 0; font-size: 32px; font-weight: 600; color: #166534;">$${totalAmount}</p>
              </div>
              <div style="background-color: #fafaf9; padding: 20px; border-left: 3px solid #C9920E;">
                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Customer:</strong> <span style="color: #3f3f46;">${invoice.customer_name}</span></p>
                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Email:</strong> <span style="color: #3f3f46;">${invoice.customer_email}</span></p>
                <p style="margin: 0; font-size: 14px;"><strong style="color: #0C0C0C;">Invoice:</strong> <span style="color: #3f3f46;">${invoiceNumber}</span></p>
              </div>
            `)}
            ${emailFooter("Something Sweet by Erica")}
          `),
          text_body: `Payment received!\n\nAmount: $${totalAmount}\nCustomer: ${invoice.customer_name}\nEmail: ${invoice.customer_email}\nInvoice: ${invoiceNumber}`,
        });
      } catch (e) {
        console.error("Failed to send admin payment notification:", e);
      }
    }
  }
  
  return c.json({ success: true });
});

// Resend invoice email
app.post("/api/invoices/:id/resend", async (c) => {
  const id = c.req.param("id");
  
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ?").bind(id).first() as Record<string, unknown> | null;
  
  if (!invoice || !invoice.customer_email) {
    return c.json({ success: false, error: "Invoice not found" }, 404);
  }
  
  const invoiceNumber = invoice.invoice_number as string;
  const customerName = (invoice.customer_name as string).split(" ")[0];
  const totalAmount = (invoice.total as number).toFixed(2);
  const dueDate = invoice.due_date ? new Date(invoice.due_date as string).toLocaleDateString("en-US", { 
    month: "long", day: "numeric", year: "numeric" 
  }) : "Upon receipt";
  
  try {
    await (c.env.EMAILS as unknown as { send: (params: { to: string; subject: string; html_body: string; text_body: string; reply_to?: string }) => Promise<void> }).send({
      to: invoice.customer_email as string,
      subject: `Reminder: Invoice ${invoiceNumber} from Something Sweet by Erica`,
      reply_to: ADMIN_EMAIL,
      html_body: emailTemplate(`
        ${emailHeader("Invoice Reminder")}
        ${emailBody(`
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            Hi ${customerName},
          </p>
          <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            This is a friendly reminder about your invoice. Please review the details below.
          </p>
          
          <div style="background-color: #fafaf9; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Invoice Number</p>
            <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #0C0C0C;">${invoiceNumber}</p>
            
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
              <p style="margin: 0; font-size: 28px; font-weight: 600; color: #C9920E;">$${totalAmount}</p>
            </div>
            
            <p style="margin: 16px 0 0 0; font-size: 14px; color: #3f3f46;">
              <strong>Due Date:</strong> ${dueDate}
            </p>
          </div>
          
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #3f3f46;">
            Please reply to this email with any questions, or to arrange payment.
          </p>
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #3f3f46;">
            Thank you for your business!<br><br>
            <strong style="color: #0C0C0C;">Erica</strong><br>
            <span style="color: #C9920E; font-style: italic;">Something Sweet by Erica</span>
          </p>
        `)}
        ${emailFooter("Something Sweet by Erica · Charlotte, NC")}
      `),
      text_body: `Hi ${customerName},\n\nThis is a friendly reminder about your invoice.\n\nInvoice: ${invoiceNumber}\nAmount Due: $${totalAmount}\nDue Date: ${dueDate}\n\nPlease reply to this email with any questions.\n\nThank you!\nErica`,
    });
    
    return c.json({ success: true });
  } catch (e) {
    console.error("Failed to resend invoice email:", e);
    return c.json({ success: false, error: "Failed to send email" }, 500);
  }
});

// Delete invoice
app.delete("/api/invoices/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM invoices WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// ============ SETTINGS ============

// Get settings
app.get("/api/settings", async (c) => {
  const settings = await c.env.DB.prepare("SELECT * FROM settings WHERE id = 1").first();
  return c.json(settings || {});
});

// Update settings
app.put("/api/settings", async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE settings SET
      business_name = ?, tagline = ?, owner_name = ?,
      email = ?, phone = ?, address = ?, city = ?, state = ?, zip = ?,
      instagram_url = ?, facebook_url = ?, tiktok_url = ?, pinterest_url = ?,
      hours_monday = ?, hours_tuesday = ?, hours_wednesday = ?,
      hours_thursday = ?, hours_friday = ?, hours_saturday = ?, hours_sunday = ?,
      min_order_notice_days = ?, is_accepting_orders = ?, order_message = ?,
      tax_rate = ?, updated_at = ?
    WHERE id = 1
  `).bind(
    body.business_name,
    body.tagline,
    body.owner_name,
    body.email,
    body.phone,
    body.address,
    body.city,
    body.state,
    body.zip,
    body.instagram_url,
    body.facebook_url,
    body.tiktok_url,
    body.pinterest_url,
    body.hours_monday,
    body.hours_tuesday,
    body.hours_wednesday,
    body.hours_thursday,
    body.hours_friday,
    body.hours_saturday,
    body.hours_sunday,
    body.min_order_notice_days,
    body.is_accepting_orders ? 1 : 0,
    body.order_message,
    body.tax_rate,
    now
  ).run();
  
  return c.json({ success: true });
});

// ============ PAGE CONTENT ============

// Get all page content
app.get("/api/page-content", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT content_key, content_value FROM page_content").all();
  return c.json(results || []);
});

// Update page content (batch upsert)
app.put("/api/page-content", async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  
  // Upsert each content item
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string" && value.trim()) {
      await c.env.DB.prepare(`
        INSERT INTO page_content (content_key, content_value, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(content_key) DO UPDATE SET
          content_value = excluded.content_value,
          updated_at = excluded.updated_at
      `).bind(key, value, now, now).run();
    } else {
      // Delete if empty
      await c.env.DB.prepare("DELETE FROM page_content WHERE content_key = ?").bind(key).run();
    }
  }
  
  return c.json({ success: true });
});

// ============ EMAIL SUBSCRIBERS ============

// Get all subscribers (admin)
app.get("/api/subscribers", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM subscribers ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

// Subscribe to email list (public)
app.post("/api/subscribers", async (c) => {
  const body = await c.req.json();
  const email = body.email?.trim()?.toLowerCase();
  
  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }
  
  const now = new Date().toISOString();
  
  // Check if already subscribed
  const existing = await c.env.DB.prepare(
    "SELECT * FROM subscribers WHERE email = ?"
  ).bind(email).first();
  
  if (existing) {
    // Reactivate if previously unsubscribed
    if (!existing.is_active) {
      await c.env.DB.prepare(
        "UPDATE subscribers SET is_active = 1, updated_at = ? WHERE email = ?"
      ).bind(now, email).run();
    }
    return c.json({ success: true, message: "You're already subscribed!" });
  }
  
  // Add new subscriber
  await c.env.DB.prepare(
    "INSERT INTO subscribers (email, name, is_active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)"
  ).bind(email, body.name || null, now, now).run();

  // Welcome the new subscriber
  try {
    const greeting = body.name ? body.name.split(" ")[0] : "there";
    await (c.env.EMAILS as unknown as { send: (params: { to: string; subject: string; html_body: string; text_body: string; reply_to?: string }) => Promise<void> }).send({
      to: email,
      subject: "Welcome to Something Sweet by Erica! 💛",
      reply_to: ADMIN_EMAIL,
      html_body: emailTemplate(`
        ${emailHeader("Welcome, Sweet Friend!")}
        ${emailBody(`
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            Hi ${greeting},
          </p>
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            Thank you for joining the Something Sweet by Erica family! You'll be the first to know about seasonal specials, new treats, and exclusive offers.
          </p>
          <div style="background-color: #fafaf9; padding: 20px; margin-bottom: 24px; border-left: 3px solid #C9920E;">
            <p style="margin: 0; font-size: 14px; color: #3f3f46;">
              Craving something sweet? Browse the menu and place an order anytime at
              <a href="https://somethingsweet.shop" style="color: #C9920E;">somethingsweet.shop</a>.
            </p>
          </div>
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #3f3f46;">
            With love,<br>
            <strong style="color: #0C0C0C;">Erica</strong><br>
            <span style="color: #C9920E; font-style: italic;">Something Sweet by Erica</span>
          </p>
        `)}
        ${emailFooter("You're receiving this because you signed up for updates from Something Sweet by Erica.")}
      `),
      text_body: `Hi ${greeting},\n\nThank you for joining the Something Sweet by Erica family! You'll be the first to know about seasonal specials, new treats, and exclusive offers.\n\nPlace an order anytime at somethingsweet.shop\n\nWith love,\nErica`,
    });
  } catch (e) {
    console.error("Failed to send subscriber welcome:", e);
  }

  // Notify admin
  try {
    await sendToAdmin(c.env, {
      subject: "🎉 New Email Subscriber!",
      html_body: emailTemplate(`
        ${emailHeader("New Subscriber")}
        ${emailBody(`
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
            Someone just joined your email list!
          </p>
          <div style="background-color: #fafaf9; padding: 20px; border-left: 3px solid #C9920E; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #3f3f46;">
              <strong>Email:</strong> ${email}
            </p>
          </div>
          <p style="margin: 0; font-size: 14px; color: #71717a;">
            View all subscribers in your admin dashboard.
          </p>
        `)}
        ${emailFooter("Something Sweet by Erica")}
      `),
      text_body: `New email subscriber: ${email}`
    });
  } catch (e) {
    console.error("Failed to send admin notification:", e);
  }
  
  return c.json({ success: true, message: "Thanks for subscribing!" });
});

// Delete subscriber (admin)
app.delete("/api/subscribers/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM subscribers WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Send bulk email campaign to all active subscribers
app.post("/api/email-campaign", async (c) => {
  try {
    const body = await c.req.json();
    const { subject, message, imageUrl } = body;

    if (!subject || !message) {
      return c.json({ error: "Subject and message are required" }, 400);
    }

    // Get all active subscribers
    const { results: subscribers } = await c.env.DB.prepare(
      "SELECT email FROM subscribers WHERE is_active = 1"
    ).all();

    if (!subscribers || subscribers.length === 0) {
      return c.json({ error: "No active subscribers to send to" }, 400);
    }

    // Build image HTML if provided
    const imageHtml = imageUrl ? `
      <div style="margin-bottom: 24px;">
        <img src="${imageUrl}" alt="Something Sweet by Erica" style="width: 100%; max-width: 500px; height: auto; border-radius: 8px; display: block;" />
      </div>
    ` : '';

    // Build email HTML
    const html = emailTemplate(`
      ${emailHeader("Something Sweet by Erica")}
      ${emailBody(`
        ${imageHtml}
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #3f3f46; line-height: 1.6;">
          ${message.replace(/\n/g, '<br>')}
        </p>
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
          <p style="margin: 0; font-size: 13px; color: #71717a;">
            Ready to order? Visit us at <a href="https://somethingsweet.shop" style="color: #C9920E;">somethingsweet.shop</a>
          </p>
        </div>
      `)}
      ${emailFooter("You're receiving this because you signed up for updates from Something Sweet by Erica.")}
    `);

    const text = `${message}\n\nReady to order? Visit us at somethingsweet.shop\n\nYou're receiving this because you signed up for updates from Something Sweet by Erica.`;

    // Send to each subscriber
    let sent = 0;
    let failed = 0;
    
    for (const sub of subscribers) {
      try {
        await (c.env.EMAILS as any).send({
          to: (sub as any).email,
          subject: subject,
          html_body: html,
          text_body: text,
        });
        sent++;
      } catch (e) {
        console.error(`Failed to send to ${(sub as any).email}:`, e);
        failed++;
      }
    }

    // Notify admin
    await sendToAdmin(c.env, {
      subject: `Email Campaign Sent: ${subject}`,
      html_body: emailTemplate(`
        ${emailHeader("Campaign Sent")}
        ${emailBody(`
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #3f3f46;">
            Your email campaign has been sent!
          </p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #71717a;">Subject</p>
            <p style="margin: 0; font-size: 15px; color: #18181b; font-weight: 500;">${subject}</p>
          </div>
          <p style="margin: 0; font-size: 14px; color: #3f3f46;">
            ✅ Successfully sent: ${sent}<br>
            ${failed > 0 ? `❌ Failed: ${failed}` : ''}
          </p>
        `)}
        ${emailFooter("Something Sweet by Erica - Admin Notification")}
      `),
      text_body: `Campaign "${subject}" sent to ${sent} subscribers. ${failed > 0 ? `${failed} failed.` : ''}`,
    });

    return c.json({ success: true, sent, failed });
  } catch (e) {
    console.error("Email campaign error:", e);
    return c.json({ error: "Failed to send campaign" }, 500);
  }
});

// ============ GALLERY IMAGES (R2) ============

// Get all gallery images
app.get("/api/gallery", async (c) => {
  const category = c.req.query("category");
  let query = "SELECT * FROM gallery_images ORDER BY created_at DESC";
  const params: string[] = [];
  
  if (category && category !== "all") {
    query = "SELECT * FROM gallery_images WHERE category = ? ORDER BY created_at DESC";
    params.push(category);
  }
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  
  // Transform r2_key to image_url for frontend consumption
  const imagesWithUrls = results.map((img: Record<string, unknown>) => ({
    ...img,
    image_url: img.r2_key ? `/api/files/${img.r2_key}` : null,
  }));
  
  return c.json(imagesWithUrls);
});

// Serve image from R2
app.get("/api/gallery/image/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const object = await c.env.R2_BUCKET.get(`gallery/${key}`);
  
  if (!object) {
    return c.json({ error: "Image not found" }, 404);
  }
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000");
  
  return c.body(object.body, { headers });
});

// Upload gallery image
app.post("/api/gallery", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const isFeatured = formData.get("is_featured") === "true";
  
  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const r2Key = `gallery/${timestamp}-${safeName}`;
  
  // Upload to R2
  await c.env.R2_BUCKET.put(r2Key, file, {
    httpMetadata: {
      contentType: file.type,
    },
  });
  
  const now = new Date().toISOString();
  
  // Save to database
  const result = await c.env.DB.prepare(`
    INSERT INTO gallery_images (
      title, category, description, r2_key, filename, content_type, size, is_featured, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    title || file.name,
    category || "cakes",
    description || null,
    r2Key,
    file.name,
    file.type,
    file.size,
    isFeatured ? 1 : 0,
    now,
    now
  ).run();
  
  return c.json({ id: result.meta.last_row_id, r2_key: r2Key, success: true });
});

// Update gallery image metadata
app.patch("/api/gallery/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE gallery_images SET
      title = ?, category = ?, description = ?, is_featured = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    body.title,
    body.category,
    body.description,
    body.is_featured ? 1 : 0,
    now,
    id
  ).run();
  
  return c.json({ success: true });
});

// Delete gallery image
app.delete("/api/gallery/:id", async (c) => {
  const id = c.req.param("id");
  
  // Get the R2 key first
  const image = await c.env.DB.prepare("SELECT r2_key FROM gallery_images WHERE id = ?").bind(id).first();
  
  if (image && image.r2_key) {
    // Delete from R2
    await c.env.R2_BUCKET.delete(image.r2_key as string);
  }
  
  // Delete from database
  await c.env.DB.prepare("DELETE FROM gallery_images WHERE id = ?").bind(id).run();
  
  return c.json({ success: true });
});

// ============ HIDDEN GALLERY ITEMS ============

// Get all hidden gallery item IDs
app.get("/api/gallery/hidden", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT item_id FROM hidden_gallery_items").all();
  return c.json(results?.map((r: Record<string, unknown>) => r.item_id) || []);
});

// Hide a placeholder gallery item
app.post("/api/gallery/hidden/:itemId", async (c) => {
  const itemId = c.req.param("itemId");
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO hidden_gallery_items (item_id, created_at, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT (item_id) DO NOTHING
  `).bind(itemId, now, now).run();
  
  return c.json({ success: true });
});

// Unhide a placeholder gallery item
app.delete("/api/gallery/hidden/:itemId", async (c) => {
  const itemId = c.req.param("itemId");
  await c.env.DB.prepare("DELETE FROM hidden_gallery_items WHERE item_id = ?").bind(itemId).run();
  return c.json({ success: true });
});

// ============ SITE IMAGES API ============

// Get site images (optionally by location)
app.get("/api/site-images", async (c) => {
  const location = c.req.query("location");
  
  if (location) {
    const image = await c.env.DB.prepare(
      "SELECT * FROM site_images WHERE location = ?"
    ).bind(location).first();
    return c.json(image || null);
  }
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM site_images ORDER BY location"
  ).all();
  return c.json(results);
});

// Serve site image from R2
app.get("/api/site-images/image/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const object = await c.env.R2_BUCKET.get(`site/${key}`);
  
  if (!object) {
    return c.json({ error: "Image not found" }, 404);
  }
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000");
  
  return c.body(object.body, { headers });
});

// Upload/replace site image for a location
app.post("/api/site-images", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  const location = formData.get("location") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  
  if (!file || !location) {
    return c.json({ error: "File and location are required" }, 400);
  }
  
  // Check if there's an existing image for this location
  const existing = await c.env.DB.prepare(
    "SELECT r2_key FROM site_images WHERE location = ?"
  ).bind(location).first();
  
  // Delete old image from R2 if exists
  if (existing && existing.r2_key) {
    await c.env.R2_BUCKET.delete(existing.r2_key as string);
    await c.env.DB.prepare("DELETE FROM site_images WHERE location = ?").bind(location).run();
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const r2Key = `site/${location}-${timestamp}-${safeName}`;
  
  // Upload to R2
  await c.env.R2_BUCKET.put(r2Key, file, {
    httpMetadata: {
      contentType: file.type,
    },
  });
  
  const now = new Date().toISOString();
  
  // Save to database
  const result = await c.env.DB.prepare(`
    INSERT INTO site_images (
      location, title, description, r2_key, filename, content_type, size, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    location,
    title || null,
    description || null,
    r2Key,
    file.name,
    file.type,
    file.size,
    now,
    now
  ).run();
  
  return c.json({ id: result.meta.last_row_id, r2_key: r2Key, success: true });
});

// Update site image metadata
app.patch("/api/site-images/:location", async (c) => {
  const location = c.req.param("location");
  const body = await c.req.json();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE site_images SET title = ?, description = ?, updated_at = ? WHERE location = ?
  `).bind(body.title, body.description, now, location).run();
  
  return c.json({ success: true });
});

// Delete site image
app.delete("/api/site-images/:location", async (c) => {
  const location = c.req.param("location");
  
  const image = await c.env.DB.prepare(
    "SELECT r2_key FROM site_images WHERE location = ?"
  ).bind(location).first();
  
  if (image && image.r2_key) {
    await c.env.R2_BUCKET.delete(image.r2_key as string);
  }
  
  await c.env.DB.prepare("DELETE FROM site_images WHERE location = ?").bind(location).run();
  
  return c.json({ success: true });
});

// Create Stripe checkout session for invoice payment
app.post("/api/invoices/:id/checkout", async (c) => {
  const id = c.req.param("id");
  
  // Get invoice details
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ?").bind(id).first() as Record<string, unknown> | null;
  
  if (!invoice) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  
  if (invoice.status === "paid") {
    return c.json({ error: "Invoice is already paid" }, 400);
  }
  
  // Get invoice items
  const itemsResult = await c.env.DB.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").bind(id).all();
  const items = itemsResult.results || [];
  
  const stripe = new Stripe((c.env as unknown as Record<string, string>).STRIPE_SECRET_KEY);
  
  // Create line items from invoice items
  const lineItems = items.map((item: Record<string, unknown>) => ({
    price_data: {
      currency: "usd",
      product_data: { 
        name: item.description as string,
      },
      unit_amount: Math.round((item.unit_price as number) * 100), // Convert to cents
    },
    quantity: item.quantity as number,
  }));
  
  // Add tax as a separate line item if present
  if (invoice.tax && (invoice.tax as number) > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Tax" },
        unit_amount: Math.round((invoice.tax as number) * 100),
      },
      quantity: 1,
    });
  }
  
  // Determine base URL
  const url = new URL(c.req.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${baseUrl}/invoice/${invoice.invoice_number}?payment=success`,
    cancel_url: `${baseUrl}/invoice/${invoice.invoice_number}?payment=cancelled`,
    customer_email: invoice.customer_email as string,
    metadata: {
      invoice_id: id,
      invoice_number: invoice.invoice_number as string,
    },
  });
  
  // Store the payment intent ID
  await c.env.DB.prepare("UPDATE invoices SET stripe_payment_intent_id = ?, updated_at = ? WHERE id = ?")
    .bind(session.payment_intent || session.id, new Date().toISOString(), id)
    .run();
  
  return c.json({ url: session.url });
});

// Stripe webhook handler
app.post("/api/webhooks/stripe", async (c) => {
  const body = await c.req.text();
  const sig = c.req.header("stripe-signature") || "";
  
  const stripe = new Stripe((c.env as unknown as Record<string, string>).STRIPE_SECRET_KEY);
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      (c.env as unknown as Record<string, string>).STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return c.json({ error: "Invalid signature" }, 400);
  }
  
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoice_id;
    const invoiceNumber = session.metadata?.invoice_number;
    
    if (invoiceId) {
      const now = new Date().toISOString();
      
      // Get invoice details for email
      const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ?").bind(invoiceId).first() as Record<string, unknown> | null;
      
      // Update invoice status to paid
      await c.env.DB.prepare("UPDATE invoices SET status = ?, updated_at = ? WHERE id = ?")
        .bind("paid", now, invoiceId)
        .run();
      
      // Send payment confirmation emails
      if (invoice && invoice.customer_email) {
        const customerName = (invoice.customer_name as string).split(" ")[0];
        const totalAmount = (invoice.total as number).toFixed(2);
        
        // Send payment confirmation to customer
        try {
          await (c.env.EMAILS as unknown as { send: (params: { to: string; subject: string; html_body: string; text_body: string; reply_to?: string }) => Promise<void> }).send({
            to: invoice.customer_email as string,
            subject: "Payment received - Thank you! 💛",
            reply_to: ADMIN_EMAIL,
            html_body: emailTemplate(`
              ${emailHeader("Payment Received")}
              ${emailBody(`
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                  Hi ${customerName},
                </p>
                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                  Thank you! Your payment of <strong style="color: #C9920E;">$${totalAmount}</strong> for invoice ${invoiceNumber} has been received.
                </p>
                
                <div style="background-color: #f0fdf4; padding: 20px; margin-bottom: 24px; border-left: 3px solid #22c55e;">
                  <p style="margin: 0; font-size: 16px; color: #166534; font-weight: 600;">✓ Payment Complete</p>
                </div>
                
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #3f3f46;">
                  I'm excited to create something sweet for you! You'll receive updates as your order progresses.
                </p>
                <p style="margin: 24px 0 0 0; font-size: 14px; color: #3f3f46;">
                  With gratitude,<br><br>
                  <strong style="color: #0C0C0C;">Erica</strong><br>
                  <span style="color: #C9920E; font-style: italic;">Something Sweet by Erica</span>
                </p>
              `)}
              ${emailFooter("Something Sweet by Erica · Charlotte, NC · Made with love 💛")}
            `),
            text_body: `Hi ${customerName},\n\nThank you! Your payment of $${totalAmount} for invoice ${invoiceNumber} has been received.\n\nI'm excited to create something sweet for you!\n\nWith gratitude,\nErica`,
          });
        } catch (e) {
          console.error("Failed to send payment confirmation:", e);
        }
        
        // Notify admin of payment
        try {
          await sendToAdmin(c.env, {
            subject: `💰 Payment received: $${totalAmount} from ${invoice.customer_name}`,
            html_body: emailTemplate(`
              ${emailHeader("Payment Received!")}
              ${emailBody(`
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                  Great news! You've received a payment via Stripe.
                </p>
                <div style="background-color: #f0fdf4; padding: 24px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Amount Received</p>
                  <p style="margin: 0; font-size: 32px; font-weight: 600; color: #166534;">$${totalAmount}</p>
                </div>
                <div style="background-color: #fafaf9; padding: 20px; border-left: 3px solid #C9920E;">
                  <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Customer:</strong> <span style="color: #3f3f46;">${invoice.customer_name}</span></p>
                  <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #0C0C0C;">Email:</strong> <span style="color: #3f3f46;">${invoice.customer_email}</span></p>
                  <p style="margin: 0; font-size: 14px;"><strong style="color: #0C0C0C;">Invoice:</strong> <span style="color: #3f3f46;">${invoiceNumber}</span></p>
                </div>
              `)}
              ${emailFooter("Something Sweet by Erica")}
            `),
            text_body: `Payment received via Stripe!\n\nAmount: $${totalAmount}\nCustomer: ${invoice.customer_name}\nEmail: ${invoice.customer_email}\nInvoice: ${invoiceNumber}`,
          });
        } catch (e) {
          console.error("Failed to send admin payment notification:", e);
        }
      }
    }
  }
  
  return c.json({ received: true });
});

export default app;
