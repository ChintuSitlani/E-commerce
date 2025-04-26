import { HttpClient } from '@angular/common/http';
import { userLoginData, userSignupData } from '../data-type';
import { environment } from '../../environments/environments';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class BuyerService {
  isBuyerLoggedIn = new BehaviorSubject<boolean>(false);
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Injecting platform ID
  ) {
    // Check local storage only if running in the browser
    if (isPlatformBrowser(this.platformId)) {
      const buyerData = localStorage.getItem('buyer');
      if (buyerData) {
        this.isBuyerLoggedIn.next(true);
      }
    }
  }

  buyerSignup(data: userSignupData) {
    const param = 'buyer';
    const redirectRoute = param + '-home';
    return this.http
      .post(`${this.baseUrl}/${param}`, data, { observe: 'response' })
      .subscribe(
        (result) => {
          this.isBuyerLoggedIn.next(true);

          if (typeof window !== 'undefined') {
            localStorage.setItem(param, JSON.stringify(result.body));
          }

          this.router.navigate([redirectRoute]);
          console.log(result);
        },
        (error) => {
          console.error('Signup failed:', error);
          return error; // Ensures function always returns a value
        }
      );
  }
  buyerLogin(data: userLoginData) {
    return this.http
      .get<userLoginData[]>(`${this.baseUrl}/buyer?email=${data.email}&password=${data.password}`)
      .subscribe(
        (result) => {
          if (result.length) {
            this.isBuyerLoggedIn.next(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('buyer', JSON.stringify(result[0]));
            }
            this.router.navigate(['buyer-home']);
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
  reloadBuyer() {
    const param = 'buyer';
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem(param)) {
        this.isBuyerLoggedIn.next(true);
      }
    }
  }
}

