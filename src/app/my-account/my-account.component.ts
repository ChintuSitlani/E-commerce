import { Component, OnInit } from '@angular/core';
import { BuyerService } from '../services/buyer.service';
import { OtpService } from '../services/otp.service';
import { sellers, buyers, sellerLocalStorageData, buyerLocalStorageData } from '../data-type';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SellerService } from '../services/seller.service';

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
  seller: sellers = {
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
  buyerData: buyerLocalStorageData = JSON.parse(localStorage.getItem('buyer') || '{}');
  sellerData: sellerLocalStorageData = JSON.parse(localStorage.getItem('seller') || '{}');
  isSeller = false;
  currentUser: buyers | sellers | null = null;

  constructor(
    private buyerS: BuyerService,
    private otpS: OtpService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private sellerS: SellerService
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
      country: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.isSeller = !!this.sellerData?.seller?._id;
    this.loadUserData();
  }

  loadUserData() {
    if (this.isSeller) {
      this.currentUser = this.sellerS.getSellerDataSellerDataType();
      this.seller = this.currentUser as sellers;
      this.shipForm.patchValue({
        shippingAddress: this.seller.shippingAddress,
        pin: this.seller.pin,
        state: this.seller.state,
        city: this.seller.city,
        country: this.seller.country,
        phone: this.seller.phone,
      });
    } else if (this.buyerData?.buyer?._id) {
      this.currentUser = this.buyerS.getBuyerData();
      this.buyer = this.currentUser as buyers;
      this.shipForm.patchValue({
        shippingAddress: this.buyer.shippingAddress,
        pin: this.buyer.pin,
        state: this.buyer.state,
        city: this.buyer.city,
        country: this.buyer.country,
        phone: this.buyer.phone,
      });
    }
  }

  sendVerificationEmail() {
    const email = this.isSeller ? this.seller.email : this.buyer.email;
    this.otpS.sendOtp(email).subscribe({
      next: () => {
        this.otpSent = true;
        this.message = 'OTP sent to email.';
      },
      error: err => this.message = err.error.message
    });
  }

  verifyOtp() {
    const email = this.isSeller ? this.seller.email : this.buyer.email;
    const otpValue = this.otpForm.get('OTP')?.value;
    this.otpS.verifyOtp(email, otpValue).subscribe({
      next: () => {
        this.message = 'Email verified successfully!';
        if (this.isSeller) {
          this.seller.isEmailVerified = true;
          this.sellerData.seller = this.seller;
          this.sellerS.setSellerData(this.sellerData);
        } else {
          this.buyer.isEmailVerified = true;
          this.buyerData.buyer = this.buyer;
          this.buyerS.setBuyerData(this.buyerData);
        }
        this.otpForm.reset();
        this.otpSent = false;
      },
      error: err => this.message = err.error.message
    });
  }

  updateShippingInfo() {
    if (this.shipForm.valid) {
      const formValues = this.shipForm.value;

      if (this.isSeller) {
        const updatedSeller = {
          ...this.seller,
          shippingAddress: formValues.shippingAddress,
          pin: formValues.pin,
          state: formValues.state,
          city: formValues.city,
          country: formValues.country,
          phone: formValues.phone,
        };
        updatedSeller.password = '';
        this.sellerS.updateSellerInfo(updatedSeller).subscribe({
          next: (updatedData: sellers) => {
            this.seller = updatedData;
            this.sellerData.seller = updatedData;
            this.sellerS.setSellerData(this.sellerData);
            this.snackBar.open('Shipping address updated successfully!', 'Close', { duration: 3000 });
          },
          error: (err: any) => {
            console.error('Error:', err);
            this.snackBar.open('Error updating shipping address', 'Close', { duration: 3000 });
          },
        });
      } else {
        const updatedBuyer = {
          ...this.buyer,
          shippingAddress: formValues.shippingAddress,
          pin: formValues.pin,
          state: formValues.state,
          city: formValues.city,
          country: formValues.country,
          phone: formValues.phone,
        };
        updatedBuyer.password = ''
        this.buyerS.updateBuyerInfo(updatedBuyer).subscribe({
          next: (updatedData: buyers) => {
            this.buyer = updatedData;
            this.buyerData.buyer = updatedData;
            this.buyerS.setBuyerData(this.buyerData);
            this.snackBar.open('Shipping address updated successfully!', 'Close', { duration: 3000 });
          },
          error: (err: any) => {
            console.error('Error:', err);
            this.snackBar.open('Error updating shipping address', 'Close', { duration: 3000 });
          },
        });
      }
    } else {
      this.snackBar.open('Please fill up all the details.', 'Close', { duration: 3000 });
    }
  }

  updatePassword() {
    if (this.passForm.valid) {
      const formValues = this.passForm.value;

      if (this.isSeller) {
        const updatedSeller = {
          ...this.seller,
          password: formValues.new,
        };

        this.sellerS.updateSellerInfo(updatedSeller).subscribe({
          next: (updatedData: sellers) => {
            this.seller = updatedData;
            this.sellerData.seller = updatedData;
            this.sellerS.setSellerData(this.sellerData);
            this.snackBar.open('Password updated successfully.', 'Close', { duration: 3000 });
            this.passForm.reset();
          },
          error: (err: any) => {
            this.snackBar.open(err.error.message || 'Password update failed.', 'Close', { duration: 3000 });
          }
        });
      } else {
        const updatedBuyer = {
          ...this.buyer,
          password: formValues.new,
        };

        this.buyerS.updateBuyerInfo(updatedBuyer).subscribe({
          next: (updatedData: buyers) => {
            this.buyer = updatedData;
            this.buyerData.buyer = updatedData;
            this.buyerS.setBuyerData(this.buyerData);
            this.snackBar.open('Password updated successfully.', 'Close', { duration: 3000 });
            this.passForm.reset();
          },
          error: (err: any) => {
            this.snackBar.open(err.error.message || 'Password update failed.', 'Close', { duration: 3000 });
          }
        });
      }
    } else {
      this.snackBar.open('Please enter password.', 'Close', { duration: 3000 });
    }
  }

  getCurrentEmail(): string {
    return this.isSeller ? this.seller.email : this.buyer.email;
  }

  getIsEmailVerified(): boolean {
    return this.isSeller ? (this.seller.isEmailVerified ?? false) : (this.buyer.isEmailVerified ?? false);
  }
}
