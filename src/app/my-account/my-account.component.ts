import { Component, OnInit } from '@angular/core';
import { BuyerService } from '../services/buyer.service';
import { OtpService } from '../services/otp.service';
import { buyers } from '../data-type';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {
  buyer: buyers = {
    _id: '',
    email: '',
    password: '',
    isEmailVerified: false,
    shippingAddress: '',
    country: '',
    city: '',
    phone: '',
    pin: '',
    state: '',
  };
  orders: any[] = [];

  email = '';
  otpSent = false;
  message = '';

  otpForm: FormGroup;
  passForm: FormGroup;
  shipForm: FormGroup;
  constructor(
    private buyerS: BuyerService,
    private otpS: OtpService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.otpForm = this.fb.group({
      OTP: ['', Validators.required]
    });

    this.passForm = this.fb.group({
      current: ['', Validators.required],
      new: ['', Validators.required]
    });

    this.shipForm = this.fb.group({
      shippingAddress: ['', Validators.required],
      pin: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      
      phone: ['', Validators.required],
    });
  }
  ngOnInit() {
    this.loadUserData();

  }

  loadUserData() {
    this.buyer = this.buyerS.getBuyerData();
    this.shipForm.patchValue({
      shippingAddress: this.buyer.shippingAddress,
      pin: this.buyer.pin,
      state: this.buyer.state,
      city: this.buyer.city,
      country: this.buyer.country,
      phone: this.buyer.phone,
    });
  }

  sendVerificationEmail() {
    this.otpS.sendOtp(this.buyer.email).subscribe({
      next: () => {
        this.otpSent = true;
        this.message = 'OTP sent to email.';
      },
      error: err => this.message = err.error.message
    });
  }
  verifyOtp() {
    const otpValue = this.otpForm.get('OTP')?.value;
    this.otpS.verifyOtp(this.buyer.email, otpValue).subscribe({
      next: () => {
        this.message = 'Email verified successfully!';
        this.buyer.isEmailVerified = true;
        this.otpForm.reset();
        this.otpSent = false;
      },
      error: err => this.message = err.error.message
    });
  }

  updateShippingInfo() {
    if (this.shipForm.valid) {
      const formValues = this.shipForm.value;
      const updatedShippingInfo = {
        ...this.buyer,
        shippingAddress: formValues.shippingAddress,
        pin: formValues.pin,
        state: formValues.state,
        city: formValues.city,
       
        phone: formValues.phone,
      };
      console.log('Updated Shipping Info:', updatedShippingInfo);
      this.buyerS.updateBuyerInfo(updatedShippingInfo).subscribe({
        next: (updatedBuyer: buyers) => {
          this.buyer = updatedBuyer;
          this.updateBuyerData(updatedBuyer);
          this.snackBar.open('shipping address updated successfully!', 'Close', { duration: 3000 });
        },
        error: (err: any) => {
          console.error('Error:', err);
          this.snackBar.open('Error updating shippping address', 'Close', { duration: 3000 });
        },
      });
    } else {
      this.snackBar.open('Please fill up all the details.', 'Close', { duration: 3000 });
    }

  }
  updatePassword() {
    if (this.passForm.valid) {
      const formValues = this.passForm.value;
      const updatedPasswordInfo = {
        ...this.buyer,
        password: formValues.new,
      };

      this.buyerS.updateBuyerInfo(updatedPasswordInfo).subscribe({
        next: (updatedBuyer: buyers) => {
          this.buyer = updatedBuyer;
          this.updateBuyerData(updatedBuyer);
          this.snackBar.open('Password updated successfully.', 'Close', { duration: 3000 });
          this.passForm.reset();
        },
        error: (err: any) => {
          this.snackBar.open(err.error.message || 'Password update failed.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please enter password.', 'Close', { duration: 3000 });
    }
  }
  updateBuyerData(updatedBuyer: buyers) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('buyer', JSON.stringify(updatedBuyer));
    }
  }
}
