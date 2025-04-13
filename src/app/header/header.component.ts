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
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isSellerLogin = false;
  searchText: string = '';
  cartItems: number = 3; // Simulated dynamic cart count
 
  
  constructor(private seller: SellerService) {}

  ngOnInit() {
    this.seller.isSellerLoggedIn.subscribe((status: boolean) => {
      this.isSellerLogin = status;
    });
  }
}
