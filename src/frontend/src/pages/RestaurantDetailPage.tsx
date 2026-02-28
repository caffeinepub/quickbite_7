import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Loader2, Star, UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";
import type { Restaurant } from "../backend.d";
import { MenuItemCard } from "../components/restaurant/MenuItemCard";
import { useMenuItems } from "../hooks/useQueries";

const CUISINE_EMOJI: Record<string, string> = {
  japanese: "🍣",
  chinese: "🥢",
  italian: "🍝",
  indian: "🍛",
  american: "🍔",
};

const CUISINE_LABEL: Record<string, string> = {
  japanese: "Japanese",
  chinese: "Chinese",
  italian: "Italian",
  indian: "Indian",
  american: "American",
};

interface RestaurantDetailPageProps {
  restaurant: Restaurant;
  onBack: () => void;
}

export function RestaurantDetailPage({
  restaurant,
  onBack,
}: RestaurantDetailPageProps) {
  const { data: menuItems, isLoading } = useMenuItems(restaurant.id);

  const cuisineKey =
    typeof restaurant.cuisineType === "string"
      ? restaurant.cuisineType
      : Object.keys(restaurant.cuisineType)[0];

  const emoji = CUISINE_EMOJI[cuisineKey] ?? "🍽️";
  const label = CUISINE_LABEL[cuisineKey] ?? cuisineKey;

  // Group items by category
  const grouped = (menuItems ?? []).reduce<Record<string, typeof menuItems>>(
    (acc, item) => {
      if (!item) return acc;
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat]!.push(item);
      return acc;
    },
    {},
  );

  const categories = Object.keys(grouped).sort();
  const availableCount = (menuItems ?? []).filter((i) => i.isAvailable).length;

  return (
    <main className="flex-1">
      {/* Restaurant header */}
      <section className="relative border-b border-border bg-card/50">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <div className="relative container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-6 -ml-1 font-body font-500 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to restaurants
            </Button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              {/* Cuisine badge */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-border text-4xl shadow-card">
                {emoji}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="font-display text-3xl font-800 leading-tight">
                      {restaurant.name}
                    </h1>
                    <p className="mt-1 text-muted-foreground font-body">
                      {restaurant.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 rounded-xl bg-accent/10 border border-accent/20 px-3 py-2">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-display font-700 text-accent">
                        {restaurant.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl bg-muted border border-border px-3 py-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-body font-500 text-sm">
                        {restaurant.deliveryTimeMinutes.toString()} min
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl bg-muted border border-border px-3 py-2">
                      <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                      <span className="font-body font-500 text-sm">
                        {label}
                      </span>
                    </div>
                  </div>
                </div>

                {!isLoading && menuItems && (
                  <p className="mt-3 text-sm text-muted-foreground font-body">
                    {availableCount} of {menuItems.length} items available
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Menu */}
      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-8">
            {["cat1", "cat2", "cat3"].map((sk) => (
              <div key={sk}>
                <Skeleton className="mb-4 h-6 w-32" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {["m1", "m2", "m3", "m4"].map((mk) => (
                    <Skeleton key={mk} className="h-24 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="text-5xl">🍽️</div>
            <div>
              <p className="font-display text-xl font-600">Menu coming soon</p>
              <p className="mt-1 text-muted-foreground font-body">
                This restaurant hasn't added menu items yet
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {categories.map((category, catIdx) => {
              const items = grouped[category] ?? [];
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: catIdx * 0.08 }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="font-display text-xl font-700">
                      {category}
                    </h2>
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground font-body">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((item, idx) => (
                      <MenuItemCard
                        key={item.id.toString()}
                        item={item}
                        restaurant={restaurant}
                        index={idx}
                      />
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
