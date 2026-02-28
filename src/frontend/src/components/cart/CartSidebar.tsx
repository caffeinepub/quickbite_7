import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertCircle,
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useCart } from "../../contexts/CartContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { usePlaceOrder } from "../../hooks/useQueries";

export function CartSidebar() {
  const {
    items,
    restaurantId,
    restaurantName,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    isOpen,
    closeCart,
    toOrderItems,
  } = useCart();

  const { identity, login } = useInternetIdentity();
  const placeOrder = usePlaceOrder();
  const isLoggedIn = !!identity;

  async function handlePlaceOrder() {
    if (!isLoggedIn) {
      login();
      return;
    }
    if (!restaurantId || items.length === 0) return;

    try {
      const orderId = await placeOrder.mutateAsync({
        restaurantId,
        items: toOrderItems(),
      });
      clearCart();
      closeCart();
      toast.success(`Order #${orderId} placed successfully! 🎉`, {
        description: "Your food is being prepared.",
      });
    } catch (err) {
      toast.error("Failed to place order", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md bg-card border-l border-border"
      >
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Your Cart
            {restaurantName && (
              <span className="ml-auto text-sm font-body font-400 text-muted-foreground">
                {restaurantName}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-4xl">
              🛒
            </div>
            <div>
              <p className="font-display text-lg font-600">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground font-body">
                Add items from a restaurant to get started
              </p>
            </div>
            <Button variant="secondary" onClick={closeCart}>
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <AnimatePresence initial={false}>
                {items.map((ci) => (
                  <motion.div
                    key={ci.menuItem.id.toString()}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-600 text-sm leading-snug truncate">
                          {ci.menuItem.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground font-body">
                          ${ci.menuItem.price.toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              updateQuantity(ci.menuItem.id, ci.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center text-sm font-600 font-body tabular-nums">
                            {ci.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              updateQuantity(ci.menuItem.id, ci.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <span className="w-14 text-right text-sm font-700 font-body text-primary">
                          ${(ci.menuItem.price * ci.quantity).toFixed(2)}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(ci.menuItem.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Separator className="mb-4 opacity-50" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>

            {/* Order summary */}
            <div className="border-t border-border bg-background/50 px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-body text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-body font-600">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-muted-foreground">
                  Delivery fee
                </span>
                <span className="font-body font-600 text-primary">Free</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-700">Total</span>
                <span className="font-display text-xl font-800 text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>

              {!isLoggedIn && (
                <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground border border-border">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="font-body">Sign in to place your order</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    clearCart();
                    closeCart();
                  }}
                >
                  Clear cart
                </Button>
                <Button
                  size="sm"
                  className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-body font-600 shadow-glow-sm"
                  onClick={handlePlaceOrder}
                  disabled={placeOrder.isPending}
                >
                  {placeOrder.isPending ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Placing…
                    </span>
                  ) : isLoggedIn ? (
                    <span className="flex items-center gap-1.5">
                      Place Order
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    "Sign In to Order"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
