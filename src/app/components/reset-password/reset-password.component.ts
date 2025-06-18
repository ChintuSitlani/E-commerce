import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuyerService } from '../../services/buyer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { buyerLocalStorageData, sellerLocalStorageData } from '../../data-type';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SellerService } from '../../services/seller.service';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
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
export class ResetPasswordComponent implements OnDestroy {
  private routeSub: Subscription | undefined;
  userType: string = '';
  token = '';
  passwordForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private buyerService: BuyerService,
    private sellerService: SellerService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.userType = params['userType'] || '';
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  resetPassword(): void {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    const newPassword = this.passwordForm.value.newPassword;

    if (this.userType === 'buyer') {
      this.handlePasswordReset(
        this.buyerService.resetPasswordWithToken(this.token, newPassword),
        this.buyerService.setBuyerData.bind(this.buyerService),
        () => this.buyerService.isBuyerLoggedIn.next(true),
        'buyer-home'
      );
    } else if (this.userType === 'seller') {
      this.handlePasswordReset(
        this.sellerService.resetPasswordWithToken(this.token, newPassword),
        this.sellerService.setSellerData.bind(this.sellerService),
        () => this.sellerService.isSellerLoggedIn.next(true),
        'seller-home'
      );
    } else {
      this.handleInvalidUserType();
    }
  }

  private handlePasswordReset(
    observable: Observable<any>,
    setDataFn: (data: any) => void,
    loginStatusFn: () => void,
    redirectRoute: string
  ): void {
    observable.subscribe({
      next: (res: any) => {
        setDataFn(res);
        loginStatusFn();
        this.showSuccessMessage();
        this.router.navigate([redirectRoute]);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleError(err);
      },
      complete: () => this.isLoading = false
    });
  }

  private showSuccessMessage(): void {
    this.snackBar.open('Password updated successfully', 'Close', { duration: 3000 });
  }

  private handleError(err: HttpErrorResponse): void {
    let errorMessage = 'An error occurred';

    if (err.error?.message?.includes('expired')) {
      errorMessage = 'The reset link has expired. Please request a new one.';
    } else if (err.error?.message?.includes('Invalid')) {
      errorMessage = 'Invalid reset link. Please check the link or request a new one.';
    }

    this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
  }

  private handleInvalidUserType(): void {
    this.isLoading = false;
    this.snackBar.open('Invalid user type specified', 'Close', { duration: 5000 });
  }
}