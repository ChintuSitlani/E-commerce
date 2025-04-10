export interface userSignupData{
    name: string,
    email: string,
    password: string,
}

export interface userLoginData{
    email: string,
    password: string,
}

export interface Product {
    id?: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
  }