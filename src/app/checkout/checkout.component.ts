import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { buyers, OrderItem, OrderSummary } from '../data-type';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../services/product.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { LayoutModule } from '@angular/cdk/layout';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    FormsModule,
    MatCheckboxModule,
    MatExpansionModule,
    LayoutModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  buyerData: buyers = JSON.parse(localStorage.getItem('buyer') || '{}');
  items: OrderItem[] = [];
  billingSameAsShipping: boolean = false;
  orderId: string = '';

  summary = {
    subTotal: 0,
    itemDiscountTotal: 0,
    couponDiscount: 0,
    taxTotal: 0,
    total: 0,
  };
  isDesktop = true;
  constructor(
    private fb: FormBuilder,
    private orderS: OrderService,
    private router: Router,
    private snackBar: MatSnackBar,
    private productS: ProductService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.checkoutForm = this.fb.group({
      shipping: this.fb.group({
        fullName: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zip: ['', Validators.required]
      }),
      billing: this.fb.group({
        fullName: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zip: ['', Validators.required]
      }),
      paymentMethod: ['', Validators.required],
      billingSameAsShipping: [false]
    });
  }

  ngOnInit(): void {
    const storedItems = localStorage.getItem('checkoutItems');
    this.items = storedItems ? JSON.parse(storedItems) : [];
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isDesktop = !result.matches;
      });
    this.checkoutForm.patchValue({
      shipping: {
        address: this.buyerData.shippingAddress,
        zip: this.buyerData.pin,
        state: this.buyerData.state,
        city: this.buyerData.city,
      }
    });

    this.calculateSummary();

  }

  calculateSummary(): void {
    const subTotal = this.items.reduce((sum, item) =>
      sum + ((item.productId?.priceExclTax ?? 0) * item.quantity), 0);
    const itemDiscountTotal = this.items.reduce((sum, item) =>
      sum + (item.productId.discountAmt ?? 0), 0);
    const taxTotal = this.items.reduce((sum, item) =>
      sum + (((item.productId?.priceExclTax ?? 0) * (item.productId?.taxRate ?? 0) / 100) * item.quantity), 0);

    this.summary = {
      subTotal,
      itemDiscountTotal,
      couponDiscount: 0,
      taxTotal,
      total: subTotal - itemDiscountTotal + taxTotal
    };
  }

  placeOrder(): void {
    if (this.checkoutForm.valid) {
      const orderDetails: OrderSummary = {
        buyerId: this.buyerData._id,
        sellerId: this.items[0]?.productId?.sellerId ?? '',
        items: this.items,
        totalAmount: this.calculateTotal(),
        shippingAddress: this.checkoutForm.value.shipping,
        _id: undefined,
        subTotal: this.calculateSubtotal(),
        discountTotal: this.calculateDiscount(),
        couponDiscount: 0,
        couponCode: '',
        shippingCharges: 0,
        billingAddress: this.checkoutForm.value.billing,
        paymentMethod: this.checkoutForm.value.paymentMethod,
        taxTotal: this.calculateTax(),
        status: 'pending',
        paymentStatus: 'pending'
      };

      this.orderS.saveOrder(orderDetails).subscribe({
        next: (res) => {
          this.orderId = res._id || 'N/A';
          for (const item of this.items) {
            this.removeItemFromCart(item._id);
          }
          localStorage.removeItem('checkoutItems');
          this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/order-confirmation'], {
            state: { orderId: this.orderId }
          });
        },
        error: () => {
          this.snackBar.open('Failed to place order.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.checkoutForm.markAllAsTouched();
    }
  }

  toggleBillingPrefill(): void {
    const billingGroup = this.checkoutForm.get('billing');
    const shippingValues = this.checkoutForm.get('shipping')?.value;

    if (this.billingSameAsShipping && billingGroup) {
      billingGroup.patchValue(shippingValues);
      billingGroup.disable();
    } else {
      billingGroup?.reset();
      billingGroup?.enable();
    }
  }

  removeItemFromCart(itemId: string): void {
    this.productS.removeFromCart(itemId).subscribe();
  }

  calculateSubtotal(): number {
    return this.items.reduce((sum, item) =>
      sum + ((item.productId?.priceExclTax ?? 0) * item.quantity), 0);
  }

  calculateDiscount(): number {
    return this.items.reduce((sum, item) =>
      sum + (item.productId.discountAmt ?? 0), 0);
  }

  calculateTax(): number {
    return this.items.reduce((sum, item) =>
      sum + (((item.productId?.priceExclTax ?? 0) * (item.productId?.taxRate ?? 0) / 100) * item.quantity), 0);
  }

  calculateTotal(): number {
    return this.calculateSubtotal() - this.calculateDiscount() + this.calculateTax();
  }
}
