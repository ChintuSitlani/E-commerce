import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCount = new BehaviorSubject<number>(0);
  getCartCount() {
    return this.cartCount.asObservable();
  }
  setCartCount(count: number) {
    this.cartCount.next(count);
  }
}
