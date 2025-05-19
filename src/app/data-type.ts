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
    pin?:string,
    phone?:string,
    country?:string,
    state?:string,
    city?:string,
    isBlocked?: boolean,
    isEmailVerified?: boolean,
    isPhoneVerified?: boolean,
    emailOTP?:string
}

export interface Product {
    _id?: string;
    productName: string;
    category: string;
    subcategory?: string;
    priceExclTax?: number;
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
    taxRate?: number;
    discountAmt?: number;
}

export interface CartSummary {
    subTotal: number;
    itemDiscountTotal: number;
    couponDiscount: number;
    taxTotal: number;
    total: number;
    cartItems: any[];
}