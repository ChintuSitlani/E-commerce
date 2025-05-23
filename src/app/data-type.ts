export interface userSignupData {
  name: string,
  email: string,
  password: string,
}

export interface buyers {
  _id: string,
  email: string,
  password: string,
  shippingAddress?: string,
  pin?: string,
  phone?: string,
  country?: string,
  state?: string,
  city?: string,
  isBlocked?: boolean,
  isEmailVerified?: boolean,
  isPhoneVerified?: boolean,
  emailOTP?: string
}

export interface Product {
  _id?: string;
  productName: string;
  category: string;
  subcategory?: string;
  priceExclTax: number;
  stock?: number;
  brand?: string;
  color?: string;
  weight?: string;
  warranty?: string;
  material?: string;
  features?: string;
  specifications?: string;
  videoUrl?: string;
  ratings?: number;
  description: string;
  imageUrl: string;
  sellerId: string;
  sellerEmailId: string;
  taxRate: number;
  discountAmt: number;
}

export interface CartSummary {
  subTotal: number;
  itemDiscountTotal: number;
  couponDiscount: number;
  taxTotal: number;
  total: number;
  cartItems: CartItems[];
}
export interface CartItems {
  _id: string;
  userId: string;
  productId: Product;
  quantity: number;
  taxRate: number;
  discountAmt: number;
  selected?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface OrderItem {
  _id: string;
  userId: string;
  productId: Product;
  quantity: number;
  taxRate: number;
  discountAmt: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ShippingAddress {
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface OrderSummary {
  _id: any;
  subTotal: number;
  discountTotal: number;
  couponDiscount: number;
  couponCode?: string;
  shippingCharges?: number;
  taxTotal: number;
  totalAmount: number;
  items: OrderItem[];
  buyerId: string;
  sellerId: string;
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod?: 'credit_card'| 'debit_card'| 'paypal'| 'COD'| 'UPI';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

