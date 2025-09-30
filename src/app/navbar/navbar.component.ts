import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SellerService } from '../services/seller.service';
import { BuyerService } from '../services/buyer.service';
import { ProductService } from '../services/product.service';
import { CartService } from '../cart.service';
import { Product } from '../data-type';

import { SearchBarComponent } from '../shared/search-bar/search-bar.component';
import { CartIconComponent } from '../shared/cart-icon/cart-icon.component';

const MATERIAL_MODULES = [
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatDividerModule
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchBarComponent, CartIconComponent, ...MATERIAL_MODULES],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hoverTimer: any;

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  isSellerLogin = false;
  isBuyerLogin = false;
  cartItems = 0;
  userEmail = '';
  isHovered = false;
  isSideMenuOpen = false;

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
  }

  ngOnInit(): void {
    this.sellerService.isSellerLoggedIn
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => this.isSellerLogin = status);

    this.buyerService.isBuyerLoggedIn
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isBuyerLogin = status;
        if (status) this.updateCartCount();
      });

    this.cartService.getCartCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.cartItems = count);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearHoverTimer();
  }

  /** ----------------- Side Menu Methods ----------------- */

  toggleSideMenu(): void {
    this.isSideMenuOpen = !this.isSideMenuOpen;
    // Prevent body scroll when menu is open
    if (this.isSideMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeSideMenu(): void {
    this.isSideMenuOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Close side menu on desktop screens
    if (event.target.innerWidth > 768 && this.isSideMenuOpen) {
      this.closeSideMenu();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isSideMenuOpen) {
      this.closeSideMenu();
    }
  }

  /** ----------------- Navigation Methods ----------------- */

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /** ----------------- Account Button Handlers ----------------- */

  onAccountBtnHover(): void {
    this.isHovered = true;
    if (this.isBuyerLogin || this.isSellerLogin) {
      this.hoverTimer = setTimeout(() => {
        if (this.isHovered && this.menuTrigger && !this.menuTrigger.menuOpen) {
          this.menuTrigger.openMenu();
        }
      }, 500);
    } else {
      this.hoverTimer = setTimeout(() => {
        if (this.isHovered && this.menuTrigger && !this.menuTrigger.menuOpen) {
          this.menuTrigger.openMenu();
        }
      }, 500);
    }
  }

  onAccountBtnLeave(): void {
    this.isHovered = false;
    this.clearHoverTimer();

    if (this.menuTrigger?.menuOpen) {
      setTimeout(() => {
        if (!this.isHovered && this.menuTrigger.menuOpen) {
          this.menuTrigger.closeMenu();
        }
      }, 3000);
    }
  }

  onAccountBtnClick(): void {
    this.clearHoverTimer();

    if (!this.isBuyerLogin && !this.isSellerLogin) {
      this.router.navigate(['/buyerLogin']);
      this.menuTrigger.closeMenu();
    } else if (this.menuTrigger) {
      this.menuTrigger.menuOpen ? this.menuTrigger.closeMenu() : this.menuTrigger.openMenu();
    }
  }

  onMenuMouseEnter(): void {
    this.isHovered = true;
  }

  onMenuMouseLeave(): void {
    this.isHovered = false;
    setTimeout(() => {
      if (!this.isHovered && this.menuTrigger?.menuOpen) {
        this.menuTrigger.closeMenu();
      }
    }, 5000);
  }

  /** ----------------- User Actions ----------------- */

  logout(): void {
    if (!this.isSellerLogin && !this.isBuyerLogin) {
      this.snackBar.open('No user is currently logged in.', 'Close', { duration: 2500 });
      return;
    }

    const snackBarRef = this.snackBar.open(
      'Are you sure you want to logout?',
      'Confirm',
      {
        duration: 5000,
        verticalPosition: 'top',
        panelClass: ['logout-snackbar']
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.isSellerLogin ? this.sellerService.sellerLogout() : this.buyerService.buyerLogout();
      this.closeSideMenu();
      this.snackBar.open('Logged out successfully!', 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    });
  }

  updateCartCount(): void {
    const buyerId = this.buyerService.getBuyerData()?.buyer?._id;
    if (!buyerId) return;

    this.productService.getCartItems(buyerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => this.cartService.setCartCount(items.length));
  }

  /** ----------------- Navigation ----------------- */

  goToMyAccount(): void {
    this.router.navigate(['/my-account']);
  }

  goToMyOrders(): void {
    this.router.navigate(['/orders']);
  }

  handleSearchResult(product: Product | string): void {
    if (typeof product === 'string') {
      this.router.navigate(['/search-results'], { queryParams: { q: product } });
    } else {
      this.router.navigate(['/product-detail'], { queryParams: { id: product._id } });
    }
  }

  /** ----------------- Helpers ----------------- */

  private clearHoverTimer(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }
}