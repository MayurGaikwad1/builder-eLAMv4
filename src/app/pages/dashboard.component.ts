import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MockDataService } from "../shared/services/mock-data.service";
import { NewRequestModalComponent } from "../shared/components/new-request-modal.component";
import { ModalService } from "../shared/services/modal.service";
import {
  AccessRequest,
  RequestStatus,
  UrgencyLevel,
} from "../shared/interfaces/user.interface";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, NewRequestModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Metrics Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Total Requests
              </p>
              <p class="text-2xl font-bold text-secondary-900">
                {{ metrics().totalRequests | number }}
              </p>
              <p class="text-xs text-success-600 flex items-center mt-1">
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ metrics().requestsTrend }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-primary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Pending Approvals
              </p>
              <p class="text-2xl font-bold text-secondary-900">
                {{ metrics().pendingApprovals }}
              </p>
              <p class="text-xs text-danger-600 flex items-center mt-1">
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ metrics().approvalsTrend }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-warning-600"
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
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Active Users</p>
              <p class="text-2xl font-bold text-secondary-900">
                {{ metrics().activeUsers | number }}
              </p>
              <p class="text-xs text-success-600 flex items-center mt-1">
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ metrics().usersTrend }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-success-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Risk Score</p>
              <p class="text-2xl font-bold text-secondary-900">
                {{ metrics().riskScore }}
              </p>
              <p class="text-xs text-warning-600 flex items-center mt-1">
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ metrics().riskTrend }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-danger-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Requests -->
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-secondary-900">
              Recent Access Requests
            </h2>
            <button
              (click)="viewAllRequests()"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </button>
          </div>

          <div class="space-y-4">
            <div
              *ngFor="
                let request of recentRequests();
                trackBy: trackByRequestId
              "
              class="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"
                >
                  <span class="text-sm font-medium text-primary-700">
                    {{ getInitials(request.requesterName) }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-secondary-900">
                    {{ request.requesterName }}
                  </p>
                  <p class="text-sm text-secondary-600">
                    {{ request.requestedRoles[0]?.name || "Access Request" }}
                  </p>
                  <p class="text-xs text-secondary-500">
                    {{ request.submittedAt | date: "short" }}
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <span
                  [class]="getUrgencyClass(request.urgency)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ request.urgency | titlecase }}
                </span>
                <span
                  [class]="getStatusClass(request.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusLabel(request.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Risk Assessment -->
        <div class="card">
          <h2 class="text-lg font-semibold text-secondary-900 mb-6">
            Risk Assessment
          </h2>

          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Critical Risk</span>
                <span class="text-sm font-medium text-danger-600"
                  >3 requests</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="bg-danger-600 h-2 rounded-full"
                  style="width: 15%"
                ></div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">High Risk</span>
                <span class="text-sm font-medium text-warning-600"
                  >8 requests</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="bg-warning-600 h-2 rounded-full"
                  style="width: 40%"
                ></div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Medium Risk</span>
                <span class="text-sm font-medium text-primary-600"
                  >12 requests</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="bg-primary-600 h-2 rounded-full"
                  style="width: 60%"
                ></div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Low Risk</span>
                <span class="text-sm font-medium text-success-600"
                  >25 requests</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="bg-success-600 h-2 rounded-full"
                  style="width: 80%"
                ></div>
              </div>
            </div>
          </div>

          <div
            class="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 text-warning-600 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-warning-800">
                  Action Required
                </p>
                <p class="text-xs text-warning-700">
                  3 high-risk requests need immediate review
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h2 class="text-lg font-semibold text-secondary-900 mb-6">
          Quick Actions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            class="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left"
          >
            <svg
              class="w-8 h-8 text-primary-600 mr-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"
              ></path>
            </svg>
            <div>
              <p class="font-medium text-secondary-900">Provision User</p>
              <p class="text-sm text-secondary-600">Create new user access</p>
            </div>
          </button>

          <button
            class="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left"
          >
            <svg
              class="w-8 h-8 text-warning-600 mr-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <div>
              <p class="font-medium text-secondary-900">Review Approvals</p>
              <p class="text-sm text-secondary-600">3 pending approvals</p>
            </div>
          </button>

          <button
            class="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left"
          >
            <svg
              class="w-8 h-8 text-success-600 mr-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
              <path
                fill-rule="evenodd"
                d="M4 5a2 2 0 012-2v1a1 1 0 00-1 1v6a1 1 0 001 1v1a2 2 0 01-2-2V5zM15 5a2 2 0 00-2-2v1a1 1 0 011 1v6a1 1 0 01-1 1v1a2 2 0 002-2V5z"
                clip-rule="evenodd"
              ></path>
              <path d="M8 8a1 1 0 000 2h4a1 1 0 100-2H8z"></path>
            </svg>
            <div>
              <p class="font-medium text-secondary-900">Generate Report</p>
              <p class="text-sm text-secondary-600">Compliance reports</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- New Request Modal -->
    <app-new-request-modal
      *ngIf="showNewRequestModal()"
      (close)="closeNewRequestModal()"
      (submitted)="onRequestSubmitted()"
    ></app-new-request-modal>
  `,
})
export class DashboardComponent implements OnInit {
  metrics = signal<any>({});
  recentRequests = signal<AccessRequest[]>([]);
  showNewRequestModal = signal(false);

  constructor(
    private mockDataService: MockDataService,
    private modalService: ModalService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadDashboardData();

    // Subscribe to new request modal events
    this.modalService.newRequest$.subscribe(() => {
      this.openNewRequestModal();
    });
  }

  private loadDashboardData() {
    this.mockDataService.getDashboardMetrics().subscribe((metrics) => {
      this.metrics.set(metrics);
    });

    this.mockDataService.getAccessRequests().subscribe((requests) => {
      this.recentRequests.set(requests.slice(0, 5));
    });
  }

  openNewRequestModal() {
    this.showNewRequestModal.set(true);
  }

  closeNewRequestModal() {
    this.showNewRequestModal.set(false);
  }

  onRequestSubmitted() {
    // Refresh the recent requests after a new request is submitted
    this.loadDashboardData();
  }

  // Navigation methods for dashboard buttons
  viewAllRequests() {
    this.router.navigate(['/requests']);
  }

  navigateToUserProvisioning() {
    this.router.navigate(['/users/provisioning']);
  }

  navigateToApprovals() {
    this.router.navigate(['/approvals/queue']);
  }

  navigateToReports() {
    this.router.navigate(['/audit/compliance']);
  }

  trackByRequestId(index: number, request: AccessRequest): string {
    return request.id;
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  getUrgencyClass(urgency: UrgencyLevel): string {
    const classes = {
      [UrgencyLevel.Low]: "bg-success-100 text-success-800",
      [UrgencyLevel.Medium]: "bg-primary-100 text-primary-800",
      [UrgencyLevel.High]: "bg-warning-100 text-warning-800",
      [UrgencyLevel.Critical]: "bg-danger-100 text-danger-800",
    };
    return classes[urgency];
  }

  getStatusClass(status: RequestStatus): string {
    const classes = {
      [RequestStatus.Draft]: "bg-secondary-100 text-secondary-800",
      [RequestStatus.Submitted]: "bg-primary-100 text-primary-800",
      [RequestStatus.InReview]: "bg-warning-100 text-warning-800",
      [RequestStatus.Approved]: "bg-success-100 text-success-800",
      [RequestStatus.Rejected]: "bg-danger-100 text-danger-800",
      [RequestStatus.Provisioning]: "bg-primary-100 text-primary-800",
      [RequestStatus.Completed]: "bg-success-100 text-success-800",
      [RequestStatus.Expired]: "bg-secondary-100 text-secondary-800",
    };
    return classes[status];
  }

  getStatusLabel(status: RequestStatus): string {
    const labels = {
      [RequestStatus.Draft]: "Draft",
      [RequestStatus.Submitted]: "Submitted",
      [RequestStatus.InReview]: "In Review",
      [RequestStatus.Approved]: "Approved",
      [RequestStatus.Rejected]: "Rejected",
      [RequestStatus.Provisioning]: "Provisioning",
      [RequestStatus.Completed]: "Completed",
      [RequestStatus.Expired]: "Expired",
    };
    return labels[status];
  }
}
