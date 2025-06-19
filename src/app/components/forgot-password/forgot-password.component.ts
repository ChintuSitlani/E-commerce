import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuyerService } from '../../services/buyer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SellerService } from '../../services/seller.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  emailForm: FormGroup;
  isLoading = false;
  userType: string = '';
  constructor(
    private fb: FormBuilder,
    private buyer: BuyerService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private seller: SellerService
  ) {
    this.userType = this.route.snapshot.queryParamMap.get('userType') || '';

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendLink() {
    const email = this.emailForm.value.email;
    if (this.userType === 'buyer') {
      this.buyer.sendResetLink(email).subscribe({
        next: () => this.snackBar.open('Reset link sent to email', 'Close', { duration: 3000 }),
        error: (err: { error: { message: any; }; }) => this.snackBar.open(err.error.message || 'Error', 'Close', { duration: 3000 })
      });
    }else if (this.userType === 'seller') {
      this.seller.sendResetLink(email).subscribe({
        next: () => this.snackBar.open('Reset link sent to email', 'Close', { duration: 3000 }),
        error: (err: { error: { message: any; }; }) => this.snackBar.open(err.error.message || 'Error', 'Close', { duration: 3000 })
      });
    }
    else{
      this.snackBar.open('Invalid user type', 'Close', { duration: 3000 });
    }


  }
}
