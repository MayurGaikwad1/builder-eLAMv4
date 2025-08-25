import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MockDataService } from "../shared/services/mock-data.service";
import {
  AccessRequest,
  RequestType,
  UrgencyLevel,
  Role,
  RiskLevel,
} from "../shared/interfaces/user.interface";

@Component({
  selector: "app-access-requests",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">Access Requests</h1>
          <p class="text-secondary-600">
            Request and manage access to systems and resources
          </p>
        </div>
        <button
          (click)="showNewRequestForm = !showNewRequestForm"
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
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-secondary-900">
              {{ myRequests().length }}
            </p>
            <p class="text-sm text-secondary-600">My Requests</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-warning-600">
              {{ pendingCount() }}
            </p>
            <p class="text-sm text-secondary-600">Pending</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-success-600">
              {{ approvedCount() }}
            </p>
            <p class="text-sm text-secondary-600">Approved</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-primary-600">
              {{ avgProcessingTime() }}
            </p>
            <p class="text-sm text-secondary-600">Avg Processing</p>
          </div>
        </div>
      </div>

      <!-- New Request Form -->
      <div *ngIf="showNewRequestForm" class="card animate-slide-up">
        <h2 class="text-lg font-semibold text-secondary-900 mb-6">
          New Access Request
        </h2>

        <form (ngSubmit)="submitRequest()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2"
                >Request Type</label
              >
              <select
                [(ngModel)]="newRequest.requestType"
                name="requestType"
                class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select request type</option>
                <option value="new_access">New Access</option>
                <option value="modify_access">Modify Access</option>
                <option value="remove_access">Remove Access</option>
                <option value="emergency">Emergency Access</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2"
                >Urgency Level</label
              >
              <select
                [(ngModel)]="newRequest.urgency"
                name="urgency"
                class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2"
              >Requested Role/System</label
            >
            <select
              (change)="onRoleSelected($event)"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select role or system</option>
              <option *ngFor="let role of availableRoles" [value]="role.id">
                {{ role.name }} - {{ role.description }}
              </option>
            </select>
          </div>

          <div *ngIf="newRequest.requestedRoles.length > 0">
            <label class="block text-sm font-medium text-secondary-700 mb-2"
              >Selected Roles</label
            >
            <div class="space-y-2">
              <div
                *ngFor="let role of newRequest.requestedRoles"
                class="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <span
                    [class]="getRiskBadgeClass(role.riskLevel)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ role.riskLevel | titlecase }}
                  </span>
                  <div>
                    <p class="font-medium text-secondary-900">
                      {{ role.name }}
                    </p>
                    <p class="text-sm text-secondary-600">
                      {{ role.description }}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="removeRole(role.id)"
                  class="text-danger-600 hover:text-danger-700"
                >
                  <svg
                    class="w-4 h-4"
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
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2"
              >Business Justification</label
            >
            <textarea
              [(ngModel)]="newRequest.justification"
              name="justification"
              rows="4"
              placeholder="Provide detailed business justification for this access request..."
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            ></textarea>
          </div>

          <!-- Risk Assessment Preview -->
          <div
            *ngIf="newRequest.requestedRoles.length > 0"
            class="p-4 bg-warning-50 border border-warning-200 rounded-lg"
          >
            <div class="flex items-center mb-2">
              <svg
                class="w-5 h-5 text-warning-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <p class="text-sm font-medium text-warning-800">
                Risk Assessment
              </p>
            </div>
            <p class="text-sm text-warning-700">
              This request will require additional approval due to
              {{ getHighestRiskLevel() }} risk level. Expected processing time:
              {{ getExpectedProcessingTime() }}
            </p>
          </div>

          <div class="flex items-center justify-end space-x-3">
            <button
              type="button"
              (click)="cancelNewRequest()"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary"
              [disabled]="!isFormValid()"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>

      <!-- Requests Table -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-secondary-900">My Requests</h2>
          <div class="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search requests..."
              class="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              class="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th class="table-header">Request ID</th>
                <th class="table-header">Type</th>
                <th class="table-header">Requested Access</th>
                <th class="table-header">Status</th>
                <th class="table-header">Priority</th>
                <th class="table-header">Submitted</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                *ngFor="let request of myRequests(); trackBy: trackByRequestId"
                class="hover:bg-secondary-50"
              >
                <td class="table-cell">
                  <span class="font-mono text-sm">{{ request.id }}</span>
                </td>
                <td class="table-cell">
                  <span class="capitalize">{{
                    request.requestType.replace("_", " ")
                  }}</span>
                </td>
                <td class="table-cell">
                  <div>
                    <p class="font-medium">
                      {{ request.requestedRoles[0]?.name || "Multiple Roles" }}
                    </p>
                    <p class="text-xs text-secondary-500">
                      {{ request.requestedResources.join(", ") }}
                    </p>
                  </div>
                </td>
                <td class="table-cell">
                  <span
                    [class]="getStatusClass(request.status)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getStatusLabel(request.status) }}
                  </span>
                </td>
                <td class="table-cell">
                  <span
                    [class]="getUrgencyClass(request.urgency)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ request.urgency | titlecase }}
                  </span>
                </td>
                <td class="table-cell">
                  <span class="text-sm">{{
                    request.submittedAt | date: "MMM d, y"
                  }}</span>
                </td>
                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <button
                      class="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View
                    </button>
                    <button
                      *ngIf="request.status === 'draft'"
                      class="text-secondary-600 hover:text-secondary-700 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AccessRequestsComponent implements OnInit {
  showNewRequestForm = false;
  myRequests = signal<AccessRequest[]>([]);

  newRequest = {
    requestType: "",
    urgency: UrgencyLevel.Medium,
    requestedRoles: [] as Role[],
    requestedResources: [] as string[],
    justification: "",
  };

  availableRoles: Role[] = [
    {
      id: "r1",
      name: "Employee",
      description: "Standard employee access",
      permissions: [],
      riskLevel: RiskLevel.Low,
    },
    {
      id: "r2",
      name: "Database Admin",
      description: "Database administration access",
      permissions: [],
      riskLevel: RiskLevel.High,
    },
    {
      id: "r3",
      name: "Security Analyst",
      description: "Security analysis and monitoring",
      permissions: [],
      riskLevel: RiskLevel.Medium,
    },
    {
      id: "r4",
      name: "System Administrator",
      description: "Full system administration",
      permissions: [],
      riskLevel: RiskLevel.Critical,
    },
    {
      id: "r5",
      name: "Auditor",
      description: "Audit and compliance access",
      permissions: [],
      riskLevel: RiskLevel.Medium,
    },
    {
      id: "r6",
      name: "Developer",
      description: "Development environment access",
      permissions: [],
      riskLevel: RiskLevel.Low,
    },
    {
      id: "r7",
      name: "Manager",
      description: "Management and approval access",
      permissions: [],
      riskLevel: RiskLevel.Medium,
    },
  ];

  constructor(
    private mockDataService: MockDataService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.loadMyRequests();
    this.checkRouteForNewRequest();
  }

  private checkRouteForNewRequest() {
    const url = this.router.url;
    if (url.includes('/requests/new')) {
      this.showNewRequestForm = true;
    }
  }

  private loadMyRequests() {
    this.mockDataService.getMyRequests("1").subscribe((requests) => {
      this.myRequests.set(requests);
    });
  }

  onRoleSelected(event: any) {
    const roleId = event.target.value;
    const role = this.availableRoles.find((r) => r.id === roleId);
    if (role && !this.newRequest.requestedRoles.find((r) => r.id === roleId)) {
      this.newRequest.requestedRoles.push(role);
      this.newRequest.requestedResources.push(role.name + " Access");
    }
    event.target.value = "";
  }

  removeRole(roleId: string) {
    this.newRequest.requestedRoles = this.newRequest.requestedRoles.filter(
      (r) => r.id !== roleId,
    );
    this.newRequest.requestedResources =
      this.newRequest.requestedResources.filter(
        (_, index) => this.newRequest.requestedRoles[index]?.id !== roleId,
      );
  }

  submitRequest() {
    if (this.isFormValid()) {
      this.mockDataService
        .submitAccessRequest({
          requestType: this.newRequest.requestType as RequestType,
          urgency: this.newRequest.urgency,
          requestedRoles: this.newRequest.requestedRoles,
          requestedResources: this.newRequest.requestedResources,
          justification: this.newRequest.justification,
        })
        .subscribe(() => {
          this.showNewRequestForm = false;
          this.resetForm();
          this.loadMyRequests();
        });
    }
  }

  cancelNewRequest() {
    this.showNewRequestForm = false;
    this.resetForm();
    if (this.router.url.includes('/requests/new')) {
      this.router.navigate(['/requests']);
    }
  }

  private resetForm() {
    this.newRequest = {
      requestType: "",
      urgency: UrgencyLevel.Medium,
      requestedRoles: [],
      requestedResources: [],
      justification: "",
    };
  }

  isFormValid(): boolean {
    return (
      this.newRequest.requestType !== "" &&
      this.newRequest.requestedRoles.length > 0 &&
      this.newRequest.justification.trim() !== ""
    );
  }

  getHighestRiskLevel(): string {
    if (this.newRequest.requestedRoles.length === 0) return "low";
    const risks = this.newRequest.requestedRoles.map((r) => r.riskLevel);
    if (risks.includes(RiskLevel.Critical)) return "critical";
    if (risks.includes(RiskLevel.High)) return "high";
    if (risks.includes(RiskLevel.Medium)) return "medium";
    return "low";
  }

  getExpectedProcessingTime(): string {
    const highestRisk = this.getHighestRiskLevel();
    const times = {
      low: "1-2 business days",
      medium: "2-3 business days",
      high: "3-5 business days",
      critical: "1-2 hours (emergency approval)",
    };
    return times[highestRisk as keyof typeof times];
  }

  getRiskBadgeClass(riskLevel: RiskLevel): string {
    const classes = {
      [RiskLevel.Low]: "bg-success-100 text-success-800",
      [RiskLevel.Medium]: "bg-primary-100 text-primary-800",
      [RiskLevel.High]: "bg-warning-100 text-warning-800",
      [RiskLevel.Critical]: "bg-danger-100 text-danger-800",
    };
    return classes[riskLevel];
  }

  pendingCount() {
    return this.myRequests().filter(
      (r) => r.status === "submitted" || r.status === "in_review",
    ).length;
  }

  approvedCount() {
    return this.myRequests().filter(
      (r) => r.status === "approved" || r.status === "completed",
    ).length;
  }

  avgProcessingTime() {
    return "2.3 days"; // Mock average
  }

  trackByRequestId(index: number, request: AccessRequest): string {
    return request.id;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      draft: "bg-secondary-100 text-secondary-800",
      submitted: "bg-primary-100 text-primary-800",
      in_review: "bg-warning-100 text-warning-800",
      approved: "bg-success-100 text-success-800",
      rejected: "bg-danger-100 text-danger-800",
      provisioning: "bg-primary-100 text-primary-800",
      completed: "bg-success-100 text-success-800",
      expired: "bg-secondary-100 text-secondary-800",
    };
    return classes[status] || classes["draft"];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: "Draft",
      submitted: "Submitted",
      in_review: "In Review",
      approved: "Approved",
      rejected: "Rejected",
      provisioning: "Provisioning",
      completed: "Completed",
      expired: "Expired",
    };
    return labels[status] || "Unknown";
  }

  getUrgencyClass(urgency: string): string {
    const classes: Record<string, string> = {
      low: "bg-success-100 text-success-800",
      medium: "bg-primary-100 text-primary-800",
      high: "bg-warning-100 text-warning-800",
      critical: "bg-danger-100 text-danger-800",
    };
    return classes[urgency] || classes["medium"];
  }
}
