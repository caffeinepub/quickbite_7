import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Restaurant } from "./backend.d";
import { CartSidebar } from "./components/cart/CartSidebar";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { CartProvider } from "./contexts/CartContext";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { OrdersPage } from "./pages/OrdersPage";
import { RestaurantDetailPage } from "./pages/RestaurantDetailPage";

type Page = "home" | "restaurant" | "orders" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  function navigateTo(target: "home" | "orders" | "admin") {
    setPage(target);
    setSelectedRestaurant(null);
  }

  function selectRestaurant(restaurant: Restaurant) {
    setSelectedRestaurant(restaurant);
    setPage("restaurant");
  }

  function goBack() {
    setPage("home");
    setSelectedRestaurant(null);
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header onNavigate={navigateTo} currentPage={page} />

        <AnimatePresence mode="wait">
          {page === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-1 flex-col"
            >
              <HomePage onSelectRestaurant={selectRestaurant} />
            </motion.div>
          )}

          {page === "restaurant" && selectedRestaurant && (
            <motion.div
              key={`restaurant-${selectedRestaurant.id.toString()}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col"
            >
              <RestaurantDetailPage
                restaurant={selectedRestaurant}
                onBack={goBack}
              />
            </motion.div>
          )}

          {page === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-1 flex-col"
            >
              <OrdersPage onNavigateHome={() => navigateTo("home")} />
            </motion.div>
          )}

          {page === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-1 flex-col"
            >
              <AdminPage onNavigateHome={() => navigateTo("home")} />
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
        <CartSidebar />
        <Toaster richColors position="top-right" />
      </div>
    </CartProvider>
  );
}
