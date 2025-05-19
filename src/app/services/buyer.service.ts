import { HttpClient } from '@angular/common/http';
import { buyers, userSignupData } from '../data-type';
import { environment } from '../../environments/environments';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class BuyerService {
  isBuyerLoggedIn = new BehaviorSubject<boolean>(false);
  private baseUrl = environment.apiUrl; // now includes /api

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const buyerData = localStorage.getItem('buyer');
      if (buyerData) {
        this.isBuyerLoggedIn.next(true);
      }
    }
  }

  buyerSignup(data: userSignupData) {
    const url = `${this.baseUrl}/buyer/signup`;

    return this.http
      .post(url, data, { observe: 'response' })
      .subscribe(
        (result) => {
          this.isBuyerLoggedIn.next(true);

          if (typeof window !== 'undefined') {
            localStorage.setItem('buyer', JSON.stringify(result.body));
          }

          this.router.navigate(['buyer-home']);
          console.log(result);
        },
        (error) => {
          console.error('Signup failed:', error);
          return error;
        }
      );
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
          alert('Login failed: Server error.');
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
      return this.http.put<buyers>(`${this.baseUrl}/buyer/update/${buyer._id}`, buyer);
    }
    return new Observable<buyers>((observer) => {
      observer.error('Invalid buyer data');
    });
  }
  
}
