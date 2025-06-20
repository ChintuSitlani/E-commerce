import { Component, OnInit, OnDestroy, ViewChild, ElementRef  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription, debounceTime, takeUntil } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { SellerService } from '../services/seller.service';
import { BuyerService } from '../services/buyer.service';
import { ProductService } from '../services/product.service';
import { CartService } from '../cart.service';
import { Product } from '../data-type';

const DEFAULT_FILTERS = {
  brand: '',
  minPrice: 0,
  maxPrice: 1000000
};

const MATERIAL_MODULES = [
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatFormFieldModule,
  MatInputModule,
  MatAutocompleteModule,
  MatOptionModule
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ...MATERIAL_MODULES
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  isSellerLogin = false;
  isBuyerLogin = false;
  searchText = '';
  cartItems = 0;
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  userEmail = '';

  filters = { ...DEFAULT_FILTERS };
  totalCount = 0;
  currentSkip = 0;
  readonly limit = 10;

  searchSubject = new Subject<string>();

   @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private cartService: CartService,
    private sellerService: SellerService,
    private buyerService: BuyerService,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const buyerData = this.buyerService.getBuyerData();
    this.userEmail = buyerData?.buyer?.email || '';

    this.searchSubject.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchText = value;
      this.onSearchInput();
    });
  }

  ngOnInit(): void {
    this.filteredProducts = [];

    this.subscriptions.push(
      this.sellerService.isSellerLoggedIn.subscribe(status => {
        this.isSellerLogin = status;
      })
    );

    this.subscriptions.push(
      this.buyerService.isBuyerLoggedIn.subscribe(status => {
        this.isBuyerLogin = status;
        if (status) this.updateCartCount();
      })
    );

    this.subscriptions.push(
      this.cartService.getCartCount().subscribe(count => {
        this.cartItems = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  logout(): void {
    if (!this.isSellerLogin && !this.isBuyerLogin) {
      this.snackBar.open('No user is currently logged in.', 'Close', { duration: 2500 });
      return;
    }

    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      this.isSellerLogin
        ? this.sellerService.sellerLogout()
        : this.buyerService.buyerLogout();
    }
  }

  onSearchInput(): void {
    const search = this.searchText.trim().toLowerCase();
    if (!search) {
      this.filteredProducts = [];
      return;
    }

    this.currentSkip = 0;

    this.productService.getResultProducts(search, this.filters, this.currentSkip, this.limit)
      .subscribe({
        next: response => {
          this.allProducts = response.products;
          this.filteredProducts = this.allProducts.filter(p =>
            p.productName.toLowerCase().includes(search)
          );
          this.totalCount = response.total;
          this.currentSkip += this.limit;
        },
        error: () => {
          this.filteredProducts = [];
        }
      });
  }

  onOptionSelected(product: Product): void {
    this.searchText = '';
    this.router.navigate(['/product-detail'], { queryParams: { id: product._id } });
  }

  updateCartCount(): void {
    const buyerId = this.buyerService.getBuyerData()?.buyer?._id;
    if (!buyerId) return;

    this.productService.getCartItems(buyerId).subscribe(items => {
      this.cartService.setCartCount(items.length);
    });
  }

  goToMyAccount(): void {
    this.router.navigate(['/my-account']);
  }

  goToMyOrders(): void {
    this.router.navigate(['/orders']);
  }

  goToSearchResults(): void {
    const searchQuery = this.searchText.trim();
    if (!searchQuery) {
      this.snackBar.open('Please enter something.', 'Close', { duration: 2500 });
      return;
    }

    const exactMatch = this.filteredProducts.find(
      p => p.productName.toLowerCase() === searchQuery.toLowerCase()
    );

    this.router.navigate(
      exactMatch
        ? ['/product-detail']
        : ['/search-results'],
      { queryParams: exactMatch ? { id: exactMatch._id } : { q: searchQuery } }
    );

    this.filteredProducts = [];
    this.searchInput.nativeElement.blur();
  }

  displayProductName(product: Product): string {
    return '';
  }
}