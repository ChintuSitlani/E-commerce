import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { SellerHomeComponent } from './seller-home/seller-home.component';
import { BuyerHomeComponent } from './buyer-home/buyer-home.component';
import { AuthGuard } from './auth.guard';
import { ProductCardComponent } from './product-card/product-card.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SellerSignupComponent } from './seller-signup/seller-signup.component';
import { SellerLoginComponent } from './seller-login/seller-login.component';
import { CartComponent } from './cart/cart.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { OrdersComponent } from './orders/orders.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';


export const routes: Routes = [
    { path: '', component: HomeComponent}, // Default rongute
    { path: 'sellerSignup', component: SellerSignupComponent },
    { path: 'buyerSignup', component: SignupComponent },
    { path: 'sellerLogin',  component: SellerLoginComponent },
    { path: 'buyerLogin', component: LoginComponent },
    { path: 'seller-home', component: SellerHomeComponent, canActivate: [AuthGuard] },
    { path: 'buyer-home', component: BuyerHomeComponent},
    { path: 'product-card', component: ProductCardComponent},
    { path: 'page-not-found', component: PageNotFoundComponent },
    { path: 'cart', component: CartComponent },
    { path: 'my-account' , component: MyAccountComponent},
    { path: 'orders', component: OrdersComponent},
    { path: 'checkout', component: CheckoutComponent},
    { path: 'order-confirmation', component: OrderConfirmationComponent},
    { path: 'search-results', component: SearchResultsComponent},
    { path: 'product-detail', component: ProductDetailComponent},
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },

    { path: '**', redirectTo: 'page-not-found'} 
];
