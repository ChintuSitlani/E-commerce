import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { SellerHomeComponent } from './seller-home/seller-home.component';
import { BuyerHomeComponent } from './buyer-home/buyer-home.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    {path: '', component: HomeComponent}, // Default rongute
    { path: 'login/:user', component: LoginComponent },
    { path: 'signup/:user', component: SignupComponent },
    { path: 'seller-home', component: SellerHomeComponent, canActivate: [AuthGuard] },
    { path: 'buyer-home', component: BuyerHomeComponent, canActivate: [AuthGuard]},
];
