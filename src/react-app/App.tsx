import { BrowserRouter as Router, Routes, Route } from "react-router";
import ScrollToTop from "@/react-app/components/ScrollToTop";
import HomePage from "@/react-app/pages/Home";
import GalleryPage from "@/react-app/pages/Gallery";
import OrderPage from "@/react-app/pages/Order";
import AboutPage from "@/react-app/pages/About";
import SeasonalPage from "@/react-app/pages/Seasonal";
import ContactPage from "@/react-app/pages/Contact";
import AdminDashboard from "@/react-app/pages/admin/Dashboard";
import AdminSchedule from "@/react-app/pages/admin/Schedule";
import AdminOrders from "@/react-app/pages/admin/Orders";
import OrderDetail from "@/react-app/pages/admin/OrderDetail";
import AdminInvoices from "@/react-app/pages/admin/Invoices";
import InvoiceCreate from "@/react-app/pages/admin/InvoiceCreate";
import InvoiceDetail from "@/react-app/pages/admin/InvoiceDetail";
import GalleryManage from "@/react-app/pages/admin/GalleryManage";
import SiteImages from "@/react-app/pages/admin/SiteImages";
import PageContent from "@/react-app/pages/admin/PageContent";
import AdminSettings from "@/react-app/pages/admin/Settings";
import Subscribers from "@/react-app/pages/admin/Subscribers";
import EmailCampaign from "@/react-app/pages/admin/EmailCampaign";
import CustomerInvoice from "@/react-app/pages/CustomerInvoice";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/specials" element={<SeasonalPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Customer Invoice View */}
        <Route path="/invoice/:invoiceNumber" element={<CustomerInvoice />} />
        
        {/* Admin Routes */}
        {/* TODO: SECURE ADMIN — these /admin routes are unauthenticated, matching the
            original Mocha app (per owner's decision). Gate behind auth before go-live. */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/schedule" element={<AdminSchedule />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:id" element={<OrderDetail />} />
        <Route path="/admin/invoices" element={<AdminInvoices />} />
        <Route path="/admin/invoices/new" element={<InvoiceCreate />} />
        <Route path="/admin/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/admin/subscribers" element={<Subscribers />} />
        <Route path="/admin/email-campaign" element={<EmailCampaign />} />
        <Route path="/admin/gallery" element={<GalleryManage />} />
        <Route path="/admin/site-images" element={<SiteImages />} />
        <Route path="/admin/content" element={<PageContent />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </Router>
  );
}
