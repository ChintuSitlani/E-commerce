import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    FormsModule,
    MatCheckboxModule,
    MatCardActions
  ],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent {
  orderId: string | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.orderId = navigation?.extras?.state?.['orderId'] || 'N/A';
  }

  backToHome() {
    this.router.navigate(['/']);
  }
}
