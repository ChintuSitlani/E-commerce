import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CartSummary, CartItems, Product } from '../data-type';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  saveProduct(product: Product): Observable<Product> {
    if (product._id) {
      return this.http.put<Product>(`${this.baseUrl}/${product._id}`, product);
    } else {
      return this.http.post<Product>(this.baseUrl, product);
    }
  }

  getSellerProducts(sellerId: string, sellerEmail: string): Observable<Product[]> {
    const params = new HttpParams()
      .set('sellerId', sellerId)
      .set('sellerEmailId', sellerEmail);

    return this.http.get<Product[]>(this.baseUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${productId}`);
  }

  getProductForCarousel(limit: number): Observable<Product[]> {
    const params = new HttpParams().set('_limit', limit.toString());
    return this.http.get<Product[]>(this.baseUrl, { params });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  addToCart(productId: string, userId: string) {
    return this.http.post<any>(`${environment.apiUrl}/cart/add`, { productId, userId });
  }

  getCartItems(userId: string) {
    return this.http.get<CartItems[]>(`${environment.apiUrl}/cart/${userId}`);
  }

  updateCartQuantity(itemId: string, quantity: number) {
    return this.http.put(`${environment.apiUrl}/cart/${itemId}`, { quantity });
  }

  removeFromCart(itemId: string) {
    return this.http.delete(`${environment.apiUrl}/cart/${itemId}`);
  }

  getCartSummary(userId: string, couponCode?: string) {
    let url = `${environment.apiUrl}/cart/summary?userId=${userId}`;
    if (couponCode) url += `&couponCode=${couponCode}`;
    return this.http.get<CartSummary>(url);
  }
}
