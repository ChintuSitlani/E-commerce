import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { buyers, userSignupData, buyerLocalStorageData } from '../data-type';
import { environment } from '../../environments/environment';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class BuyerService {
  isBuyerLoggedIn = new BehaviorSubject<boolean>(false);
  private baseUrl = environment.apiUrl; // now includes /api

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private snackBar: MatSnackBar,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const buyerData = localStorage.getItem('buyer');
      if (buyerData) {
        this.isBuyerLoggedIn.next(true);
      }
    }

  }

  buyerSignup(data: userSignupData): Observable<any> {
    this.buyerLogout();
    localStorage.removeItem('cart');
    localStorage.removeItem('seller');
    
    const url = `${this.baseUrl}/buyer/signup`;
    return this.http.post(url, data, { observe: 'response' });
  }

  buyerLogin(data: buyers) {

    this.buyerLogout();
    localStorage.removeItem('cart');
    localStorage.removeItem('seller');

    const body = {
      email: data.email,
      password: data.password
    };

    const url = `${this.baseUrl}/buyer/login`;

    return this.http
      .post(url, body, { observe: 'response' })
      .subscribe(
        (result: any) => {
          if (result.body) {
            this.isBuyerLoggedIn.next(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('buyer', JSON.stringify(result.body));
            }
            this.router.navigate(['buyer-home']);
          } else {
            alert('Login failed: Invalid credentials.');
          }
        },
        (error) => {
          console.error('Login failed:', error);
          const errorMessage = error?.error?.message || 'Login failed';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000
          });
        }
      );
  }

  reloadBuyer() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('buyer')) {
        this.isBuyerLoggedIn.next(true);
      }
    }
  }
  setBuyerData(data: buyerLocalStorageData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('buyer', JSON.stringify(data));
    }
  }
  isBuyerAuthenticated() {
    const buyerData = localStorage.getItem('buyer');
    this.isBuyerLoggedIn.next(!!buyerData);
  }

  buyerLogout() {
    localStorage.removeItem('buyer');
    this.isBuyerAuthenticated();
    this.router.navigate(['/buyerLogin']);
  }
  getBuyerData(): buyerLocalStorageData {
    if (isPlatformBrowser(this.platformId)) {
      const buyer = localStorage.getItem('buyer');
      if (buyer) {
        return JSON.parse(buyer);
      }
    }
    // Return a default buyers object or handle as needed
    return {} as buyerLocalStorageData;
  };
  fetchBuyerData(): buyers {
    const data = this.getBuyerData();
    return data && data.buyer ? data.buyer : {
      _id: '',
      email: '',
      password: ''
    };
  }
  updateBuyerInfo(buyer: buyers): Observable<buyers> {
    if (buyer) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BuyerService.getToken()}`
      });
      return this.http.put<buyers>(`${this.baseUrl}/buyer/update/${buyer._id}`, buyer, { headers });
    }
    return new Observable<buyers>((observer) => {
      observer.error('Invalid buyer data');
    });
  }

  sendResetLink(email: string) {
    const body = {
      email: email,
      URL: window.location.origin+'/reset-password'
    };

    return this.http.post(`${this.baseUrl}/buyer/forgot-password`, body);
  }

  resetPasswordWithToken(token: string, newPassword: string): Observable<buyerLocalStorageData> {
    return this.http.post<buyerLocalStorageData>(`${this.baseUrl}/buyer/reset-password/${token}`, { newPassword });
  }

  static getToken(): string {
    const buyer = JSON.parse(localStorage.getItem('buyer') || '{}');
    return buyer.token || '';
  }
}
