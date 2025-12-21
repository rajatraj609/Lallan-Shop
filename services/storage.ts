import { Product, User, UserRole, Order } from '../types';

const USERS_KEY = 'chaintrack_users';
const PRODUCTS_KEY = 'chaintrack_products';
const ORDERS_KEY = 'chaintrack_orders';
const CURRENT_USER_KEY = 'chaintrack_current_user';

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// --- User Management ---

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === user.id) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
};

export const deleteUser = (userId: string): void => {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    logout();
  }
};

export const findUserByEmail = (email: string): User | undefined => {
  return getUsers().find(u => u.email === email);
};

export const getUsersByRole = (role: UserRole): User[] => {
  return getUsers().filter(u => u.role === role);
};

// --- Auth Session ---

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const login = (user: User): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// --- Product Management ---

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const updateProductQuantity = (productId: string, quantityToDeduct: number): boolean => {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (product && product.quantity >= quantityToDeduct) {
    product.quantity -= quantityToDeduct;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return true;
  }
  return false;
};

export const restoreProductQuantity = (productId: string, quantityToAdd: number): void => {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (product) {
    product.quantity += quantityToAdd;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }
};

export const getProductsForManufacturer = (manufacturerId: string): Product[] => {
  return getProducts().filter(p => p.manufacturerId === manufacturerId);
};

export const getProductsForSeller = (sellerId: string): Product[] => {
  return getProducts().filter(p => p.sellerId === sellerId);
};

// --- Order Management ---

export const getOrders = (): Order[] => {
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.push(order);
  }
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const cancelOrder = (orderId: string): void => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex >= 0) {
    const order = orders[orderIndex];
    // Restore inventory
    restoreProductQuantity(order.productId, order.quantity);
    // Remove order
    orders.splice(orderIndex, 1);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};

export const getOrdersForSeller = (sellerId: string): Order[] => {
  return getOrders().filter(o => o.sellerId === sellerId);
};

export const getOrdersForBuyer = (buyerId: string): Order[] => {
  return getOrders().filter(o => o.buyerId === buyerId);
};