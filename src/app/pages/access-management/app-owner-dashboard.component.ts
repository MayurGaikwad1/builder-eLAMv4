import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AccessManagementService } from "../../shared/services/access-management.service";
import {
  Application,
  UserAccessRequest,
  ExceptionHandling,
  DashboardMetrics,
  ActivityLog,
  ApplicationMetrics,
  AccessRequestStatus,
  ExceptionStatus,
  ExceptionDecision,
  Priority,
} from "../../shared/interfaces/access-management.interface";

@Component({
  selector: "app-app-owner-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">
            Application Owner Dashboard
          </h1>
          <p class="text-secondary-600">
            Monitor and manage access requests and exceptions for your
            applications
          </p>
        </div>
        <div class="flex space-x-3">
          <button (click)="refreshData()" class="btn-secondary">
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
          <select
            [ngModel]="selectedApplicationId()"
            (ngModelChange)="selectedApplicationId.set($event); onApplicationSelected()"
            class="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All My Applications</option>
            <option *ngFor="let app of applications()" [value]="app.id">
              {{ app.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-secondary-900">
              {{ totalRequests() }}
            </p>
            <p class="text-sm text-secondary-600">Total Requests</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-warning-600">
              {{ pendingRequests() }}
            </p>
            <p class="text-sm text-secondary-600">Pending Approval</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-danger-600">
              {{ overdueRequests() }}
            </p>
            <p class="text-sm text-secondary-600">Overdue</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-purple-600">
              {{ totalExceptions() }}
            </p>
            <p class="text-sm text-secondary-600">Exceptions</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-warning-600">
              {{ pendingExceptions() }}
            </p>
            <p class="text-sm text-secondary-600">Pending Decisions</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-primary-600">
              {{ autoDeleteToday() }}
            </p>
            <p class="text-sm text-secondary-600">Auto-Delete Today</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Pending Approvals -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-secondary-900">
              Pending Approvals
            </h3>
            <span
              class="bg-warning-100 text-warning-800 px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ pendingApprovalsList().length }} pending
            </span>
          </div>

          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div
              *ngFor="let request of pendingApprovalsList().slice(0, 5)"
              class="flex items-center justify-between p-3 bg-secondary-50 rounded-lg cursor-pointer"
              (click)="openRequestDetails(request)"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-mono text-sm">{{ request.id }}</span>
                  <span
                    [class]="getPriorityClass(request.priority)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ request.priority | titlecase }}
                  </span>
                </div>
                <p class="text-sm text-secondary-600">
                  {{ request.applicationName }}
                </p>
                <p class="text-xs text-secondary-500">
                  {{ request.userIds.length }} users •
                  {{ getTimeRemaining(request.deadline) }}
                </p>
              </div>
              <div class="flex space-x-2">
                <button
                  (click)="$event.stopPropagation(); openRequestDetails(request)"
                  class="text-primary-600 px-2 py-1 text-xs rounded hover:underline"
                >
                  View
                </button>
                <button
                  (click)="$event.stopPropagation(); quickApprove(request.id)"
                  class="bg-success-600 text-white px-3 py-1 text-xs rounded hover:bg-success-700"
                >
                  Approve
                </button>
                <button
                  (click)="$event.stopPropagation(); quickReject(request.id)"
                  class="bg-danger-600 text-white px-3 py-1 text-xs rounded hover:bg-danger-700"
                >
                  Reject
                </button>
              </div>
            </div>

            <div
              *ngIf="pendingApprovalsList().length === 0"
              class="text-center py-8 text-secondary-500"
            >
              <p>No pending approvals</p>
            </div>

            <div
              *ngIf="pendingApprovalsList().length > 5"
              class="text-center pt-2"
            >
              <button class="text-primary-600 hover:text-primary-700 text-sm">
                View all {{ pendingApprovalsList().length }} pending approvals
              </button>
            </div>
          </div>
        </div>

        <!-- Pending Exception Decisions -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-secondary-900">
              Exception Decisions
            </h3>
            <span
              class="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ pendingExceptionsList().length }} pending
            </span>
          </div>

          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div
              *ngFor="let exception of pendingExceptionsList().slice(0, 5)"
              class="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-mono text-sm">{{ exception.userId }}</span>
                  <span
                    [class]="getExceptionTypeClass(exception.exceptionType)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getExceptionTypeLabel(exception.exceptionType) }}
                  </span>
                </div>
                <p class="text-sm text-secondary-600">
                  {{ getApplicationName(exception.applicationId) }}
                </p>
                <p class="text-xs text-secondary-500">
                  Auto-delete:
                  {{ getDaysUntilAutoDelete(exception.autoDeleteDate) }} days
                </p>
              </div>
              <div class="flex space-x-2">
                <button
                  (click)="quickRetain(exception.id)"
                  class="bg-success-600 text-white px-3 py-1 text-xs rounded hover:bg-success-700"
                >
                  Retain
                </button>
                <button
                  (click)="quickDelete(exception.id)"
                  class="bg-danger-600 text-white px-3 py-1 text-xs rounded hover:bg-danger-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <div
              *ngIf="pendingExceptionsList().length === 0"
              class="text-center py-8 text-secondary-500"
            >
              <p>No pending exception decisions</p>
            </div>

            <div
              *ngIf="pendingExceptionsList().length > 5"
              class="text-center pt-2"
            >
              <button class="text-primary-600 hover:text-primary-700 text-sm">
                View all {{ pendingExceptionsList().length }} pending exceptions
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Application Performance -->
      <div class="card">
        <h3 class="text-lg font-semibold text-secondary-900 mb-6">
          Application Performance
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            *ngFor="let appMetric of applicationMetrics()"
            class="border border-secondary-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-secondary-900">
                {{ appMetric.applicationName }}
              </h4>
              <span class="text-xs text-secondary-500">Last 30 days</span>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-secondary-600">Total Requests</span>
                <span class="font-medium">{{ appMetric.totalRequests }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-secondary-600">Pending</span>
                <span class="font-medium text-warning-600">{{
                  appMetric.pendingRequests
                }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-secondary-600">Exceptions</span>
                <span class="font-medium text-purple-600">{{
                  appMetric.exceptions
                }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-secondary-600">Avg Processing Time</span>
                <span class="font-medium"
                  >{{ appMetric.averageProcessingTime }} days</span
                >
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-3">
              <div class="flex justify-between text-xs text-secondary-500 mb-1">
                <span>Completion Rate</span>
                <span>{{ getCompletionRate(appMetric) }}%</span>
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="bg-success-600 h-2 rounded-full transition-all duration-300"
                  [style.width.%]="getCompletionRate(appMetric)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-secondary-900">
            Recent Activity
          </h3>
          <button class="text-primary-600 hover:text-primary-700 text-sm">
            View All Activity
          </button>
        </div>

        <div class="space-y-4">
          <div
            *ngFor="let activity of recentActivity().slice(0, 10)"
            class="flex items-center space-x-4 p-3 bg-secondary-50 rounded-lg"
          >
            <div
              [class]="getActivityIcon(activity.action)"
              class="w-8 h-8 rounded-full flex items-center justify-center"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm text-secondary-900">{{ activity.details }}</p>
              <p class="text-xs text-secondary-500">
                {{ activity.userName }} •
                {{ activity.timestamp | date: "MMM d, y h:mm a" }}
              </p>
            </div>
            <span
              [class]="getActivityTypeClass(activity.action)"
              class="px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ getActivityTypeLabel(activity.action) }}
            </span>
          </div>

          <div
            *ngIf="recentActivity().length === 0"
            class="text-center py-8 text-secondary-500"
          >
            <p>No recent activity</p>
          </div>
        </div>
      </div>

      <!-- Automated Actions Summary -->
      <div class="card">
        <h3 class="text-lg font-semibold text-secondary-900 mb-6">
          Automated Actions
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-4 border border-secondary-200 rounded-lg">
            <div
              class="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3"
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <p class="text-2xl font-bold text-secondary-900">
              {{ autoApprovedToday() }}
            </p>
            <p class="text-sm text-secondary-600">Auto-Approved Today</p>
            <p class="text-xs text-secondary-500 mt-1">
              Deadline-based approvals
            </p>
          </div>

          <div class="text-center p-4 border border-secondary-200 rounded-lg">
            <div
              class="w-12 h-12 bg-danger-100 text-danger-600 rounded-full flex items-center justify-center mx-auto mb-3"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </div>
            <p class="text-2xl font-bold text-secondary-900">
              {{ autoDeletedToday() }}
            </p>
            <p class="text-sm text-secondary-600">Auto-Deleted Today</p>
            <p class="text-xs text-secondary-500 mt-1">
              Exception deadline reached
            </p>
          </div>

          <div class="text-center p-4 border border-secondary-200 rounded-lg">
            <div
              class="w-12 h-12 bg-warning-100 text-warning-600 rounded-full flex items-center justify-center mx-auto mb-3"
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
            </div>
            <p class="text-2xl font-bold text-secondary-900">
              {{ notificationsSent() }}
            </p>
            <p class="text-sm text-secondary-600">Notifications Sent</p>
            <p class="text-xs text-secondary-500 mt-1">Reminders and alerts</p>
          </div>
        </div>
      </div>

      <!-- Request Details Modal -->
      <div *ngIf="selectedRequest()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black opacity-50" (click)="closeDetails()"></div>
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10">
          <div class="flex items-center justify-between p-6 border-b">
            <div>
              <h2 class="text-lg font-semibold text-secondary-900">Request {{ selectedRequest()?.id }}</h2>
              <p class="text-sm text-secondary-600">{{ selectedRequest()?.applicationName }} • {{ selectedRequest()?.requesterName }}</p>
            </div>
            <div class="flex items-center space-x-3">
              <button class="btn-secondary" (click)="closeDetails()">Close</button>
              <button class="bg-success-600 text-white px-3 py-1 text-sm rounded" (click)="approveInModal(selectedRequest()?.id)">
                Approve
              </button>
              <button class="bg-danger-600 text-white px-3 py-1 text-sm rounded" (click)="rejectInModal(selectedRequest()?.id)">
                Reject
              </button>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-secondary-500">Submitted</p>
                <p class="font-medium">{{ selectedRequest()?.submittedAt | date:'MMM d, y h:mm a' }}</p>
              </div>
              <div>
                <p class="text-sm text-secondary-500">Deadline</p>
                <p class="font-medium">{{ selectedRequest()?.deadline | date:'MMM d, y h:mm a' }}</p>
              </div>
              <div>
                <p class="text-sm text-secondary-500">Users</p>
                <p class="font-medium">{{ (selectedRequest()?.userIds ?? []).join(', ') }}</p>
              </div>
              <div>
                <p class="text-sm text-secondary-500">Priority</p>
                <p class="font-medium">{{ selectedRequest()?.priority | titlecase }}</p>
              </div>
            </div>

            <div>
              <p class="text-sm text-secondary-500">Justification</p>
              <p class="font-medium">{{ selectedRequest()?.justification }}</p>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-secondary-800 mb-2">Approval Trail</h4>
              <div *ngIf="(selectedRequest()?.approvals?.length ?? 0) === 0" class="p-4 bg-secondary-50 rounded">
                <p class="text-sm text-secondary-600">No approvals yet. Waiting for manager approval.</p>
              </div>

              <ul class="space-y-3">
                <li class="flex items-start" *ngFor="let appr of selectedRequest()?.approvals">
                  <div class="w-2 h-2 rounded-full mt-2" [class]="appr.status === 'approved' ? 'bg-success-600' : (appr.status === 'rejected' ? 'bg-danger-600' : 'bg-secondary-400')"></div>
                  <div class="ml-3">
                    <p class="text-sm font-medium">Level {{ appr.level }} — {{ appr.approverName || appr.approverRole }}</p>
                    <p class="text-xs text-secondary-500">Status: {{ appr.status }} {{ appr.approvedAt ? ('• ' + (appr.approvedAt | date:'MMM d, y h:mm a')) : '' }}</p>
                    <p *ngIf="appr.comments" class="text-xs text-secondary-600">{{ appr.comments }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class AppOwnerDashboardComponent implements OnInit {
  selectedApplicationId = signal<string>("");

  applications = signal<Application[]>([]);
  accessRequests = signal<UserAccessRequest[]>([]);
  exceptions = signal<ExceptionHandling[]>([]);
  dashboardMetrics = signal<DashboardMetrics | null>(null);

  selectedRequest = signal<UserAccessRequest | null>(null);

  // Computed properties
  totalRequests = computed(() => {
    const requests = this.accessRequests();
    const sel = this.selectedApplicationId();
    return sel ? requests.filter((r) => r.applicationId === sel).length : requests.length;
  });

  pendingRequests = computed(() => {
    const requests = this.accessRequests();
    const sel = this.selectedApplicationId();
    const filtered = sel ? requests.filter((r) => r.applicationId === sel) : requests;
    return filtered.filter(
      (r) =>
        r.status === AccessRequestStatus.InReview ||
        r.status === AccessRequestStatus.AwaitingApproval,
    ).length;
  });

  overdueRequests = computed(() => {
    const requests = this.accessRequests();
    const sel = this.selectedApplicationId();
    const filtered = sel ? requests.filter((r) => r.applicationId === sel) : requests;
    return filtered.filter((r) => new Date() > r.deadline).length;
  });

  totalExceptions = computed(() => {
    const exceptions = this.exceptions();
    const sel = this.selectedApplicationId();
    return sel ? exceptions.filter((e) => e.applicationId === sel).length : exceptions.length;
  });

  pendingExceptions = computed(() => {
    const exceptions = this.exceptions();
    const sel = this.selectedApplicationId();
    const filtered = sel ? exceptions.filter((e) => e.applicationId === sel) : exceptions;
    return filtered.filter((e) => !e.ownerDecision).length;
  });

  autoDeleteToday = computed(() => {
    const exceptions = this.exceptions();
    const today = new Date().toDateString();
    const sel = this.selectedApplicationId();
    const filtered = sel ? exceptions.filter((e) => e.applicationId === sel) : exceptions;
    return filtered.filter((e) => new Date(e.autoDeleteDate).toDateString() === today).length;
  });

  pendingApprovalsList = computed(() => {
    const requests = this.accessRequests();
    const sel = this.selectedApplicationId();
    const filtered = sel ? requests.filter((r) => r.applicationId === sel) : requests;
    return filtered
      .filter((r) => r.status === AccessRequestStatus.AwaitingApproval)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  });

  pendingExceptionsList = computed(() => {
    const exceptions = this.exceptions();
    const sel = this.selectedApplicationId();
    const filtered = sel ? exceptions.filter((e) => e.applicationId === sel) : exceptions;
    return filtered
      .filter((e) => !e.ownerDecision)
      .sort((a, b) => new Date(a.autoDeleteDate).getTime() - new Date(b.autoDeleteDate).getTime());
  });

  applicationMetrics = computed(() => {
    const metrics = this.dashboardMetrics();
    return metrics?.applicationMetrics || [];
  });

  recentActivity = computed(() => {
    const metrics = this.dashboardMetrics();
    return metrics?.recentActivity || [];
  });

  constructor(private accessManagementService: AccessManagementService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.accessManagementService.getApplications().subscribe((apps) => {
      this.applications.set(apps);
    });

    this.accessManagementService.getAccessRequests().subscribe((requests) => {
      this.accessRequests.set(requests);
    });

    this.accessManagementService.getExceptions().subscribe((exceptions) => {
      this.exceptions.set(exceptions);
    });

    this.accessManagementService.getDashboardMetrics().subscribe((metrics) => {
      this.dashboardMetrics.set(metrics);
    });
  }

  refreshData() {
    this.loadData();
  }

  onApplicationSelected() {
    // Data will be filtered automatically through computed properties
  }

  // Quick Actions
  quickApprove(requestId: string) {
    this.accessManagementService
      .approveRequest(requestId, "app-owner", "Quick approval from dashboard")
      .subscribe(() => {
        this.loadData();
      });
  }

  quickReject(requestId: string) {
    this.accessManagementService.rejectRequest?.(requestId, "app-owner", "Quick reject from dashboard")?.subscribe?.(() => {
      this.loadData();
    });
  }

  quickRetain(exceptionId: string) {
    this.accessManagementService
      .markExceptionDecision(
        exceptionId,
        ExceptionDecision.Retain,
        "Quick retention from dashboard",
      )
      .subscribe(() => {
        this.loadData();
      });
  }

  quickDelete(exceptionId: string) {
    this.accessManagementService
      .markExceptionDecision(exceptionId, ExceptionDecision.Delete)
      .subscribe(() => {
        this.loadData();
      });
  }

  // Modal handlers
  openRequestDetails(request: UserAccessRequest) {
    console.log('AppOwnerDashboard: openRequestDetails', request?.id);
    this.selectedRequest.set(request);
  }

  closeDetails() {
    this.selectedRequest.set(null);
  }

  approveInModal(requestId?: string | null) {
    if (!requestId) return;
    console.log('AppOwnerDashboard: approveInModal', requestId);
    this.accessManagementService
      .approveRequest(requestId, "app-owner", "Approved by application owner")
      .subscribe(() => {
        this.loadData();
        this.closeDetails();
      });
  }

  rejectInModal(requestId?: string | null) {
    if (!requestId) return;
    console.log('AppOwnerDashboard: rejectInModal', requestId);
    if (!this.accessManagementService.rejectRequest) {
      console.warn('Reject action not implemented in service');
      return;
    }
    this.accessManagementService.rejectRequest(requestId, "app-owner", "Rejected by application owner").subscribe(() => {
      this.loadData();
      this.closeDetails();
    });
  }

  // Utility methods
  getApplicationName(applicationId: string): string {
    const app = this.applications().find((a) => a.id === applicationId);
    return app?.name || "Unknown Application";
  }

  getTimeRemaining(deadline: Date): string {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours <= 0) return "Overdue";
    if (diffHours < 24) return `${diffHours}h remaining`;
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d remaining`;
  }

  getDaysUntilAutoDelete(autoDeleteDate: Date): number {
    const now = new Date();
    const deleteDate = new Date(autoDeleteDate);
    const diffTime = deleteDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCompletionRate(appMetric: ApplicationMetrics): number {
    if (appMetric.totalRequests === 0) return 100;
    const completed = appMetric.totalRequests - appMetric.pendingRequests;
    return Math.round((completed / appMetric.totalRequests) * 100);
  }

  // Mock methods for automated actions
  autoApprovedToday(): number {
    return this.dashboardMetrics()?.autoProcessedToday || 0;
  }

  autoDeletedToday(): number {
    // Mock data - would be calculated from actual deletions
    return 3;
  }

  notificationsSent(): number {
    // Mock data - would be calculated from notification logs
    return 15;
  }

  // Styling methods
  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      low: "bg-success-100 text-success-800",
      medium: "bg-primary-100 text-primary-800",
      high: "bg-warning-100 text-warning-800",
      critical: "bg-danger-100 text-danger-800",
    };
    return classes[priority] || classes["medium"];
  }

  getExceptionTypeClass(type: string): string {
    const classes: Record<string, string> = {
      user_not_found: "bg-danger-100 text-danger-800",
      group_not_found: "bg-warning-100 text-warning-800",
      system_not_found: "bg-primary-100 text-primary-800",
      integration_not_found: "bg-purple-100 text-purple-800",
    };
    return classes[type] || classes["user_not_found"];
  }

  getExceptionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      user_not_found: "User Not Found",
      group_not_found: "Group Not Found",
      system_not_found: "System Not Found",
      integration_not_found: "Integration Not Found",
    };
    return labels[type] || "Unknown";
  }

  getActivityIcon(action: string): string {
    const base = "text-white";
    switch (action) {
      case "request_approved":
        return `${base} bg-success-600`;
      case "request_rejected":
        return `${base} bg-danger-600`;
      case "exception_marked":
        return `${base} bg-purple-600`;
      case "auto_processed":
        return `${base} bg-primary-600`;
      default:
        return `${base} bg-secondary-600`;
    }
  }

  getActivityTypeClass(action: string): string {
    const classes: Record<string, string> = {
      request_approved: "bg-success-100 text-success-800",
      request_rejected: "bg-danger-100 text-danger-800",
      exception_marked: "bg-purple-100 text-purple-800",
      auto_processed: "bg-primary-100 text-primary-800",
      bulk_uploaded: "bg-warning-100 text-warning-800",
    };
    return classes[action] || "bg-secondary-100 text-secondary-800";
  }

  getActivityTypeLabel(action: string): string {
    const labels: Record<string, string> = {
      request_approved: "Approved",
      request_rejected: "Rejected",
      exception_marked: "Exception",
      auto_processed: "Auto-Processed",
      bulk_uploaded: "Bulk Upload",
    };
    return labels[action] || "Activity";
  }
}
