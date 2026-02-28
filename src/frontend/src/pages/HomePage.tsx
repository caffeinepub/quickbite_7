import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, Star, UtensilsCrossed, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Restaurant } from "../backend.d";
import { RestaurantCard } from "../components/restaurant/RestaurantCard";
import { useActor } from "../hooks/useActor";
import { useRestaurants, useSeedData } from "../hooks/useQueries";

const CUISINE_FILTERS = [
  { key: "all", label: "All", emoji: "🍽️" },
  { key: "american", label: "American", emoji: "🍔" },
  { key: "italian", label: "Italian", emoji: "🍝" },
  { key: "indian", label: "Indian", emoji: "🍛" },
  { key: "chinese", label: "Chinese", emoji: "🥢" },
  { key: "japanese", label: "Japanese", emoji: "🍣" },
];

const SEED_DONE_KEY = "quickbite_seeded";

interface HomePageProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export function HomePage({ onSelectRestaurant }: HomePageProps) {
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const { actor, isFetching: actorFetching } = useActor();
  const { data: restaurants, isLoading } = useRestaurants();
  const seedData = useSeedData();

  // Seed once on first load
  const seedMutate = seedData.mutate;
  useEffect(() => {
    if (!actor || actorFetching) return;
    const seeded = localStorage.getItem(SEED_DONE_KEY);
    if (!seeded) {
      seedMutate(undefined, {
        onSuccess: () => {
          localStorage.setItem(SEED_DONE_KEY, "1");
        },
      });
    }
  }, [actor, actorFetching, seedMutate]);

  const filtered = (restaurants ?? []).filter((r) => {
    const cuisineKey =
      typeof r.cuisineType === "string"
        ? r.cuisineType
        : Object.keys(r.cuisineType)[0];

    const matchesCuisine =
      cuisineFilter === "all" || cuisineKey === cuisineFilter;
    const matchesSearch =
      search === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      cuisineKey.toLowerCase().includes(search.toLowerCase());

    return matchesCuisine && matchesSearch;
  });

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-food-spread.dim_1400x600.jpg"
            alt="Delicious food spread"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-body font-500 text-primary">
              <Zap className="h-3.5 w-3.5 fill-primary" />
              Fast delivery, fresh food
            </div>
            <h1 className="font-display text-4xl font-800 leading-tight md:text-5xl lg:text-6xl text-balance">
              Order food{" "}
              <span className="text-primary relative">
                you love
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5.5C40 1.5 80 1.5 100 3.5C120 5.5 160 7 199 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="text-primary/60"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground font-body leading-relaxed">
              Discover the best restaurants near you and get delicious meals
              delivered to your door.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span>Top-rated restaurants</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                <Zap className="h-4 w-4 text-primary" />
                <span>30-45 min delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                <UtensilsCrossed className="h-4 w-4 text-accent" />
                <span>5 cuisine types</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or cuisines…"
              className="pl-10 font-body bg-card border-border focus:border-primary/60 focus:ring-primary/20"
            />
          </div>

          {/* Cuisine filters */}
          <div className="flex flex-wrap gap-2">
            {CUISINE_FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={cuisineFilter === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setCuisineFilter(f.key)}
                className={`font-body font-500 gap-1.5 transition-all duration-200 ${
                  cuisineFilter === f.key
                    ? "bg-primary text-primary-foreground shadow-glow-sm border-transparent"
                    : "border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <span>{f.emoji}</span>
                {f.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Restaurant grid */}
        <div className="mt-8">
          {isLoading || seedData.isPending ? (
            <div>
              <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading restaurants…
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((sk) => (
                  <div
                    key={sk}
                    className="rounded-2xl overflow-hidden border border-border"
                  >
                    <Skeleton className="h-32 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <div className="text-5xl">🔍</div>
              <div>
                <p className="font-display text-xl font-600">
                  No restaurants found
                </p>
                <p className="mt-1 text-muted-foreground font-body">
                  Try adjusting your search or filters
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setCuisineFilter("all");
                }}
              >
                Clear filters
              </Button>
            </motion.div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground font-body">
                {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""}{" "}
                available
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((restaurant, i) => (
                  <RestaurantCard
                    key={restaurant.id.toString()}
                    restaurant={restaurant}
                    onClick={() => onSelectRestaurant(restaurant)}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
