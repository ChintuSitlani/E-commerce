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
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check local storage only if running in browser
    if (isPlatformBrowser(this.platformId)) {
      const sellerData = localStorage.getItem('seller');
      if (sellerData) {
        this.isSellerLoggedIn.next(true);
      }
    }
  }

  sellerSignup(data: userSignupData) {
    const param = 'seller';
    const redirectRoute = param + '-home';

    // Dynamic URL based on environment
    const url = environment.production
      ? `${this.baseUrl}/${param}/signup`
      : `${this.baseUrl}/${param}`;

    return this.http
      .post(url, data, { observe: 'response' })
      .subscribe(
        (result) => {
          this.isSellerLoggedIn.next(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem(param, JSON.stringify(result.body));
          }
          this.router.navigate([redirectRoute]);
          console.log(result);
        },
        (error) => {
          console.error('Signup failed:', error);
          return error;
        }
      );
  }

  sellerLogin(data: userLoginData) {
    // Create a body with only email and password
    const body = {
      email: data.email,
      password: data.password
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url = environment.production
      ? `${this.baseUrl}/seller/login`
      : `${this.baseUrl}/seller?email=${data.email}&password=${data.password}`;

    if (environment.production) {
      // Real backend - POST login
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
    } else {
      // Local - JSON-server - GET method
      return this.http
        .get<userLoginData[]>(url)
        .subscribe(
          (result) => {
            if (result.length) {
              this.isSellerLoggedIn.next(true);
              if (typeof window !== 'undefined') {
                localStorage.setItem('seller', JSON.stringify(result[0]));
              }
              this.router.navigate(['seller-home']);
            } else {
              alert('Login failed: Invalid email or password.');
            }
          },
          (error) => {
            console.error('Login failed:', error);
            alert('Login failed: Server error.');
          }
        );
    }
  }

  reloadSeller() {
    const param = 'seller';
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem(param)) {
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
    if (sellerData) {
      this.isSellerLoggedIn.next(true);
    } else {
      this.isSellerLoggedIn.next(false);
    }
  }

  sellerLogout() {
    localStorage.removeItem('seller');
    this.isSellerAuthenticated();
    this.router.navigate(['']);
  }
}
