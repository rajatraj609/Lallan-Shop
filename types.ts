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

export interface Product {
  id: string;
  name: string;
  serialNumber: string; // Added field
  quantity: number; // Inventory available
  manufacturingDate: string;
  
  manufacturerId: string;
  sellerId: string;
  sellerName: string;
  dateSentToSeller: string;
}

export type OrderStatus = 'Awaiting Confirmation' | 'Confirmed' | 'Delivered';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  
  sellerId: string;
  buyerId: string;
  buyerName: string;
  
  quantity: number;
  status: OrderStatus;
  
  dateOrdered: string;
  dateConfirmed?: string;
  dateDelivered?: string;
}

export interface PasswordScore {
  score: number;
  label: string;
  color: string;
}