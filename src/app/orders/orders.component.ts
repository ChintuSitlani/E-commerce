import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../services/order.service';
import { OrderSummary, buyerLocalStorageData, sellerLocalStorageData } from '../data-type';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    ReactiveFormsModule,
    MatDivider,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: OrderSummary[] = [];
  filteredOrders: OrderSummary[] = [];
  readonly CANCELLED_STATUS = 'cancelled';
  buyerData: buyerLocalStorageData = JSON.parse(localStorage.getItem('buyer') || '{}');
  sellerData: sellerLocalStorageData = JSON.parse(localStorage.getItem('seller') || '{}');
  isSeller = false;
  selectedStatus = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Pagination values
  limit = 5;
  page = 1;

  statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.isSeller = !!this.sellerData?.seller?._id;
    this.loadOrders();
  }

  loadOrders(): void {
    const filters = this.buildFilters();
    filters.limit = this.limit;
    filters.page = this.page;

    if (this.isSeller && this.sellerData.seller?._id) {
      this.orderService.getOrdersForSeller(this.sellerData.seller._id, filters).subscribe({
        next: (response: any) => {
          this.orders = response.orders || response || [];
          this.filteredOrders = [...this.orders];
        },
        error: err => {
          this.snackBar.open('Error loading orders: ' + err, 'Close', { duration: 3000 });
          console.error('Error loading seller orders:', err);
        }
      });
    } else if (this.buyerData.buyer?._id) {
      this.orderService.getOrdersForBuyer(this.buyerData.buyer._id, filters).subscribe({
        next: (response: any) => {
          this.orders = response.orders || response || [];
          this.filteredOrders = [...this.orders];
        },
        error: err => {
          this.snackBar.open('Error loading orders: ' + err, 'Close', { duration: 3000 });
          console.error('Error loading buyer orders:', err);
        }
      });
    }
  }


  applyFilters(): void {
    this.page = 1; // reset to first page
    this.loadOrders();
  }

  resetFilters(): void {
    this.selectedStatus = '';
    this.startDate = null;
    this.endDate = null;
    this.page = 1;
    this.loadOrders();
  }

  nextPage(): void {
    this.page++;
    this.loadOrders();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadOrders();
    }
  }

  private buildFilters(): any {
    const filters: any = {};
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.startDate) filters.startDate = this.startDate.toISOString();
    if (this.endDate) filters.endDate = this.endDate.toISOString();
    return filters;
  }

  getFinalPrice(priceExclTax: number, taxRate: number, disAmt: number): number {
    return parseFloat((this.getPriceAfterTax(priceExclTax, taxRate) - disAmt).toFixed(2));
  }
  getPriceAfterTax(priceExclTax: number, taxRate: number): number {
    return priceExclTax + (priceExclTax * taxRate / 100);
  }
  cancelOrder(orderId: string): void {
    if (this.isSeller) return;

    const confirmed = confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;

    this.orderService.changeOrderStatus(orderId, 'cancelled').subscribe({
      next: () => {
        this.snackBar.open('Order cancelled successfully!', 'Close', { duration: 3000 });
        this.loadOrders();
      },
      error: err => {
        this.snackBar.open('Error cancelling order: ' + err.message, 'Close', { duration: 3000 });
      }
    });
  }
}