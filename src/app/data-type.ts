export interface userSignupData{
    name: string,
    email: string,
    password: string,
}

export interface userLoginData{
    id: string,
    email: string,
    password: string,
}

export interface Product {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    price: number;
    description: string;
    imageUrl: string;
    sellerId: string;
    sellerEmailId: string;
  }