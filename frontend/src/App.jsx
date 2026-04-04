import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import CartDrawer from "./shared/components/Cart/CartDrawer";
import ProtectedRoute from "./shared/components/Auth/ProtectedRoute";
import ErrorBoundary from "./shared/components/ErrorBoundary/ErrorBoundary";
import AdminLogin from "./modules/Admin/pages/Login";
import AdminProtectedRoute from "./modules/Admin/components/AdminProtectedRoute";
import AdminLayout from "./modules/Admin/components/Layout/AdminLayout";
import Dashboard from "./modules/Admin/pages/Dashboard";
import Products from "./modules/Admin/pages/Products";
import ProductForm from "./modules/Admin/pages/ProductForm";
import AdminOrders from "./modules/Admin/pages/Orders";
import OrderDetail from "./modules/Admin/pages/OrderDetail";
import ReturnRequests from "./modules/Admin/pages/ReturnRequests";
import ReturnRequestDetail from "./modules/Admin/pages/ReturnRequestDetail";
import Shipments from "./modules/Admin/pages/sales/Shipments";
import RecurringPayments from "./modules/Admin/pages/sales/RecurringPayments";
import GiftCards from "./modules/Admin/pages/sales/GiftCards";
import CurrentShoppingCarts from "./modules/Admin/pages/sales/CurrentShoppingCarts";
import CurrentWishlists from "./modules/Admin/pages/sales/CurrentWishlists";
import Bestsellers from "./modules/Admin/pages/sales/Bestsellers";
import ProductsNeverPurchased from "./modules/Admin/pages/sales/ProductsNeverPurchased";
import ExternalAuthenticationMethods from "./modules/Admin/pages/customers/ExternalAuthenticationMethods";
import Manufacturers from "./modules/Admin/pages/catalog/Manufacturers";
import ProductsTags from "./modules/Admin/pages/catalog/ProductsTags";
import RecycleBin from "./modules/Admin/pages/catalog/RecycleBin";
import Stores from "./modules/Admin/pages/catalog/Stores";
import ProductAttributes from "./modules/Admin/pages/catalog/ProductAttributes";
import SpecificationAttributes from "./modules/Admin/pages/catalog/SpecificationAttributes";
import CheckoutAttributes from "./modules/Admin/pages/catalog/CheckoutAttributes";
import Discounts from "./modules/Admin/pages/promotions/Discounts";
import Affiliates from "./modules/Admin/pages/promotions/Affiliates";
import NewsletterSubscribers from "./modules/Admin/pages/promotions/NewsletterSubscribers";
import Categories from "./modules/Admin/pages/Categories";
import Brands from "./modules/Admin/pages/Brands";
import Customers from "./modules/Admin/pages/Customers";

import Campaigns from "./modules/Admin/pages/promotions/Campaigns";
import Banners from "./modules/Admin/pages/Banners";
import Reviews from "./modules/Admin/pages/Reviews";
import Analytics from "./modules/Admin/pages/Analytics";
import Content from "./modules/Admin/pages/Content";
import Settings from "./modules/Admin/pages/Settings";
import More from "./modules/Admin/pages/More";
import PromoCodes from "./modules/Admin/pages/PromoCodes";
// Orders child pages
import AllOrders from "./modules/Admin/pages/orders/AllOrders";
import OrderTracking from "./modules/Admin/pages/orders/OrderTracking";

import Invoice from "./modules/Admin/pages/orders/Invoice";
// Products child pages
import ManageProducts from "./modules/Admin/pages/products/ManageProducts";
import TaxPricing from "./modules/Admin/pages/products/TaxPricing";
import ProductRatings from "./modules/Admin/pages/products/ProductRatings";
// CMS child pages
import Topics from "./modules/Admin/pages/cms/topics";
import Menus from "./modules/Admin/pages/cms/Menus";
import MessageTemplates from "./modules/Admin/pages/cms/MessageTemplates";
import Plans from "./modules/Admin/pages/configuration/Plans";
import SetUpLevel from "./modules/Admin/pages/configuration/SetUpLevel";
import RegionalSettings from "./modules/Admin/pages/configuration/RegionalSettings";
import Lists from "./modules/Admin/pages/configuration/Lists";
import PaymentMethods from "./modules/Admin/pages/configuration/PaymentMethods";
import EmailAccounts from "./modules/Admin/pages/configuration/EmailAccounts";
import ActivityTypes from "./modules/Admin/pages/configuration/ActivityTypes";
import Import from "./modules/Admin/pages/configuration/Import";
import Export from "./modules/Admin/pages/configuration/Export";
import Themes from "./modules/Admin/pages/configuration/Themes";
import Rules from "./modules/Admin/pages/system/Rules";
import Logs from "./modules/Admin/pages/system/Logs";
import MessageQueue from "./modules/Admin/pages/system/MessageQueue";
import ScheduledTasks from "./modules/Admin/pages/system/ScheduledTasks";
import SEONames from "./modules/Admin/pages/system/SEONames";
import Maintenance from "./modules/Admin/pages/system/Maintenance";
import Warnings from "./modules/Admin/pages/system/Warnings";
import SystemInformation from "./modules/Admin/pages/system/SystemInformation";

// Categories child pages
import ManageCategories from "./modules/Admin/pages/categories/ManageCategories";
import CategoryOrder from "./modules/Admin/pages/categories/CategoryOrder";
// Brands child pages
import ManageBrands from "./modules/Admin/pages/brands/ManageBrands";
// Customers child pages
import ViewCustomers from "./modules/Admin/pages/customers/ViewCustomers";
import CustomerAddresses from "./modules/Admin/pages/customers/Addresses";
import Transactions from "./modules/Admin/pages/customers/Transactions";
import Roles from "./modules/Admin/pages/customers/Roles";
import OnlineCustomers from "./modules/Admin/pages/customers/OnlineCustomers";
import CustomerReports from "./modules/Admin/pages/customers/CustomerReports";
import ActivityLog from "./modules/Admin/pages/customers/ActivityLog";
import CustomerDetailPage from "./modules/Admin/pages/customers/CustomerDetailPage";
// Delivery Management child pages
import DeliveryBoys from "./modules/Admin/pages/delivery/DeliveryBoys";
import CashCollection from "./modules/Admin/pages/delivery/CashCollection";
import AssignDelivery from "./modules/Admin/pages/delivery/AssignDelivery";
// Vendors child pages
import Vendors from "./modules/Admin/pages/Vendors";
import ManageVendors from "./modules/Admin/pages/vendors/ManageVendors";
import PendingApprovals from "./modules/Admin/pages/vendors/PendingApprovals";
import VendorDetail from "./modules/Admin/pages/vendors/VendorDetail";
import CommissionRates from "./modules/Admin/pages/vendors/CommissionRates";
import AdminVendorAnalytics from "./modules/Admin/pages/vendors/VendorAnalytics";

// Offers & Sliders child pages
import HomeSliders from "./modules/Admin/pages/offers/HomeSliders";
import FestivalOffers from "./modules/Admin/pages/offers/FestivalOffers";
// Notifications child pages
import PushNotifications from "./modules/Admin/pages/notifications/PushNotifications";
import CustomMessages from "./modules/Admin/pages/notifications/CustomMessages";
import AllNotifications from "./modules/Admin/pages/notifications/AllNotifications";
// Support Desk child pages
import LiveChat from "./modules/Admin/pages/support/LiveChat";
import TicketTypes from "./modules/Admin/pages/support/TicketTypes";
import Tickets from "./modules/Admin/pages/support/Tickets";
// Reports child pages
import SalesReport from "./modules/Admin/pages/reports/SalesReport";
import InventoryReport from "./modules/Admin/pages/reports/InventoryReport";
// Analytics & Finance child pages
import RevenueOverview from "./modules/Admin/pages/finance/RevenueOverview";
import ProfitLoss from "./modules/Admin/pages/finance/ProfitLoss";
import OrderTrends from "./modules/Admin/pages/finance/OrderTrends";
import PaymentBreakdown from "./modules/Admin/pages/finance/PaymentBreakdown";
import TaxReports from "./modules/Admin/pages/finance/TaxReports";
import RefundReports from "./modules/Admin/pages/finance/RefundReports";
// Consolidated Settings pages
import GeneralSettings from "./modules/Admin/pages/settings/GeneralSettings";
import PaymentShippingSettings from "./modules/Admin/pages/settings/PaymentShippingSettings";
import OrdersCustomersSettings from "./modules/Admin/pages/settings/OrdersCustomersSettings";
import ProductsInventorySettings from "./modules/Admin/pages/settings/ProductsInventorySettings";
import ContentFeaturesSettings from "./modules/Admin/pages/settings/ContentFeaturesSettings";
import NotificationsSEOSettings from "./modules/Admin/pages/settings/NotificationsSEOSettings";
// Policies child pages
import PrivacyPolicy from "./modules/Admin/pages/policies/PrivacyPolicy";
import RefundPolicy from "./modules/Admin/pages/policies/RefundPolicy";
import TermsConditions from "./modules/Admin/pages/policies/TermsConditions";
// Firebase child pages
import PushConfig from "./modules/Admin/pages/firebase/PushConfig";
import Authentication from "./modules/Admin/pages/firebase/Authentication";
import RouteWrapper from "./shared/components/RouteWrapper";
import ScrollToTop from "./shared/components/ScrollToTop";
import AppBootstrap from "./shared/components/AppBootstrap";

// Mobile App Routes
import MobileHome from "./modules/UserApp/pages/Home";
import MobileProductDetail from "./modules/UserApp/pages/ProductDetail";
import MobileSeller from "./modules/UserApp/pages/Seller";
import MobileCategory from "./modules/UserApp/pages/Category";
import MobileBrand from "./modules/UserApp/pages/Brand";
import MobileCategories from "./modules/UserApp/pages/categories";
import MobileCheckout from "./modules/UserApp/pages/Checkout";
import MobileSearch from "./modules/UserApp/pages/Search";
import MobileLogin from "./modules/UserApp/pages/Login";
import MobileRegister from "./modules/UserApp/pages/Register";
import MobileVerification from "./modules/UserApp/pages/Verification";
import MobileForgotPassword from "./modules/UserApp/pages/ForgotPassword";
import MobileResetPassword from "./modules/UserApp/pages/ResetPassword";
import MobileProfile from "./modules/UserApp/pages/Profile";
import UserNotifications from "./modules/UserApp/pages/Notifications";
import MobileOrders from "./modules/UserApp/pages/Orders";
import MobileOrderDetail from "./modules/UserApp/pages/OrderDetail";
import MobileAddresses from "./modules/UserApp/pages/Addresses";
import MobileWishlist from "./modules/UserApp/pages/Wishlist";
import MobileOffers from "./modules/UserApp/pages/Offers";
import MobileDailyDeals from "./modules/UserApp/pages/DailyDeals";
import MobileFlashSale from "./modules/UserApp/pages/FlashSale";
import MobileNewArrivals from "./modules/UserApp/pages/NewArrivals";
import MobileCampaignSale from "./modules/UserApp/pages/CampaignSale";
import MobileTrackOrder from "./modules/UserApp/pages/TrackOrder";
import MobileOrderConfirmation from "./modules/UserApp/pages/OrderConfirmation";
import ComingSoon from "./modules/UserApp/pages/ComingSoon";
// Delivery Routes
import DeliveryLogin from "./modules/Delivery/pages/Login";
import DeliveryRegister from "./modules/Delivery/pages/Register";
import DeliveryForgotPassword from "./modules/Delivery/pages/ForgotPassword";
import DeliveryResetPassword from "./modules/Delivery/pages/ResetPassword";
import DeliveryProtectedRoute from "./modules/Delivery/components/DeliveryProtectedRoute";
import DeliveryLayout from "./modules/Delivery/components/Layout/DeliveryLayout";
import DeliveryDashboard from "./modules/Delivery/pages/Dashboard";
import DeliveryOrders from "./modules/Delivery/pages/Orders";
import DeliveryOrderDetail from "./modules/Delivery/pages/OrderDetail";
import DeliveryProfile from "./modules/Delivery/pages/Profile";
import DeliveryNotifications from "./modules/Delivery/pages/Notifications";
// Vendor Routes
import VendorLogin from "./modules/Vendor/pages/Login";
import VendorRegister from "./modules/Vendor/pages/Register";
import VendorVerification from "./modules/Vendor/pages/Verification";
import VendorForgotPassword from "./modules/Vendor/pages/ForgotPassword";
import VendorResetPassword from "./modules/Vendor/pages/ResetPassword";
import VendorProtectedRoute from "./modules/Vendor/components/VendorProtectedRoute";
import VendorLayout from "./modules/Vendor/components/Layout/VendorLayout";
import VendorDashboard from "./modules/Vendor/pages/Dashboard";
import VendorProducts from "./modules/Vendor/pages/Products";
import VendorManageProducts from "./modules/Vendor/pages/products/ManageProducts";
import VendorAddProduct from "./modules/Vendor/pages/products/AddProduct";
import VendorProductForm from "./modules/Vendor/pages/products/ProductForm";
import VendorOrders from "./modules/Vendor/pages/Orders";
import VendorAllOrders from "./modules/Vendor/pages/orders/AllOrders";
import VendorOrderTracking from "./modules/Vendor/pages/orders/OrderTracking";
import VendorOrderDetail from "./modules/Vendor/pages/orders/OrderDetail";
import VendorAnalytics from "./modules/Vendor/pages/Analytics";
import VendorEarnings from "./modules/Vendor/pages/Earnings";
import VendorSettings from "./modules/Vendor/pages/Settings";
import VendorStockManagement from "./modules/Vendor/pages/StockManagement";
import VendorWalletHistory from "./modules/Vendor/pages/WalletHistory";
import VendorChat from "./modules/Vendor/pages/Chat";
import VendorReturnRequests from "./modules/Vendor/pages/ReturnRequests";
import VendorReturnRequestDetail from "./modules/Vendor/pages/returns/ReturnRequestDetail";
import VendorProductReviews from "./modules/Vendor/pages/ProductReviews";
import VendorShippingManagement from "./modules/Vendor/pages/ShippingManagement";
import VendorCustomers from "./modules/Vendor/pages/Customers";
import VendorCustomerDetail from "./modules/Vendor/pages/CustomerDetail";
import VendorInventoryReports from "./modules/Vendor/pages/InventoryReports";
import VendorPerformanceMetrics from "./modules/Vendor/pages/PerformanceMetrics";
import VendorDocuments from "./modules/Vendor/pages/Documents";
import VendorNotifications from "./modules/Vendor/pages/Notifications";
import VendorSupportTickets from "./modules/Vendor/pages/SupportTickets";
import VendorPickupLocations from "./modules/Vendor/pages/PickupLocations";
import VendorReports from "./modules/Vendor/pages/Reports";
import VendorLanguageSettings from "./modules/Vendor/pages/LanguageSettings";

// Inner component that has access to useLocation
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RouteWrapper>
            <MobileHome />
          </RouteWrapper>
        }
      />
      <Route
        path="/home"
        element={
          <RouteWrapper>
            <MobileHome />
          </RouteWrapper>
        }
      />
      <Route
        path="/product/:id"
        element={
          <RouteWrapper>
            <MobileProductDetail />
          </RouteWrapper>
        }
      />
      <Route
        path="/seller/:id"
        element={
          <RouteWrapper>
            <MobileSeller />
          </RouteWrapper>
        }
      />
      <Route
        path="/category/:id"
        element={
          <RouteWrapper>
            <MobileCategory />
          </RouteWrapper>
        }
      />
      <Route
        path="/brand/:id"
        element={
          <RouteWrapper>
            <MobileBrand />
          </RouteWrapper>
        }
      />
      <Route
        path="/categories"
        element={
          <RouteWrapper>
            <MobileCategories />
          </RouteWrapper>
        }
      />
      <Route
        path="/search"
        element={
          <RouteWrapper>
            <MobileSearch />
          </RouteWrapper>
        }
      />
      <Route
        path="/checkout"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileCheckout />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />

      <Route
        path="/login"
        element={
          <RouteWrapper>
            <MobileLogin />
          </RouteWrapper>
        }
      />
      <Route
        path="/register"
        element={
          <RouteWrapper>
            <MobileRegister />
          </RouteWrapper>
        }
      />
      <Route
        path="/verification"
        element={
          <RouteWrapper>
            <MobileVerification />
          </RouteWrapper>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <RouteWrapper>
            <MobileForgotPassword />
          </RouteWrapper>
        }
      />
      <Route
        path="/reset-password"
        element={
          <RouteWrapper>
            <MobileResetPassword />
          </RouteWrapper>
        }
      />
      <Route
        path="/wishlist"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileWishlist />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/offers"
        element={
          <RouteWrapper>
            <MobileOffers />
          </RouteWrapper>
        }
      />
      <Route
        path="/daily-deals"
        element={
          <RouteWrapper>
            <MobileDailyDeals />
          </RouteWrapper>
        }
      />
      <Route
        path="/flash-sale"
        element={
          <RouteWrapper>
            <MobileFlashSale />
          </RouteWrapper>
        }
      />
      <Route
        path="/new-arrivals"
        element={
          <RouteWrapper>
            <MobileNewArrivals />
          </RouteWrapper>
        }
      />
      <Route
        path="/sale/:slug"
        element={
          <RouteWrapper>
            <MobileCampaignSale />
          </RouteWrapper>
        }
      />
      <Route
        path="/order-confirmation/:orderId"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileOrderConfirmation />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileOrderDetail />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/track-order/:orderId"
        element={
          <RouteWrapper>
            <MobileTrackOrder />
          </RouteWrapper>
        }
      />
      <Route
        path="/profile"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileProfile />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/notifications"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <UserNotifications />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/orders"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileOrders />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/addresses"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileAddresses />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="products/manage-products" element={<ManageProducts />} />
        <Route path="products/tax-pricing" element={<TaxPricing />} />
        <Route path="products/product-ratings" element={<ProductRatings />} />
        <Route path="more" element={<More />} />
        <Route path="categories" element={<Categories />} />
        <Route
          path="categories/manage-categories"
          element={<ManageCategories />}
        />
        <Route path="categories/category-order" element={<CategoryOrder />} />
        <Route path="brands" element={<Brands />} />
        <Route path="brands/manage-brands" element={<ManageBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="orders/:id/invoice" element={<Invoice />} />
        <Route path="orders/all-orders" element={<AllOrders />} />
        <Route path="orders/order-tracking" element={<OrderTracking />} />
        <Route path="catalog/manufacturers" element={<Manufacturers />} />
        <Route path="catalog/product-tags" element={<ProductsTags />} />
        <Route path="catalog/recycle-bin" element={<RecycleBin />} />
        <Route path="catalog/stores" element={<Stores />} />
        <Route path="catalog/product-attributes" element={<ProductAttributes />} />
        <Route path="catalog/specification-attributes" element={<SpecificationAttributes />} />
        <Route path="catalog/checkout-attributes" element={<CheckoutAttributes />} />
        <Route path="sales" element={<Navigate to="sales/shipments" replace />} />
        <Route path="sales/shipments" element={<Shipments />} />
        <Route path="sales/recurring-payments" element={<RecurringPayments />} />
        <Route path="sales/gift-cards" element={<GiftCards />} />
        <Route path="sales/shopping-carts" element={<CurrentShoppingCarts />} />
        <Route path="sales/wishlists" element={<CurrentWishlists />} />
        <Route path="sales/bestsellers" element={<Bestsellers />} />
        <Route path="sales/never-purchased" element={<ProductsNeverPurchased />} />
        <Route path="return-requests" element={<ReturnRequests />} />
        <Route path="return-requests/:id" element={<ReturnRequestDetail />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/view-customers" element={<ViewCustomers />} />
        <Route path="customers/addresses" element={<CustomerAddresses />} />
        <Route path="customers/transactions" element={<Transactions />} />
        <Route path="customers/roles" element={<Roles />} />
        <Route path="customers/online-customers" element={<OnlineCustomers />} />
        <Route path="customers/reports" element={<CustomerReports />} />
        <Route path="customers/activity-log" element={<ActivityLog />} />
        <Route path="customers/external-auth" element={<ExternalAuthenticationMethods />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />

        <Route path="delivery" element={<DeliveryBoys />} />
        <Route path="delivery/delivery-boys" element={<DeliveryBoys />} />
        <Route path="delivery/cash-collection" element={<CashCollection />} />
        <Route path="delivery/assign-delivery" element={<AssignDelivery />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/manage-vendors" element={<ManageVendors />} />
        <Route
          path="vendors/pending-approvals"
          element={<PendingApprovals />}
        />
        <Route path="vendors/commission-rates" element={<CommissionRates />} />
        <Route
          path="vendors/vendor-analytics"
          element={<AdminVendorAnalytics />}
        />
        <Route path="vendors/:id" element={<VendorDetail />} />
        <Route path="promotions" element={<Navigate to="discounts" replace />} />
        <Route path="promotions/discounts" element={<Discounts />} />
        <Route path="promotions/affiliates" element={<Affiliates />} />
        <Route path="promotions/newsletter-subscribers" element={<NewsletterSubscribers />} />
        <Route path="promotions/campaigns" element={<Campaigns />} />

        <Route path="cms" element={<Navigate to="topics" replace />} />
        <Route path="cms/topics" element={<Topics />} />
        <Route path="cms/menus" element={<Menus />} />
        <Route path="cms/message-templates" element={<MessageTemplates />} />
        <Route
          path="configuration"
          element={<Navigate to="/admin/configuration/plans" replace />}
        />
        <Route path="configuration/plans" element={<Plans />} />
        <Route path="configuration/uplevel" element={<SetUpLevel />} />
        <Route path="configuration/regional-settings" element={<RegionalSettings />} />
        <Route path="configuration/lists" element={<Lists />} />
        <Route path="configuration/payment-methods" element={<PaymentMethods />} />
        <Route path="configuration/email-accounts" element={<EmailAccounts />} />
        <Route path="configuration/activity-types" element={<ActivityTypes />} />
        <Route path="configuration/import" element={<Import />} />
        <Route path="configuration/export" element={<Export />} />
        <Route path="configuration/themes" element={<Themes />} />

        <Route path="offers" element={<HomeSliders />} />
        <Route path="offers/home-sliders" element={<HomeSliders />} />
        <Route path="offers/festival-offers" element={<FestivalOffers />} />
        <Route path="promocodes" element={<PromoCodes />} />
        <Route path="notifications" element={<AllNotifications />} />
        <Route
          path="notifications/push-notifications"
          element={<PushNotifications />}
        />
        <Route
          path="notifications/custom-messages"
          element={<CustomMessages />}
        />
        <Route path="support" element={<Tickets />} />
        <Route path="support/live-chat" element={<LiveChat />} />
        <Route path="support/ticket-types" element={<TicketTypes />} />
        <Route path="support/tickets" element={<Tickets />} />
        <Route path="reports" element={<SalesReport />} />
        <Route path="reports/sales-report" element={<SalesReport />} />
        <Route path="reports/inventory-report" element={<InventoryReport />} />
        <Route path="finance" element={<RevenueOverview />} />
        <Route path="finance/revenue-overview" element={<RevenueOverview />} />
        <Route path="finance/profit-loss" element={<ProfitLoss />} />
        <Route path="finance/order-trends" element={<OrderTrends />} />
        <Route
          path="finance/payment-breakdown"
          element={<PaymentBreakdown />}
        />
        <Route path="finance/tax-reports" element={<TaxReports />} />
        <Route path="finance/refund-reports" element={<RefundReports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route
          path="settings"
          element={<Navigate to="/admin/settings/general" replace />}
        />
        <Route path="settings/general" element={<Settings />} />
        <Route path="settings/payment-shipping" element={<Settings />} />
        <Route path="settings/orders-customers" element={<Settings />} />
        <Route path="settings/products-inventory" element={<Settings />} />
        <Route path="settings/content-features" element={<Settings />} />
        <Route path="settings/notifications-seo" element={<Settings />} />
        <Route path="policies" element={<PrivacyPolicy />} />
        <Route path="policies/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="policies/refund-policy" element={<RefundPolicy />} />
        <Route path="policies/terms-conditions" element={<TermsConditions />} />
        <Route path="firebase" element={<PushConfig />} />
        <Route path="firebase/push-config" element={<PushConfig />} />
        <Route path="firebase/authentication" element={<Authentication />} />
        <Route path="system" element={<Navigate to="/admin/system/rules" replace />} />
        <Route path="system/rules" element={<Rules />} />
        <Route path="system/logs" element={<Logs />} />
        <Route path="system/message-queue" element={<MessageQueue />} />
        <Route path="system/scheduled-tasks" element={<ScheduledTasks />} />
        <Route path="system/seo-names" element={<SEONames />} />
        <Route path="system/maintenance" element={<Maintenance />} />
        <Route path="system/warnings" element={<Warnings />} />
        <Route path="system/system-information" element={<SystemInformation />} />
        <Route path="banners" element={<Banners />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="content" element={<Content />} />
      </Route>
      {/* Delivery Routes */}
      <Route path="/delivery/login" element={<DeliveryLogin />} />
      <Route path="/delivery/register" element={<DeliveryRegister />} />
      <Route path="/delivery/forgot-password" element={<DeliveryForgotPassword />} />
      <Route path="/delivery/reset-password" element={<DeliveryResetPassword />} />
      <Route
        path="/delivery"
        element={
          <DeliveryProtectedRoute>
            <DeliveryLayout />
          </DeliveryProtectedRoute>
        }>
        <Route index element={<Navigate to="/delivery/dashboard" replace />} />
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="orders" element={<DeliveryOrders />} />
        <Route path="orders/:id" element={<DeliveryOrderDetail />} />
        <Route path="notifications" element={<DeliveryNotifications />} />
        <Route path="profile" element={<DeliveryProfile />} />
      </Route>
      {/* Vendor Routes */}
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route path="/vendor/verification" element={<VendorVerification />} />
      <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
      <Route path="/vendor/reset-password" element={<VendorResetPassword />} />
      <Route
        path="/vendor"
        element={
          <VendorProtectedRoute>
            <VendorLayout />
          </VendorProtectedRoute>
        }>
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route
          path="products/manage-products"
          element={<VendorManageProducts />}
        />
        <Route path="products/add-product" element={<VendorAddProduct />} />
        <Route path="products/:id" element={<VendorProductForm />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="orders/all-orders" element={<VendorAllOrders />} />
        <Route path="orders/order-tracking" element={<VendorOrderTracking />} />
        <Route path="orders/:id" element={<VendorOrderDetail />} />
        <Route path="analytics" element={<VendorAnalytics />} />
        <Route path="reports" element={<VendorReports />} />
        <Route path="earnings" element={<VendorEarnings />} />
        <Route path="earnings/overview" element={<VendorEarnings />} />
        <Route
          path="earnings/commission-history"
          element={<VendorEarnings />}
        />
        <Route
          path="earnings/settlement-history"
          element={<VendorEarnings />}
        />
        <Route path="stock-management" element={<VendorStockManagement />} />
        <Route path="wallet-history" element={<VendorWalletHistory />} />
        <Route path="chat" element={<VendorChat />} />
        <Route path="notifications" element={<VendorNotifications />} />
        <Route path="return-requests" element={<VendorReturnRequests />} />
        <Route
          path="return-requests/:id"
          element={<VendorReturnRequestDetail />}
        />
        <Route path="product-reviews" element={<VendorProductReviews />} />
        <Route
          path="shipping-management"
          element={<VendorShippingManagement />}
        />
        <Route path="pickup-locations" element={<VendorPickupLocations />} />
        <Route path="customers/:id" element={<VendorCustomerDetail />} />
        <Route path="customers" element={<VendorCustomers />} />
        <Route path="support-tickets" element={<VendorSupportTickets />} />
        <Route path="inventory-reports" element={<VendorInventoryReports />} />
        <Route
          path="performance-metrics"
          element={<VendorPerformanceMetrics />}
        />
        <Route path="documents" element={<VendorDocuments />} />
        <Route path="language-settings" element={<VendorLanguageSettings />} />
        <Route path="settings" element={<VendorSettings />} />
        <Route path="settings/store" element={<VendorSettings />} />
        <Route path="settings/payment" element={<VendorSettings />} />
        <Route path="settings/payment-settings" element={<VendorSettings />} />
        <Route path="settings/shipping" element={<VendorSettings />} />
        <Route path="settings/shipping-settings" element={<VendorSettings />} />
        <Route path="profile" element={<VendorSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes >
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
        <AppBootstrap />
        <ScrollToTop />
        <AppRoutes />
        <CartDrawer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#212121",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#388E3C",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#FF6161",
                secondary: "#fff",
              },
            },
          }}
        />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
