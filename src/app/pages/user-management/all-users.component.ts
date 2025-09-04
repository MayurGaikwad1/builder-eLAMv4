import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UserManagementService } from "../../shared/services/user-management.service";
import {
  UserProfile,
  SecurityClearance,
} from "../../shared/interfaces/user-management.interface";
import { UserStatus } from "../../shared/interfaces/user.interface";

@Component({
  selector: "app-all-users",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">All Users</h1>
          <p class="text-secondary-600">
            Comprehensive user directory and management
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Export
          </button>
          <button class="btn-primary">
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
            Add User
          </button>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Search Users</label
            >
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              placeholder="Name, email, employee ID..."
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Department</label
            >
            <select
              [(ngModel)]="filters.department"
              (change)="applyFilters()"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Security">Security</option>
              <option value="Operations">Operations</option>
              <option value="HR">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Status</label
            >
            <select
              [(ngModel)]="filters.status"
              (change)="applyFilters()"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Risk Level</label
            >
            <select
              [(ngModel)]="filters.riskLevel"
              (change)="applyFilters()"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low (0-25)</option>
              <option value="medium">Medium (26-60)</option>
              <option value="high">High (61-85)</option>
              <option value="critical">Critical (86-100)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-semibold text-secondary-900">
              Users ({{ filteredUsers().length }})
            </h2>
            <p class="text-sm text-secondary-600">
              {{ getActiveUsersCount() }} active •
              {{ getInactiveUsersCount() }} inactive
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              (click)="toggleBulkActions()"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              {{ showBulkActions ? "Cancel" : "Bulk Actions" }}
            </button>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div
          *ngIf="showBulkActions"
          class="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <span class="text-sm font-medium text-primary-900"
                >{{ selectedUsers.size }} users selected</span
              >
              <button class="text-sm text-primary-600 hover:text-primary-700">
                Select All
              </button>
              <button class="text-sm text-primary-600 hover:text-primary-700">
                Clear Selection
              </button>
            </div>
            <div class="flex items-center space-x-2">
              <button class="btn-secondary text-sm py-1 px-3">
                Export Selected
              </button>
              <button class="btn-secondary text-sm py-1 px-3">Bulk Edit</button>
              <button class="btn-danger text-sm py-1 px-3">Deactivate</button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th *ngIf="showBulkActions" class="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th class="table-header">User</th>
                <th class="table-header">Department</th>
                <th class="table-header">Status</th>
                <th class="table-header">Risk Score</th>
                <th class="table-header">Last Activity</th>
                <th class="table-header">Compliance</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                *ngFor="let user of filteredUsers(); trackBy: trackByUserId"
                class="hover:bg-secondary-50"
              >
                <td *ngIf="showBulkActions" class="px-6 py-4">
                  <input
                    type="checkbox"
                    [checked]="selectedUsers.has(user.id)"
                    (change)="toggleUserSelection(user.id)"
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td class="table-cell">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-primary-700">
                        {{ getInitials(user.displayName) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-secondary-900">
                        {{ user.displayName }}
                      </p>
                      <p class="text-sm text-secondary-600">{{ user.email }}</p>
                      <p class="text-xs text-secondary-500">
                        {{ user.employeeId }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="table-cell">
                  <div>
                    <p class="font-medium text-secondary-900">
                      {{ user.department }}
                    </p>
                    <p class="text-sm text-secondary-600">{{ user.title }}</p>
                    <p class="text-xs text-secondary-500">
                      {{ user.location }}
                    </p>
                  </div>
                </td>
                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <span
                      [class]="getStatusClass(user.status)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ getStatusLabel(user.status) }}
                    </span>
                    <svg
                      *ngIf="user.mfaEnabled"
                      class="w-4 h-4 text-success-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      title="MFA Enabled"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </td>
                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <span
                      [class]="getClearanceClass(user.securityClearance)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ getClearanceLabel(user.securityClearance) }}
                    </span>
                  </div>
                </td>
                <td class="table-cell">
                  <div>
                    <p class="text-sm text-secondary-900">
                      {{ user.lastActivity | date: "MMM d, y" }}
                    </p>
                    <p class="text-xs text-secondary-500">
                      {{ user.sessionCount }} sessions
                    </p>
                  </div>
                </td>
                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <span
                      [class]="
                        getComplianceClass(user.complianceStatus.isCompliant)
                      "
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{
                        user.complianceStatus.isCompliant
                          ? "Compliant"
                          : "Non-Compliant"
                      }}
                    </span>
                    <span
                      *ngIf="user.complianceStatus.violations.length > 0"
                      class="text-xs text-danger-600"
                    >
                      {{ user.complianceStatus.violations.length }} violations
                    </span>
                  </div>
                </td>
                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <button
                      class="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View
                    </button>
                    <button
                      class="text-secondary-600 hover:text-secondary-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      *ngIf="user.status === 'active'"
                      (click)="deactivateUser(user.id)"
                      class="text-danger-600 hover:text-danger-700 text-sm"
                    >
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="flex items-center justify-between px-6 py-3 border-t border-secondary-200"
        >
          <div class="text-sm text-secondary-600">
            Showing {{ filteredUsers().length }} of
            {{ allUsers().length }} users
          </div>
          <div class="flex items-center space-x-2">
            <button
              class="px-3 py-1 text-sm border border-secondary-300 rounded hover:bg-secondary-50"
            >
              Previous
            </button>
            <button class="px-3 py-1 text-sm bg-primary-600 text-white rounded">
              1
            </button>
            <button
              class="px-3 py-1 text-sm border border-secondary-300 rounded hover:bg-secondary-50"
            >
              2
            </button>
            <button
              class="px-3 py-1 text-sm border border-secondary-300 rounded hover:bg-secondary-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AllUsersComponent implements OnInit {
  allUsers = signal<UserProfile[]>([]);
  filteredUsers = signal<UserProfile[]>([]);
  searchQuery = "";
  showBulkActions = false;
  selectedUsers = new Set<string>();

  filters = {
    department: "",
    status: "",
    riskLevel: "",
  };

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.userManagementService.getUsers().subscribe((users) => {
      this.allUsers.set(users);
      this.filteredUsers.set(users);
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.userManagementService
        .searchUsers(this.searchQuery)
        .subscribe((users) => {
          this.filteredUsers.set(users);
        });
    } else {
      this.applyFilters();
    }
  }

  applyFilters() {
    let filtered = this.allUsers();

    if (this.filters.department) {
      filtered = filtered.filter(
        (user) => user.department === this.filters.department,
      );
    }

    if (this.filters.status) {
      filtered = filtered.filter((user) => user.status === this.filters.status);
    }


    this.filteredUsers.set(filtered);
  }

  toggleBulkActions() {
    this.showBulkActions = !this.showBulkActions;
    if (!this.showBulkActions) {
      this.selectedUsers.clear();
    }
  }

  toggleUserSelection(userId: string) {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  deactivateUser(userId: string) {
    if (confirm("Are you sure you want to deactivate this user?")) {
      this.userManagementService
        .deactivateUser(userId, "Manual deactivation")
        .subscribe(() => {
          this.loadUsers();
        });
    }
  }

  getActiveUsersCount(): number {
    return this.filteredUsers().filter((u) => u.status === UserStatus.Active)
      .length;
  }

  getInactiveUsersCount(): number {
    return this.filteredUsers().filter((u) => u.status !== UserStatus.Active)
      .length;
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  getStatusClass(status: UserStatus): string {
    const classes = {
      [UserStatus.Active]: "bg-success-100 text-success-800",
      [UserStatus.Inactive]: "bg-secondary-100 text-secondary-800",
      [UserStatus.Suspended]: "bg-warning-100 text-warning-800",
      [UserStatus.Terminated]: "bg-danger-100 text-danger-800",
    };
    return classes[status];
  }

  getStatusLabel(status: UserStatus): string {
    const labels = {
      [UserStatus.Active]: "Active",
      [UserStatus.Inactive]: "Inactive",
      [UserStatus.Suspended]: "Suspended",
      [UserStatus.Terminated]: "Terminated",
    };
    return labels[status];
  }


  getClearanceClass(clearance?: SecurityClearance): string {
    const classes = {
      [SecurityClearance.Public]: "bg-secondary-100 text-secondary-800",
      [SecurityClearance.Internal]: "bg-primary-100 text-primary-800",
      [SecurityClearance.Confidential]: "bg-warning-100 text-warning-800",
      [SecurityClearance.Secret]: "bg-danger-100 text-danger-800",
      [SecurityClearance.TopSecret]: "bg-danger-200 text-danger-900",
    };
    return clearance
      ? classes[clearance]
      : "bg-secondary-100 text-secondary-800";
  }

  getClearanceLabel(clearance?: SecurityClearance): string {
    const labels = {
      [SecurityClearance.Public]: "Public",
      [SecurityClearance.Internal]: "Internal",
      [SecurityClearance.Confidential]: "Confidential",
      [SecurityClearance.Secret]: "Secret",
      [SecurityClearance.TopSecret]: "Top Secret",
    };
    return clearance ? labels[clearance] : "Unknown";
  }

  getComplianceClass(isCompliant: boolean): string {
    return isCompliant
      ? "bg-success-100 text-success-800"
      : "bg-danger-100 text-danger-800";
  }

  trackByUserId(index: number, user: UserProfile): string {
    return user.id;
  }
}
