import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
    {path: '', component: HomeComponent}, // Default route
    { path: 'login/:user', component: LoginComponent },
    { path: 'signin/:user', component: SignupComponent } 
];
