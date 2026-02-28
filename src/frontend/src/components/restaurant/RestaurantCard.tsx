import { ChevronRight, Clock, Star } from "lucide-react";
import { motion } from "motion/react";
import type { CuisineType, Restaurant } from "../../backend.d";

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

const CUISINE_GRADIENT: Record<string, string> = {
  japanese: "from-pink-900/40 to-red-900/20",
  chinese: "from-red-900/40 to-orange-900/20",
  italian: "from-green-900/40 to-emerald-900/20",
  indian: "from-orange-900/40 to-yellow-900/20",
  american: "from-blue-900/40 to-slate-900/20",
};

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  index?: number;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={`star-${i}`}
          className={`h-3 w-3 ${
            i < full
              ? "fill-accent text-accent"
              : i === full && hasHalf
                ? "fill-accent/50 text-accent"
                : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-body font-600 text-accent">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function RestaurantCard({
  restaurant,
  onClick,
  index = 0,
}: RestaurantCardProps) {
  const cuisineKey =
    typeof restaurant.cuisineType === "string"
      ? restaurant.cuisineType
      : Object.keys(restaurant.cuisineType)[0];

  const emoji = CUISINE_EMOJI[cuisineKey] ?? "🍽️";
  const label = CUISINE_LABEL[cuisineKey] ?? cuisineKey;
  const gradient =
    CUISINE_GRADIENT[cuisineKey] ?? "from-slate-900/40 to-slate-800/20";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover">
        {/* Cuisine visual header */}
        <div
          className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden`}
        >
          {/* Decorative blobs */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-accent/10 blur-xl" />

          <span className="relative z-10 text-6xl filter drop-shadow-lg select-none">
            {emoji}
          </span>

          {/* Rating badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1 text-xs font-body font-600 border border-border/50">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {restaurant.rating.toFixed(1)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-700 text-base leading-tight line-clamp-1">
              {restaurant.name}
            </h3>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors duration-200" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-body font-500 text-muted-foreground px-2 py-0.5 rounded-full bg-muted/60 border border-border/50">
              {label}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
              <Clock className="h-3 w-3" />
              <span>{restaurant.deliveryTimeMinutes.toString()} min</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-2">
            {restaurant.description}
          </p>

          <div className="mt-3">
            <StarRating rating={restaurant.rating} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
