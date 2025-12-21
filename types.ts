export enum UserRole {
  MANUFACTURER = 'Manufacturer',
  SELLER = 'Seller',
  BUYER = 'Buyer'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  dob?: string;
  phone?: string;
  phoneCode?: string;
  profileImage?: string; // Base64 encoded image
}

export type UnitStatus = 
  | 'IN_FACTORY' 
  | 'IN_TRANSIT_TO_SELLER' 
  | 'AT_SELLER' 
  | 'SOLD_TO_BUYER'
  | 'RETURN_REQUESTED'       // Buyer wants to return
  | 'RETURNED_TO_SELLER'     // Back at Seller (Good condition)
  | 'RETURNED_DEFECTIVE';    // Sent back to Manufacturer

export interface ProductUnit {
  id: string;
  productId: string;
  serialNumber: string;
  status: UnitStatus;
  
  // Traceability
  manufacturerId: string;
  sellerId?: string;
  buyerId?: string;
  
  // Timeline
  manufacturingDate: string;
  dateSentToSeller?: string;
  dateSold?: string;
  dateReturned?: string;
}

// New Interface for Non-Serialized Inventory
export interface BulkStock {
  id: string;
  productId: string;
  ownerId: string; // Can be Manufacturer or Seller
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  manufacturerId: string;
  isSerialized: boolean; // New Flag
  description?: string;
}

export interface CartItem {
  id: string; // cart item id
  productId: string;
  productName: string;
  quantity: number;
  isSerialized: boolean;
  price?: number; // Optional for demo
  unitIds?: string[]; // Specific units selected (for Manufacturer dispatch)
  sellerId?: string; // For Buyers: which seller they are buying from
}

export type OrderStatus = 'Awaiting Confirmation' | 'Confirmed' | 'Delivered' | 'Return Requested' | 'Returned';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  
  sellerId: string;
  buyerId: string;
  buyerName: string;
  
  quantity: number;
  status: OrderStatus;
  
  // New field: Specific units assigned to this order (Only if isSerialized)
  assignedUnitIds?: string[];
  
  dateOrdered: string;
  dateConfirmed?: string;
  dateDelivered?: string;
}

export interface PasswordScore {
  score: number;
  label: string;
  color: string;
}