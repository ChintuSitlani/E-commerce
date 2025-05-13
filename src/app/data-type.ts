export interface userSignupData {
    name: string,
    email: string,
    password: string,
}

export interface userLoginData {
    _id: string,
    email: string,
    password: string,
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