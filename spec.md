# QuickBite - Food Delivery App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Restaurant listings with name, description, cuisine type, rating, and delivery time
- Menu items per restaurant with name, description, price, and category
- Shopping cart (add/remove items, view cart, update quantities)
- Order placement and order history
- Order status tracking (Pending, Preparing, On the Way, Delivered)
- User identity via Internet Identity (built-in)
- Admin panel for managing restaurants, menus, and order statuses
- Sample seed data for restaurants and menu items

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- `Restaurant` type: id, name, description, cuisineType, rating, deliveryTime, imageUrl, isActive
- `MenuItem` type: id, restaurantId, name, description, price, category, isAvailable
- `Order` type: id, userId, restaurantId, items (list of OrderItem), totalAmount, status, createdAt
- `OrderItem` type: menuItemId, name, price, quantity
- Stable storage maps for restaurants, menuItems, orders
- Functions:
  - `getRestaurants()` - list all active restaurants
  - `getMenuItems(restaurantId)` - list menu items for a restaurant
  - `placeOrder(restaurantId, items)` - create a new order for the caller
  - `getMyOrders()` - get all orders by the caller
  - `getOrder(orderId)` - get a specific order
  - `updateOrderStatus(orderId, status)` - admin: update status
  - `addRestaurant(...)` - admin: add restaurant
  - `addMenuItem(...)` - admin: add menu item
  - Seed function to populate sample data

### Frontend (React + TypeScript)
- Home page: list of restaurants with search/filter by cuisine
- Restaurant page: menu items grouped by category, add to cart
- Cart sidebar/modal: view items, adjust qty, place order
- Orders page: list past orders with status
- Admin page: manage restaurants, menu items, update order statuses
- Responsive layout with mobile-friendly design
