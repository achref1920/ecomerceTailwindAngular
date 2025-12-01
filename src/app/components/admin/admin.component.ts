import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiResponse } from '../../models/api.response';
import { Order } from '../../models/order.model';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderStatus } from '../../models/order-status.enum';
import { Address } from '../../models/address.model';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AddressService } from '../../services/address.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  errorMessage: string | null = null;
  isEditMode: boolean = false;
  currentSection: string = 'dashboard';
  isLoadingOrders: boolean = false;

  users: User[] = [];
  userForm: FormGroup;
  selectedUser: User | null = null;
  userModalVisible: boolean = false;

  categories: Category[] = [];
  categoryForm: FormGroup;
  selectedCategory: Category | null = null;
  categoryModalVisible: boolean = false;

  products: Product[] = [];
  productForm: FormGroup;
  selectedProduct: Product | null = null;
  productModalVisible: boolean = false;
  filteredProducts: Product[] = [];
  searchQuery: string = '';

  orders: Order[] = [];
  orderForm: FormGroup;
  selectedOrder: Order | null = null;
  orderModalVisible: boolean = false;
  orderStatuses: string[] = Object.values(OrderStatus);

  address: Address | null = null;
  addressModalVisible: boolean = false;
  sidebarOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private orderService: OrderService,
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      id: [null],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
    this.categoryForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(1)]],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      categoryId: ['', Validators.required]
    });
    this.orderForm = this.fb.group({
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadCategories();
    this.loadProducts();
    this.getAllOrders();
    console.log("Admin component initialized", this.products);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(section: string): void {
    console.log("Navigating to:", section);
    this.currentSection = section;
    // If navigating to orders, ensure data is refreshed
    if (section === 'orders') {
      this.getAllOrders();
    }
  }

  // --------------------------- User Management Section ---------------------------

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response: ApiResponse<User[]>) => {
        if (response.status === true && response.data) {
          console.log(response.message);
          this.users = response.data;
        } else {
          this.errorMessage = response.message || 'An error occurred while fetching users.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while fetching users.';
        console.error('Error fetching users:', error);
      }
    });
  }

  openEditUserModal(user: User): void {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm.patchValue(user);
    this.userModalVisible = true;
  }

  closeUserModal(): void {
    this.userModalVisible = false;
    this.userForm.reset();
    this.selectedUser = null;
    this.isEditMode = false;
  }

  updateUser(): void {
    if (this.userForm.invalid) return;
    const userData = this.userForm.value;

    if (this.isEditMode && this.selectedUser) {
      this.userService.updateUser(this.selectedUser).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === true) {
            console.log(response.message);
            console.log("User updated successfully");
            this.loadUsers();
            this.closeUserModal();
          } else {
            this.errorMessage = response.message || 'An error occurred while updating the user.';
          }
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'An error occurred while updating the user.';
          console.error('Error updating user:', error);
        }
      });
    }
  }

  deleteUser(id: number): void {
    if (!confirm("Are you sure you want to delete this user?")) return;
    this.userService.deleteUser(id).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.status === true) {
          console.log(response.message);
          this.loadUsers();
        } else {
          this.errorMessage = response.message || 'An error occurred while deleting the user.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while deleting the user.';
        console.error('Error deleting user:', error);
      }
    });
  }

  // --------------------------- Product Management Section ---------------------------

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response: ApiResponse<Product[]>) => {
        if (response.status === true && response.data) {
          console.log(response.message);
          this.products = response.data;
          this.filteredProducts = [...this.products];
        } else {
          this.errorMessage = response.message || 'An error occurred while fetching products.';
          this.filteredProducts = [];
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while fetching products.';
        this.filteredProducts = [];
        console.error('Error fetching products:', error);
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredProducts = [...this.products];
      return;
    }

    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }

  openAddProductModal(): void {
    this.isEditMode = false;
    this.productForm.reset();
    this.selectedProduct = null;
    this.loadCategories();
    this.productModalVisible = true;
  }

  openEditProductModal(product: Product): void {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.productForm.patchValue(product);
    this.productModalVisible = true;
  }

  closeProductModal(): void {
    this.productModalVisible = false;
    this.productForm.reset();
    this.selectedProduct = null;
    this.isEditMode = false;
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    const productData = this.productForm.value;
    const categoryId = productData.categoryId;

    if (this.isEditMode && this.selectedProduct) {
      this.productService.updateProduct(this.selectedProduct.id, productData).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === true) {
            console.log(response.message);
            this.closeProductModal();
            this.loadProducts();
          } else {
            this.errorMessage = response.message || 'An error occurred while updating the product.';
          }
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'An error occurred while updating the product.';
          console.error("Error updating product:", error);
        }
      });
    } else {
      this.productService.addProduct(categoryId, productData).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === true) {
            console.log(response.message);
            this.closeProductModal();
            this.loadProducts();
          } else {
            this.errorMessage = response.message || 'An error occurred while adding the product.';
          }
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'An error occurred while adding the product.';
          console.error('Error adding product:', error);
        }
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === true) {
            console.log(response.message);
            this.loadProducts();
            this.onSearch();
          } else {
            this.errorMessage = response.message || 'An error occurred while deleting the product.';
          }
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'An error occurred while deleting the product.';
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  getProductsByCategory(categoryId: number): void {
    if (categoryId) {
      this.productService.getProductsByCategory(categoryId).subscribe({
        next: (response: ApiResponse<Product[]>) => {
          if (response.status === true && response.data) {
            console.log(response.message);
            this.products = response.data;
            this.filteredProducts = [...this.products];
            this.onSearch();
          } else {
            this.errorMessage = response.message || 'An error occurred while fetching products.';
            this.filteredProducts = [];
          }
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'An error occurred while fetching products.';
          this.filteredProducts = [];
          console.error('Error fetching products:', error);
        }
      });
    } else {
      this.loadProducts();
    }
  }

  // --------------------------- Category Management Section ---------------------------

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response: ApiResponse<Category[]>) => {
        if (response.status === true && response.data) {
          console.log(response.message);
          this.categories = response.data;
        } else {
          this.errorMessage = response.message || 'An error occurred while fetching categories.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while fetching categories.';
        console.error('Error fetching categories:', error);
      }
    });
  }

  openAddCategoryModal(): void {
    this.isEditMode = false;
    this.categoryForm.reset();
    this.categoryModalVisible = true;
  }

  openEditCategoryModal(category: Category): void {
    this.isEditMode = true;
    this.selectedCategory = category;
    this.categoryForm.patchValue(category);
    this.categoryModalVisible = true;
  }

  closeCategoryModal(): void {
    this.categoryModalVisible = false;
    this.categoryForm.reset();
    this.selectedCategory = null;
    this.isEditMode = false;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) return;
    const categoryData = this.categoryForm.value;

    if (this.isEditMode && this.selectedCategory) {
      this.categoryService.updateCategory(categoryData.id, categoryData).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === true) {
            console.log(response.message);
            this.closeCategoryModal();
            this.loadCategories();
          } else {
            this.errorMessage = response.message || 'An error occurred while updating the category.';
          }
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'An error occurred while updating the category.';
          console.error("Error updating category:", error);
        }
      });
    } else {
      this.categoryService.addCategory(categoryData).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === true) {
            console.log(response.message);
            this.closeCategoryModal();
            this.loadCategories();
          } else {
            this.errorMessage = response.message || 'An error occurred while adding the category.';
          }
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'An error occurred while adding the category.';
          console.error('Error adding category:', error);
        }
      });
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === true) {
            console.log(response.message);
            this.loadCategories();
          } else {
            this.errorMessage = response.message || 'An error occurred while deleting the category.';
          }
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'An error occurred while deleting the category.';
          console.error('Error deleting category:', error);
        }
      });
    }
  }

  onCategoryChange(event: any): void {
    const categoryId = event.target.value;
    this.getProductsByCategory(categoryId);
  }

  // --------------------------- Orders Management Section ---------------------------

  getAllOrders(): void {
    this.isLoadingOrders = true;
    this.orderService.getAllOrders().subscribe({
      next: (response: ApiResponse<Order[]>) => {
        console.log('Orders API Response:', response); // Debug log
        if (response.status === true && response.data) {
          console.log('Orders fetched successfully:', response.data);
          this.orders = response.data;
        } else {
          this.errorMessage = response.message || 'An error occurred while fetching orders.';
          this.orders = [];
          console.log('No orders data or status false:', response.message);
        }
        this.isLoadingOrders = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while fetching orders.';
        this.orders = [];
        this.isLoadingOrders = false;
        this.cdr.detectChanges();
        console.error('Error fetching orders:', error);
      }
    });
  }

  openEditOrderModal(order: Order): void {
    this.isEditMode = true;
    this.selectedOrder = order;
    this.orderForm.patchValue({
      status: order.status
    });
    this.orderModalVisible = true;
  }

  closeOrderModal(): void {
    this.orderModalVisible = false;
    this.orderForm.reset();
    this.selectedOrder = null;
    this.isEditMode = false;
  }

  updateOrderStatus(): void {
    if (this.orderForm.invalid) {
      console.log("Form is invalid");
      return;
    }

    const updatedStatus = this.orderForm.value.status;
    console.log("Updating order status to:", updatedStatus);

    if (this.isEditMode && this.selectedOrder) {
      this.orderService.updateOrderStatus(this.selectedOrder.id, updatedStatus).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === true) {
            console.log(response.message);
            this.closeOrderModal();
            this.getAllOrders();
          } else {
            this.errorMessage = response.message || 'An error occurred while updating the order status.';
          }
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'An error occurred while updating the order status.';
          console.error("Error updating order status:", error);
        }
      });
    }
  }

  deleteOrder(id: number): void {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }
    this.orderService.deleteOrder(id).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.status === true) {
          console.log(response.message);
          this.getAllOrders();
        } else {
          this.errorMessage = response.message || 'An error occurred while deleting the order.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while deleting the order.';
        console.error('Error deleting order:', error);
      }
    });
  }

  // --------------------------- Address Management Section ---------------------------

  openAddressPopup(addressId: number): void {
    this.address = null;
    this.addressModalVisible = true;
    this.getAddressById(addressId);
  }

  getAddressById(addressId: number): void {
    this.addressService.getAddressById(addressId).subscribe({
      next: (response: ApiResponse<Address>) => {
        if (response.status === true && response.data) {
          console.log(response.message);
          this.address = response.data;
        } else {
          this.errorMessage = response.message || 'An error occurred while fetching address.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while fetching address.';
        console.error('Error fetching address:', error);
      }
    });
  }

  closeAddressPopup(): void {
    this.addressModalVisible = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this.router.navigate(['/admin']);
  }
}