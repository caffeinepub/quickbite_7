import { Button } from "@/components/ui/button";
import { CheckCircle, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { MenuItem, Restaurant } from "../../backend.d";
import { useCart } from "../../contexts/CartContext";

interface MenuItemCardProps {
  item: MenuItem;
  restaurant: Restaurant;
  index?: number;
}

export function MenuItemCard({
  item,
  restaurant,
  index = 0,
}: MenuItemCardProps) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.some((ci) => ci.menuItem.id === item.id);

  function handleAdd() {
    addItem(item, restaurant.id, restaurant.name);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`group rounded-xl border border-border bg-card p-4 transition-all duration-200 ${
        !item.isAvailable
          ? "opacity-50"
          : "hover:border-primary/30 hover:bg-card/80"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-body font-600 text-sm leading-snug truncate">
              {item.name}
            </h4>
            {!item.isAvailable && (
              <span className="shrink-0 text-xs font-body font-500 text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                Unavailable
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground font-body leading-relaxed line-clamp-2">
            {item.description}
          </p>
          <p className="mt-2 font-display font-700 text-base text-primary">
            ${item.price.toFixed(2)}
          </p>
        </div>

        {item.isAvailable && (
          <Button
            size="sm"
            onClick={handleAdd}
            className={`shrink-0 transition-all duration-200 ${
              justAdded
                ? "bg-green-600 hover:bg-green-600 text-white"
                : inCart
                  ? "bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-sm"
            }`}
            variant={inCart && !justAdded ? "outline" : "default"}
          >
            {justAdded ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Added!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {inCart ? "Add More" : "Add"}
              </span>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
