import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';
import { SellerService } from '../services/seller.service';
import { BuyerService } from '../services/buyer.service';
import { Product } from '../data-type';
import { ProductService } from '../services/product.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core'; // this is where mat-option comes from
import { Router } from '@angular/router';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    MatAutocompleteModule,
    MatOptionModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  logoUrl = 'https://image.pngaaa.com/550/811550-middle.png'
  isSellerLogin = false;
  searchText: string = '';
  cartItems: number = 0; 
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
 isBuyerLogin = false;
   
  constructor(
    private cartService: CartService,
    private seller: SellerService,
    private buyer: BuyerService,
    private productService: ProductService,
    private router: Router) { }

  ngOnInit() {
    this.seller.isSellerLoggedIn.subscribe((status: boolean) => {
      this.isSellerLogin = status;
    });
    this.buyer.isBuyerLoggedIn.subscribe((status: boolean) => {
      this.isBuyerLogin = status;
    });
    this.productService.getProducts().subscribe(products => {
      this.allProducts = products;
    });
    this.cartService.getCartCount().subscribe(count => {
      this.cartItems = count;
    });
  }
  logout() {
    const userConfirmed = confirm('Are you sure you want to logout?');
    if (userConfirmed) {
      if (this.isSellerLogin) {
        this.seller.sellerLogout();
      } else if (this.isBuyerLogin) {
        this.buyer.buyerLogout();
      } else {
        console.error("No one is logged in");
        alert("No user is currently logged in.");
      }
    } else {
      console.log("Logout canceled by the user.");
    }
  }
    
  onSearchInput() {
    const value = this.searchText?.toLowerCase() || '';
    this.filteredProducts = this.allProducts.filter(product =>
      product.productName?.toLowerCase().includes(value)
    );
  }

  onOptionSelected(productId: string) {
    this.searchText = ''; 
    this.router.navigate(['/product-card'], { queryParams: { id: productId } });
  }
}
