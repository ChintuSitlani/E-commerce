import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders , HttpParams } from '@angular/common/http';
import { CartSummary, CartItems, Product } from '../data-type';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { SellerService } from './seller.service';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = `${environment.apiUrl}/products`;
  private token: string;
  constructor(private http: HttpClient) {
    this.token = SellerService.getToken();
  }

  saveProduct(product: Product): Observable<Product> {
    if (!this.token) {
      throw new Error('No token found. Please log in as a seller.');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });

    if (product._id) {
      return this.http.put<Product>(
        `${this.baseUrl}/${product._id}`,
        product,
        { headers }
      );
    } else {
      return this.http.post<Product>(
        this.baseUrl,
        product,
        { headers }
      );
    }
  }

  getSellerProducts(sellerId: string, sellerEmail: string): Observable<Product[]> {
    const params = new HttpParams()
      .set('sellerId', sellerId)
      .set('sellerEmailId', sellerEmail);

    return this.http.get<Product[]>(`${this.baseUrl}/getHomeScreenProducts`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  deleteProduct(productId: string): Observable<any> {
    if (!this.token) {
      throw new Error('No token found. Please log in as a seller.');
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
    return this.http.delete(`${this.baseUrl}/${productId}`, { headers });
  }

  getProductForCarousel(limit: number): Observable<Product[]> {
    const params = new HttpParams().set('_limit', limit.toString());
    return this.http.get<Product[]>(`${this.baseUrl}/getCrausalProduct`, { params });
  }

  getProducts(page: number = 1, limit: number = 6): Observable<any> {
    return this.http.get(`${this.baseUrl}/getHomeScreenProducts?page=${page}&limit=${limit}`);
  }

  getResultProducts(
    searchTerm: string = '',
    filters: { brand: string; minPrice: number; maxPrice: number } = { brand: '', minPrice: 0, maxPrice: 100000 },
    skip: number = 0,
    limit: number = 10
  ): Observable<{ products: Product[]; total: number }> {
    let params = new HttpParams()
      .set('search', searchTerm)
      .set('minPrice', filters.minPrice.toString())
      .set('maxPrice', filters.maxPrice.toString())
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (filters.brand) {
      params = params.set('brand', filters.brand);
    }

    return this.http.get<{ products: Product[]; total: number }>(`${this.baseUrl}/filteredProduct`, { params });
  }
  addToCart(cartItem: any): Observable<CartItems> {
    return this.http.post<CartItems>(`${environment.apiUrl}/cart/add`, cartItem);
  }

  getCartItems(userId: string) {
    return this.http.get<CartItems[]>(`${environment.apiUrl}/cart/${userId}`);
  }

  updateCartItem(itemId: string, cartItem: any): Observable<CartItems> {
    return this.http.put<CartItems>(`${environment.apiUrl}/cart/${itemId}`, { cartItem });
  }

  removeFromCart(itemId: string) {
    return this.http.delete(`${environment.apiUrl}/cart/${itemId}`);
  }

  getCartSummary(userId: string, couponCode?: string) {
    let url = `${environment.apiUrl}/cart/summary?userId=${userId}`;
    if (couponCode) url += `&couponCode=${couponCode}`;
    return this.http.get<CartSummary>(url);
  }
  updateCartItemSelection(itemId: string, selected: boolean) {
    return this.http.put(`${environment.apiUrl}/cart/selected/${itemId}`, { selected });
  }

}
