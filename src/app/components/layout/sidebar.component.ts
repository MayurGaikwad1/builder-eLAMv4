import { Component, Input, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../shared/services/auth.service";

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavItem[];
  requiredRoles?: string[];
}

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="bg-white shadow-sm border-r border-secondary-200 h-full w-64 flex flex-col"
    >
      <!-- Logo and Title -->
      <div class="px-6 py-4 border-b border-secondary-200">
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-secondary-900">ELAM</h1>
            <p class="text-xs text-secondary-500">Access Management</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <ng-container *ngFor="let item of navItems()">
          <div>
            <a
              [routerLink]="item.route"
              routerLinkActive="sidebar-link-active"
              #rla="routerLinkActive"
              [class]="
                rla.isActive
                  ? 'sidebar-link sidebar-link-active'
                  : 'sidebar-link sidebar-link-inactive'
              "
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path [attr.d]="getIconPath(item.icon)"></path>
              </svg>
              <span class="flex-1">{{ item.label }}</span>
              <span
                *ngIf="item.badge"
                class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {{ item.badge }}
              </span>
            </a>

            <!-- Sub-navigation -->
            <div
              *ngIf="item.children && rla.isActive"
              class="ml-8 mt-1 space-y-1"
            >
              <a
                *ngFor="let child of item.children"
                [routerLink]="child.route"
                routerLinkActive="text-primary-600"
                class="block px-3 py-1 text-sm text-secondary-600 hover:text-secondary-900"
              >
                {{ child.label }}
              </a>
            </div>
          </div>
        </ng-container>
      </nav>

      <!-- User Info -->
      <div
        class="px-4 py-4 border-t border-secondary-200"
        *ngIf="currentUser()"
      >
        <div class="flex items-center space-x-3">
          <div
            *ngIf="currentUser()?.avatar"
            class="w-8 h-8 rounded-full overflow-hidden"
          >
            <img
              [src]="currentUser()?.avatar"
              [alt]="currentUser()?.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            *ngIf="!currentUser()?.avatar"
            class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
          >
            <span class="text-sm font-medium text-primary-700">
              {{ getInitials(currentUser()?.name || "") }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-secondary-900 truncate">
              {{ currentUser()?.name }}
            </p>
            <p class="text-xs text-secondary-500 truncate capitalize">
              {{ currentUser()?.role }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;

  currentUser = signal<any>(null);

  private allNavItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: "dashboard",
      route: "/dashboard",
      requiredRoles: ["admin", "manager", "user"],
    },
    {
      label: "Access Requests",
      icon: "requests",
      route: "/requests",
      badge: 5,
      requiredRoles: ["admin", "manager", "user"],
      children: [
        { label: "My Requests", icon: "", route: "/requests/my-requests" },
        { label: "New Request", icon: "", route: "/requests/new" },
        { label: "Request History", icon: "", route: "/requests/history" },
      ],
    },
    {
      label: "Renewal Requests Approval",
      icon: "approvals",
      route: "/approvals",
      badge: 3,
      requiredRoles: ["admin", "manager"],
    },
    {
      label: "User Management",
      icon: "users",
      route: "/users",
      requiredRoles: ["admin"],
      children: [
        { label: "All Users", icon: "", route: "/users/all" },
        { label: "Provisioning", icon: "", route: "/users/provisioning" },
        { label: "Deprovisioning", icon: "", route: "/users/deprovisioning" },
      ],
    },
    {
      label: "Audit & Compliance",
      icon: "audit",
      route: "/audit",
      requiredRoles: ["admin"],
      children: [
        { label: "Audit Logs", icon: "", route: "/audit/logs" },
        { label: "Compliance Reports", icon: "", route: "/audit/compliance" },
        { label: "Access Reviews", icon: "", route: "/audit/reviews" },
      ],
    },
    {
      label: "Access Management",
      icon: "access_management",
      route: "/access-management",
      requiredRoles: ["admin"],
      children: [
        {
          label: "User Access Requests",
          icon: "",
          route: "/access-management/user-access",
        },
        {
          label: "Exception Handling",
          icon: "",
          route: "/access-management/exceptions",
        },
        {
          label: "Owner Dashboard",
          icon: "",
          route: "/access-management/app-owner-dashboard",
        },
      ],
    },
    {
      label: "Administration",
      icon: "admin",
      route: "/admin",
      requiredRoles: ["admin"],
      children: [
        { label: "Roles & Policies", icon: "", route: "/admin/roles" },
        { label: "Integrations", icon: "", route: "/admin/integrations" },
        { label: "System Config", icon: "", route: "/admin/config" },
      ],
    },
  ];

  // Computed property for filtered navigation items
  navItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    return this.allNavItems.filter((item) => {
      // Hide Access Requests for Admin, Manager & User roles
      if (item.label === "Access Requests" && ["admin", "manager", "user"].includes(user.role)) {
        return false;
      }

      // Hide User Management & Access Management for Manager & User roles
      if (
        (item.label === "User Management" || item.label === "Access Management") &&
        ["manager", "user"].includes(user.role)
      ) {
        return false;
      }

      if (!item.requiredRoles) return true;
      return item.requiredRoles.includes(user.role);
    });
  });

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });
  }

  getInitials(name: string): string {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }

  getIconPath(iconName: string): string {
    const icons: Record<string, string> = {
      dashboard:
        "M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z",
      requests:
        "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      approvals: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      users:
        "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
      audit:
        "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
      access_management:
        "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      admin:
        "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    };
    return icons[iconName] || icons["dashboard"];
  }
}
