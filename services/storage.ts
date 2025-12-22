import { Product, User, UserRole, Order, ProductUnit, UnitStatus, BulkStock, CartItem } from '../types';

const USERS_KEY = 'chaintrack_users';
const PRODUCTS_KEY = 'chaintrack_products';
const UNITS_KEY = 'chaintrack_units'; 
const BULK_STOCK_KEY = 'chaintrack_bulk_stock'; // New Key
const ORDERS_KEY = 'chaintrack_orders';
const CURRENT_USER_KEY = 'chaintrack_current_user';
const CART_KEY_PREFIX = 'chaintrack_cart_';
const SYSTEM_SECRET_KEY = 'LALLAN-ASKE-V1-SECRET'; // In prod, this would be env variable

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// --- Security / Aske Logic ---

export const generateSecureHash = async (serialNumber: string, manufacturerId: string): Promise<string> => {
    // Formula: SHA-256(SerialNumber + ManufacturerID + SystemKey)
    const data = `${serialNumber}-${manufacturerId}-${SYSTEM_SECRET_KEY}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert to Hex and take first 16 chars for a "Code" style, or full hash
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyProductIdentity = async (qrSerialNumber: string, inputAuthCode: string): Promise<{valid: boolean, unit?: ProductUnit}> => {
    const units = getProductUnits();
    const unit = units.find(u => u.serialNumber === qrSerialNumber);
    
    if (!unit || !unit.uniqueAuthHash) {
        return { valid: false };
    }

    // Since we store the hash, we compare the input directly against the stored hash
    // The InputAuthCode PROVIDED by the user IS the hash (retrieved from their dashboard)
    if (unit.uniqueAuthHash === inputAuthCode) {
        return { valid: true, unit };
    }
    
    return { valid: false };
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

export const resetPassword = (userId: string, newPassword: string): void => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index >= 0) {
        users[index].password = newPassword;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

// --- Product & Inventory Management ---

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getProductUnits = (): ProductUnit[] => {
  const stored = localStorage.getItem(UNITS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getBulkStock = (): BulkStock[] => {
  const stored = localStorage.getItem(BULK_STOCK_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveProductBatch = async (product: Product, quantity: number, partialUnits: Partial<ProductUnit>[]): Promise<void> => {
  const products = getProducts();
  
  // Update or Add Product definition
  const pIndex = products.findIndex(p => p.id === product.id);
  if (pIndex >= 0) products[pIndex] = product;
  else products.push(product);
  
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

  if (product.isSerialized) {
    const allUnits = getProductUnits();
    
    // Process units to generate hashes asynchronously
    const finalUnits: ProductUnit[] = [];
    
    for (const u of partialUnits) {
        if (u.serialNumber && u.manufacturerId) {
             const hash = await generateSecureHash(u.serialNumber, u.manufacturerId);
             finalUnits.push({
                 ...u,
                 uniqueAuthHash: hash
             } as ProductUnit);
        }
    }

    finalUnits.forEach(u => allUnits.push(u));
    localStorage.setItem(UNITS_KEY, JSON.stringify(allUnits));
  } else {
    // Add Bulk Stock
    const allStock = getBulkStock();
    const existingStock = allStock.find(s => s.productId === product.id && s.ownerId === product.manufacturerId);
    
    if (existingStock) {
      existingStock.quantity += quantity;
    } else {
      allStock.push({
        id: generateId(),
        productId: product.id,
        ownerId: product.manufacturerId,
        quantity: quantity
      });
    }
    localStorage.setItem(BULK_STOCK_KEY, JSON.stringify(allStock));
  }
};

export const updateProductUnits = (unitsToUpdate: ProductUnit[]): void => {
  const allUnits = getProductUnits();
  unitsToUpdate.forEach(u => {
    const idx = allUnits.findIndex(existing => existing.id === u.id);
    if (idx >= 0) allUnits[idx] = u;
  });
  localStorage.setItem(UNITS_KEY, JSON.stringify(allUnits));
};

// Transfer Bulk Stock (Manufacturer -> Seller or Seller -> Buyer)
export const transferBulkStock = (productId: string, fromOwnerId: string, toOwnerId: string | null, quantity: number): void => {
    const allStock = getBulkStock();
    const sourceStock = allStock.find(s => s.productId === productId && s.ownerId === fromOwnerId);
    
    if (sourceStock && sourceStock.quantity >= quantity) {
        sourceStock.quantity -= quantity;
        
        // If toOwnerId is null, it means it's sold to a buyer (leaving the 'stock' system)
        if (toOwnerId) {
            const destStock = allStock.find(s => s.productId === productId && s.ownerId === toOwnerId);
            if (destStock) {
                destStock.quantity += quantity;
            } else {
                allStock.push({
                    id: generateId(),
                    productId: productId,
                    ownerId: toOwnerId,
                    quantity: quantity
                });
            }
        }
    }
    localStorage.setItem(BULK_STOCK_KEY, JSON.stringify(allStock));
};

// Strict Deletion: Delete Unit
export const deleteProductUnit = (unitId: string): void => {
  const units = getProductUnits().filter(u => u.id !== unitId);
  localStorage.setItem(UNITS_KEY, JSON.stringify(units));
};

// Strict Deletion: Delete Product
export const deleteProduct = (productId: string): boolean => {
  const units = getProductUnits();
  const hasUnits = units.some(u => u.productId === productId);
  
  const stocks = getBulkStock();
  const hasStock = stocks.some(s => s.productId === productId && s.quantity > 0);
  
  if (hasUnits || hasStock) return false;

  const products = getProducts().filter(p => p.id !== productId);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return true;
};

// --- Inventory Getters (Hybrid) ---

export const getProductStockForOwner = (productId: string, ownerId: string, isSerialized: boolean): number => {
    if (isSerialized) {
        const units = getProductUnits();
        // Check for IN_FACTORY (if Mfg) or AT_SELLER (if Seller)
        return units.filter(u => 
            u.productId === productId && 
            ((u.manufacturerId === ownerId && u.status === 'IN_FACTORY') || 
             (u.sellerId === ownerId && (u.status === 'AT_SELLER' || u.status === 'RETURNED_TO_SELLER')))
        ).length;
    } else {
        const stock = getBulkStock().find(s => s.productId === productId && s.ownerId === ownerId);
        return stock ? stock.quantity : 0;
    }
};

// Helper: Get actual Product objects with computed quantity
export const getProductsWithStock = (ownerId: string, role: UserRole): (Product & { quantity: number })[] => {
  const products = getProducts();
  
  return products.map(p => {
    const quantity = getProductStockForOwner(p.id, ownerId, p.isSerialized);
    
    // Filter logic: Only show products relevant to owner
    if (role === UserRole.MANUFACTURER && p.manufacturerId !== ownerId) return null;
    
    return { ...p, quantity };
  }).filter((p): p is (Product & { quantity: number }) => p !== null && (role === UserRole.MANUFACTURER || p.quantity > 0)); 
};

export const getProductsForManufacturer = (manufacturerId: string): (Product & { quantity: number })[] => {
  return getProductsWithStock(manufacturerId, UserRole.MANUFACTURER);
};

export const getProductsForSeller = (sellerId: string): (Product & { quantity: number })[] => {
  return getProductsWithStock(sellerId, UserRole.SELLER);
};

export const getAvailableSerialNumbers = (productId: string, status: UnitStatus, ownerIdField: 'manufacturerId' | 'sellerId', ownerId: string): ProductUnit[] => {
  const units = getProductUnits();
  // @ts-ignore - dynamic key access
  return units.filter(u => u.productId === productId && u.status === status && u[ownerIdField] === ownerId);
};

export const getManufacturerDispatchHistory = (manufacturerId: string): (ProductUnit & { productName: string, sellerName: string })[] => {
  const units = getProductUnits();
  const products = getProducts();
  const users = getUsers();

  // Filter for units made by this manufacturer that have been sent to a seller (sellerId exists)
  const history = units.filter(u => u.manufacturerId === manufacturerId && u.sellerId);

  return history.map(u => {
    const prod = products.find(p => p.id === u.productId);
    const seller = users.find(s => s.id === u.sellerId);
    return {
      ...u,
      productName: prod ? prod.name : 'Unknown Product',
      sellerName: seller ? seller.name : 'Unknown Seller'
    };
  }).sort((a, b) => {
    // Sort by date sent descending
    const dateA = a.dateSentToSeller || '';
    const dateB = b.dateSentToSeller || '';
    return dateB.localeCompare(dateA);
  });
};

// --- Cart Management ---

export const getCart = (userId: string): CartItem[] => {
  const stored = localStorage.getItem(CART_KEY_PREFIX + userId);
  return stored ? JSON.parse(stored) : [];
};

export const addToCart = (userId: string, item: CartItem): void => {
  const cart = getCart(userId);
  
  // Strict matching including sellerId to avoid merging items from different sellers
  const existing = cart.find(c => 
    c.productId === item.productId && 
    c.sellerId === item.sellerId
  );

  if (existing) {
    existing.quantity += item.quantity;
    // Merge unitIds if present
    if (item.unitIds && item.unitIds.length > 0) {
        const existingUnits = existing.unitIds || [];
        const newUnits = item.unitIds.filter(id => !existingUnits.includes(id));
        existing.unitIds = [...existingUnits, ...newUnits];
    }
  } else {
    cart.push(item);
  }
  localStorage.setItem(CART_KEY_PREFIX + userId, JSON.stringify(cart));
};

export const removeFromCart = (userId: string, itemId: string): void => {
    const cart = getCart(userId).filter(c => c.id !== itemId);
    localStorage.setItem(CART_KEY_PREFIX + userId, JSON.stringify(cart));
};

export const clearCart = (userId: string): void => {
    localStorage.removeItem(CART_KEY_PREFIX + userId);
};

// --- Returns Logic ---

export const returnUnitsToManufacturer = (unitIds: string[]): void => {
  const allUnits = getProductUnits();
  
  unitIds.forEach(id => {
    const unit = allUnits.find(u => u.id === id);
    if (unit) {
      unit.status = 'RETURNED_DEFECTIVE';
      unit.dateReturned = new Date().toISOString().split('T')[0];
    }
  });
  
  localStorage.setItem(UNITS_KEY, JSON.stringify(allUnits));
};

export const returnBulkToManufacturer = (productId: string, sellerId: string, quantity: number): void => {
    const allStock = getBulkStock();
    const sellerStock = allStock.find(s => s.productId === productId && s.ownerId === sellerId);
    if (sellerStock && sellerStock.quantity >= quantity) {
        sellerStock.quantity -= quantity;
        
        const products = getProducts();
        const prod = products.find(p => p.id === productId);
        if (prod) {
             const mfgStock = allStock.find(s => s.productId === productId && s.ownerId === prod.manufacturerId);
             if (mfgStock) mfgStock.quantity += quantity;
        }
    }
    localStorage.setItem(BULK_STOCK_KEY, JSON.stringify(allStock));
};

export const requestOrderReturn = (orderId: string): void => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  const units = getProductUnits();

  if (order) {
    order.status = 'Return Requested';
    
    if (order.assignedUnitIds) {
        order.assignedUnitIds.forEach(uid => {
        const u = units.find(unit => unit.id === uid);
        if (u) {
            u.status = 'RETURN_REQUESTED';
        }
        });
        localStorage.setItem(UNITS_KEY, JSON.stringify(units));
    }
    
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};

export const processBuyerReturn = (orderId: string, accept: boolean): void => {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    const units = getProductUnits();
  
    if (order) {
      if (accept) {
          order.status = 'Returned';
          if (order.assignedUnitIds) {
             order.assignedUnitIds.forEach(uid => {
                const u = units.find(unit => unit.id === uid);
                if (u) {
                  u.status = 'RETURNED_TO_SELLER';
                }
             });
             localStorage.setItem(UNITS_KEY, JSON.stringify(units));
          } else {
             // Bulk Return: Increase Seller Stock
             const stocks = getBulkStock();
             const sellerStock = stocks.find(s => s.productId === order.productId && s.ownerId === order.sellerId);
             if (sellerStock) {
                 sellerStock.quantity += order.quantity;
                 localStorage.setItem(BULK_STOCK_KEY, JSON.stringify(stocks));
             }
          }
      } else {
        order.status = 'Delivered';
        if (order.assignedUnitIds) {
            order.assignedUnitIds.forEach(uid => {
                const u = units.find(unit => unit.id === uid);
                if (u) u.status = 'SOLD_TO_BUYER'; 
            });
            localStorage.setItem(UNITS_KEY, JSON.stringify(units));
        }
      }
  
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
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

export const fulfillOrder = (orderId: string, unitIds: string[] | null): void => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  const units = getProductUnits();

  if (order) {
    order.status = 'Confirmed';
    order.dateConfirmed = new Date().toISOString().split('T')[0];
    
    if (unitIds && unitIds.length > 0) {
        // Serialized Fulfillment
        order.assignedUnitIds = unitIds;
        unitIds.forEach(uid => {
          const u = units.find(unit => unit.id === uid);
          if (u) {
            u.status = 'SOLD_TO_BUYER';
            u.buyerId = order.buyerId;
            u.dateSold = new Date().toISOString().split('T')[0];
          }
        });
        localStorage.setItem(UNITS_KEY, JSON.stringify(units));
    } else {
        // Bulk Fulfillment - Deduct Stock
        transferBulkStock(order.productId, order.sellerId, null, order.quantity);
    }
    
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};

export const cancelOrder = (orderId: string): void => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex >= 0) {
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
