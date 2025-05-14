import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private baseUrl = environment.apiUrl;
  private endpoint = '/auth';

  constructor(private http: HttpClient) {}

  sendOtp(email: string) {
    return this.http.post(`${this.baseUrl+this.endpoint}/send-otp`, { email });
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post(`${this.baseUrl+this.endpoint}/verify-otp`, { email, otp });
  }

}
