import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Loader2, Package } from "lucide-react";
import { motion } from "motion/react";
import type { OrderStatus } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserOrders } from "../hooks/useQueries";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  onTheWay: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_EMOJI: Record<string, string> = {
  pending: "⏳",
  preparing: "👨‍🍳",
  onTheWay: "🚴",
  delivered: "✅",
  cancelled: "❌",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "status-pending",
  preparing: "status-preparing",
  onTheWay: "status-on-way",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
};

function getStatusKey(status: OrderStatus): string {
  if (typeof status === "string") return status;
  return Object.keys(status)[0] ?? "pending";
}

function formatDate(time: bigint): string {
  // Motoko Time is nanoseconds since epoch
  const ms = Number(time / BigInt(1_000_000));
  if (ms === 0) return "Just now";
  try {
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown date";
  }
}

interface OrdersPageProps {
  onNavigateHome: () => void;
}

export function OrdersPage({ onNavigateHome }: OrdersPageProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: orders, isLoading } = useUserOrders();
  const isLoggedIn = !!identity;

  if (!isLoggedIn) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-4 max-w-sm px-4"
        >
          <div className="text-6xl">🔒</div>
          <div>
            <p className="font-display text-2xl font-700">
              Sign in to view orders
            </p>
            <p className="mt-2 text-muted-foreground font-body">
              You need to be signed in to view your order history.
            </p>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-600 shadow-glow-sm"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHome}
              className="mb-4 -ml-1 font-body font-500 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to restaurants
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-800">My Orders</h1>
                <p className="text-sm text-muted-foreground font-body">
                  Track your order history
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {["o1", "o2", "o3", "o4"].map((sk) => (
              <Skeleton key={sk} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="text-5xl">📦</div>
            <div>
              <p className="font-display text-xl font-600">No orders yet</p>
              <p className="mt-1 text-muted-foreground font-body">
                Place your first order to see it here
              </p>
            </div>
            <Button
              variant="default"
              onClick={onNavigateHome}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm"
            >
              Browse Restaurants
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm text-muted-foreground font-body">
              {orders.length} order{orders.length !== 1 ? "s" : ""} total
            </p>
            {orders
              .slice()
              .sort((a, b) => {
                // Sort by createdAt descending
                const aTime = Number(a.createdAt);
                const bTime = Number(b.createdAt);
                return bTime - aTime;
              })
              .map((order, i) => {
                const statusKey = getStatusKey(order.status);
                const statusClass = STATUS_CLASS[statusKey] ?? "status-pending";
                const statusLabel = STATUS_LABELS[statusKey] ?? statusKey;
                const statusEmoji = STATUS_EMOJI[statusKey] ?? "⏳";

                return (
                  <motion.div
                    key={order.id.toString()}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    className="rounded-xl border border-border bg-card p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-body font-600 text-sm text-muted-foreground">
                            Order #{order.id.toString()}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-body font-600 ${statusClass}`}
                          >
                            <span>{statusEmoji}</span>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                          <Clock className="h-3 w-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-xl font-800 text-primary">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <Separator className="opacity-50" />

                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${item.menuItemId.toString()}-${idx}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-body text-muted-foreground">
                            <span className="font-600 text-foreground">
                              {item.name}
                            </span>
                            <span className="ml-1 text-muted-foreground">
                              × {item.quantity.toString()}
                            </span>
                          </span>
                          <span className="font-body font-600">
                            ${(item.price * Number(item.quantity)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </section>
    </main>
  );
}
