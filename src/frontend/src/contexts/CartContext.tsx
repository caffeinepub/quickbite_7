import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { MenuItem, OrderItem, RestaurantId } from "../backend.d";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  restaurantId: RestaurantId | null;
  restaurantName: string;
  addItem: (
    menuItem: MenuItem,
    restaurantId: RestaurantId,
    restaurantName: string,
  ) => void;
  removeItem: (menuItemId: bigint) => void;
  updateQuantity: (menuItemId: bigint, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  toOrderItems: () => Array<OrderItem>;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "quickbite_cart";

function loadCartFromStorage(): {
  items: CartItem[];
  restaurantId: RestaurantId | null;
  restaurantName: string;
} {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [], restaurantId: null, restaurantName: "" };
    const parsed = JSON.parse(raw);
    // Restore BigInt fields
    const items: CartItem[] = (parsed.items || []).map(
      (ci: CartItem & { menuItem: { id: string; restaurantId: string } }) => ({
        ...ci,
        menuItem: {
          ...ci.menuItem,
          id: BigInt(ci.menuItem.id),
          restaurantId: BigInt(ci.menuItem.restaurantId),
        },
      }),
    );
    const restaurantId = parsed.restaurantId
      ? BigInt(parsed.restaurantId)
      : null;
    return { items, restaurantId, restaurantName: parsed.restaurantName || "" };
  } catch {
    return { items: [], restaurantId: null, restaurantName: "" };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<RestaurantId | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once
  useEffect(() => {
    const stored = loadCartFromStorage();
    setItems(stored.items);
    setRestaurantId(stored.restaurantId);
    setRestaurantName(stored.restaurantName);
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items, restaurantId, restaurantName }),
    );
  }, [items, restaurantId, restaurantName, hydrated]);

  const addItem = useCallback(
    (menuItem: MenuItem, rId: RestaurantId, rName: string) => {
      // If cart has items from a different restaurant, clear it
      setItems((prev) => {
        if (restaurantId !== null && restaurantId !== rId) {
          // New restaurant — reset
          setRestaurantId(rId);
          setRestaurantName(rName);
          return [{ menuItem, quantity: 1 }];
        }
        const existing = prev.find((ci) => ci.menuItem.id === menuItem.id);
        if (existing) {
          return prev.map((ci) =>
            ci.menuItem.id === menuItem.id
              ? { ...ci, quantity: ci.quantity + 1 }
              : ci,
          );
        }
        setRestaurantId(rId);
        setRestaurantName(rName);
        return [...prev, { menuItem, quantity: 1 }];
      });
    },
    [restaurantId],
  );

  const removeItem = useCallback((menuItemId: bigint) => {
    setItems((prev) => {
      const next = prev.filter((ci) => ci.menuItem.id !== menuItemId);
      if (next.length === 0) {
        setRestaurantId(null);
        setRestaurantName("");
      }
      return next;
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: bigint, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const next = prev.filter((ci) => ci.menuItem.id !== menuItemId);
        if (next.length === 0) {
          setRestaurantId(null);
          setRestaurantName("");
        }
        return next;
      });
      return;
    }
    setItems((prev) =>
      prev.map((ci) =>
        ci.menuItem.id === menuItemId ? { ...ci, quantity } : ci,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName("");
  }, []);

  const total = items.reduce(
    (sum, ci) => sum + ci.menuItem.price * ci.quantity,
    0,
  );

  const itemCount = items.reduce((sum, ci) => sum + ci.quantity, 0);

  const toOrderItems = useCallback((): Array<OrderItem> => {
    return items.map((ci) => ({
      menuItemId: ci.menuItem.id,
      name: ci.menuItem.name,
      quantity: BigInt(ci.quantity),
      price: ci.menuItem.price,
    }));
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        toOrderItems,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
