import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { ApprovalManagementService } from "../../shared/services/approval-management.service";
import {
  ApprovalRequest,
  ApprovalAction,
  ApprovalActionType,
  ApprovalStatus,
  RequestType,
  ApprovalPriority,
} from "../../shared/interfaces/approval-management.interface";
import { UrgencyLevel } from "../../shared/interfaces/user.interface";

@Component({
  selector: "app-approval-queue",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">Approval Queue</h1>
          <p class="text-secondary-600">
            Review and process pending access requests
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            (click)="toggleBulkMode()"
            [class]="bulkMode ? 'btn-primary' : 'btn-secondary'"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            {{ bulkMode ? "Exit Bulk Mode" : "Bulk Actions" }}
          </button>
          <button class="btn-secondary" (click)="refreshQueue()">
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

      <!-- Filters and Search -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Search</label
            >
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
              placeholder="Request title, requester..."
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
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
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Urgency</label
            >
            <select
              [(ngModel)]="filters.urgency"
              (change)="applyFilters()"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Urgency</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Request Type</label
            >
            <select
              [(ngModel)]="filters.requestType"
              (change)="applyFilters()"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="access_request">Access Request</option>
              <option value="role_change">Role Change</option>
              <option value="emergency_access">Emergency Access</option>
              <option value="system_access">System Access</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1"
              >Queue</label
            >
            <select
              [(ngModel)]="filters.queue"
              (change)="applyFilters()"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Queues</option>
              <option value="my_queue">My Queue</option>
              <option value="delegated">Delegated to Me</option>
              <option value="escalated">Escalated to Me</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <div
        *ngIf="bulkMode && selectedRequests.size > 0"
        class="card bg-primary-50 border-primary-200"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-primary-900"
              >{{ selectedRequests.size }} requests selected</span
            >
            <button
              (click)="selectAll()"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              Select All Visible
            </button>
            <button
              (click)="clearSelection()"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear Selection
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <button
              (click)="processBulkAction('approve')"
              class="btn-primary text-sm py-2 px-4"
            >
              Bulk Approve
            </button>
            <button
              (click)="processBulkAction('reject')"
              class="btn-danger text-sm py-2 px-4"
            >
              Bulk Reject
            </button>
            <button
              (click)="showBulkDelegationModal = true"
              class="btn-secondary text-sm py-2 px-4"
            >
              Bulk Delegate
            </button>
          </div>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-semibold text-secondary-900">
              Pending Requests ({{ filteredRequests().length }})
            </h2>
            <p class="text-sm text-secondary-600">
              {{ getHighPriorityCount() }} high priority •
              {{ getSlaBreachCount() }} SLA breaches
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              (click)="sortBy('submittedAt')"
              [class]="
                sortField === 'submittedAt' ? 'btn-primary' : 'btn-secondary'
              "
              class="text-sm py-1 px-3"
            >
              Date
            </button>
            <button
              (click)="sortBy('urgency')"
              [class]="
                sortField === 'urgency' ? 'btn-primary' : 'btn-secondary'
              "
              class="text-sm py-1 px-3"
            >
              Priority
            </button>
            <button
              (click)="sortBy('riskScore')"
              [class]="
                sortField === 'riskScore' ? 'btn-primary' : 'btn-secondary'
              "
              class="text-sm py-1 px-3"
            >
              Risk
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th *ngIf="bulkMode" class="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    [checked]="areAllSelected()"
                    (change)="toggleSelectAll()"
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th class="table-header">Request</th>
                <th class="table-header">Requester</th>
                <th class="table-header">Type</th>
                <th class="table-header">Priority</th>
                <th class="table-header">Risk Score</th>
                <th class="table-header">SLA Status</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                *ngFor="
                  let request of filteredRequests();
                  trackBy: trackByRequestId
                "
                class="hover:bg-secondary-50"
                [class.bg-danger-50]="request.slaBreachWarning"
                [class.border-l-4]="request.slaBreachWarning"
                [class.border-danger-500]="request.slaBreachWarning"
              >
                <td *ngIf="bulkMode" class="px-6 py-4">
                  <input
                    type="checkbox"
                    [checked]="selectedRequests.has(request.id)"
                    (change)="toggleRequestSelection(request.id)"
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>

                <td class="table-cell">
                  <div>
                    <p class="font-medium text-secondary-900">
                      {{ request.requestTitle }}
                    </p>
                    <p class="text-sm text-secondary-600">
                      {{ request.description | slice: 0 : 80
                      }}{{ request.description.length > 80 ? "..." : "" }}
                    </p>
                    <p class="text-xs text-secondary-500">
                      ID: {{ request.id }} • Level {{ request.currentLevel }}/{{
                        request.totalLevels
                      }}
                    </p>
                  </div>
                </td>

                <td class="table-cell">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-xs font-medium text-primary-700">
                        {{ getInitials(request.requestedBy.name) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-secondary-900">
                        {{ request.requestedBy.name }}
                      </p>
                      <p class="text-sm text-secondary-600">
                        {{ request.requestedBy.department }}
                      </p>
                      <p class="text-xs text-secondary-500">
                        {{ request.requestedBy.title }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="table-cell">
                  <span
                    [class]="getRequestTypeClass(request.requestType)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getRequestTypeLabel(request.requestType) }}
                  </span>
                </td>

                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <span
                      [class]="getUrgencyClass(request.urgency)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ request.urgency | titlecase }}
                    </span>
                    <svg
                      *ngIf="request.slaBreachWarning"
                      class="w-4 h-4 text-danger-500"
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
                </td>

                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <span
                      [class]="getRiskScoreClass(request.riskScore)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ request.riskScore }}
                    </span>
                    <svg
                      *ngIf="request.conflictChecks.length > 0"
                      class="w-4 h-4 text-warning-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      title="SoD Conflicts Detected"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </td>

                <td class="table-cell">
                  <div>
                    <span
                      [class]="getSlaStatusClass(request)"
                      class="text-sm font-medium"
                    >
                      {{ getSlaStatus(request) }}
                    </span>
                    <p class="text-xs text-secondary-500">
                      {{ getTimeRemaining(request.deadline) }}
                    </p>
                  </div>
                </td>

                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <button
                      (click)="showApprovalModal(request)"
                      class="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Review
                    </button>
                    <button
                      (click)="quickApprove(request.id)"
                      class="text-success-600 hover:text-success-700 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      (click)="quickReject(request.id)"
                      class="text-danger-600 hover:text-danger-700 text-sm"
                    >
                      Reject
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
            Showing {{ filteredRequests().length }} of
            {{ allRequests().length }} requests
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

      <!-- Approval Modal -->
      <div
        *ngIf="selectedRequest"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-secondary-900">
                Review Request
              </h2>
              <button
                (click)="closeApprovalModal()"
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

            <!-- Request Details -->
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-md font-medium text-secondary-900 mb-3">
                    Request Information
                  </h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Title:</span>
                      <span class="font-medium">{{
                        selectedRequest.requestTitle
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Type:</span>
                      <span class="font-medium">{{
                        getRequestTypeLabel(selectedRequest.requestType)
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Priority:</span>
                      <span
                        [class]="getUrgencyClass(selectedRequest.urgency)"
                        class="px-2 py-1 text-xs font-medium rounded-full"
                      >
                        {{ selectedRequest.urgency | titlecase }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Risk Score:</span>
                      <span
                        [class]="getRiskScoreClass(selectedRequest.riskScore)"
                        class="px-2 py-1 text-xs font-medium rounded-full"
                      >
                        {{ selectedRequest.riskScore }}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-md font-medium text-secondary-900 mb-3">
                    Requester Information
                  </h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Name:</span>
                      <span class="font-medium">{{
                        selectedRequest.requestedBy.name
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Department:</span>
                      <span class="font-medium">{{
                        selectedRequest.requestedBy.department
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Title:</span>
                      <span class="font-medium">{{
                        selectedRequest.requestedBy.title
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Manager:</span>
                      <span class="font-medium">{{
                        selectedRequest.requestedBy.manager || "Not specified"
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-md font-medium text-secondary-900 mb-3">
                  Business Justification
                </h3>
                <p
                  class="text-sm text-secondary-700 bg-secondary-50 p-3 rounded-lg"
                >
                  {{ selectedRequest.justification }}
                </p>
              </div>

              <!-- Action Buttons -->
              <div
                class="flex items-center justify-end space-x-3 pt-6 border-t border-secondary-200"
              >
                <button (click)="closeApprovalModal()" class="btn-secondary">
                  Cancel
                </button>
                <button
                  (click)="rejectRequest(selectedRequest.id)"
                  class="btn-danger"
                >
                  Reject
                </button>
                <button
                  (click)="approveRequest(selectedRequest.id)"
                  class="btn-primary"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ApprovalQueueComponent implements OnInit {
  allRequests = signal<ApprovalRequest[]>([]);
  filteredRequests = signal<ApprovalRequest[]>([]);
  selectedRequest: ApprovalRequest | null = null;

  bulkMode = false;
  selectedRequests = new Set<string>();
  showBulkDelegationModal = false;

  searchQuery = "";
  sortField = "submittedAt";
  sortDirection = "desc";

  filters = {
    status: "",
    urgency: "",
    requestType: "",
    queue: "",
  };

  constructor(private approvalService: ApprovalManagementService) {}

  ngOnInit() {
    this.loadRequests();
  }

  private loadRequests() {
    this.approvalService.getMyApprovals().subscribe((requests) => {
      this.allRequests.set(requests);
      this.applyFilters();
    });
  }

  applyFilters() {
    let filtered = this.allRequests();

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.requestTitle.toLowerCase().includes(query) ||
          req.requestedBy.name.toLowerCase().includes(query) ||
          req.description.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (this.filters.status) {
      filtered = filtered.filter((req) => req.status === this.filters.status);
    }

    // Urgency filter
    if (this.filters.urgency) {
      filtered = filtered.filter((req) => req.urgency === this.filters.urgency);
    }

    // Request type filter
    if (this.filters.requestType) {
      filtered = filtered.filter(
        (req) => req.requestType === this.filters.requestType,
      );
    }

    // Queue filter
    if (this.filters.queue) {
      switch (this.filters.queue) {
        case "my_queue":
          // Already filtered to my approvals
          break;
        case "delegated":
          this.approvalService
            .getDelegatedApprovals()
            .subscribe((delegated) => {
              this.filteredRequests.set(delegated);
            });
          return;
        case "escalated":
          this.approvalService
            .getEscalatedApprovals()
            .subscribe((escalated) => {
              this.filteredRequests.set(escalated);
            });
          return;
      }
    }

    // Sort
    filtered = this.sortRequests(filtered);

    this.filteredRequests.set(filtered);
  }

  private sortRequests(requests: ApprovalRequest[]): ApprovalRequest[] {
    return requests.sort((a, b) => {
      let comparison = 0;

      switch (this.sortField) {
        case "submittedAt":
          comparison =
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime();
          break;
        case "urgency":
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison =
            urgencyOrder[b.urgency as keyof typeof urgencyOrder] -
            urgencyOrder[a.urgency as keyof typeof urgencyOrder];
          break;
        case "riskScore":
          comparison = b.riskScore - a.riskScore;
          break;
      }

      return this.sortDirection === "desc" ? comparison : -comparison;
    });
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === "desc" ? "asc" : "desc";
    } else {
      this.sortField = field;
      this.sortDirection = "desc";
    }
    this.applyFilters();
  }

  refreshQueue() {
    this.loadRequests();
  }

  toggleBulkMode() {
    this.bulkMode = !this.bulkMode;
    if (!this.bulkMode) {
      this.selectedRequests.clear();
    }
  }

  toggleRequestSelection(requestId: string) {
    if (this.selectedRequests.has(requestId)) {
      this.selectedRequests.delete(requestId);
    } else {
      this.selectedRequests.add(requestId);
    }
  }

  toggleSelectAll() {
    if (this.areAllSelected()) {
      this.clearSelection();
    } else {
      this.selectAll();
    }
  }

  selectAll() {
    this.filteredRequests().forEach((req) => this.selectedRequests.add(req.id));
  }

  clearSelection() {
    this.selectedRequests.clear();
  }

  areAllSelected(): boolean {
    return (
      this.filteredRequests().length > 0 &&
      this.filteredRequests().every((req) => this.selectedRequests.has(req.id))
    );
  }

  processBulkAction(action: "approve" | "reject") {
    const actionType =
      action === "approve"
        ? ApprovalActionType.BulkApprove
        : ApprovalActionType.BulkReject;

    this.approvalService
      .processBulkApprovalAction({
        action: actionType,
        requestIds: Array.from(this.selectedRequests),
        comments: `Bulk ${action} action`,
      })
      .subscribe(() => {
        this.selectedRequests.clear();
        this.loadRequests();
      });
  }

  showApprovalModal(request: ApprovalRequest) {
    this.selectedRequest = request;
  }

  closeApprovalModal() {
    this.selectedRequest = null;
  }

  quickApprove(requestId: string) {
    this.processAction(requestId, ApprovalActionType.Approve);
  }

  quickReject(requestId: string) {
    this.processAction(requestId, ApprovalActionType.Reject);
  }

  approveRequest(requestId: string) {
    this.processAction(requestId, ApprovalActionType.Approve);
    this.closeApprovalModal();
  }

  rejectRequest(requestId: string) {
    this.processAction(requestId, ApprovalActionType.Reject);
    this.closeApprovalModal();
  }

  delegateRequest(requestId: string) {
    // For demo, delegate to a mock user
    this.approvalService
      .delegateApproval(requestId, "delegate-001", "Delegated for review")
      .subscribe(() => {
        this.loadRequests();
        this.closeApprovalModal();
      });
  }

  private processAction(requestId: string, actionType: ApprovalActionType) {
    const action: ApprovalAction = {
      type: actionType,
      requestId,
      comments: `${actionType} via approval queue`,
      timeSpent: Math.floor(Math.random() * 10) + 5,
    };

    this.approvalService.processApprovalAction(action).subscribe(() => {
      this.loadRequests();
    });
  }

  getHighPriorityCount(): number {
    return this.filteredRequests().filter(
      (req) =>
        req.urgency === UrgencyLevel.High ||
        req.urgency === UrgencyLevel.Critical,
    ).length;
  }

  getSlaBreachCount(): number {
    return this.filteredRequests().filter((req) => req.slaBreachWarning).length;
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  getRequestTypeClass(type: RequestType): string {
    const classes = {
      [RequestType.AccessRequest]: "bg-primary-100 text-primary-800",
      [RequestType.RoleChange]: "bg-success-100 text-success-800",
      [RequestType.PermissionModification]: "bg-warning-100 text-warning-800",
      [RequestType.SystemAccess]: "bg-primary-100 text-primary-800",
      [RequestType.EmergencyAccess]: "bg-danger-100 text-danger-800",
      [RequestType.DataAccess]: "bg-secondary-100 text-secondary-800",
      [RequestType.AdminAccess]: "bg-danger-100 text-danger-800",
    };
    return classes[type] || "bg-secondary-100 text-secondary-800";
  }

  getRequestTypeLabel(type: RequestType): string {
    const labels = {
      [RequestType.AccessRequest]: "Access Request",
      [RequestType.RoleChange]: "Role Change",
      [RequestType.PermissionModification]: "Permission Modification",
      [RequestType.SystemAccess]: "System Access",
      [RequestType.EmergencyAccess]: "Emergency Access",
      [RequestType.DataAccess]: "Data Access",
      [RequestType.AdminAccess]: "Admin Access",
    };
    return labels[type] || "Unknown";
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

  getRiskScoreClass(score: number): string {
    if (score < 25) return "bg-success-100 text-success-800";
    if (score < 60) return "bg-primary-100 text-primary-800";
    if (score < 85) return "bg-warning-100 text-warning-800";
    return "bg-danger-100 text-danger-800";
  }

  getSlaStatusClass(request: ApprovalRequest): string {
    if (request.slaBreachWarning) return "text-danger-600";
    if (this.getTimeRemainingHours(request.deadline) < 4)
      return "text-warning-600";
    return "text-success-600";
  }

  getSlaStatus(request: ApprovalRequest): string {
    if (request.slaBreachWarning) return "SLA Breach";
    const hoursRemaining = this.getTimeRemainingHours(request.deadline);
    if (hoursRemaining < 2) return "Critical";
    if (hoursRemaining < 8) return "Warning";
    return "On Track";
  }

  getTimeRemaining(deadline?: Date): string {
    if (!deadline) return "No deadline";

    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();

    if (diff < 0) return "Overdue";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  private getTimeRemainingHours(deadline?: Date): number {
    if (!deadline) return 999;

    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  }

  trackByRequestId(index: number, request: ApprovalRequest): string {
    return request.id;
  }
}
