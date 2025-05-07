import { HttpClient, HttpHeaders } from '@angular/common/http';
import { userLoginData, userSignupData } from '../data-type';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environments';
@Injectable({
  providedIn: 'root',
})
export class SellerService {
  isSellerLoggedIn = new BehaviorSubject<boolean>(false);
  private baseUrl = environment.apiUrl; // already ends in /api

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const sellerData = localStorage.getItem('seller');
      if (sellerData) {
        this.isSellerLoggedIn.next(true);
      }
    }
  }

  sellerSignup(data: userSignupData) {
    const url = `${this.baseUrl}/seller/signup`;

    return this.http
      .post(url, data, { observe: 'response' })
      .subscribe(
        (result) => {
          this.isSellerLoggedIn.next(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('seller', JSON.stringify(result.body));
          }
          this.router.navigate(['seller-home']);
        },
        (error) => {
          console.error('Signup failed:', error);
          return error;
        }
      );
  }

  sellerLogin(data: userLoginData) {
    const body = {
      email: data.email,
      password: data.password
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const url = `${this.baseUrl}/seller/login`;

    return this.http
      .post(url, body, { headers, observe: 'response' })
      .subscribe(
        (result: any) => {
          if (result.body) {
            this.isSellerLoggedIn.next(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('seller', JSON.stringify(result.body));
            }
            this.router.navigate(['seller-home']);
          } else {
            alert('Login failed: Invalid credentials.');
          }
        },
        (error) => {
          console.error('Login failed:', error);
          alert('Login failed: Server error.');
        }
      );
  }

  reloadSeller() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('seller')) {
        this.isSellerLoggedIn.next(true);
      }
    }
  }

  getSellerData: () => userLoginData | null = () => {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('seller')) {
        return JSON.parse(localStorage.getItem('seller') || '{}');
      } else {
        return null;
      }
    }
  };

  isSellerAuthenticated() {
    const sellerData = localStorage.getItem('seller');
    this.isSellerLoggedIn.next(!!sellerData);
  }

  sellerLogout() {
    localStorage.removeItem('seller');
    this.isSellerAuthenticated();
    this.router.navigate(['']);
  }
}
