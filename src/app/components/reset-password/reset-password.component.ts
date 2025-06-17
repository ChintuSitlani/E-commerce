import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuyerService } from '../../services/buyer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { buyerLocalStorageData } from '../../data-type';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  token = '';
  passwordForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private buyer: BuyerService,
    private snack: MatSnackBar,
    private router: Router,
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

  }
  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }
  resetPassword() {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    this.buyer.resetPasswordWithToken(this.token, this.passwordForm.value.newPassword).subscribe({
      next: (res: buyerLocalStorageData) => {
        this.snack.open('Password updated successfully', 'Close', { duration: 3000 });
        this.buyer.setBuyerData(res);
        this.buyer.isBuyerLoggedIn.next(true);
        this.router.navigate(['buyer-home']);;
      },
      error: (err) => {
        this.isLoading = false;
        let errorMessage = 'An error occurred';
        if (err.error?.message?.includes('expired')) {
          errorMessage = 'The reset link has expired. Please request a new one.';
        } else if (err.error?.message?.includes('Invalid')) {
          errorMessage = 'Invalid reset link. Please check the link or request a new one.';
        }
        this.snack.open(errorMessage, 'Close', { duration: 5000 });
      },
      complete: () => this.isLoading = false
    });
  }
}