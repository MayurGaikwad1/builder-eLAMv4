import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SystemAdminService } from "../../shared/services/system-admin.service";
import {
  SystemRole,
  Permission,
  Policy,
  RoleType,
  PolicyType,
  PolicyCategory,
  EnforcementLevel,
  ActionType,
  ActionScope,
} from "../../shared/interfaces/system-admin.interface";
import { RiskLevel } from "../../shared/interfaces/user.interface";

interface RoleFilters {
  searchQuery: string;
  roleType: string;
  riskLevel: string;
  isActive: string;
}

interface PolicyFilters {
  searchQuery: string;
  policyType: string;
  category: string;
  enforcement: string;
}

@Component({
  selector: "app-roles-policies",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">
            Roles & Policies
          </h1>
          <p class="text-secondary-600 mt-1">
            Manage user roles, permissions, and security policies
          </p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary" (click)="showCreateRoleModal()">
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
            Create Role
          </button>
          <button class="btn-secondary" (click)="showCreatePolicyModal()">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Create Policy
          </button>
          <button class="btn-primary" (click)="refreshData()">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="border-b border-secondary-200">
        <nav class="-mb-px flex space-x-8">
          <button
            [class]="
              activeTab() === 'roles'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            "
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            (click)="setActiveTab('roles')"
          >
            Roles ({{ roles().length }})
          </button>
          <button
            [class]="
              activeTab() === 'policies'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            "
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            (click)="setActiveTab('policies')"
          >
            Policies ({{ policies().length }})
          </button>
          <button
            [class]="
              activeTab() === 'permissions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            "
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            (click)="setActiveTab('permissions')"
          >
            Permissions ({{ permissions().length }})
          </button>
        </nav>
      </div>

      <!-- Roles Tab -->
      <div *ngIf="activeTab() === 'roles'" class="space-y-6">
        <!-- Roles Search and Filters -->
        <div class="card">
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-secondary-400"
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
                <input
                  type="text"
                  [(ngModel)]="roleFilters().searchQuery"
                  (ngModelChange)="onRoleFilterChange()"
                  placeholder="Search roles by name, description, or permissions..."
                  class="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div class="flex space-x-3">
              <select
                [(ngModel)]="roleFilters().roleType"
                (ngModelChange)="onRoleFilterChange()"
                class="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Types</option>
                <option value="system">System</option>
                <option value="business">Business</option>
                <option value="application">Application</option>
                <option value="custom">Custom</option>
              </select>
              <select
                [(ngModel)]="roleFilters().riskLevel"
                (ngModelChange)="onRoleFilterChange()"
                class="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Risk Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <span
                class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-primary-100 text-primary-800"
              >
                {{ filteredRoles().length }} roles
              </span>
            </div>
          </div>
        </div>

        <!-- Roles Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            *ngFor="let role of filteredRoles()"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            (click)="viewRoleDetails(role)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <h4 class="text-lg font-medium text-secondary-900">
                    {{ role.displayName }}
                  </h4>
                  <span
                    *ngIf="role.isBuiltIn"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    Built-in
                  </span>
                </div>
                <p class="text-sm text-secondary-600 line-clamp-2">
                  {{ role.description }}
                </p>
              </div>
              <div class="flex flex-col items-end space-y-2">
                <span [class]="getRoleStatusBadgeClass(role.isActive)">
                  {{ role.isActive ? "Active" : "Inactive" }}
                </span>
                <span [class]="getRiskLevelBadgeClass(role.riskLevel)">
                  {{ role.riskLevel }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center">
                <div class="text-lg font-semibold text-secondary-900">
                  {{ role.assignedUsers }}
                </div>
                <div class="text-xs text-secondary-500">Assigned Users</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold text-primary-600">
                  {{ role.permissions.length }}
                </div>
                <div class="text-xs text-secondary-500">Permissions</div>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center space-x-2">
                <div [class]="getRoleTypeIconClass(role.type)">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="3"></circle>
                  </svg>
                </div>
                <span class="text-secondary-600">{{
                  getRoleTypeLabel(role.type)
                }}</span>
              </div>
              <span class="text-secondary-500">{{
                role.lastModified | date: "MMM d, y"
              }}</span>
            </div>

            <!-- Action Buttons -->
            <div class="mt-4 flex items-center justify-end space-x-2">
              <button
                (click)="editRole(role, $event)"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Edit
              </button>
              <button
                *ngIf="!role.isBuiltIn"
                (click)="deleteRole(role, $event)"
                class="text-danger-600 hover:text-danger-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Policies Tab -->
      <div *ngIf="activeTab() === 'policies'" class="space-y-6">
        <!-- Policies Search and Filters -->
        <div class="card">
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-secondary-400"
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
                <input
                  type="text"
                  [(ngModel)]="policyFilters().searchQuery"
                  (ngModelChange)="onPolicyFilterChange()"
                  placeholder="Search policies by name, description, or conditions..."
                  class="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div class="flex space-x-3">
              <select
                [(ngModel)]="policyFilters().policyType"
                (ngModelChange)="onPolicyFilterChange()"
                class="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Types</option>
                <option value="access">Access</option>
                <option value="security">Security</option>
                <option value="compliance">Compliance</option>
                <option value="business">Business</option>
                <option value="technical">Technical</option>
              </select>
              <select
                [(ngModel)]="policyFilters().enforcement"
                (ngModelChange)="onPolicyFilterChange()"
                class="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Enforcement</option>
                <option value="advisory">Advisory</option>
                <option value="warning">Warning</option>
                <option value="blocking">Blocking</option>
                <option value="automatic">Automatic</option>
              </select>
              <span
                class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-primary-100 text-primary-800"
              >
                {{ filteredPolicies().length }} policies
              </span>
            </div>
          </div>
        </div>

        <!-- Policies List -->
        <div class="space-y-4">
          <div
            *ngFor="let policy of filteredPolicies()"
            class="card hover:shadow-md transition-shadow cursor-pointer"
            (click)="viewPolicyDetails(policy)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h4 class="text-lg font-medium text-secondary-900">
                    {{ policy.displayName }}
                  </h4>
                  <span [class]="getPolicyTypeBadgeClass(policy.type)">
                    {{ getPolicyTypeLabel(policy.type) }}
                  </span>
                  <span [class]="getEnforcementBadgeClass(policy.enforcement)">
                    {{ getEnforcementLabel(policy.enforcement) }}
                  </span>
                  <span [class]="getPolicyStatusBadgeClass(policy.isActive)">
                    {{ policy.isActive ? "Active" : "Inactive" }}
                  </span>
                </div>
                <p class="text-sm text-secondary-600 mb-3">
                  {{ policy.description }}
                </p>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-secondary-500">Category:</span>
                    <span class="ml-1 text-secondary-900">{{
                      getPolicyCategoryLabel(policy.category)
                    }}</span>
                  </div>
                  <div>
                    <span class="text-secondary-500">Version:</span>
                    <span class="ml-1 text-secondary-900">{{
                      policy.version
                    }}</span>
                  </div>
                  <div>
                    <span class="text-secondary-500">Effective:</span>
                    <span class="ml-1 text-secondary-900">{{
                      policy.effectiveDate | date: "MMM d, y"
                    }}</span>
                  </div>
                </div>

                <!-- Compliance Requirements -->
                <div *ngIf="policy.compliance.length > 0" class="mt-3">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="text-sm font-medium text-secondary-700"
                      >Compliance:</span
                    >
                    <div class="flex flex-wrap gap-1">
                      <span
                        *ngFor="let comp of policy.compliance"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {{ comp.framework }} {{ comp.requirement }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center space-x-2 ml-4">
                <button
                  (click)="editPolicy(policy, $event)"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  (click)="deletePolicy(policy, $event)"
                  class="text-danger-600 hover:text-danger-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions Tab -->
      <div *ngIf="activeTab() === 'permissions'" class="space-y-6">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">System Permissions</h3>
            <p class="card-subtitle">
              Available permissions that can be assigned to roles
            </p>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-secondary-200">
              <thead class="bg-secondary-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Permission
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Resource
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Risk Score
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-secondary-200">
                <tr
                  *ngFor="let permission of permissions(); let i = index"
                  class="hover:bg-secondary-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-secondary-900">
                        {{ permission.displayName }}
                      </div>
                      <div class="text-sm text-secondary-500">
                        {{ permission.name }}
                      </div>
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900"
                  >
                    {{ permission.resource }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-wrap gap-1">
                      <span
                        *ngFor="let action of permission.actions"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                      >
                        {{ getActionLabel(action.action) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <!-- Risk score removed -->
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      [class]="
                        getPermissionStatusBadgeClass(permission.isActive)
                      "
                    >
                      {{ permission.isActive ? "Active" : "Inactive" }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Role Details Modal -->
      <div
        *ngIf="selectedRole()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeRoleDetails()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-secondary-900">
                  {{ selectedRole()!.displayName }}
                </h3>
                <p class="text-sm text-secondary-600 mt-1">
                  {{ selectedRole()!.description }}
                </p>
              </div>
              <button
                (click)="closeRoleDetails()"
                class="text-secondary-400 hover:text-secondary-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Role Information -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Role Type</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ getRoleTypeLabel(selectedRole()!.type) }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Risk Level</label
                  >
                  <span
                    class="mt-1"
                    [class]="getRiskLevelBadgeClass(selectedRole()!.riskLevel)"
                  >
                    {{ selectedRole()!.riskLevel }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Assigned Users</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedRole()!.assignedUsers }} users
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Created</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedRole()!.createdAt | date: "MMM d, y h:mm a" }} by
                    {{ selectedRole()!.createdBy }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Last Modified</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{
                      selectedRole()!.lastModified | date: "MMM d, y h:mm a"
                    }}
                    by {{ selectedRole()!.modifiedBy }}
                  </p>
                </div>
              </div>

              <!-- Permissions -->
              <div>
                <h4 class="text-lg font-medium text-secondary-900 mb-4">
                  Permissions ({{ selectedRole()!.permissions.length }})
                </h4>
                <div class="space-y-3 max-h-64 overflow-y-auto">
                  <div
                    *ngFor="let permission of selectedRole()!.permissions"
                    class="border border-secondary-200 rounded-lg p-3"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h5 class="font-medium text-secondary-900">
                          {{ permission.displayName }}
                        </h5>
                        <p class="text-sm text-secondary-600 mt-1">
                          {{ permission.description }}
                        </p>
                        <div class="flex items-center space-x-2 mt-2">
                          <span class="text-xs text-secondary-500"
                            >Resource:</span
                          >
                          <span
                            class="text-xs text-secondary-900 font-medium"
                            >{{ permission.resource }}</span
                          >
                        </div>
                      </div>
                      <div class="flex items-center ml-2">
                        <span
                          [class]="getRiskScoreClass(permission.riskScore)"
                          class="text-xs font-medium"
                        >
                          {{ permission.riskScore }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Constraints -->
            <div *ngIf="selectedRole()!.constraints.length > 0" class="mt-6">
              <h4 class="text-lg font-medium text-secondary-900 mb-4">
                Role Constraints
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  *ngFor="let constraint of selectedRole()!.constraints"
                  class="border border-secondary-200 rounded-lg p-3"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-secondary-900">{{
                      constraint.type
                    }}</span>
                    <span
                      [class]="
                        constraint.isActive
                          ? 'text-success-600'
                          : 'text-secondary-500'
                      "
                    >
                      {{ constraint.isActive ? "Active" : "Inactive" }}
                    </span>
                  </div>
                  <p class="text-sm text-secondary-600 mt-1">
                    {{ constraint.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3"
          >
            <button
              *ngIf="!selectedRole()!.isBuiltIn"
              (click)="editRole(selectedRole()!)"
              class="btn-secondary"
            >
              Edit Role
            </button>
            <button (click)="closeRoleDetails()" class="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Policy Details Modal -->
      <div
        *ngIf="selectedPolicy()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closePolicyDetails()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-secondary-900">
                  {{ selectedPolicy()!.displayName }}
                </h3>
                <p class="text-sm text-secondary-600 mt-1">
                  {{ selectedPolicy()!.description }}
                </p>
              </div>
              <button
                (click)="closePolicyDetails()"
                class="text-secondary-400 hover:text-secondary-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Policy Information -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Policy Type</label
                  >
                  <span
                    class="mt-1"
                    [class]="getPolicyTypeBadgeClass(selectedPolicy()!.type)"
                  >
                    {{ getPolicyTypeLabel(selectedPolicy()!.type) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Category</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ getPolicyCategoryLabel(selectedPolicy()!.category) }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Enforcement Level</label
                  >
                  <span
                    class="mt-1"
                    [class]="
                      getEnforcementBadgeClass(selectedPolicy()!.enforcement)
                    "
                  >
                    {{ getEnforcementLabel(selectedPolicy()!.enforcement) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Version</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedPolicy()!.version }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Effective Date</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedPolicy()!.effectiveDate | date: "MMM d, y" }}
                  </p>
                </div>
              </div>

              <!-- Policy Actions -->
              <div>
                <h4 class="text-lg font-medium text-secondary-900 mb-4">
                  Policy Actions
                </h4>
                <div class="space-y-3">
                  <div
                    *ngFor="let action of selectedPolicy()!.actions"
                    class="border border-secondary-200 rounded-lg p-3"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-secondary-900">{{
                        action.type
                      }}</span>
                      <div class="flex items-center space-x-2">
                        <span class="text-sm text-secondary-500"
                          >Priority:</span
                        >
                        <span class="text-sm font-medium text-secondary-900">{{
                          action.priority
                        }}</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-4 mt-2 text-sm">
                      <span
                        [class]="
                          action.isBlocking
                            ? 'text-danger-600'
                            : 'text-success-600'
                        "
                      >
                        {{ action.isBlocking ? "Blocking" : "Non-blocking" }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Policy Conditions -->
            <div *ngIf="selectedPolicy()!.conditions.length > 0" class="mb-6">
              <h4 class="text-lg font-medium text-secondary-900 mb-4">
                Policy Conditions
              </h4>
              <div class="space-y-3">
                <div
                  *ngFor="let condition of selectedPolicy()!.conditions"
                  class="border border-secondary-200 rounded-lg p-3"
                >
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span class="text-secondary-500">Field:</span>
                      <span class="ml-1 text-secondary-900 font-medium">{{
                        condition.field
                      }}</span>
                    </div>
                    <div>
                      <span class="text-secondary-500">Operator:</span>
                      <span class="ml-1 text-secondary-900 font-medium">{{
                        condition.operator
                      }}</span>
                    </div>
                    <div>
                      <span class="text-secondary-500">Value:</span>
                      <span class="ml-1 text-secondary-900 font-medium">{{
                        condition.value
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Compliance Requirements -->
            <div *ngIf="selectedPolicy()!.compliance.length > 0">
              <h4 class="text-lg font-medium text-secondary-900 mb-4">
                Compliance Requirements
              </h4>
              <div class="space-y-3">
                <div
                  *ngFor="let comp of selectedPolicy()!.compliance"
                  class="border border-secondary-200 rounded-lg p-3"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <h5 class="font-medium text-secondary-900">
                          {{ comp.framework }}
                        </h5>
                        <span class="text-sm text-primary-600">{{
                          comp.requirement
                        }}</span>
                      </div>
                      <p class="text-sm text-secondary-600">
                        {{ comp.description }}
                      </p>
                    </div>
                    <span
                      [class]="
                        comp.mandatory ? 'text-danger-600' : 'text-warning-600'
                      "
                      class="text-xs font-medium"
                    >
                      {{ comp.mandatory ? "Mandatory" : "Optional" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3"
          >
            <button
              (click)="editPolicy(selectedPolicy()!)"
              class="btn-secondary"
            >
              Edit Policy
            </button>
            <button (click)="closePolicyDetails()" class="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Create Role Modal -->
      <div
        *ngIf="showCreateRoleModalFlag()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeCreateRoleModal()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <h3 class="text-lg font-medium text-secondary-900">
              Create New Role
            </h3>
          </div>

          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Role Name</label
                >
                <input
                  type="text"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="senior_analyst"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Display Name</label
                >
                <input
                  type="text"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Senior Business Analyst"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Role Type</label
                >
                <select
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="business">Business</option>
                  <option value="application">Application</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Risk Level</label
                >
                <select
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Description</label
                >
                <textarea
                  rows="3"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Role description and responsibilities..."
                ></textarea>
              </div>
            </div>
          </div>

          <div
            class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3"
          >
            <button (click)="closeCreateRoleModal()" class="btn-secondary">
              Cancel
            </button>
            <button (click)="createRole()" class="btn-primary">
              Create Role
            </button>
          </div>
        </div>
      </div>

      <!-- Create Policy Modal -->
      <div
        *ngIf="showCreatePolicyModalFlag()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeCreatePolicyModal()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <h3 class="text-lg font-medium text-secondary-900">
              Create New Policy
            </h3>
          </div>

          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Policy Name</label
                >
                <input
                  type="text"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="data_retention_policy"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Display Name</label
                >
                <input
                  type="text"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Data Retention Policy"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Policy Type</label
                >
                <select
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                  <option value="access">Access</option>
                  <option value="business">Business</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Enforcement Level</label
                >
                <select
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="advisory">Advisory</option>
                  <option value="warning">Warning</option>
                  <option value="blocking">Blocking</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Description</label
                >
                <textarea
                  rows="3"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Policy description and requirements..."
                ></textarea>
              </div>
            </div>
          </div>

          <div
            class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3"
          >
            <button (click)="closeCreatePolicyModal()" class="btn-secondary">
              Cancel
            </button>
            <button (click)="createPolicy()" class="btn-primary">
              Create Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RolesPoliciesComponent implements OnInit {
  activeTab = signal<string>("roles");
  roles = signal<SystemRole[]>([]);
  policies = signal<Policy[]>([]);
  permissions = signal<Permission[]>([]);
  selectedRole = signal<SystemRole | null>(null);
  selectedPolicy = signal<Policy | null>(null);
  showCreateRoleModalFlag = signal(false);
  showCreatePolicyModalFlag = signal(false);
  isLoading = signal(false);

  roleFilters = signal<RoleFilters>({
    searchQuery: "",
    roleType: "",
    riskLevel: "",
    isActive: "",
  });

  policyFilters = signal<PolicyFilters>({
    searchQuery: "",
    policyType: "",
    category: "",
    enforcement: "",
  });

  // Computed properties
  filteredRoles = computed(() => {
    let filtered = this.roles();
    const f = this.roleFilters();

    if (f.searchQuery) {
      const query = f.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.name.toLowerCase().includes(query) ||
          role.displayName.toLowerCase().includes(query) ||
          role.description.toLowerCase().includes(query),
      );
    }

    if (f.roleType) {
      filtered = filtered.filter((role) => role.type === f.roleType);
    }

    if (f.riskLevel) {
      filtered = filtered.filter((role) => role.riskLevel === f.riskLevel);
    }

    if (f.isActive) {
      filtered = filtered.filter(
        (role) => role.isActive === (f.isActive === "true"),
      );
    }

    return filtered.sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
    );
  });

  filteredPolicies = computed(() => {
    let filtered = this.policies();
    const f = this.policyFilters();

    if (f.searchQuery) {
      const query = f.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (policy) =>
          policy.name.toLowerCase().includes(query) ||
          policy.displayName.toLowerCase().includes(query) ||
          policy.description.toLowerCase().includes(query),
      );
    }

    if (f.policyType) {
      filtered = filtered.filter((policy) => policy.type === f.policyType);
    }

    if (f.category) {
      filtered = filtered.filter((policy) => policy.category === f.category);
    }

    if (f.enforcement) {
      filtered = filtered.filter(
        (policy) => policy.enforcement === f.enforcement,
      );
    }

    return filtered.sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
    );
  });

  constructor(private adminService: SystemAdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);

    this.adminService.getRoles().subscribe((roles) => {
      this.roles.set(roles);
    });

    this.adminService.getPolicies().subscribe((policies) => {
      this.policies.set(policies);
    });

    this.adminService.getPermissions().subscribe((permissions) => {
      this.permissions.set(permissions);
      this.isLoading.set(false);
    });
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  // Filter handlers
  onRoleFilterChange(): void {
    // Filtering is handled by computed property
  }

  onPolicyFilterChange(): void {
    // Filtering is handled by computed property
  }

  // Role operations
  viewRoleDetails(role: SystemRole): void {
    this.selectedRole.set(role);
  }

  closeRoleDetails(): void {
    this.selectedRole.set(null);
  }

  editRole(role: SystemRole, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    console.log("Edit role:", role.id);
    // Implement edit functionality
  }

  deleteRole(role: SystemRole, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (
      confirm(`Are you sure you want to delete the role "${role.displayName}"?`)
    ) {
      this.adminService.deleteRole(role.id).subscribe(() => {
        this.loadData();
      });
    }
  }

  showCreateRoleModal(): void {
    this.showCreateRoleModalFlag.set(true);
  }

  closeCreateRoleModal(): void {
    this.showCreateRoleModalFlag.set(false);
  }

  createRole(): void {
    // Implement role creation
    console.log("Create role");
    this.closeCreateRoleModal();
  }

  // Policy operations
  viewPolicyDetails(policy: Policy): void {
    this.selectedPolicy.set(policy);
  }

  closePolicyDetails(): void {
    this.selectedPolicy.set(null);
  }

  editPolicy(policy: Policy, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    console.log("Edit policy:", policy.id);
    // Implement edit functionality
  }

  deletePolicy(policy: Policy, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (
      confirm(
        `Are you sure you want to delete the policy "${policy.displayName}"?`,
      )
    ) {
      console.log("Delete policy:", policy.id);
      // Implement delete functionality
    }
  }

  showCreatePolicyModal(): void {
    this.showCreatePolicyModalFlag.set(true);
  }

  closeCreatePolicyModal(): void {
    this.showCreatePolicyModalFlag.set(false);
  }

  createPolicy(): void {
    // Implement policy creation
    console.log("Create policy");
    this.closeCreatePolicyModal();
  }

  refreshData(): void {
    this.loadData();
  }

  // Helper methods for styling and labels
  getRoleStatusBadgeClass(isActive: boolean): string {
    const baseClass =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    return isActive
      ? `${baseClass} bg-success-100 text-success-800`
      : `${baseClass} bg-secondary-100 text-secondary-800`;
  }

  getRiskLevelBadgeClass(riskLevel: RiskLevel): string {
    const baseClass =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (riskLevel) {
      case RiskLevel.Critical:
        return `${baseClass} bg-purple-100 text-purple-800`;
      case RiskLevel.High:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case RiskLevel.Medium:
        return `${baseClass} bg-warning-100 text-warning-800`;
      case RiskLevel.Low:
        return `${baseClass} bg-success-100 text-success-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getRoleTypeIconClass(type: RoleType): string {
    const baseClass = "w-4 h-4 rounded-full flex items-center justify-center";
    switch (type) {
      case RoleType.System:
        return `${baseClass} bg-blue-100 text-blue-600`;
      case RoleType.Business:
        return `${baseClass} bg-green-100 text-green-600`;
      case RoleType.Application:
        return `${baseClass} bg-purple-100 text-purple-600`;
      case RoleType.Custom:
        return `${baseClass} bg-orange-100 text-orange-600`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-600`;
    }
  }

  getRoleTypeLabel(type: RoleType): string {
    switch (type) {
      case RoleType.System:
        return "System";
      case RoleType.Business:
        return "Business";
      case RoleType.Application:
        return "Application";
      case RoleType.Custom:
        return "Custom";
      default:
        return type;
    }
  }

  getPolicyTypeBadgeClass(type: PolicyType): string {
    const baseClass =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (type) {
      case PolicyType.Security:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case PolicyType.Compliance:
        return `${baseClass} bg-blue-100 text-blue-800`;
      case PolicyType.Access:
        return `${baseClass} bg-green-100 text-green-800`;
      case PolicyType.Business:
        return `${baseClass} bg-orange-100 text-orange-800`;
      case PolicyType.Technical:
        return `${baseClass} bg-purple-100 text-purple-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getPolicyTypeLabel(type: PolicyType): string {
    switch (type) {
      case PolicyType.Security:
        return "Security";
      case PolicyType.Compliance:
        return "Compliance";
      case PolicyType.Access:
        return "Access";
      case PolicyType.Business:
        return "Business";
      case PolicyType.Technical:
        return "Technical";
      default:
        return type;
    }
  }

  getPolicyCategoryLabel(category: PolicyCategory): string {
    switch (category) {
      case PolicyCategory.Authentication:
        return "Authentication";
      case PolicyCategory.Authorization:
        return "Authorization";
      case PolicyCategory.DataProtection:
        return "Data Protection";
      case PolicyCategory.AuditLogging:
        return "Audit Logging";
      case PolicyCategory.RiskManagement:
        return "Risk Management";
      case PolicyCategory.ChangeManagement:
        return "Change Management";
      default:
        return category;
    }
  }

  getEnforcementBadgeClass(enforcement: EnforcementLevel): string {
    const baseClass =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (enforcement) {
      case EnforcementLevel.Blocking:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case EnforcementLevel.Warning:
        return `${baseClass} bg-warning-100 text-warning-800`;
      case EnforcementLevel.Advisory:
        return `${baseClass} bg-blue-100 text-blue-800`;
      case EnforcementLevel.Automatic:
        return `${baseClass} bg-green-100 text-green-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getEnforcementLabel(enforcement: EnforcementLevel): string {
    switch (enforcement) {
      case EnforcementLevel.Blocking:
        return "Blocking";
      case EnforcementLevel.Warning:
        return "Warning";
      case EnforcementLevel.Advisory:
        return "Advisory";
      case EnforcementLevel.Automatic:
        return "Automatic";
      default:
        return enforcement;
    }
  }

  getPolicyStatusBadgeClass(isActive: boolean): string {
    return this.getRoleStatusBadgeClass(isActive);
  }

  getPermissionStatusBadgeClass(isActive: boolean): string {
    return this.getRoleStatusBadgeClass(isActive);
  }

  getActionLabel(action: ActionType): string {
    switch (action) {
      case ActionType.Create:
        return "Create";
      case ActionType.Read:
        return "Read";
      case ActionType.Update:
        return "Update";
      case ActionType.Delete:
        return "Delete";
      case ActionType.Execute:
        return "Execute";
      case ActionType.Approve:
        return "Approve";
      case ActionType.Assign:
        return "Assign";
      default:
        return action;
    }
  }

  getRiskScoreClass(score: number): string {
    if (score >= 80) return "text-purple-600";
    if (score >= 60) return "text-danger-600";
    if (score >= 30) return "text-warning-600";
    return "text-success-600";
  }

  getRiskBarClass(score: number): string {
    if (score >= 80) return "bg-purple-500";
    if (score >= 60) return "bg-danger-500";
    if (score >= 30) return "bg-warning-500";
    return "bg-success-500";
  }
}
