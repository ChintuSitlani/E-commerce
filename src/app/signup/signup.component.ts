import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { SellerService } from '../services/seller.service';
import { userData} from '../data-type';
import { BuyerService } from '../services/buyer.service';
import { error } from 'console';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signinForm: FormGroup;
  paramUserType: string = '';

  userData: userData = {
    name: '',
    email: '',
    password: '',
  };


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private seller: SellerService,
    private buyer: BuyerService,

    ) {
    this.signinForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.paramUserType = this.route.snapshot.paramMap.get('user') || '';
    if (this.signinForm.valid) {
      this.userData = {
        ...this.userData,
        name: this.signinForm.value.name,
        email: this.signinForm.value.email,
        password: this.signinForm.value.password // Only save the password
      };
      if(this.paramUserType === 'seller')
      {
        this.seller.sellerSignup(this.userData, this.paramUserType);
      }
      else if(this.paramUserType === 'buyer')
      {
        this.buyer.buyerSignup(this.userData, this.paramUserType);
      }else
        throw new Error('Invalid user type '+ this.paramUserType);

      this.signinForm.reset();
    }
  } 
  ngOnInit() {
    if (this.paramUserType === null 
      || this.paramUserType === undefined
      || this.paramUserType === '') {
        this.paramUserType = this.paramUserType = this.route.snapshot.paramMap.get('user') ?? '';;
    }
    if (this.paramUserType === 'seller') {
      this.seller.reloadSeller(this.paramUserType);
    } else if (this.paramUserType === 'buyer') {
      this.buyer.reloadBuyer(this.paramUserType);
    }
  }
}