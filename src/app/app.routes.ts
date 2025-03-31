import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { SellerHomeComponent } from './seller-home/seller-home.component';
import { BuyerHomeComponent } from './buyer-home/buyer-home.component';

export const routes: Routes = [
    {path: '', component: HomeComponent}, // Default rongute
    { path: 'login/:user', component: LoginComponent },
    { path: 'signin/:user', component: SignupComponent },
    { path: 'seller-home', component: SellerHomeComponent },
    { path: 'buyer-home', component: BuyerHomeComponent },
];
