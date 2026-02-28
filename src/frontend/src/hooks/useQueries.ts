import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  MenuItem,
  MenuItemId,
  Order,
  OrderId,
  OrderItem,
  OrderStatus,
  Restaurant,
  RestaurantId,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Restaurants ──────────────────────────────────────────────────────────────

export function useRestaurants() {
  const { actor, isFetching } = useActor();
  return useQuery<Restaurant[]>({
    queryKey: ["restaurants"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveRestaurants();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Menu Items ───────────────────────────────────────────────────────────────

export function useMenuItems(restaurantId: RestaurantId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems", restaurantId?.toString()],
    queryFn: async () => {
      if (!actor || restaurantId === null) return [];
      return actor.getMenuItemsByRestaurant(restaurantId);
    },
    enabled: !!actor && !isFetching && restaurantId !== null,
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────

export function useUserOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["userOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrder(orderId: OrderId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Order>({
    queryKey: ["order", orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) throw new Error("No actor or order ID");
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
  });
}

// ── User Profile ─────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      items,
    }: {
      restaurantId: RestaurantId;
      items: Array<OrderItem>;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.placeOrder(restaurantId, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.seedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: OrderId;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
    },
  });
}

export function useUpdateMenuItemAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isAvailable,
      restaurantId,
    }: {
      id: MenuItemId;
      isAvailable: boolean;
      restaurantId: RestaurantId;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.updateMenuItemAvailability(id, isAvailable);
      return restaurantId;
    },
    onSuccess: (restaurantId) => {
      queryClient.invalidateQueries({
        queryKey: ["menuItems", restaurantId?.toString()],
      });
    },
  });
}

export function useAddRestaurant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurant: Restaurant) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addRestaurant(restaurant);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItem: MenuItem) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addMenuItem(menuItem);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["menuItems", variables.restaurantId?.toString()],
      });
    },
  });
}

export function useUpdateRestaurant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      restaurant,
    }: {
      id: RestaurantId;
      restaurant: Restaurant;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateRestaurant(id, restaurant);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
