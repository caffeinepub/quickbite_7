import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Order {
    id: OrderId;
    status: OrderStatus;
    userId: Principal;
    createdAt: Time;
    restaurantId: RestaurantId;
    totalAmount: number;
    items: Array<OrderItem>;
}
export interface MenuItem {
    id: MenuItemId;
    name: string;
    isAvailable: boolean;
    description: string;
    restaurantId: RestaurantId;
    category: string;
    price: number;
}
export type Time = bigint;
export type MenuItemId = bigint;
export interface OrderItem {
    name: string;
    quantity: bigint;
    price: number;
    menuItemId: MenuItemId;
}
export type RestaurantId = bigint;
export interface Restaurant {
    id: RestaurantId;
    name: string;
    cuisineType: CuisineType;
    description: string;
    isActive: boolean;
    deliveryTimeMinutes: bigint;
    rating: number;
}
export interface UserProfile {
    name: string;
}
export type OrderId = bigint;
export enum CuisineType {
    japanese = "japanese",
    chinese = "chinese",
    italian = "italian",
    indian = "indian",
    american = "american"
}
export enum OrderStatus {
    preparing = "preparing",
    cancelled = "cancelled",
    pending = "pending",
    onTheWay = "onTheWay",
    delivered = "delivered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMenuItem(menuItem: MenuItem): Promise<void>;
    addRestaurant(restaurant: Restaurant): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllActiveRestaurants(): Promise<Array<Restaurant>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMenuItemsByRestaurant(restaurantId: RestaurantId): Promise<Array<MenuItem>>;
    getOrder(orderId: OrderId): Promise<Order>;
    getUserOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(restaurantId: RestaurantId, items: Array<OrderItem>): Promise<OrderId>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedData(): Promise<void>;
    updateMenuItemAvailability(id: MenuItemId, isAvailable: boolean): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateRestaurant(id: RestaurantId, restaurant: Restaurant): Promise<void>;
}
