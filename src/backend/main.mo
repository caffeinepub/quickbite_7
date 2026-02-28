import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Bool "mo:core/Bool";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type RestaurantId = Nat;
  type MenuItemId = Nat;
  type OrderId = Nat;

  type CuisineType = {
    #italian;
    #indian;
    #chinese;
    #japanese;
    #american;
  };

  type Restaurant = {
    id : RestaurantId;
    name : Text;
    description : Text;
    cuisineType : CuisineType;
    rating : Float;
    deliveryTimeMinutes : Nat;
    isActive : Bool;
  };

  type MenuItem = {
    id : MenuItemId;
    restaurantId : RestaurantId;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    isAvailable : Bool;
  };

  type OrderItem = {
    menuItemId : MenuItemId;
    name : Text;
    price : Float;
    quantity : Nat;
  };

  type OrderStatus = {
    #pending;
    #preparing;
    #onTheWay;
    #delivered;
    #cancelled;
  };

  type Order = {
    id : OrderId;
    userId : Principal;
    restaurantId : RestaurantId;
    items : [OrderItem];
    totalAmount : Float;
    status : OrderStatus;
    createdAt : Time.Time;
  };

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  let restaurants = Map.empty<RestaurantId, Restaurant>();
  let menuItems = Map.empty<MenuItemId, MenuItem>();
  let orders = Map.empty<OrderId, Order>();

  var nextRestaurantId : RestaurantId = 1;
  var nextMenuItemId : MenuItemId = 1;
  var nextOrderId : OrderId = 1;
  var isSeeded : Bool = false;

  // Restaurant functions
  public query ({ caller }) func getAllActiveRestaurants() : async [Restaurant] {
    let activeRestaurants = restaurants.values().toArray().filter(
      func(r : Restaurant) : Bool { r.isActive }
    );
    activeRestaurants.sort<Restaurant>(
      func(r1 : Restaurant, r2 : Restaurant) : Order.Order {
        Nat.compare(r1.id, r2.id);
      }
    );
  };

  public shared ({ caller }) func addRestaurant(restaurant : Restaurant) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add restaurants");
    };
    let newRestaurant : Restaurant = {
      restaurant with
      id = nextRestaurantId;
    };
    restaurants.add(nextRestaurantId, newRestaurant);
    nextRestaurantId += 1;
  };

  public shared ({ caller }) func updateRestaurant(id : RestaurantId, restaurant : Restaurant) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update restaurants");
    };
    if (not restaurants.containsKey(id)) { Runtime.trap("Restaurant not found") };
    let updatedRestaurant : Restaurant = {
      id;
      name = restaurant.name;
      description = restaurant.description;
      cuisineType = restaurant.cuisineType;
      rating = restaurant.rating;
      deliveryTimeMinutes = restaurant.deliveryTimeMinutes;
      isActive = restaurant.isActive;
    };
    restaurants.add(id, updatedRestaurant);
  };

  // Menu item functions
  public query ({ caller }) func getMenuItemsByRestaurant(restaurantId : RestaurantId) : async [MenuItem] {
    menuItems.values().toArray().filter<MenuItem>(
      func(item : MenuItem) : Bool { item.restaurantId == restaurantId and item.isAvailable }
    );
  };

  public shared ({ caller }) func addMenuItem(menuItem : MenuItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add menu items");
    };
    let newMenuItem : MenuItem = {
      menuItem with
      id = nextMenuItemId;
    };
    menuItems.add(nextMenuItemId, newMenuItem);
    nextMenuItemId += 1;
  };

  public shared ({ caller }) func updateMenuItemAvailability(id : MenuItemId, isAvailable : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        let updatedItem : MenuItem = { item with isAvailable };
        menuItems.add(id, updatedItem);
      };
    };
  };

  // Order functions
  public shared ({ caller }) func placeOrder(restaurantId : RestaurantId, items : [OrderItem]) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    var total : Float = 0.0;
    for (item in items.vals()) {
      total += item.price * item.quantity.toFloat();
    };

    let newOrder : Order = {
      id = nextOrderId;
      userId = caller;
      restaurantId;
      items;
      totalAmount = total;
      status = #pending;
      createdAt = Time.now();
    };

    orders.add(nextOrderId, newOrder);
    let orderId = nextOrderId;
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getUserOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let userOrders = orders.values().toArray().filter(
      func(order : Order) : Bool { order.userId == caller }
    );
    userOrders.sort<Order>(
      func(o1 : Order, o2 : Order) : Order.Order {
        Int.compare(o1.createdAt, o2.createdAt);
      }
    );
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async Order {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Users can only view their own orders, admins can view all orders
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // Seed data function
  public shared ({ caller }) func seedData() : async () {
    // Allow seeding during initialization (anonymous caller) or by admin
    let isAnonymous = caller.isAnonymous();
    if (not isAnonymous and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };

    if (isSeeded) { Runtime.trap("Data already seeded") };

    let sampleRestaurants : [Restaurant] = [
      {
        id = 0;
        name = "Luigi's Pizzeria";
        description = "Authentic Italian pizza and pasta";
        cuisineType = #italian;
        rating = 4.5;
        deliveryTimeMinutes = 30;
        isActive = true;
      },
      {
        id = 0;
        name = "Curry Palace";
        description = "Spicy Indian curries and tandoori dishes";
        cuisineType = #indian;
        rating = 4.2;
        deliveryTimeMinutes = 35;
        isActive = true;
      },
      {
        id = 0;
        name = "Dragon Wok";
        description = "Delicious Chinese stir-fry and noodles";
        cuisineType = #chinese;
        rating = 4.0;
        deliveryTimeMinutes = 25;
        isActive = true;
      },
      {
        id = 0;
        name = "Sushi Express";
        description = "Fresh sushi and sashimi";
        cuisineType = #japanese;
        rating = 4.8;
        deliveryTimeMinutes = 20;
        isActive = true;
      },
      {
        id = 0;
        name = "Burger Joint";
        description = "Classic American burgers and fries";
        cuisineType = #american;
        rating = 4.3;
        deliveryTimeMinutes = 28;
        isActive = true;
      },
    ];

    for (r in sampleRestaurants.vals()) {
      let newRestaurant : Restaurant = {
        r with
        id = nextRestaurantId;
      };
      restaurants.add(nextRestaurantId, newRestaurant);
      nextRestaurantId += 1;
    };

    let sampleMenuItems : [MenuItem] = [
      {
        id = 0;
        restaurantId = 1;
        name = "Margherita Pizza";
        description = "Classic tomato, cheese, and basil";
        price = 12.99;
        category = "Pizza";
        isAvailable = true;
      },
      {
        id = 0;
        restaurantId = 2;
        name = "Chicken Tikka Masala";
        description = "Grilled chicken in creamy tomato sauce";
        price = 14.99;
        category = "Curry";
        isAvailable = true;
      },
      {
        id = 0;
        restaurantId = 2;
        name = "Butter Chicken";
        description = "Tender chicken in rich butter sauce";
        price = 15.99;
        category = "Curry";
        isAvailable = true;
      },
      {
        id = 0;
        restaurantId = 1;
        name = "Veggie Pizza";
        description = "Mixed veggies and cheese";
        price = 13.99;
        category = "Pizza";
        isAvailable = true;
      },
      {
        id = 0;
        restaurantId = 3;
        name = "Kung Pao Chicken";
        description = "Spicy stir-fried chicken with peanuts";
        price = 12.99;
        category = "Stir Fry";
        isAvailable = true;
      },
    ];

    for (item in sampleMenuItems.vals()) {
      let newItem : MenuItem = {
        item with
        id = nextMenuItemId;
      };
      menuItems.add(nextMenuItemId, newItem);
      nextMenuItemId += 1;
    };

    isSeeded := true;
  };
};
