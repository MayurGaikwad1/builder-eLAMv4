import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AccessManagementService } from "../../shared/services/access-management.service";
import {
  ExceptionHandling,
  Application,
  UserAccessRequest,
  ADValidationResult,
  ExceptionType,
  ExceptionDecision,
  ExceptionStatus,
  ADValidationStatus,
} from "../../shared/interfaces/access-management.interface";

@Component({
  selector: "app-exception-handling",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">
            Exception Handling
          </h1>
          <p class="text-secondary-600">
            Manage AD validation failures and exception retention policies
          </p>
        </div>
        <div class="flex space-x-3">
          <button (click)="validateAllPending()" class="btn-secondary">
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
            Re-validate All
          </button>
          <button
            (click)="showBulkActions = !showBulkActions"
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              ></path>
            </svg>
            Bulk Actions
          </button>
        </div>
      </div>

      <!-- Exception Stats -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-secondary-900">
              {{ totalExceptions() }}
            </p>
            <p class="text-sm text-secondary-600">Total Exceptions</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-warning-600">
              {{ pendingExceptions() }}
            </p>
            <p class="text-sm text-secondary-600">Pending Review</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-success-600">
              {{ retainedExceptions() }}
            </p>
            <p class="text-sm text-secondary-600">Marked for Retention</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-danger-600">
              {{ scheduledForDeletion() }}
            </p>
            <p class="text-sm text-secondary-600">Scheduled Deletion</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="text-center">
            <p class="text-2xl font-bold text-purple-600">
              {{ autoDeleteToday() }}
            </p>
            <p class="text-sm text-secondary-600">Auto-Delete Today</p>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Panel -->
      <div *ngIf="showBulkActions" class="card animate-slide-up">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-secondary-900">
            Bulk Exception Actions
          </h2>
          <button
            (click)="showBulkActions = false"
            class="text-secondary-400 hover:text-secondary-600"
          >
            <svg
              class="w-5 h-5"
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

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 border border-secondary-200 rounded-lg">
            <h3 class="font-medium text-secondary-900 mb-2">
              Filter by Application
            </h3>
            <select
              [(ngModel)]="bulkActionForm.applicationId"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Applications</option>
              <option *ngFor="let app of applications()" [value]="app.id">
                {{ app.name }}
              </option>
            </select>
          </div>

          <div class="p-4 border border-secondary-200 rounded-lg">
            <h3 class="font-medium text-secondary-900 mb-2">
              Filter by Exception Type
            </h3>
            <select
              [(ngModel)]="bulkActionForm.exceptionType"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="user_not_found">User Not Found</option>
              <option value="group_not_found">Group Not Found</option>
              <option value="system_not_found">System Not Found</option>
              <option value="integration_not_found">
                Integration Not Found
              </option>
            </select>
          </div>

          <div class="p-4 border border-secondary-200 rounded-lg">
            <h3 class="font-medium text-secondary-900 mb-2">
              Days Until Auto-Delete
            </h3>
            <select
              [(ngModel)]="bulkActionForm.daysUntilDelete"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Any Time</option>
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-sm text-secondary-600">
            {{ getFilteredExceptionsForBulk().length }} exceptions match the
            current filters
          </p>
          <div class="flex space-x-3">
            <button
              (click)="applyBulkAction('retain')"
              [disabled]="getFilteredExceptionsForBulk().length === 0"
              class="btn-success"
            >
              Retain All Filtered
            </button>
            <button
              (click)="applyBulkAction('delete')"
              [disabled]="getFilteredExceptionsForBulk().length === 0"
              class="btn-danger"
            >
              Delete All Filtered
            </button>
          </div>
        </div>
      </div>

      <!-- Exception Details Modal -->
      <div
        *ngIf="selectedExceptionId"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div
            class="flex items-center justify-between p-6 border-b border-secondary-200"
          >
            <h2 class="text-lg font-semibold text-secondary-900">
              Exception Details
            </h2>
            <button
              (click)="closeExceptionModal()"
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

          <div *ngIf="selectedException()" class="p-6 space-y-6">
            <!-- Exception Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700"
                  >User ID</label
                >
                <p class="font-mono text-secondary-900">
                  {{ selectedException()?.userId }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700"
                  >Application</label
                >
                <p class="text-secondary-900">
                  {{
                    getApplicationName(selectedException()?.applicationId || "")
                  }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700"
                  >Exception Type</label
                >
                <span
                  [class]="
                    getExceptionTypeClass(
                      selectedException()?.exceptionType || ''
                    )
                  "
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{
                    getExceptionTypeLabel(
                      selectedException()?.exceptionType || ""
                    )
                  }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700"
                  >Auto-Delete Date</label
                >
                <p
                  [class]="selectedException()?.autoDeleteDate ? getAutoDeleteClass(selectedException()!.autoDeleteDate) : 'text-secondary-600'"
                  class="text-sm"
                >
                  {{
                    selectedException()?.autoDeleteDate
                      | date: "MMM d, y h:mm a"
                  }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2"
                >Validation Error</label
              >
              <p
                class="text-sm text-secondary-900 bg-secondary-50 p-3 rounded-lg"
              >
                {{ selectedException()?.validationError }}
              </p>
            </div>

            <!-- Decision Form -->
            <div class="border-t border-secondary-200 pt-6">
              <h3 class="text-md font-medium text-secondary-900 mb-4">
                Application Owner Decision
              </h3>

              <form (ngSubmit)="submitExceptionDecision()" class="space-y-4">
                <div>
                  <label
                    class="block text-sm font-medium text-secondary-700 mb-3"
                    >Decision</label
                  >
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        type="radio"
                        [(ngModel)]="exceptionDecisionForm.decision"
                        name="decision"
                        value="retain"
                        class="mr-2"
                      />
                      <span class="text-sm"
                        >Retain this ID with exception note</span
                      >
                    </label>
                    <label class="flex items-center">
                      <input
                        type="radio"
                        [(ngModel)]="exceptionDecisionForm.decision"
                        name="decision"
                        value="delete"
                        class="mr-2"
                      />
                      <span class="text-sm"
                        >Proceed with deletion (default)</span
                      >
                    </label>
                  </div>
                </div>

                <div *ngIf="exceptionDecisionForm.decision === 'retain'">
                  <label
                    class="block text-sm font-medium text-secondary-700 mb-2"
                    >Retention Note</label
                  >
                  <textarea
                    [(ngModel)]="exceptionDecisionForm.note"
                    name="note"
                    rows="3"
                    placeholder="Explain why this ID should be retained despite the validation error..."
                    class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  ></textarea>
                </div>

                <div class="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    (click)="closeExceptionModal()"
                    class="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="!isDecisionFormValid()"
                    class="btn-primary"
                  >
                    Save Decision
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Exceptions Table -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-secondary-900">
            AD Validation Exceptions
          </h2>
          <div class="flex items-center space-x-3">
            <select
              [(ngModel)]="selectedStatusFilter"
              (change)="applyFilters()"
              class="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              [(ngModel)]="selectedApplicationFilter"
              (change)="applyFilters()"
              class="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Applications</option>
              <option *ngFor="let app of applications()" [value]="app.id">
                {{ app.name }}
              </option>
            </select>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
              placeholder="Search User ID..."
              class="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th class="table-header">
                  <input
                    type="checkbox"
                    (change)="toggleSelectAll($event)"
                    class="rounded"
                  />
                </th>
                <th class="table-header">User ID</th>
                <th class="table-header">Application</th>
                <th class="table-header">Exception Type</th>
                <th class="table-header">Status</th>
                <th class="table-header">Owner Decision</th>
                <th class="table-header">Auto-Delete Date</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                *ngFor="
                  let exception of filteredExceptions();
                  trackBy: trackByExceptionId
                "
                class="hover:bg-secondary-50"
              >
                <td class="table-cell">
                  <input
                    type="checkbox"
                    [checked]="selectedExceptions.has(exception.id)"
                    (change)="toggleExceptionSelection(exception.id, $event)"
                    class="rounded"
                  />
                </td>
                <td class="table-cell">
                  <span class="font-mono text-sm">{{ exception.userId }}</span>
                </td>
                <td class="table-cell">
                  <p class="font-medium">
                    {{ getApplicationName(exception.applicationId) }}
                  </p>
                </td>
                <td class="table-cell">
                  <span
                    [class]="getExceptionTypeClass(exception.exceptionType)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getExceptionTypeLabel(exception.exceptionType) }}
                  </span>
                </td>
                <td class="table-cell">
                  <span
                    [class]="getExceptionStatusClass(exception.status)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getExceptionStatusLabel(exception.status) }}
                  </span>
                </td>
                <td class="table-cell">
                  <div *ngIf="exception.ownerDecision; else noDecision">
                    <span
                      [class]="getDecisionClass(exception.ownerDecision)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ getDecisionLabel(exception.ownerDecision) }}
                    </span>
                    <p
                      *ngIf="exception.retentionNote"
                      class="text-xs text-secondary-500 mt-1"
                    >
                      {{ exception.retentionNote | slice: 0 : 50
                      }}{{ exception.retentionNote!.length > 50 ? "..." : "" }}
                    </p>
                  </div>
                  <ng-template #noDecision>
                    <span class="text-secondary-500 text-sm">Pending</span>
                  </ng-template>
                </td>
                <td class="table-cell">
                  <span
                    [class]="getAutoDeleteClass(exception.autoDeleteDate)"
                    class="text-sm"
                  >
                    {{ exception.autoDeleteDate | date: "MMM d, y" }}
                  </span>
                  <p class="text-xs text-secondary-500">
                    {{ getDaysUntilAutoDelete(exception.autoDeleteDate) }} days
                  </p>
                </td>
                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    <button
                      (click)="openExceptionModal(exception.id)"
                      class="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Review
                    </button>
                    <button
                      *ngIf="!exception.ownerDecision"
                      (click)="quickAction(exception.id, 'retain')"
                      class="text-success-600 hover:text-success-700 text-sm"
                    >
                      Retain
                    </button>
                    <button
                      *ngIf="!exception.ownerDecision"
                      (click)="quickAction(exception.id, 'delete')"
                      class="text-danger-600 hover:text-danger-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            *ngIf="filteredExceptions().length === 0"
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
            <p class="text-secondary-600">No exceptions found</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ExceptionHandlingComponent implements OnInit {
  showBulkActions = false;
  selectedExceptionId: string | null = null;
  searchTerm = "";
  selectedStatusFilter = "";
  selectedApplicationFilter = "";
  selectedExceptions = new Set<string>();

  applications = signal<Application[]>([]);
  exceptions = signal<ExceptionHandling[]>([]);

  exceptionDecisionForm = {
    decision: "" as ExceptionDecision | "",
    note: "",
  };

  bulkActionForm = {
    applicationId: "",
    exceptionType: "",
    daysUntilDelete: "",
  };

  // Computed properties
  totalExceptions = computed(() => this.exceptions().length);
  pendingExceptions = computed(
    () =>
      this.exceptions().filter(
        (e) =>
          e.status === ExceptionStatus.New ||
          e.status === ExceptionStatus.UnderReview,
      ).length,
  );
  retainedExceptions = computed(
    () =>
      this.exceptions().filter(
        (e) => e.ownerDecision === ExceptionDecision.Retain,
      ).length,
  );
  scheduledForDeletion = computed(
    () =>
      this.exceptions().filter(
        (e) => e.ownerDecision === ExceptionDecision.Delete,
      ).length,
  );
  autoDeleteToday = computed(() => {
    const today = new Date().toDateString();
    return this.exceptions().filter(
      (e) => new Date(e.autoDeleteDate).toDateString() === today,
    ).length;
  });

  selectedException = computed(() =>
    this.exceptions().find((e) => e.id === this.selectedExceptionId),
  );

  filteredExceptions = computed(() => {
    let filtered = this.exceptions();

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter((e) =>
        e.userId.toLowerCase().includes(search),
      );
    }

    if (this.selectedStatusFilter) {
      filtered = filtered.filter((e) => e.status === this.selectedStatusFilter);
    }

    if (this.selectedApplicationFilter) {
      filtered = filtered.filter(
        (e) => e.applicationId === this.selectedApplicationFilter,
      );
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

    this.accessManagementService.getExceptions().subscribe((exceptions) => {
      this.exceptions.set(exceptions);
    });
  }

  // Modal methods
  openExceptionModal(exceptionId: string) {
    this.selectedExceptionId = exceptionId;
    const exception = this.selectedException();
    if (exception) {
      this.exceptionDecisionForm = {
        decision: exception.ownerDecision || "",
        note: exception.retentionNote || "",
      };
    }
  }

  closeExceptionModal() {
    this.selectedExceptionId = null;
    this.exceptionDecisionForm = { decision: "", note: "" };
  }

  submitExceptionDecision() {
    if (this.selectedExceptionId && this.isDecisionFormValid()) {
      this.accessManagementService
        .markExceptionDecision(
          this.selectedExceptionId,
          this.exceptionDecisionForm.decision as ExceptionDecision,
          this.exceptionDecisionForm.note,
        )
        .subscribe(() => {
          this.loadData();
          this.closeExceptionModal();
        });
    }
  }

  isDecisionFormValid(): boolean {
    if (!this.exceptionDecisionForm.decision) return false;
    if (this.exceptionDecisionForm.decision === ExceptionDecision.Retain) {
      return this.exceptionDecisionForm.note.trim().length > 0;
    }
    return true;
  }

  // Quick actions
  quickAction(exceptionId: string, action: "retain" | "delete") {
    const decision =
      action === "retain" ? ExceptionDecision.Retain : ExceptionDecision.Delete;
    const note = action === "retain" ? "Quick retention" : "";

    this.accessManagementService
      .markExceptionDecision(exceptionId, decision, note)
      .subscribe(() => {
        this.loadData();
      });
  }

  // Bulk actions
  getFilteredExceptionsForBulk(): ExceptionHandling[] {
    let filtered = this.exceptions();

    if (this.bulkActionForm.applicationId) {
      filtered = filtered.filter(
        (e) => e.applicationId === this.bulkActionForm.applicationId,
      );
    }

    if (this.bulkActionForm.exceptionType) {
      filtered = filtered.filter(
        (e) => e.exceptionType === this.bulkActionForm.exceptionType,
      );
    }

    if (this.bulkActionForm.daysUntilDelete) {
      const targetDays = parseInt(this.bulkActionForm.daysUntilDelete);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + targetDays);

      filtered = filtered.filter((e) => {
        const deleteDate = new Date(e.autoDeleteDate);
        return deleteDate <= targetDate;
      });
    }

    return filtered.filter((e) => !e.ownerDecision); // Only pending decisions
  }

  applyBulkAction(action: "retain" | "delete") {
    const exceptions = this.getFilteredExceptionsForBulk();
    const decision =
      action === "retain" ? ExceptionDecision.Retain : ExceptionDecision.Delete;
    const note = action === "retain" ? "Bulk retention action" : "";

    // Process each exception
    exceptions.forEach((exception) => {
      this.accessManagementService
        .markExceptionDecision(exception.id, decision, note)
        .subscribe(() => {
          // Reload data after each update
          this.loadData();
        });
    });

    this.showBulkActions = false;
  }

  // Selection methods
  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.filteredExceptions().forEach((e) =>
        this.selectedExceptions.add(e.id),
      );
    } else {
      this.selectedExceptions.clear();
    }
  }

  toggleExceptionSelection(exceptionId: string, event: any) {
    if (event.target.checked) {
      this.selectedExceptions.add(exceptionId);
    } else {
      this.selectedExceptions.delete(exceptionId);
    }
  }

  // Validation and utilities
  validateAllPending() {
    // Simulate re-validation
    console.log("Re-validating all pending exceptions...");
  }

  applyFilters() {
    // Filters are applied automatically through computed property
  }

  trackByExceptionId(index: number, exception: ExceptionHandling): string {
    return exception.id;
  }

  getApplicationName(applicationId: string): string {
    const app = this.applications().find((a) => a.id === applicationId);
    return app?.name || "Unknown Application";
  }

  getDaysUntilAutoDelete(autoDeleteDate: Date): number {
    const now = new Date();
    const deleteDate = new Date(autoDeleteDate);
    const diffTime = deleteDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Styling methods
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

  getExceptionStatusClass(status: string): string {
    const classes: Record<string, string> = {
      new: "bg-primary-100 text-primary-800",
      under_review: "bg-warning-100 text-warning-800",
      resolved: "bg-success-100 text-success-800",
      auto_deleted: "bg-secondary-100 text-secondary-800",
    };
    return classes[status] || classes["new"];
  }

  getExceptionStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      new: "New",
      under_review: "Under Review",
      resolved: "Resolved",
      auto_deleted: "Auto-Deleted",
    };
    return labels[status] || "Unknown";
  }

  getDecisionClass(decision: string): string {
    const classes: Record<string, string> = {
      retain: "bg-success-100 text-success-800",
      delete: "bg-danger-100 text-danger-800",
    };
    return classes[decision] || "";
  }

  getDecisionLabel(decision: string): string {
    const labels: Record<string, string> = {
      retain: "Retain",
      delete: "Delete",
    };
    return labels[decision] || "";
  }

  getAutoDeleteClass(autoDeleteDate: Date): string {
    const daysRemaining = this.getDaysUntilAutoDelete(autoDeleteDate);
    if (daysRemaining <= 0) return "text-danger-600 font-medium";
    if (daysRemaining <= 1) return "text-danger-600";
    if (daysRemaining <= 3) return "text-warning-600";
    return "text-secondary-600";
  }
}
