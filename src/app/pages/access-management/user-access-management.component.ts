import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AccessManagementService } from "../../shared/services/access-management.service";
import {
  Application,
  UserAccessRequest,
  BulkUpload,
  AccessLevel,
  AccessRequestType,
  AccessRequestStatus,
  Priority,
  ApprovalStatus,
  UploadStatus,
} from "../../shared/interfaces/access-management.interface";

@Component({
  selector: "app-user-access-management",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">
            User Access Management
          </h1>
          <p class="text-secondary-600">
            Manage user access through structured workflows with multi-level
            approvals
          </p>
        </div>
        <div class="flex space-x-3">
          <button
            (click)="showBulkUpload = !showBulkUpload"
            class="btn-secondary"
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              ></path>
            </svg>
            Bulk Upload
          </button>
          <button
            (click)="showNewRequest = !showNewRequest"
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
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <p class="text-2xl font-bold text-success-600">
              {{ approvedRequests() }}
            </p>
            <p class="text-sm text-secondary-600">Approved</p>
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
            <p class="text-2xl font-bold text-primary-600">
              {{ autoProcessedToday() }}
            </p>
            <p class="text-sm text-secondary-600">Auto-Processed</p>
          </div>
        </div>
      </div>

      <!-- Bulk Upload Section -->
      <div *ngIf="showBulkUpload" class="card animate-slide-up">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-secondary-900">
            Bulk Upload Access Requests
          </h2>
          <button (click)="downloadTemplate()" class="btn-secondary text-sm">
            <svg
              class="w-4 h-4 mr-1"
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
            Download Template
          </button>
        </div>

        <form (ngSubmit)="processBulkUpload()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2"
              >Select Application</label
            >
            <select
              [(ngModel)]="bulkUploadForm.applicationId"
              name="applicationId"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select application</option>
              <option *ngFor="let app of applications()" [value]="app.id">
                {{ app.name }} ({{ app.type | titlecase }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2"
              >Upload Excel File</label
            >
            <div
              class="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
            >
              <input
                type="file"
                #fileInput
                (change)="onFileSelected($event)"
                accept=".xlsx,.xls,.csv"
                class="hidden"
              />
              <div
                *ngIf="!selectedFile"
                (click)="fileInput.click()"
                class="cursor-pointer"
              >
                <svg
                  class="w-12 h-12 text-secondary-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  ></path>
                </svg>
                <p class="text-secondary-600">
                  Click to upload or drag and drop
                </p>
                <p class="text-xs text-secondary-500">
                  Excel files only (.xlsx, .xls, .csv)
                </p>
              </div>
              <div *ngIf="selectedFile" class="space-y-2">
                <div class="flex items-center justify-center space-x-2">
                  <svg
                    class="w-8 h-8 text-success-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span class="text-secondary-900">{{
                    selectedFile.name
                  }}</span>
                </div>
                <button
                  type="button"
                  (click)="clearFile(); fileInput.click()"
                  class="text-sm text-primary-600 hover:text-primary-700"
                >
                  Change file
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end space-x-3">
            <button
              type="button"
              (click)="cancelBulkUpload()"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="!isUploadFormValid()"
              class="btn-primary"
            >
              Process Upload
            </button>
          </div>
        </form>

        <!-- Upload History -->
        <div
          *ngIf="recentUploads().length > 0"
          class="mt-6 pt-6 border-t border-secondary-200"
        >
          <h3 class="text-md font-medium text-secondary-900 mb-4">
            Recent Uploads
          </h3>
          <div class="space-y-3">
            <div
              *ngFor="let upload of recentUploads()"
              class="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div [class]="getUploadStatusIcon(upload.status)">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-secondary-900">
                    {{ upload.fileName }}
                  </p>
                  <p class="text-sm text-secondary-600">
                    {{ upload.successfulRecords }}/{{
                      upload.totalRecords
                    }}
                    successful •
                    {{ upload.uploadedAt | date: "MMM d, y h:mm a" }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  [class]="getUploadStatusClass(upload.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getUploadStatusLabel(upload.status) }}
                </span>
                <button
                  *ngIf="upload.downloadUrl"
                  class="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Download Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Request Form -->
      <div *ngIf="showNewRequest" class="card animate-slide-up">
        <h2 class="text-lg font-semibold text-secondary-900 mb-6">
          New Access Request
        </h2>

        <form (ngSubmit)="submitRequest()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2"
                >Application</label
              >
              <select
                [(ngModel)]="newRequest.applicationId"
                name="applicationId"
                (change)="onApplicationSelected()"
                class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select application</option>
                <option *ngFor="let app of applications()" [value]="app.id">
                  {{ app.name }} ({{ app.type | titlecase }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2"
                >Access Level</label
              >
              <select
                [(ngModel)]="newRequest.accessLevel"
                name="accessLevel"
                class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select access level</option>
                <option value="read">Read Only</option>
                <option value="write">Read/Write</option>
                <option value="admin">Administrator</option>
                <option value="full">Full Access</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2"
              >User IDs</label
            >
            <textarea
              [(ngModel)]="newRequest.userIdsText"
              name="userIdsText"
              rows="3"
              placeholder="Enter user IDs separated by commas or new lines"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            ></textarea>
            <p class="text-xs text-secondary-500 mt-1">
              Separate multiple user IDs with commas or new lines
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2"
                >Department</label
              >
              <input
                type="text"
                [(ngModel)]="newRequest.department"
                name="department"
                placeholder="Enter department"
                class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2"
                >Priority</label
              >
              <select
                [(ngModel)]="newRequest.priority"
                name="priority"
                class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

          <!-- Workflow Preview -->
          <div
            *ngIf="selectedApplication()"
            class="p-4 bg-primary-50 border border-primary-200 rounded-lg"
          >
            <h4 class="text-sm font-medium text-primary-900 mb-3">
              Approval Workflow
            </h4>
            <div class="flex items-center space-x-2">
              <div
                *ngFor="
                  let level of selectedApplication()?.approvalWorkflow
                    .approvalLevels;
                  let i = index
                "
                class="flex items-center"
              >
                <div class="flex items-center space-x-2">
                  <div
                    class="w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-sm font-medium"
                  >
                    {{ level.level }}
                  </div>
                  <span class="text-sm text-primary-700">{{
                    level.role | titlecase
                  }}</span>
                </div>
                <svg
                  *ngIf="
                    i <
                    selectedApplication()!.approvalWorkflow.approvalLevels
                      .length -
                      1
                  "
                  class="w-4 h-4 text-primary-400 mx-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </div>
            </div>
            <p class="text-xs text-primary-600 mt-2">
              Expected processing time:
              {{ selectedApplication()?.approvalWorkflow.deadlineHours }} hours
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
              [disabled]="!isRequestFormValid()"
              class="btn-primary"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>

      <!-- Requests Table -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-secondary-900">
            Access Requests
          </h2>
          <div class="flex items-center space-x-3">
            <select
              [(ngModel)]="selectedStatusFilter"
              (change)="applyFilters()"
              class="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="exception">Exception</option>
            </select>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
              placeholder="Search requests..."
              class="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th class="table-header">Request ID</th>
                <th class="table-header">Application</th>
                <th class="table-header">Users</th>
                <th class="table-header">Status</th>
                <th class="table-header">Current Approval</th>
                <th class="table-header">Priority</th>
                <th class="table-header">Deadline</th>
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
              >
                <td class="table-cell">
                  <span class="font-mono text-sm">{{ request.id }}</span>
                </td>
                <td class="table-cell">
                  <div>
                    <p class="font-medium">{{ request.applicationName }}</p>
                    <p class="text-xs text-secondary-500">
                      {{ request.accessLevel | titlecase }}
                    </p>
                  </div>
                </td>
                <td class="table-cell">
                  <div>
                    <p class="font-medium">
                      {{ request.userIds.length }} users
                    </p>
                    <p class="text-xs text-secondary-500">
                      {{ request.userIds.slice(0, 2).join(", ")
                      }}{{ request.userIds.length > 2 ? "..." : "" }}
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
                  <div
                    *ngIf="
                      request.status === 'in_review' ||
                      request.status === 'awaiting_approval'
                    "
                  >
                    <p class="text-sm">
                      Level {{ request.currentApprovalLevel }}
                    </p>
                    <p class="text-xs text-secondary-500">
                      {{ getCurrentApproverRole(request) | titlecase }}
                    </p>
                  </div>
                  <span
                    *ngIf="request.status === 'approved'"
                    class="text-success-600 text-sm"
                    >Completed</span
                  >
                  <span
                    *ngIf="request.status === 'rejected'"
                    class="text-danger-600 text-sm"
                    >Rejected</span
                  >
                </td>
                <td class="table-cell">
                  <span
                    [class]="getPriorityClass(request.priority)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ request.priority | titlecase }}
                  </span>
                </td>
                <td class="table-cell">
                  <span
                    [class]="getDeadlineClass(request.deadline)"
                    class="text-sm"
                  >
                    {{ request.deadline | date: "MMM d, y" }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <button
                      class="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View
                    </button>
                    <button
                      *ngIf="canApprove(request)"
                      class="text-success-600 hover:text-success-700 text-sm"
                    >
                      Approve
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            *ngIf="filteredRequests().length === 0"
            class="text-center py-12"
          >
            <svg
              class="w-12 h-12 text-secondary-400 mx-auto mb-4"
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
            <p class="text-secondary-600">No access requests found</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UserAccessManagementComponent implements OnInit {
  showBulkUpload = false;
  showNewRequest = false;
  selectedFile: File | null = null;
  searchTerm = "";
  selectedStatusFilter = "";

  applications = signal<Application[]>([]);
  accessRequests = signal<UserAccessRequest[]>([]);
  recentUploads = signal<BulkUpload[]>([]);

  newRequest = {
    applicationId: "",
    accessLevel: "",
    userIdsText: "",
    department: "",
    priority: "medium" as Priority,
    justification: "",
  };

  bulkUploadForm = {
    applicationId: "",
  };

  // Computed properties
  totalRequests = computed(() => this.accessRequests().length);
  pendingRequests = computed(
    () =>
      this.accessRequests().filter(
        (r) =>
          r.status === AccessRequestStatus.InReview ||
          r.status === AccessRequestStatus.AwaitingApproval,
      ).length,
  );
  approvedRequests = computed(
    () =>
      this.accessRequests().filter(
        (r) => r.status === AccessRequestStatus.Approved,
      ).length,
  );
  overdueRequests = computed(
    () => this.accessRequests().filter((r) => new Date() > r.deadline).length,
  );
  autoProcessedToday = computed(
    () =>
      this.accessRequests().filter(
        (r) =>
          r.autoProcessed &&
          new Date(r.submittedAt).toDateString() === new Date().toDateString(),
      ).length,
  );

  selectedApplication = computed(() =>
    this.applications().find((app) => app.id === this.newRequest.applicationId),
  );

  filteredRequests = computed(() => {
    let filtered = this.accessRequests();

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(search) ||
          r.applicationName.toLowerCase().includes(search) ||
          r.userIds.some((uid) => uid.toLowerCase().includes(search)),
      );
    }

    if (this.selectedStatusFilter) {
      filtered = filtered.filter((r) => r.status === this.selectedStatusFilter);
    }

    return filtered;
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

    this.accessManagementService.getBulkUploads().subscribe((uploads) => {
      this.recentUploads.set(uploads);
    });
  }

  // File upload methods
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  clearFile() {
    this.selectedFile = null;
  }

  downloadTemplate() {
    // Simulate template download
    const template =
      "User ID,Application,Access Level,Justification,Department\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "access_request_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  processBulkUpload() {
    if (this.selectedFile && this.bulkUploadForm.applicationId) {
      this.accessManagementService
        .processBulkUpload(this.selectedFile, this.bulkUploadForm.applicationId)
        .subscribe((upload) => {
          console.log("Upload processed:", upload);
          this.loadData();
          this.cancelBulkUpload();
        });
    }
  }

  cancelBulkUpload() {
    this.showBulkUpload = false;
    this.selectedFile = null;
    this.bulkUploadForm = { applicationId: "" };
  }

  isUploadFormValid(): boolean {
    return !!(this.selectedFile && this.bulkUploadForm.applicationId);
  }

  // Request form methods
  onApplicationSelected() {
    // Application selected, workflow preview will update
  }

  submitRequest() {
    if (this.isRequestFormValid()) {
      const userIds = this.newRequest.userIdsText
        .split(/[,\n]/)
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      const request = {
        applicationId: this.newRequest.applicationId,
        applicationName: this.selectedApplication()?.name || "",
        accessLevel: this.newRequest.accessLevel as AccessLevel,
        userIds,
        department: this.newRequest.department,
        priority: this.newRequest.priority,
        justification: this.newRequest.justification,
        requestType: AccessRequestType.NewAccess,
      };

      this.accessManagementService
        .createAccessRequest(request)
        .subscribe((newRequest) => {
          console.log("Request created:", newRequest);
          this.loadData();
          this.cancelNewRequest();
        });
    }
  }

  cancelNewRequest() {
    this.showNewRequest = false;
    this.newRequest = {
      applicationId: "",
      accessLevel: "",
      userIdsText: "",
      department: "",
      priority: "medium" as Priority,
      justification: "",
    };
  }

  isRequestFormValid(): boolean {
    return !!(
      this.newRequest.applicationId &&
      this.newRequest.accessLevel &&
      this.newRequest.userIdsText.trim() &&
      this.newRequest.department &&
      this.newRequest.justification
    );
  }

  // Table methods
  applyFilters() {
    // Filters are applied automatically through computed property
  }

  trackByRequestId(index: number, request: UserAccessRequest): string {
    return request.id;
  }

  canApprove(request: UserAccessRequest): boolean {
    // Simplified approval check
    return request.status === AccessRequestStatus.AwaitingApproval;
  }

  getCurrentApproverRole(request: UserAccessRequest): string {
    const app = this.applications().find((a) => a.id === request.applicationId);
    const level = app?.approvalWorkflow.approvalLevels.find(
      (l) => l.level === request.currentApprovalLevel,
    );
    return level?.role || "";
  }

  // Utility methods for styling
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      submitted: "bg-primary-100 text-primary-800",
      in_review: "bg-warning-100 text-warning-800",
      awaiting_approval: "bg-warning-100 text-warning-800",
      approved: "bg-success-100 text-success-800",
      rejected: "bg-danger-100 text-danger-800",
      exception: "bg-purple-100 text-purple-800",
      auto_processed: "bg-secondary-100 text-secondary-800",
    };
    return classes[status] || classes["submitted"];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      submitted: "Submitted",
      in_review: "In Review",
      awaiting_approval: "Awaiting Approval",
      approved: "Approved",
      rejected: "Rejected",
      exception: "Exception",
      auto_processed: "Auto-Processed",
    };
    return labels[status] || "Unknown";
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      low: "bg-success-100 text-success-800",
      medium: "bg-primary-100 text-primary-800",
      high: "bg-warning-100 text-warning-800",
      critical: "bg-danger-100 text-danger-800",
    };
    return classes[priority] || classes["medium"];
  }

  getDeadlineClass(deadline: Date): string {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursRemaining =
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) return "text-danger-600";
    if (hoursRemaining < 24) return "text-warning-600";
    return "text-secondary-600";
  }

  getUploadStatusClass(status: string): string {
    const classes: Record<string, string> = {
      uploading: "bg-primary-100 text-primary-800",
      processing: "bg-warning-100 text-warning-800",
      completed: "bg-success-100 text-success-800",
      failed: "bg-danger-100 text-danger-800",
      partial_success: "bg-warning-100 text-warning-800",
    };
    return classes[status] || classes["processing"];
  }

  getUploadStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      uploading: "Uploading",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
      partial_success: "Partial Success",
    };
    return labels[status] || "Unknown";
  }

  getUploadStatusIcon(status: string): string {
    const base = "w-5 h-5 rounded-full flex items-center justify-center";
    switch (status) {
      case UploadStatus.Completed:
        return `${base} bg-success-100 text-success-600`;
      case UploadStatus.Failed:
        return `${base} bg-danger-100 text-danger-600`;
      case UploadStatus.PartialSuccess:
        return `${base} bg-warning-100 text-warning-600`;
      default:
        return `${base} bg-primary-100 text-primary-600`;
    }
  }
}
