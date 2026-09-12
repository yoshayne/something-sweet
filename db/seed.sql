-- Something Sweet by Erica — Postgres seed data
-- AUTO-GENERATED from d1_dump.sql by scripts/convert-dump.mjs. Do not edit by hand;
-- re-run `node scripts/convert-dump.mjs` to regenerate.
--
-- Load order: db/schema.sql first, then this file.

BEGIN;

INSERT INTO "orders" ("id","customer_name","customer_email","customer_phone","product_type","flavor","size","quantity","occasion","pickup_date","pickup_time","is_delivery","delivery_address","special_requests","status","total_amount","deposit_amount","notes","created_at","updated_at","inspiration_links","inspiration_images") VALUES(3,'Odell Mccants','odmccants@icloud','8034290755','cake','Red Velvet with Cream Cheese','8inch',1,'Just Because','2026-03-17','TBD',0,NULL,'Red velvet with nuts','cancelled',0,0,NULL,'2026-03-15T19:26:49.647Z','2026-03-26T18:37:32.456Z','[]','[]');
INSERT INTO "settings" ("id","business_name","tagline","owner_name","email","phone","address","city","state","zip","instagram_url","facebook_url","tiktok_url","hours_monday","hours_tuesday","hours_wednesday","hours_thursday","hours_friday","hours_saturday","hours_sunday","min_order_notice_days","is_accepting_orders","order_message","tax_rate","created_at","updated_at","pinterest_url") VALUES(1,'Something Sweet by Erica','Handcrafted with Love','Erica','somethingsweetbyerica@gmail.com','8037183346','','Winnsboro ','SC','29180','https://www.instagram.com/somethingsweetbyerica','https://www.facebook.com/share/17A3uMTF43/?mibextid=wwXIfr','www.tiktok.com/@somethingsweetbyerica','','9:00 AM - 5:00 PM','9:00 AM - 5:00 PM','9:00 AM - 5:00 PM','9:00 AM - 5:00 PM','10:00 AM - 3:00 PM','Closed',5,1,NULL,6,'2026-03-10 21:13:29','2026-03-17T22:19:31.963Z',NULL);
INSERT INTO "page_content" ("id","content_key","content_value","created_at","updated_at") VALUES(1,'home_announcement','Now taking orders for Easter!','2026-03-14T01:01:36.246Z','2026-03-31T13:01:47.978Z');
INSERT INTO "page_content" ("id","content_key","content_value","created_at","updated_at") VALUES(6,'home_special_title','Easter Cookie Sale','2026-03-15T23:47:11.110Z','2026-03-31T13:01:47.978Z');
INSERT INTO "page_content" ("id","content_key","content_value","created_at","updated_at") VALUES(7,'home_special_description','🌸🐰 SOMETHING SWEET BY ERICA – COOKIE PRESALE 🐰🌸

Spring is in the air and so are these soft, thick, loaded cookies 😍🍪
Perfect for Easter weekend or just treating yourself!

✨ Flavors Available:
• Strawberry Crunch
• Banana Pudding
• Chocolate Chip 
• Butter Pecan','2026-03-15T23:47:11.110Z','2026-03-31T13:01:47.978Z');
INSERT INTO "subscribers" ("id","email","name","is_active","created_at","updated_at") VALUES(1,'amaurigibbes26@icloud.com',NULL,1,'2026-03-17T02:04:08.114Z','2026-03-17T02:04:08.114Z');

-- Reset sequences so new inserts continue past the seeded ids.
SELECT setval('orders_id_seq', GREATEST((SELECT COALESCE(MAX(id),0) FROM orders), 1), (SELECT COUNT(*) FROM orders) > 0);
SELECT setval('invoices_id_seq', GREATEST((SELECT COALESCE(MAX(id),0) FROM invoices), 1), (SELECT COUNT(*) FROM invoices) > 0);
SELECT setval('invoice_items_id_seq', GREATEST((SELECT COALESCE(MAX(id),0) FROM invoice_items), 1), (SELECT COUNT(*) FROM invoice_items) > 0);
SELECT setval('settings_id_seq', GREATEST((SELECT COALESCE(MAX(id),0) FROM settings), 1), (SELECT COUNT(*) FROM settings) > 0);
SELECT setval('page_content_id_seq', GREATEST((SELECT COALESCE(MAX(id),0) FROM page_content), 1), (SELECT COUNT(*) FROM page_content) > 0);
SELECT setval('subscribers_id_seq', GREATEST((SELECT COALESCE(MAX(id),0) FROM subscribers), 1), (SELECT COUNT(*) FROM subscribers) > 0);

COMMIT;
