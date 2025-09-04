import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuditComplianceService } from "../../shared/services/audit-compliance.service";
import {
  AuditLog,
  AuditEventType,
  AuditCategory,
  AuditSeverity,
  AuditOutcome,
} from "../../shared/interfaces/audit-compliance.interface";

interface AuditFilters {
  searchQuery: string;
  eventType: string;
  category: string;
  severity: string;
  outcome: string;
  dateFrom: string;
  dateTo: string;
  userId: string;
  riskLevel: string;
}

@Component({
  selector: "app-audit-logs",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">Audit Logs</h1>
          <p class="text-secondary-600 mt-1">
            Monitor and review system audit events and activities
          </p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary" (click)="exportLogs()">
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
          <button class="btn-secondary" (click)="toggleFilters()">
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
              ></path>
            </svg>
            Filters
          </button>
          <button class="btn-primary" (click)="refreshLogs()">
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

      <!-- Search Bar -->
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
                [(ngModel)]="filters().searchQuery"
                (ngModelChange)="onFilterChange()"
                placeholder="Search audit logs by user, action, resource, or description..."
                class="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div class="flex space-x-2">
            <span
              class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-primary-100 text-primary-800"
            >
              {{ filteredLogs().length }} results
            </span>
            <button
              *ngIf="hasActiveFilters()"
              (click)="clearFilters()"
              class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Panel -->
      <div *ngIf="showFilters()" class="card animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Event Type Filter -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Event Type</label
            >
            <select
              [(ngModel)]="filters().eventType"
              (ngModelChange)="onFilterChange()"
              class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              <option value="user_login">User Login</option>
              <option value="user_logout">User Logout</option>
              <option value="access_granted">Access Granted</option>
              <option value="access_denied">Access Denied</option>
              <option value="permission_changed">Permission Changed</option>
              <option value="role_assigned">Role Assigned</option>
              <option value="role_revoked">Role Revoked</option>
              <option value="data_access">Data Access</option>
              <option value="data_modification">Data Modification</option>
              <option value="configuration_change">Configuration Change</option>
              <option value="policy_violation">Policy Violation</option>
              <option value="security_incident">Security Incident</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Category</label
            >
            <select
              [(ngModel)]="filters().category"
              (ngModelChange)="onFilterChange()"
              class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="authorization">Authorization</option>
              <option value="data_access">Data Access</option>
              <option value="system_admin">System Admin</option>
              <option value="security">Security</option>
              <option value="compliance">Compliance</option>
              <option value="privacy">Privacy</option>
              <option value="operations">Operations</option>
            </select>
          </div>

          <!-- Severity Filter -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Severity</label
            >
            <select
              [(ngModel)]="filters().severity"
              (ngModelChange)="onFilterChange()"
              class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Severities</option>
              <option value="informational">Informational</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <!-- Outcome Filter -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Outcome</label
            >
            <select
              [(ngModel)]="filters().outcome"
              (ngModelChange)="onFilterChange()"
              class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Outcomes</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <!-- Date From -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >From Date</label
            >
            <input
              type="date"
              [(ngModel)]="filters().dateFrom"
              (ngModelChange)="onFilterChange()"
              class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Date To -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >To Date</label
            >
            <input
              type="date"
              [(ngModel)]="filters().dateTo"
              (ngModelChange)="onFilterChange()"
              class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Risk Level -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Risk Level</label
            >
            <select
              [(ngModel)]="filters().riskLevel"
              (ngModelChange)="onFilterChange()"
              class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low (0-25)</option>
              <option value="medium">Medium (26-60)</option>
              <option value="high">High (61-85)</option>
              <option value="critical">Critical (86-100)</option>
            </select>
          </div>

          <!-- User ID -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >User ID</label
            >
            <input
              type="text"
              [(ngModel)]="filters().userId"
              (ngModelChange)="onFilterChange()"
              placeholder="Enter user ID"
              class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Timestamp
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Event
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Resource
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Severity
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Outcome
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                *ngFor="let log of paginatedLogs(); let i = index"
                class="hover:bg-secondary-50 transition-colors"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900"
                >
                  <div>
                    <div class="font-medium">
                      {{ log.timestamp | date: "MMM d, y" }}
                    </div>
                    <div class="text-secondary-500">
                      {{ log.timestamp | date: "h:mm:ss a" }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div
                        class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center"
                      >
                        <span class="text-xs font-medium text-primary-600">
                          {{ getUserInitials(log.userName) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-secondary-900">
                        {{ log.userName }}
                      </div>
                      <div class="text-sm text-secondary-500">
                        {{ log.userRole }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-secondary-900">
                      {{ log.action }}
                    </div>
                    <div class="text-sm text-secondary-500">
                      {{ getEventTypeLabel(log.eventType) }}
                    </div>
                  </div>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900"
                >
                  {{ log.targetResource }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getSeverityBadgeClass(log.severity)">
                    {{ log.severity }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getOutcomeBadgeClass(log.outcome)">
                    {{ log.outcome }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    (click)="viewLogDetails(log)"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    (click)="exportSingleLog(log)"
                    class="text-secondary-600 hover:text-secondary-900"
                  >
                    Export
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="bg-white px-4 py-3 flex items-center justify-between border-t border-secondary-200 sm:px-6"
        >
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              [disabled]="currentPage() === 1"
              (click)="previousPage()"
              class="relative inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              [disabled]="currentPage() === totalPages()"
              (click)="nextPage()"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div
            class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm text-secondary-700">
                Showing
                <span class="font-medium">{{ getStartIndex() }}</span> to
                <span class="font-medium">{{ getEndIndex() }}</span> of
                <span class="font-medium">{{ filteredLogs().length }}</span>
                results
              </p>
            </div>
            <div>
              <nav
                class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              >
                <button
                  [disabled]="currentPage() === 1"
                  (click)="previousPage()"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>

                <button
                  *ngFor="let page of getVisiblePages()"
                  (click)="setCurrentPage(page)"
                  [class]="
                    page === currentPage()
                      ? 'bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-secondary-300 text-secondary-500 hover:bg-secondary-50'
                  "
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  {{ page }}
                </button>

                <button
                  [disabled]="currentPage() === totalPages()"
                  (click)="nextPage()"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Log Details Modal -->
      <div
        *ngIf="selectedLog()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeLogDetails()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-secondary-900">
                Audit Log Details
              </h3>
              <button
                (click)="closeLogDetails()"
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Information -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Event ID</label
                  >
                  <p class="mt-1 text-sm text-secondary-900 font-mono">
                    {{ selectedLog()!.id }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Timestamp</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.timestamp | date: "full" }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >User</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.userName }} ({{
                      selectedLog()!.userRole
                    }})
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Action</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.action }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Target Resource</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.targetResource }}
                  </p>
                </div>
              </div>

              <!-- Event Details -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Event Type</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ getEventTypeLabel(selectedLog()!.eventType) }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Category</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.category }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Severity</label
                  >
                  <span
                    [class]="getSeverityBadgeClass(selectedLog()!.severity)"
                  >
                    {{ selectedLog()!.severity }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Outcome</label
                  >
                  <span [class]="getOutcomeBadgeClass(selectedLog()!.outcome)">
                    {{ selectedLog()!.outcome }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-secondary-700"
                >Description</label
              >
              <p class="mt-1 text-sm text-secondary-900">
                {{ selectedLog()!.details.description }}
              </p>
            </div>

            <!-- Technical Details -->
            <div
              class="mt-6"
              *ngIf="selectedLog()!.ipAddress || selectedLog()!.location"
            >
              <label class="block text-sm font-medium text-secondary-700 mb-3"
                >Technical Details</label
              >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngIf="selectedLog()!.ipAddress">
                  <label class="block text-sm font-medium text-secondary-600"
                    >IP Address</label
                  >
                  <p class="mt-1 text-sm text-secondary-900 font-mono">
                    {{ selectedLog()!.ipAddress }}
                  </p>
                </div>
                <div *ngIf="selectedLog()!.location">
                  <label class="block text-sm font-medium text-secondary-600"
                    >Location</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.location!.city }},
                    {{ selectedLog()!.location!.region }},
                    {{ selectedLog()!.location!.country }}
                  </p>
                </div>
                <div *ngIf="selectedLog()!.sessionId">
                  <label class="block text-sm font-medium text-secondary-600"
                    >Session ID</label
                  >
                  <p class="mt-1 text-sm text-secondary-900 font-mono">
                    {{ selectedLog()!.sessionId }}
                  </p>
                </div>
                <div *ngIf="selectedLog()!.correlationId">
                  <label class="block text-sm font-medium text-secondary-600"
                    >Correlation ID</label
                  >
                  <p class="mt-1 text-sm text-secondary-900 font-mono">
                    {{ selectedLog()!.correlationId }}
                  </p>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-secondary-700 mb-3"
                >System Information</label
              >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-600"
                    >System</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.details.systemInfo.systemName }} v{{
                      selectedLog()!.details.systemInfo.version
                    }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-600"
                    >Environment</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.details.systemInfo.environment }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-600"
                    >Module</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.details.systemInfo.module }}
                  </p>
                </div>
                <div *ngIf="selectedLog()!.details.systemInfo.component">
                  <label class="block text-sm font-medium text-secondary-600"
                    >Component</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedLog()!.details.systemInfo.component }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Compliance Flags -->
            <div class="mt-6" *ngIf="selectedLog()!.complianceFlags.length > 0">
              <label class="block text-sm font-medium text-secondary-700 mb-2"
                >Compliance Flags</label
              >
              <div class="flex flex-wrap gap-2">
                <span
                  *ngFor="let flag of selectedLog()!.complianceFlags"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ flag }}
                </span>
              </div>
            </div>

            <!-- Metadata -->
            <div
              class="mt-6"
              *ngIf="
                selectedLog()!.metadata && hasMetadata(selectedLog()!.metadata)
              "
            >
              <label class="block text-sm font-medium text-secondary-700 mb-2"
                >Additional Metadata</label
              >
              <div class="bg-secondary-50 rounded-lg p-3">
                <pre class="text-xs text-secondary-900 whitespace-pre-wrap">{{
                  formatMetadata(selectedLog()!.metadata)
                }}</pre>
              </div>
            </div>
          </div>

          <div
            class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3"
          >
            <button
              (click)="exportSingleLog(selectedLog()!)"
              class="btn-secondary"
            >
              Export Log
            </button>
            <button (click)="closeLogDetails()" class="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuditLogsComponent implements OnInit {
  allLogs = signal<AuditLog[]>([]);
  filteredLogs = signal<AuditLog[]>([]);
  selectedLog = signal<AuditLog | null>(null);
  showFilters = signal(false);
  currentPage = signal(1);
  pageSize = 20;
  isLoading = signal(false);

  filters = signal<AuditFilters>({
    searchQuery: "",
    eventType: "",
    category: "",
    severity: "",
    outcome: "",
    dateFrom: "",
    dateTo: "",
    userId: "",
    riskLevel: "",
  });

  // Computed properties
  totalPages = computed(() =>
    Math.ceil(this.filteredLogs().length / this.pageSize),
  );

  paginatedLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredLogs().slice(start, end);
  });

  constructor(private auditService: AuditComplianceService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  private loadAuditLogs(): void {
    this.isLoading.set(true);
    this.auditService.getAuditLogs().subscribe((logs) => {
      this.allLogs.set(logs);
      this.applyFilters();
      this.isLoading.set(false);
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.applyFilters();
  }

  private applyFilters(): void {
    this.auditService
      .searchAuditLogs(this.filters().searchQuery, this.filters())
      .subscribe((logs) => {
        this.filteredLogs.set(logs);
      });
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  clearFilters(): void {
    this.filters.set({
      searchQuery: "",
      eventType: "",
      category: "",
      severity: "",
      outcome: "",
      dateFrom: "",
      dateTo: "",
      userId: "",
      riskLevel: "",
    });
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(
      f.searchQuery ||
      f.eventType ||
      f.category ||
      f.severity ||
      f.outcome ||
      f.dateFrom ||
      f.dateTo ||
      f.userId ||
      f.riskLevel
    );
  }

  refreshLogs(): void {
    this.loadAuditLogs();
  }

  exportLogs(): void {
    // Simulate export functionality
    const dataStr = JSON.stringify(this.filteredLogs(), null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportSingleLog(log: AuditLog): void {
    const dataStr = JSON.stringify(log, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-log-${log.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  viewLogDetails(log: AuditLog): void {
    this.selectedLog.set(log);
  }

  closeLogDetails(): void {
    this.selectedLog.set(null);
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  setCurrentPage(page: number): void {
    this.currentPage.set(page);
  }

  getVisiblePages(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push(-1, total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots.filter((n) => n > 0);
  }

  getStartIndex(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(
      this.currentPage() * this.pageSize,
      this.filteredLogs().length,
    );
  }

  // Utility methods
  getUserInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  getEventTypeLabel(eventType: AuditEventType): string {
    return eventType
      .toString()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getSeverityBadgeClass(severity: AuditSeverity): string {
    const baseClass =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (severity) {
      case AuditSeverity.Critical:
        return `${baseClass} bg-purple-100 text-purple-800`;
      case AuditSeverity.High:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case AuditSeverity.Medium:
        return `${baseClass} bg-warning-100 text-warning-800`;
      case AuditSeverity.Low:
        return `${baseClass} bg-blue-100 text-blue-800`;
      case AuditSeverity.Informational:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getOutcomeBadgeClass(outcome: AuditOutcome): string {
    const baseClass =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (outcome) {
      case AuditOutcome.Success:
        return `${baseClass} bg-success-100 text-success-800`;
      case AuditOutcome.Failure:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case AuditOutcome.Warning:
        return `${baseClass} bg-warning-100 text-warning-800`;
      case AuditOutcome.Error:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case AuditOutcome.Blocked:
        return `${baseClass} bg-purple-100 text-purple-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getRiskScoreClass(score: number): string {
    if (score >= 86) return "text-purple-600";
    if (score >= 61) return "text-danger-600";
    if (score >= 26) return "text-warning-600";
    return "text-success-600";
  }

  getRiskBarClass(score: number): string {
    if (score >= 86) return "bg-purple-500";
    if (score >= 61) return "bg-danger-500";
    if (score >= 26) return "bg-warning-500";
    return "bg-success-500";
  }

  formatMetadata(metadata: Record<string, any>): string {
    return JSON.stringify(metadata, null, 2);
  }

  hasMetadata(metadata: Record<string, any>): boolean {
    return metadata && Object.keys(metadata).length > 0;
  }
}
