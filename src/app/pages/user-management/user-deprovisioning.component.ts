import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UserManagementService } from "../../shared/services/user-management.service";
import {
  UserProfile,
  ProvisioningWorkflow,
  WorkflowType,
  WorkflowStatus,
} from "../../shared/interfaces/user-management.interface";
import { UserStatus } from "../../shared/interfaces/user.interface";

@Component({
  selector: "app-user-deprovisioning",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">
            User Deprovisioning
          </h1>
          <p class="text-secondary-600">
            Securely deactivate user accounts and manage data retention
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              ></path>
            </svg>
            Deprovisioning Report
          </button>
          <button
            class="btn-danger"
            (click)="showBulkDeprovisioning = !showBulkDeprovisioning"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            Bulk Deprovisioning
          </button>
        </div>
      </div>

      <!-- Deprovisioning Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-warning-600">
              {{ deprovisioningWorkflows().length }}
            </p>
            <p class="text-sm text-secondary-600">Active Workflows</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-danger-600">
              {{ getPendingWorkflows() }}
            </p>
            <p class="text-sm text-secondary-600">Pending Approval</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-success-600">
              {{ getCompletedWorkflows() }}
            </p>
            <p class="text-sm text-secondary-600">Completed Today</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-secondary-600">98.5%</p>
            <p class="text-sm text-secondary-600">SLA Compliance</p>
          </div>
        </div>
      </div>

      <!-- Bulk Deprovisioning -->
      <div *ngIf="showBulkDeprovisioning" class="card animate-slide-up">
        <h2 class="text-lg font-semibold text-secondary-900 mb-6">
          Bulk Deprovisioning
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2"
              >Upload User List</label
            >
            <div
              class="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center"
            >
              <svg
                class="mx-auto h-12 w-12 text-secondary-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
              <div class="mt-4">
                <label class="cursor-pointer">
                  <span
                    class="mt-2 block text-sm font-medium text-secondary-900"
                    >Upload CSV file</span
                  >
                  <input type="file" class="sr-only" accept=".csv" />
                </label>
                <p class="mt-2 text-xs text-secondary-500">
                  CSV format: Employee ID, Reason, Termination Date
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              class="btn-secondary"
              (click)="showBulkDeprovisioning = false"
            >
              Cancel
            </button>
            <button class="btn-danger">Process Bulk Deprovisioning</button>
          </div>
        </div>
      </div>

      <!-- Single User Deprovisioning -->
      <div class="card">
        <h2 class="text-lg font-semibold text-secondary-900 mb-6">
          Single User Deprovisioning
        </h2>

        <form (ngSubmit)="submitDeprovisioningRequest()" class="space-y-6">
          <!-- User Selection -->
          <div>
            <h3 class="text-md font-medium text-secondary-900 mb-4">
              User Selection
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Search User *</label
                >
                <input
                  type="text"
                  [(ngModel)]="selectedUserQuery"
                  (input)="searchUsers()"
                  name="selectedUserQuery"
                  placeholder="Enter name, email, or employee ID..."
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                <!-- Search Results -->
                <div
                  *ngIf="userSearchResults().length > 0"
                  class="mt-2 border border-secondary-300 rounded-lg max-h-48 overflow-y-auto"
                >
                  <div
                    *ngFor="let user of userSearchResults()"
                    (click)="selectUser(user)"
                    class="p-3 hover:bg-secondary-50 cursor-pointer border-b border-secondary-200 last:border-b-0"
                  >
                    <div class="flex items-center space-x-3">
                      <div
                        class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
                      >
                        <span class="text-xs font-medium text-primary-700">{{
                          getInitials(user.displayName)
                        }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-secondary-900">
                          {{ user.displayName }}
                        </p>
                        <p class="text-sm text-secondary-600">
                          {{ user.email }} • {{ user.employeeId }}
                        </p>
                        <p class="text-xs text-secondary-500">
                          {{ user.department }} • {{ user.title }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected User Info -->
              <div *ngIf="selectedUser">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Selected User</label
                >
                <div class="p-4 border border-secondary-300 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-primary-700">{{
                        getInitials(selectedUser.displayName)
                      }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-secondary-900">
                        {{ selectedUser.displayName }}
                      </p>
                      <p class="text-sm text-secondary-600">
                        {{ selectedUser.email }}
                      </p>
                      <p class="text-xs text-secondary-500">
                        {{ selectedUser.department }} • {{ selectedUser.title }}
                      </p>
                      <p class="text-xs text-secondary-500">
                        Risk Score: {{ selectedUser.riskScore }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Deprovisioning Details -->
          <div *ngIf="selectedUser">
            <h3 class="text-md font-medium text-secondary-900 mb-4">
              Deprovisioning Details
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Termination Type *</label
                >
                <select
                  [(ngModel)]="deprovisioningData.terminationType"
                  name="terminationType"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Type</option>
                  <option value="voluntary">Voluntary Resignation</option>
                  <option value="involuntary">Involuntary Termination</option>
                  <option value="retirement">Retirement</option>
                  <option value="transfer">Department Transfer</option>
                  <option value="leave">Leave of Absence</option>
                  <option value="contract_end">Contract End</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Effective Date *</label
                >
                <input
                  type="date"
                  [(ngModel)]="deprovisioningData.effectiveDate"
                  name="effectiveDate"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Reason for Termination *</label
                >
                <textarea
                  [(ngModel)]="deprovisioningData.reason"
                  name="reason"
                  rows="3"
                  required
                  placeholder="Provide detailed reason for deprovisioning..."
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Data Handling -->
          <div *ngIf="selectedUser">
            <h3 class="text-md font-medium text-secondary-900 mb-4">
              Data & Asset Management
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Data Transfer</label
                >
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      [(ngModel)]="deprovisioningData.transferEmail"
                      name="transferEmail"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Transfer email to manager</span
                    >
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      [(ngModel)]="deprovisioningData.transferFiles"
                      name="transferFiles"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Transfer files and documents</span
                    >
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      [(ngModel)]="deprovisioningData.archiveData"
                      name="archiveData"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Archive user data (7-year retention)</span
                    >
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Transfer Data To</label
                >
                <input
                  type="text"
                  [(ngModel)]="deprovisioningData.transferTo"
                  name="transferTo"
                  placeholder="Manager or team member email..."
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Asset Return</label
                >
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      [(ngModel)]="deprovisioningData.returnLaptop"
                      name="returnLaptop"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Company laptop/equipment</span
                    >
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      [(ngModel)]="deprovisioningData.returnBadge"
                      name="returnBadge"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Security badge/access cards</span
                    >
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      [(ngModel)]="deprovisioningData.returnKeys"
                      name="returnKeys"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Office keys</span
                    >
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Compliance & Security -->
          <div
            *ngIf="selectedUser"
            class="p-4 bg-warning-50 border border-warning-200 rounded-lg"
          >
            <h3 class="text-md font-medium text-warning-900 mb-3">
              Security & Compliance Requirements
            </h3>
            <div class="space-y-3">
              <div class="flex items-start">
                <svg
                  class="w-5 h-5 text-warning-600 mr-2 mt-0.5"
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
                    Immediate Security Actions
                  </p>
                  <ul class="text-sm text-warning-700 mt-1 space-y-1">
                    <li>• Disable all system access within 1 hour</li>
                    <li>• Revoke VPN and remote access immediately</li>
                    <li>• Change shared account passwords</li>
                    <li>• Remove from all distribution lists</li>
                  </ul>
                </div>
              </div>

              <div class="flex items-start">
                <svg
                  class="w-5 h-5 text-warning-600 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path
                    fill-rule="evenodd"
                    d="M4 5a2 2 0 012-2v1a1 1 0 00-1 1v6a1 1 0 001 1v1a2 2 0 01-2-2V5zM15 5a2 2 0 00-2-2v1a1 1 0 011 1v6a1 1 0 01-1 1v1a2 2 0 002-2V5z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-warning-800">
                    Compliance Requirements
                  </p>
                  <ul class="text-sm text-warning-700 mt-1 space-y-1">
                    <li>• SOX compliance audit trail maintained</li>
                    <li>• GDPR data retention policy enforced</li>
                    <li>• All access changes logged and timestamped</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Actions -->
          <div class="flex items-center justify-end space-x-3">
            <button type="button" class="btn-secondary" (click)="resetForm()">
              Clear
            </button>
            <button
              type="submit"
              class="btn-danger"
              [disabled]="!isFormValid()"
            >
              Submit Deprovisioning Request
            </button>
          </div>
        </form>
      </div>

      <!-- Recent Deprovisioning Workflows -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-secondary-900">
            Recent Deprovisioning Workflows
          </h2>
          <button class="text-sm text-primary-600 hover:text-primary-700">
            View All
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th class="table-header">Workflow ID</th>
                <th class="table-header">User</th>
                <th class="table-header">Type</th>
                <th class="table-header">Status</th>
                <th class="table-header">Progress</th>
                <th class="table-header">Effective Date</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                *ngFor="
                  let workflow of deprovisioningWorkflows();
                  trackBy: trackByWorkflowId
                "
                class="hover:bg-secondary-50"
              >
                <td class="table-cell">
                  <span class="font-mono text-sm">{{ workflow.id }}</span>
                </td>
                <td class="table-cell">
                  <div>
                    <p class="font-medium text-secondary-900">
                      {{ workflow.userName }}
                    </p>
                    <p class="text-sm text-secondary-600">
                      {{ workflow.userEmail }}
                    </p>
                  </div>
                </td>
                <td class="table-cell">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-800"
                  >
                    Deprovisioning
                  </span>
                </td>
                <td class="table-cell">
                  <span
                    [class]="getWorkflowStatusClass(workflow.status)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getWorkflowStatusLabel(workflow.status) }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      class="bg-warning-600 h-2 rounded-full"
                      [style.width.%]="getWorkflowProgress(workflow)"
                    ></div>
                  </div>
                  <p class="text-xs text-secondary-500 mt-1">
                    {{ getCompletedTasks(workflow) }}/{{
                      workflow.tasks.length
                    }}
                    tasks
                  </p>
                </td>
                <td class="table-cell">
                  <span class="text-sm">{{
                    workflow.scheduledFor | date: "MMM d, y"
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
                      *ngIf="workflow.status === 'pending'"
                      (click)="approveWorkflow(workflow.id)"
                      class="text-success-600 hover:text-success-700 text-sm"
                    >
                      Approve
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
export class UserDeprovisioningComponent implements OnInit {
  deprovisioningWorkflows = signal<ProvisioningWorkflow[]>([]);
  userSearchResults = signal<UserProfile[]>([]);
  selectedUser: UserProfile | null = null;
  selectedUserQuery = "";
  showBulkDeprovisioning = false;

  deprovisioningData = {
    terminationType: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    reason: "",
    transferEmail: false,
    transferFiles: false,
    archiveData: true,
    transferTo: "",
    returnLaptop: false,
    returnBadge: false,
    returnKeys: false,
  };

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit() {
    this.loadDeprovisioningWorkflows();
  }

  private loadDeprovisioningWorkflows() {
    this.userManagementService
      .getWorkflowsByType(WorkflowType.UserDeprovisioning)
      .subscribe((workflows) => {
        this.deprovisioningWorkflows.set(workflows);
      });
  }

  searchUsers() {
    if (this.selectedUserQuery.trim().length > 2) {
      this.userManagementService
        .searchUsers(this.selectedUserQuery)
        .subscribe((users) => {
          // Only show active users
          const activeUsers = users.filter(
            (u) => u.status === UserStatus.Active,
          );
          this.userSearchResults.set(activeUsers);
        });
    } else {
      this.userSearchResults.set([]);
    }
  }

  selectUser(user: UserProfile) {
    this.selectedUser = user;
    this.selectedUserQuery = user.displayName;
    this.userSearchResults.set([]);

    // Pre-fill transfer recipient with manager if available
    if (user.manager) {
      this.deprovisioningData.transferTo = user.manager;
    }
  }

  submitDeprovisioningRequest() {
    if (this.isFormValid() && this.selectedUser) {
      // Create deprovisioning workflow
      this.userManagementService
        .createProvisioningWorkflow(
          this.selectedUser.id,
          WorkflowType.UserDeprovisioning,
          this.deprovisioningData.reason,
        )
        .subscribe(() => {
          this.resetForm();
          this.loadDeprovisioningWorkflows();
        });
    }
  }

  approveWorkflow(workflowId: string) {
    this.userManagementService
      .approveWorkflow(
        workflowId,
        "current-user",
        "Approved for deprovisioning",
      )
      .subscribe(() => {
        this.loadDeprovisioningWorkflows();
      });
  }

  resetForm() {
    this.selectedUser = null;
    this.selectedUserQuery = "";
    this.userSearchResults.set([]);
    this.deprovisioningData = {
      terminationType: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      reason: "",
      transferEmail: false,
      transferFiles: false,
      archiveData: true,
      transferTo: "",
      returnLaptop: false,
      returnBadge: false,
      returnKeys: false,
    };
  }

  isFormValid(): boolean {
    return (
      this.selectedUser !== null &&
      this.deprovisioningData.terminationType !== "" &&
      this.deprovisioningData.effectiveDate !== "" &&
      this.deprovisioningData.reason.trim() !== ""
    );
  }

  getPendingWorkflows(): number {
    return this.deprovisioningWorkflows().filter(
      (w) => w.status === WorkflowStatus.Pending,
    ).length;
  }

  getCompletedWorkflows(): number {
    return this.deprovisioningWorkflows().filter(
      (w) => w.status === WorkflowStatus.Completed,
    ).length;
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  getWorkflowStatusClass(status: WorkflowStatus): string {
    const classes = {
      [WorkflowStatus.Draft]: "bg-secondary-100 text-secondary-800",
      [WorkflowStatus.Pending]: "bg-warning-100 text-warning-800",
      [WorkflowStatus.InProgress]: "bg-primary-100 text-primary-800",
      [WorkflowStatus.Approved]: "bg-success-100 text-success-800",
      [WorkflowStatus.Rejected]: "bg-danger-100 text-danger-800",
      [WorkflowStatus.Completed]: "bg-success-100 text-success-800",
      [WorkflowStatus.Failed]: "bg-danger-100 text-danger-800",
      [WorkflowStatus.Cancelled]: "bg-secondary-100 text-secondary-800",
      [WorkflowStatus.OnHold]: "bg-warning-100 text-warning-800",
    };
    return classes[status];
  }

  getWorkflowStatusLabel(status: WorkflowStatus): string {
    const labels = {
      [WorkflowStatus.Draft]: "Draft",
      [WorkflowStatus.Pending]: "Pending",
      [WorkflowStatus.InProgress]: "In Progress",
      [WorkflowStatus.Approved]: "Approved",
      [WorkflowStatus.Rejected]: "Rejected",
      [WorkflowStatus.Completed]: "Completed",
      [WorkflowStatus.Failed]: "Failed",
      [WorkflowStatus.Cancelled]: "Cancelled",
      [WorkflowStatus.OnHold]: "On Hold",
    };
    return labels[status];
  }

  getWorkflowProgress(workflow: ProvisioningWorkflow): number {
    const completed = this.getCompletedTasks(workflow);
    return (completed / workflow.tasks.length) * 100;
  }

  getCompletedTasks(workflow: ProvisioningWorkflow): number {
    return workflow.tasks.filter((t) => t.status === "completed").length;
  }

  trackByWorkflowId(index: number, workflow: ProvisioningWorkflow): string {
    return workflow.id;
  }
}
