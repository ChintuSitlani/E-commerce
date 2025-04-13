import { AppComponent } from "./app.component";
import { HeaderComponent } from "./header/header.component";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { SellerAddProdComponent } from "./seller-add-prod/seller-add-prod.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    SellerAddProdComponent
  ],
  imports: [
    MatCardModule,
    MatButtonModule,
    BrowserModule,
    FormsModule,
    HttpClient
  ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }