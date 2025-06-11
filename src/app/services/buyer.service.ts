import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { buyers, userSignupData , buyerLocalStorageData } from '../data-type';
import { environment } from '../../environments/environments';
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
    const url = `${this.baseUrl}/buyer/signup`;
    return this.http.post(url, data, { observe: 'response' });
  }

  buyerLogin(data: buyers) {
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
  getBuyerData(): buyers {
    if (isPlatformBrowser(this.platformId)) {
      const buyer = localStorage.getItem('buyer');
      if (buyer) {
        return JSON.parse(buyer);
      }
    }
    // Return a default buyers object or handle as needed
    return {} as buyers;
  };

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
  static getToken(): string {
    const buyer = JSON.parse(localStorage.getItem('buyer') || '{}');
    return buyer.token || '';
  }
}
