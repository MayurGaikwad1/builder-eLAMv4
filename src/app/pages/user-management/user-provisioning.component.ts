import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UserManagementService } from "../../shared/services/user-management.service";
import {
  ProvisioningWorkflow,
  WorkflowType,
  WorkflowStatus,
  SecurityClearance,
  DataClassification,
} from "../../shared/interfaces/user-management.interface";

@Component({
  selector: "app-user-provisioning",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">
            User Provisioning
          </h1>
          <p class="text-secondary-600">
            Create new user accounts with automated workflow processing
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              ></path>
            </svg>
            Bulk Import
          </button>
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
            Templates
          </button>
        </div>
      </div>

      <!-- Provisioning Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-primary-600">
              {{ provisioningWorkflows().length }}
            </p>
            <p class="text-sm text-secondary-600">Active Workflows</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-warning-600">
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
            <p class="text-2xl font-bold text-secondary-600">2.3h</p>
            <p class="text-sm text-secondary-600">Avg Processing Time</p>
          </div>
        </div>
      </div>

      <!-- New User Form -->
      <div class="card">
        <h2 class="text-lg font-semibold text-secondary-900 mb-6">
          Create New User
        </h2>

        <form (ngSubmit)="submitProvisioningRequest()" class="space-y-6">
          <!-- Personal Information -->
          <div>
            <h3 class="text-md font-medium text-secondary-900 mb-4">
              Personal Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >First Name *</label
                >
                <input
                  type="text"
                  [(ngModel)]="newUser.firstName"
                  name="firstName"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Last Name *</label
                >
                <input
                  type="text"
                  [(ngModel)]="newUser.lastName"
                  name="lastName"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Email Address *</label
                >
                <input
                  type="email"
                  [(ngModel)]="newUser.email"
                  name="email"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Employee ID *</label
                >
                <input
                  type="text"
                  [(ngModel)]="newUser.employeeId"
                  name="employeeId"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <!-- Employment Information -->
          <div>
            <h3 class="text-md font-medium text-secondary-900 mb-4">
              Employment Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Department *</label
                >
                <select
                  [(ngModel)]="newUser.department"
                  name="department"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Security">Security</option>
                  <option value="Operations">Operations</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Job Title *</label
                >
                <input
                  type="text"
                  [(ngModel)]="newUser.title"
                  name="title"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Organization Unit</label
                >
                <input
                  type="text"
                  [(ngModel)]="newUser.organizationUnit"
                  name="organizationUnit"
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Location *</label
                >
                <select
                  [(ngModel)]="newUser.location"
                  name="location"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Location</option>
                  <option value="New York, NY">New York, NY</option>
                  <option value="San Francisco, CA">San Francisco, CA</option>
                  <option value="Chicago, IL">Chicago, IL</option>
                  <option value="Austin, TX">Austin, TX</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Hire Date *</label
                >
                <input
                  type="date"
                  [(ngModel)]="newUser.hireDate"
                  name="hireDate"
                  required
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Manager</label
                >
                <input
                  type="text"
                  [(ngModel)]="newUser.manager"
                  name="manager"
                  placeholder="Manager's email or name"
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <!-- Security Configuration -->
          <div>
            <h3 class="text-md font-medium text-secondary-900 mb-4">
              Security Configuration
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Security Clearance</label
                >
                <select
                  [(ngModel)]="newUser.securityClearance"
                  name="securityClearance"
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="public">Public</option>
                  <option value="internal">Internal</option>
                  <option value="confidential">Confidential</option>
                  <option value="secret">Secret</option>
                  <option value="top_secret">Top Secret</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Data Classifications</label
                >
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Internal (Default)</span
                    >
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Confidential</span
                    >
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Restricted</span
                    >
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Access Requirements -->
          <div>
            <h3 class="text-md font-medium text-secondary-900 mb-4">
              Initial Access Requirements
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Standard Role Templates</label
                >
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      checked
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Employee (Standard)</span
                    >
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >VPN Access</span
                    >
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Office 365</span
                    >
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-secondary-700"
                      >Development Tools</span
                    >
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Business Justification</label
                >
                <textarea
                  [(ngModel)]="newUser.justification"
                  name="justification"
                  rows="4"
                  placeholder="Provide business justification for this user account..."
                  class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Workflow Configuration -->
          <div
            class="p-4 bg-secondary-50 border border-secondary-200 rounded-lg"
          >
            <h3 class="text-md font-medium text-secondary-900 mb-3">
              Automated Workflow
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="workflowConfig.requireApproval"
                    name="requireApproval"
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-secondary-700"
                    >Require Manager Approval</span
                  >
                </label>
              </div>
              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="workflowConfig.notifyHR"
                    name="notifyHR"
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-secondary-700"
                    >Notify HR on Completion</span
                  >
                </label>
              </div>
              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="workflowConfig.scheduleReview"
                    name="scheduleReview"
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-secondary-700"
                    >Schedule 90-day Access Review</span
                  >
                </label>
              </div>
              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="workflowConfig.enableAuditLogging"
                    name="enableAuditLogging"
                    checked
                    disabled
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-secondary-700"
                    >Enable Audit Logging (Required)</span
                  >
                </label>
              </div>
            </div>
          </div>

          <!-- Submit Actions -->
          <div class="flex items-center justify-end space-x-3">
            <button type="button" class="btn-secondary">Save as Draft</button>
            <button
              type="submit"
              class="btn-primary"
              [disabled]="!isFormValid()"
            >
              Submit for Provisioning
            </button>
          </div>
        </form>
      </div>

      <!-- Recent Provisioning Workflows -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-secondary-900">
            Recent Provisioning Workflows
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
                <th class="table-header">Status</th>
                <th class="table-header">Progress</th>
                <th class="table-header">Created</th>
                <th class="table-header">SLA</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                *ngFor="
                  let workflow of provisioningWorkflows();
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
                    [class]="getWorkflowStatusClass(workflow.status)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getWorkflowStatusLabel(workflow.status) }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      class="bg-primary-600 h-2 rounded-full"
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
                    workflow.createdAt | date: "MMM d, y"
                  }}</span>
                </td>
                <td class="table-cell">
                  <span [class]="getSLAClass(workflow)" class="text-sm">
                    {{ getSLAStatus(workflow) }}
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
export class UserProvisioningComponent implements OnInit {
  provisioningWorkflows = signal<ProvisioningWorkflow[]>([]);

  newUser = {
    firstName: "",
    lastName: "",
    email: "",
    employeeId: "",
    department: "",
    title: "",
    organizationUnit: "",
    location: "",
    hireDate: new Date().toISOString().split("T")[0],
    manager: "",
    securityClearance: SecurityClearance.Internal,
    justification: "",
  };

  workflowConfig = {
    requireApproval: true,
    notifyHR: true,
    scheduleReview: true,
    enableAuditLogging: true,
  };

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit() {
    this.loadProvisioningWorkflows();
  }

  private loadProvisioningWorkflows() {
    this.userManagementService
      .getWorkflowsByType(WorkflowType.UserProvisioning)
      .subscribe((workflows) => {
        this.provisioningWorkflows.set(workflows);
      });
  }

  submitProvisioningRequest() {
    if (this.isFormValid()) {
      this.userManagementService
        .createUser({
          ...this.newUser,
          hireDate: new Date(this.newUser.hireDate),
        })
        .subscribe(() => {
          this.resetForm();
          this.loadProvisioningWorkflows();
        });
    }
  }

  approveWorkflow(workflowId: string) {
    this.userManagementService
      .approveWorkflow(workflowId, "current-user", "Approved for provisioning")
      .subscribe(() => {
        this.loadProvisioningWorkflows();
      });
  }

  private resetForm() {
    this.newUser = {
      firstName: "",
      lastName: "",
      email: "",
      employeeId: "",
      department: "",
      title: "",
      organizationUnit: "",
      location: "",
      hireDate: new Date().toISOString().split("T")[0],
      manager: "",
      securityClearance: SecurityClearance.Internal,
      justification: "",
    };
  }

  isFormValid(): boolean {
    return (
      this.newUser.firstName !== "" &&
      this.newUser.lastName !== "" &&
      this.newUser.email !== "" &&
      this.newUser.employeeId !== "" &&
      this.newUser.department !== "" &&
      this.newUser.title !== "" &&
      this.newUser.location !== ""
    );
  }

  getPendingWorkflows(): number {
    return this.provisioningWorkflows().filter(
      (w) => w.status === WorkflowStatus.Pending,
    ).length;
  }

  getCompletedWorkflows(): number {
    return this.provisioningWorkflows().filter(
      (w) => w.status === WorkflowStatus.Completed,
    ).length;
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

  getSLAClass(workflow: ProvisioningWorkflow): string {
    if (!workflow.slaDeadline) return "text-secondary-600";

    const now = new Date();
    const deadline = new Date(workflow.slaDeadline);
    const hoursRemaining =
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 2) return "text-danger-600";
    if (hoursRemaining < 8) return "text-warning-600";
    return "text-success-600";
  }

  getSLAStatus(workflow: ProvisioningWorkflow): string {
    if (!workflow.slaDeadline) return "No SLA";

    const now = new Date();
    const deadline = new Date(workflow.slaDeadline);
    const hoursRemaining =
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) return "Overdue";
    if (hoursRemaining < 2) return "Critical";
    if (hoursRemaining < 8) return "Warning";
    return "On Track";
  }

  trackByWorkflowId(index: number, workflow: ProvisioningWorkflow): string {
    return workflow.id;
  }
}
