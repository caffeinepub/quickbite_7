import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Edit2,
  Loader2,
  Plus,
  Settings,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  CuisineType,
  MenuItem,
  OrderStatus,
  Restaurant,
} from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddMenuItem,
  useAddRestaurant,
  useIsAdmin,
  useMenuItems,
  useRestaurants,
  useUpdateMenuItemAvailability,
  useUpdateOrderStatus,
  useUpdateRestaurant,
  useUserOrders,
} from "../hooks/useQueries";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "onTheWay", label: "On the Way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_CLASS: Record<string, string> = {
  pending: "status-pending",
  preparing: "status-preparing",
  onTheWay: "status-on-way",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
};

function getCuisineKey(cuisine: CuisineType): string {
  if (typeof cuisine === "string") return cuisine;
  return Object.keys(cuisine)[0] ?? "american";
}

// ── Add Restaurant Dialog ─────────────────────────────────────────────────────
function AddRestaurantDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addRestaurant = useAddRestaurant();
  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisineType: "american",
    deliveryTimeMinutes: "30",
    rating: "4.0",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addRestaurant.mutateAsync({
        id: BigInt(0),
        name: form.name,
        description: form.description,
        cuisineType: form.cuisineType as CuisineType,
        deliveryTimeMinutes: BigInt(Number.parseInt(form.deliveryTimeMinutes)),
        rating: Number.parseFloat(form.rating),
        isActive: true,
      });
      toast.success("Restaurant added!");
      onClose();
      setForm({
        name: "",
        description: "",
        cuisineType: "american",
        deliveryTimeMinutes: "30",
        rating: "4.0",
      });
    } catch (err) {
      toast.error("Failed to add restaurant", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display font-700">
            Add Restaurant
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="font-body font-500">Restaurant Name</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. The Golden Fork"
              className="font-body"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-body font-500">Description</Label>
            <Textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief description of the restaurant"
              className="font-body resize-none"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-body font-500">Cuisine Type</Label>
              <Select
                value={form.cuisineType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, cuisineType: v }))
                }
              >
                <SelectTrigger className="font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-body font-500">Delivery Time (min)</Label>
              <Input
                type="number"
                required
                min={5}
                max={120}
                value={form.deliveryTimeMinutes}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    deliveryTimeMinutes: e.target.value,
                  }))
                }
                className="font-body"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-body font-500">Initial Rating (0-5)</Label>
            <Input
              type="number"
              required
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) =>
                setForm((f) => ({ ...f, rating: e.target.value }))
              }
              className="font-body"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addRestaurant.isPending}
              className="bg-primary text-primary-foreground"
            >
              {addRestaurant.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Restaurant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Menu Item Dialog ──────────────────────────────────────────────────────
function AddMenuItemDialog({
  open,
  onClose,
  restaurantId,
}: {
  open: boolean;
  onClose: () => void;
  restaurantId: bigint | null;
}) {
  const addMenuItem = useAddMenuItem();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    try {
      await addMenuItem.mutateAsync({
        id: BigInt(0),
        restaurantId,
        name: form.name,
        description: form.description,
        category: form.category,
        price: Number.parseFloat(form.price),
        isAvailable: true,
      });
      toast.success("Menu item added!");
      onClose();
      setForm({ name: "", description: "", category: "", price: "" });
    } catch (err) {
      toast.error("Failed to add menu item", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display font-700">
            Add Menu Item
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="font-body font-500">Item Name</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Margherita Pizza"
              className="font-body"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-body font-500">Description</Label>
            <Textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe the dish"
              className="font-body resize-none"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-body font-500">Category</Label>
              <Input
                required
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="e.g. Mains"
                className="font-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-body font-500">Price ($)</Label>
              <Input
                type="number"
                required
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="12.99"
                className="font-body"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMenuItem.isPending}
              className="bg-primary text-primary-foreground"
            >
              {addMenuItem.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Restaurants Tab ───────────────────────────────────────────────────────────
function RestaurantsTab() {
  const { data: restaurants, isLoading } = useRestaurants();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-700 text-lg">Restaurants</h2>
        <Button
          size="sm"
          onClick={() => setShowAdd(true)}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Restaurant
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {["r1", "r2", "r3", "r4"].map((sk) => (
            <Skeleton key={sk} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !restaurants?.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground font-body">
          No restaurants yet. Add one!
        </div>
      ) : (
        <div className="space-y-2">
          {restaurants.map((r) => (
            <div
              key={r.id.toString()}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-body font-600">{r.name}</p>
                <p className="text-xs text-muted-foreground font-body">
                  {getCuisineKey(r.cuisineType)} • ⭐ {r.rating.toFixed(1)} •{" "}
                  {r.deliveryTimeMinutes.toString()} min
                </p>
              </div>
              <Badge
                variant={r.isActive ? "default" : "secondary"}
                className={
                  r.isActive
                    ? "bg-primary/20 text-primary border-primary/30"
                    : ""
                }
              >
                {r.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <AddRestaurantDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

// ── Menu Items Tab ────────────────────────────────────────────────────────────
function MenuItemsTab() {
  const { data: restaurants } = useRestaurants();
  const [selectedRestId, setSelectedRestId] = useState<string>("");
  const [showAdd, setShowAdd] = useState(false);
  const updateAvailability = useUpdateMenuItemAvailability();

  const restaurantId = selectedRestId ? BigInt(selectedRestId) : null;
  const { data: menuItems, isLoading } = useMenuItems(restaurantId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-700 text-lg">Menu Items</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedRestId} onValueChange={setSelectedRestId}>
            <SelectTrigger className="w-48 font-body">
              <SelectValue placeholder="Select restaurant" />
            </SelectTrigger>
            <SelectContent>
              {(restaurants ?? []).map((r) => (
                <SelectItem
                  key={r.id.toString()}
                  value={r.id.toString()}
                  className="font-body"
                >
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {restaurantId && (
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              className="bg-primary text-primary-foreground"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {!selectedRestId ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground font-body">
          Select a restaurant to manage its menu
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {["m1", "m2", "m3", "m4"].map((sk) => (
            <Skeleton key={sk} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !menuItems?.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground font-body">
          No menu items yet. Add one!
        </div>
      ) : (
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.id.toString()}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p
                  className={`font-body font-600 truncate ${!item.isAvailable ? "text-muted-foreground line-through" : ""}`}
                >
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  {item.category} • ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs font-body font-500 ${item.isAvailable ? "text-primary" : "text-muted-foreground"}`}
                >
                  {item.isAvailable ? "Available" : "Unavailable"}
                </span>
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={(checked) =>
                    updateAvailability.mutate(
                      {
                        id: item.id,
                        isAvailable: checked,
                        restaurantId: item.restaurantId,
                      },
                      {
                        onSuccess: () =>
                          toast.success(
                            `${item.name} marked as ${checked ? "available" : "unavailable"}`,
                          ),
                        onError: () =>
                          toast.error("Failed to update availability"),
                      },
                    )
                  }
                  disabled={updateAvailability.isPending}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <AddMenuItemDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        restaurantId={restaurantId}
      />
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const { data: orders, isLoading } = useUserOrders();
  const updateStatus = useUpdateOrderStatus();

  function getStatusKey(status: OrderStatus): string {
    if (typeof status === "string") return status;
    return Object.keys(status)[0] ?? "pending";
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display font-700 text-lg">Orders</h2>

      {isLoading ? (
        <div className="space-y-3">
          {["ord1", "ord2", "ord3", "ord4"].map((sk) => (
            <Skeleton key={sk} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : !orders?.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground font-body">
          No orders yet
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const statusKey = getStatusKey(order.status);
            const statusClass = STATUS_CLASS[statusKey] ?? "status-pending";

            return (
              <div
                key={order.id.toString()}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-body font-600 text-sm">
                    Order #{order.id.toString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {order.items.length} items • ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-body font-600 ${statusClass}`}
                  >
                    {STATUS_OPTIONS.find((s) => s.value === statusKey)?.label ??
                      statusKey}
                  </span>
                  <Select
                    value={statusKey}
                    onValueChange={(v) =>
                      updateStatus.mutate(
                        { orderId: order.id, status: v as OrderStatus },
                        {
                          onSuccess: () =>
                            toast.success("Order status updated"),
                          onError: () => toast.error("Failed to update status"),
                        },
                      )
                    }
                  >
                    <SelectTrigger className="h-8 w-36 text-xs font-body">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem
                          key={s.value}
                          value={s.value}
                          className="text-xs font-body"
                        >
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────
interface AdminPageProps {
  onNavigateHome: () => void;
}

export function AdminPage({ onNavigateHome }: AdminPageProps) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const isLoggedIn = !!identity;

  if (!isLoggedIn) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center space-y-4 max-w-sm px-4">
          <div className="text-6xl">🔐</div>
          <p className="font-display text-2xl font-700">Sign in required</p>
          <p className="text-muted-foreground font-body">
            You need to be signed in to access the admin panel.
          </p>
        </div>
      </main>
    );
  }

  if (checkingAdmin) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center space-y-4 max-w-sm px-4">
          <div className="text-6xl">⛔</div>
          <p className="font-display text-2xl font-700">Access Denied</p>
          <p className="text-muted-foreground font-body">
            You don't have admin permissions.
          </p>
          <Button onClick={onNavigateHome} variant="secondary">
            Go Home
          </Button>
        </div>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 border border-accent/30">
                <Settings className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-800">Admin Panel</h1>
                <p className="text-sm text-muted-foreground font-body">
                  Manage restaurants, menus, and orders
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="restaurants">
          <TabsList className="mb-6 bg-card border border-border">
            <TabsTrigger value="restaurants" className="font-body font-500">
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="menu" className="font-body font-500">
              Menu Items
            </TabsTrigger>
            <TabsTrigger value="orders" className="font-body font-500">
              Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="restaurants">
            <RestaurantsTab />
          </TabsContent>
          <TabsContent value="menu">
            <MenuItemsTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
