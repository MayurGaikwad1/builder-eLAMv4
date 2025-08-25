import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { AuthService, User } from "../../shared/services/auth.service";
import { ModalService } from "../../shared/services/modal.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white shadow-sm border-b border-secondary-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            (click)="onMenuToggle()"
            class="p-2 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 lg:hidden"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>

          <div>
            <h1 class="text-xl font-semibold text-secondary-900">
              {{ title }}
            </h1>
            <p *ngIf="subtitle" class="text-sm text-secondary-500">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Search -->
          <div class="hidden md:block relative">
            <input
              type="text"
              placeholder="Search requests, users..."
              class="w-64 pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg
              class="absolute left-3 top-2.5 w-5 h-5 text-secondary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>

          <!-- Notifications -->
          <div class="relative">
            <button
              class="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg relative"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
              <span
                class="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"
              ></span>
            </button>
          </div>

          <!-- Quick Actions -->
          <button
            *ngIf="showNewRequestButton()"
            (click)="onNewRequest()"
            class="btn-primary"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            New Request
          </button>

          <!-- User Menu -->
          <div class="relative">
            <button
              (click)="toggleUserMenu()"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary-100"
            >
              <!-- User Avatar -->
              <div
                *ngIf="currentUser()?.avatar"
                class="w-8 h-8 rounded-full overflow-hidden"
              >
                <img
                  [src]="currentUser()!.avatar"
                  [alt]="currentUser()!.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <!-- Fallback to initials -->
              <div
                *ngIf="!currentUser()?.avatar"
                class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
              >
                <span class="text-sm font-medium text-primary-700">{{
                  getUserInitials()
                }}</span>
              </div>

              <!-- User Info (hidden on mobile) -->
              <div class="hidden md:block text-left">
                <div class="text-sm font-medium text-secondary-900">
                  {{ currentUser()?.name || "User" }}
                </div>
                <div class="text-xs text-secondary-500">
                  {{ getUserRole() }}
                </div>
              </div>

              <svg
                class="w-4 h-4 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            <!-- User Menu Dropdown -->
            <div
              *ngIf="showUserMenu()"
              class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
            >
              <div class="p-4 border-b border-secondary-200">
                <div class="flex items-center space-x-3">
                  <div
                    *ngIf="currentUser()?.avatar"
                    class="w-10 h-10 rounded-full overflow-hidden"
                  >
                    <img
                      [src]="currentUser()!.avatar"
                      [alt]="currentUser()!.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    *ngIf="!currentUser()?.avatar"
                    class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
                  >
                    <span class="text-sm font-medium text-primary-700">{{
                      getUserInitials()
                    }}</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-secondary-900">
                      {{ currentUser()?.name || "User" }}
                    </div>
                    <div class="text-xs text-secondary-500">
                      {{ currentUser()?.email || "" }}
                    </div>
                    <div class="text-xs text-primary-600">
                      {{ getUserRole() }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="py-2">
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-3 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  My Profile
                </a>
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-3 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  Account Settings
                </a>
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-3 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Help & Support
                </a>
              </div>

              <div class="border-t border-secondary-200 py-2">
                <button
                  (click)="onLogout()"
                  class="block w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          <!-- Click outside to close menu -->
          <div
            *ngIf="showUserMenu()"
            class="fixed inset-0 z-40"
            (click)="showUserMenu.set(false)"
          ></div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Input() title = "Dashboard";
  @Input() subtitle = "";
  @Output() menuToggle = new EventEmitter<void>();
  @Output() newRequest = new EventEmitter<void>();

  protected readonly showUserMenu = signal(false);
  protected readonly currentUser = signal<User | null>(null);
  protected readonly showNewRequestButton = signal(true);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    // Subscribe to current user
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });

    // Monitor route changes to show/hide New Request button
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        const isRequestsPage = url.includes('/requests');
        this.showNewRequestButton.set(!isRequestsPage);
      });

    // Initial check
    const currentUrl = this.router.url;
    const isRequestsPage = currentUrl.includes('/requests');
    this.showNewRequestButton.set(!isRequestsPage);
  }

  onMenuToggle() {
    this.menuToggle.emit();
  }

  onNewRequest() {
    this.newRequest.emit();
  }

  toggleUserMenu() {
    this.showUserMenu.update((show) => !show);
  }

  onLogout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"]);
    });
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return "U";

    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  }

  getUserRole(): string {
    const user = this.currentUser();
    if (!user) return "";

    switch (user.role) {
      case "admin":
        return "Administrator";
      case "manager":
        return "Manager";
      case "user":
        return "User";
      default:
        return user.role;
    }
  }
}
