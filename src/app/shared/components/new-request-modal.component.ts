import { Component, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MockDataService } from "../services/mock-data.service";
import {
  RequestType,
  UrgencyLevel,
  Role,
  RiskLevel,
} from "../interfaces/user.interface";

@Component({
  selector: "app-new-request-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Backdrop -->
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <!-- Modal Container -->
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between p-6 border-b border-secondary-200"
        >
          <h2 class="text-lg font-semibold text-secondary-900">
            New Access Request
          </h2>
          <button
            (click)="onClose()"
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

        <!-- Modal Body -->
        <div class="p-6">
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
                {{ getHighestRiskLevel() }} risk level. Expected processing
                time:
                {{ getExpectedProcessingTime() }}
              </p>
            </div>

            <!-- Modal Footer -->
            <div
              class="flex items-center justify-end space-x-3 pt-4 border-t border-secondary-200"
            >
              <button type="button" (click)="onClose()" class="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="!isFormValid() || isSubmitting()"
              >
                <span *ngIf="isSubmitting()" class="mr-2">
                  <svg
                    class="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
                {{ isSubmitting() ? "Submitting..." : "Submit Request" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class NewRequestModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  protected readonly isSubmitting = signal(false);

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

  constructor(private mockDataService: MockDataService) {}

  onClose() {
    this.close.emit();
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
    if (this.isFormValid() && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      this.mockDataService
        .submitAccessRequest({
          requestType: this.newRequest.requestType as RequestType,
          urgency: this.newRequest.urgency,
          requestedRoles: this.newRequest.requestedRoles,
          requestedResources: this.newRequest.requestedResources,
          justification: this.newRequest.justification,
        })
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.resetForm();
            this.submitted.emit();
            this.close.emit();
          },
          error: () => {
            this.isSubmitting.set(false);
          },
        });
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
}
