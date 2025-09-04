import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuditComplianceService } from "../../shared/services/audit-compliance.service";
import {
  AccessReview,
  AccessCertification,
  ReviewFinding,
  ReviewType,
  ReviewStatus,
  ReviewFrequency,
  FindingType,
  FindingSeverity,
  FindingStatus,
  CertificationDecision,
} from "../../shared/interfaces/audit-compliance.interface";

interface ReviewFilters {
  searchQuery: string;
  status: string;
  reviewType: string;
  dateFrom: string;
  dateTo: string;
}

@Component({
  selector: "app-access-reviews",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">
            Access Reviews
          </h1>
          <p class="text-secondary-600 mt-1">
            Manage periodic access certifications and user access reviews
          </p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary" (click)="showCreateReviewModal()">
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
            Create Review
          </button>
          <button class="btn-secondary" (click)="exportReviews()">
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
          <button class="btn-primary" (click)="refreshReviews()">
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

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Active Reviews -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Active Reviews
              </p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">
                {{ getActiveReviewsCount() }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-primary-600"
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
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600"
                >{{ reviews().length }} total reviews</span
              >
            </div>
          </div>
        </div>

        <!-- Pending Certifications -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Pending Items
              </p>
              <p class="text-2xl font-semibold text-warning-600 mt-2">
                {{ getTotalPendingItems() }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-warning-600"
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
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600"
                >{{ getTotalCompletedItems() }} completed</span
              >
            </div>
          </div>
        </div>

        <!-- Overdue Reviews -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Overdue Reviews
              </p>
              <p class="text-2xl font-semibold text-danger-600 mt-2">
                {{ getOverdueReviewsCount() }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-danger-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-danger-600">Requires attention</span>
            </div>
          </div>
        </div>

        <!-- Flagged Items -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Flagged Items
              </p>
              <p class="text-2xl font-semibold text-purple-600 mt-2">
                {{ getTotalFlaggedItems() }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600">Risk indicators</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
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
                placeholder="Search reviews by name, type, or reviewer..."
                class="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div class="flex space-x-3">
            <select
              [(ngModel)]="filters().status"
              (ngModelChange)="onFilterChange()"
              class="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              [(ngModel)]="filters().reviewType"
              (ngModelChange)="onFilterChange()"
              class="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              <option value="access_certification">Access Certification</option>
              <option value="role_certification">Role Certification</option>
              <option value="permission_review">Permission Review</option>
              <option value="orphaned_account_review">
                Orphaned Account Review
              </option>
              <option value="privileged_access_review">
                Privileged Access Review
              </option>
            </select>
            <span
              class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-primary-100 text-primary-800"
            >
              {{ filteredReviews().length }} reviews
            </span>
          </div>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          *ngFor="let review of filteredReviews()"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          (click)="viewReviewDetails(review)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h4 class="text-lg font-medium text-secondary-900 mb-2">
                {{ review.name }}
              </h4>
              <p class="text-sm text-secondary-600 line-clamp-2">
                {{ review.description }}
              </p>
            </div>
            <span [class]="getStatusBadgeClass(review.status)">
              {{ getStatusLabel(review.status) }}
            </span>
          </div>

          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <div [class]="getReviewTypeIconClass(review.reviewType)">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <span class="text-sm text-secondary-700">{{
                getReviewTypeLabel(review.reviewType)
              }}</span>
            </div>
            <div class="text-sm text-secondary-500">
              {{ review.frequency }}
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-secondary-600">Progress</span>
              <span class="font-medium text-secondary-900"
                >{{ getReviewProgress(review) }}%</span
              >
            </div>
            <div class="w-full bg-secondary-200 rounded-full h-2">
              <div
                class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                [style.width.%]="getReviewProgress(review)"
              ></div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="text-center">
              <div class="text-lg font-semibold text-secondary-900">
                {{ review.totalItems }}
              </div>
              <div class="text-xs text-secondary-500">Total Items</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-success-600">
                {{ review.approvedItems }}
              </div>
              <div class="text-xs text-secondary-500">Approved</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-danger-600">
                {{ review.revokedItems }}
              </div>
              <div class="text-xs text-secondary-500">Revoked</div>
            </div>
          </div>

          <!-- Due Date -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary-500">
              {{ review.status === "completed" ? "Completed" : "Due" }}:
            </span>
            <span [class]="getDueDateClass(review)">
              {{
                review.status === "completed"
                  ? (review.completionDate | date: "MMM d, y")
                  : (review.endDate | date: "MMM d, y")
              }}
            </span>
          </div>

          <!-- Findings Alert -->
          <div
            *ngIf="review.findings.length > 0"
            class="mt-3 p-2 bg-warning-50 border border-warning-200 rounded-md"
          >
            <div class="flex items-center space-x-2">
              <svg
                class="w-4 h-4 text-warning-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span class="text-sm text-warning-800"
                >{{ review.findings.length }} finding(s) require attention</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredReviews().length === 0" class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-secondary-400"
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
        <h3 class="mt-2 text-sm font-medium text-secondary-900">
          No access reviews found
        </h3>
        <p class="mt-1 text-sm text-secondary-500">
          Get started by creating your first access review campaign.
        </p>
        <div class="mt-6">
          <button class="btn-primary" (click)="showCreateReviewModal()">
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
            Create Access Review
          </button>
        </div>
      </div>

      <!-- Review Details Modal -->
      <div
        *ngIf="selectedReview()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeReviewDetails()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-secondary-900">
                  {{ selectedReview()!.name }}
                </h3>
                <p class="text-sm text-secondary-600 mt-1">
                  {{ selectedReview()!.description }}
                </p>
              </div>
              <button
                (click)="closeReviewDetails()"
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
            <!-- Review Overview -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div class="lg:col-span-1 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Status</label
                  >
                  <span
                    class="mt-1"
                    [class]="getStatusBadgeClass(selectedReview()!.status)"
                  >
                    {{ getStatusLabel(selectedReview()!.status) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Review Type</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ getReviewTypeLabel(selectedReview()!.reviewType) }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Frequency</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedReview()!.frequency }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Period</label
                  >
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedReview()!.startDate | date: "MMM d, y" }} -
                    {{ selectedReview()!.endDate | date: "MMM d, y" }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Progress</label
                  >
                  <div class="mt-1">
                    <div class="flex items-center justify-between text-sm mb-1">
                      <span
                        >{{ selectedReview()!.completedItems }}/{{
                          selectedReview()!.totalItems
                        }}</span
                      >
                      <span>{{ getReviewProgress(selectedReview()!) }}%</span>
                    </div>
                    <div class="w-full bg-secondary-200 rounded-full h-2">
                      <div
                        class="bg-primary-600 h-2 rounded-full"
                        [style.width.%]="getReviewProgress(selectedReview()!)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Statistics -->
              <div class="lg:col-span-2">
                <h4 class="text-lg font-medium text-secondary-900 mb-4">
                  Review Statistics
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="text-center p-3 bg-secondary-50 rounded-lg">
                    <div class="text-2xl font-bold text-secondary-900">
                      {{ selectedReview()!.totalItems }}
                    </div>
                    <div class="text-sm text-secondary-600">Total Items</div>
                  </div>
                  <div class="text-center p-3 bg-success-50 rounded-lg">
                    <div class="text-2xl font-bold text-success-600">
                      {{ selectedReview()!.approvedItems }}
                    </div>
                    <div class="text-sm text-secondary-600">Approved</div>
                  </div>
                  <div class="text-center p-3 bg-danger-50 rounded-lg">
                    <div class="text-2xl font-bold text-danger-600">
                      {{ selectedReview()!.revokedItems }}
                    </div>
                    <div class="text-sm text-secondary-600">Revoked</div>
                  </div>
                  <div class="text-center p-3 bg-warning-50 rounded-lg">
                    <div class="text-2xl font-bold text-warning-600">
                      {{ selectedReview()!.flaggedItems }}
                    </div>
                    <div class="text-sm text-secondary-600">Flagged</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Review Scope -->
            <div class="mb-6">
              <h4 class="text-lg font-medium text-secondary-900 mb-4">
                Review Scope
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Departments</label
                  >
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span
                      *ngFor="let dept of selectedReview()!.scope.departments"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {{ dept }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Systems</label
                  >
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span
                      *ngFor="let system of selectedReview()!.scope.systems"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {{ system }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700"
                    >Access Types</label
                  >
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span
                      *ngFor="let type of selectedReview()!.scope.accessTypes"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {{ type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Findings -->
            <div *ngIf="selectedReview()!.findings.length > 0" class="mb-6">
              <h4 class="text-lg font-medium text-secondary-900 mb-4">
                Review Findings
              </h4>
              <div class="space-y-3">
                <div
                  *ngFor="let finding of selectedReview()!.findings"
                  class="border border-secondary-200 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h5 class="font-medium text-secondary-900">
                        {{ getFindingTypeLabel(finding.type) }}
                      </h5>
                      <p class="text-sm text-secondary-600 mt-1">
                        {{ finding.description }}
                      </p>
                    </div>
                    <span [class]="getFindingSeverityClass(finding.severity)">
                      {{ finding.severity }}
                    </span>
                  </div>
                  <div class="text-sm text-secondary-600 mb-2">
                    <span class="font-medium">Risk Impact:</span>
                    {{ finding.riskImpact }}
                  </div>
                  <div class="text-sm text-primary-600 mb-2">
                    <span class="font-medium">Recommendation:</span>
                    {{ finding.recommendation }}
                  </div>
                  <div
                    class="flex items-center justify-between text-sm text-secondary-500"
                  >
                    <span>Assigned to: {{ finding.assignedTo }}</span>
                    <span>Due: {{ finding.dueDate | date: "MMM d, y" }}</span>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <span
                      *ngFor="let item of finding.affectedItems"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                    >
                      {{ item }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviewers -->
            <div class="mb-6">
              <h4 class="text-lg font-medium text-secondary-900 mb-4">
                Reviewers
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  *ngFor="let reviewer of selectedReview()!.metadata.reviewers"
                  class="border border-secondary-200 rounded-lg p-3"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="font-medium text-secondary-900">
                      {{ reviewer.name }}
                    </h5>
                    <span class="text-sm text-secondary-500">{{
                      reviewer.role
                    }}</span>
                  </div>
                  <div class="text-sm text-secondary-600 mb-2">
                    Progress: {{ reviewer.completedItems }}/{{
                      reviewer.assignedItems
                    }}
                    items
                  </div>
                  <div class="w-full bg-secondary-200 rounded-full h-2 mb-2">
                    <div
                      class="bg-primary-600 h-2 rounded-full"
                      [style.width.%]="getReviewerProgress(reviewer)"
                    ></div>
                  </div>
                  <div class="text-xs text-secondary-500">
                    Last activity:
                    {{ reviewer.lastActivity | date: "MMM d, h:mm a" }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3"
          >
            <button
              *ngIf="selectedReview()!.status === 'in_progress'"
              (click)="continueReview(selectedReview()!)"
              class="btn-secondary"
            >
              Continue Review
            </button>
            <button
              (click)="exportReview(selectedReview()!)"
              class="btn-secondary"
            >
              Export Results
            </button>
            <button (click)="closeReviewDetails()" class="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Create Review Modal -->
      <div
        *ngIf="showCreateModal()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeCreateModal()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <h3 class="text-lg font-medium text-secondary-900">
              Create Access Review
            </h3>
          </div>

          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Review Name</label
                >
                <input
                  type="text"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Q1 2024 Privileged Access Review"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Review Type</label
                >
                <select
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option>Access Certification</option>
                  <option>Role Certification</option>
                  <option>Permission Review</option>
                  <option>Privileged Access Review</option>
                  <option>Orphaned Account Review</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Frequency</label
                >
                <select
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option>Quarterly</option>
                  <option>Monthly</option>
                  <option>Semi-Annually</option>
                  <option>Annually</option>
                  <option>On-Demand</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Start Date</label
                >
                <input
                  type="date"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >End Date</label
                >
                <input
                  type="date"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2"
                  >Description</label
                >
                <textarea
                  rows="3"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of the access review campaign..."
                ></textarea>
              </div>
            </div>
          </div>

          <div
            class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3"
          >
            <button (click)="closeCreateModal()" class="btn-secondary">
              Cancel
            </button>
            <button (click)="createReview()" class="btn-primary">
              Create Review
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AccessReviewsComponent implements OnInit {
  reviews = signal<AccessReview[]>([]);
  certifications = signal<AccessCertification[]>([]);
  selectedReview = signal<AccessReview | null>(null);
  showCreateModal = signal(false);
  isLoading = signal(false);

  filters = signal<ReviewFilters>({
    searchQuery: "",
    status: "",
    reviewType: "",
    dateFrom: "",
    dateTo: "",
  });

  // Computed properties
  filteredReviews = computed(() => {
    let filtered = this.reviews();
    const f = this.filters();

    if (f.searchQuery) {
      const query = f.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.name.toLowerCase().includes(query) ||
          review.description.toLowerCase().includes(query) ||
          review.reviewedBy.some((reviewer) =>
            reviewer.toLowerCase().includes(query),
          ),
      );
    }

    if (f.status) {
      filtered = filtered.filter((review) => review.status === f.status);
    }

    if (f.reviewType) {
      filtered = filtered.filter(
        (review) => review.reviewType === f.reviewType,
      );
    }

    if (f.dateFrom) {
      filtered = filtered.filter(
        (review) => review.startDate >= new Date(f.dateFrom),
      );
    }

    if (f.dateTo) {
      filtered = filtered.filter(
        (review) => review.endDate <= new Date(f.dateTo),
      );
    }

    return filtered.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    );
  });

  constructor(private auditService: AuditComplianceService) {}

  ngOnInit(): void {
    this.loadReviews();
    this.loadCertifications();
  }

  private loadReviews(): void {
    this.isLoading.set(true);
    this.auditService.getAccessReviews().subscribe((reviews) => {
      this.reviews.set(reviews);
      this.isLoading.set(false);
    });
  }

  private loadCertifications(): void {
    this.auditService.getAccessCertifications().subscribe((certifications) => {
      this.certifications.set(certifications);
    });
  }

  onFilterChange(): void {
    // Filtering is handled by computed property
  }

  refreshReviews(): void {
    this.loadReviews();
    this.loadCertifications();
  }

  exportReviews(): void {
    const dataStr = JSON.stringify(this.filteredReviews(), null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `access-reviews-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportReview(review: AccessReview): void {
    const dataStr = JSON.stringify(review, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${review.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  viewReviewDetails(review: AccessReview): void {
    this.selectedReview.set(review);
  }

  closeReviewDetails(): void {
    this.selectedReview.set(null);
  }

  continueReview(review: AccessReview): void {
    // Navigate to review certification interface
    console.log("Continue review:", review.id);
    this.closeReviewDetails();
  }

  showCreateReviewModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createReview(): void {
    // Simulate review creation
    this.isLoading.set(true);
    this.auditService.createAccessReview({}).subscribe((reviewId) => {
      console.log("Created review:", reviewId);
      this.closeCreateModal();
      this.loadReviews();
      this.isLoading.set(false);
    });
  }

  // Utility methods
  getActiveReviewsCount(): number {
    return this.reviews().filter(
      (r) =>
        r.status === ReviewStatus.InProgress ||
        r.status === ReviewStatus.Review,
    ).length;
  }

  getOverdueReviewsCount(): number {
    return this.reviews().filter(
      (r) =>
        r.status === ReviewStatus.Overdue ||
        (r.endDate < new Date() && r.status !== ReviewStatus.Completed),
    ).length;
  }

  getTotalPendingItems(): number {
    return this.reviews().reduce(
      (sum, review) => sum + (review.totalItems - review.completedItems),
      0,
    );
  }

  getTotalCompletedItems(): number {
    return this.reviews().reduce(
      (sum, review) => sum + review.completedItems,
      0,
    );
  }

  getTotalFlaggedItems(): number {
    return this.reviews().reduce((sum, review) => sum + review.flaggedItems, 0);
  }

  getReviewProgress(review: AccessReview): number {
    if (review.totalItems === 0) return 0;
    return Math.round((review.completedItems / review.totalItems) * 100);
  }

  getReviewerProgress(reviewer: any): number {
    if (reviewer.assignedItems === 0) return 0;
    return Math.round((reviewer.completedItems / reviewer.assignedItems) * 100);
  }

  getStatusBadgeClass(status: ReviewStatus): string {
    const baseClass =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case ReviewStatus.Planned:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
      case ReviewStatus.InProgress:
        return `${baseClass} bg-blue-100 text-blue-800`;
      case ReviewStatus.Review:
        return `${baseClass} bg-warning-100 text-warning-800`;
      case ReviewStatus.Completed:
        return `${baseClass} bg-success-100 text-success-800`;
      case ReviewStatus.Cancelled:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
      case ReviewStatus.Overdue:
        return `${baseClass} bg-danger-100 text-danger-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getStatusLabel(status: ReviewStatus): string {
    switch (status) {
      case ReviewStatus.InProgress:
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  getReviewTypeIconClass(reviewType: ReviewType): string {
    const baseClass = "w-6 h-6 rounded-lg flex items-center justify-center";
    switch (reviewType) {
      case ReviewType.AccessCertification:
        return `${baseClass} bg-primary-100 text-primary-600`;
      case ReviewType.RoleCertification:
        return `${baseClass} bg-green-100 text-green-600`;
      case ReviewType.PermissionReview:
        return `${baseClass} bg-blue-100 text-blue-600`;
      case ReviewType.OrphanedAccountReview:
        return `${baseClass} bg-orange-100 text-orange-600`;
      case ReviewType.PrivilegedAccessReview:
        return `${baseClass} bg-purple-100 text-purple-600`;
      case ReviewType.ComplianceReview:
        return `${baseClass} bg-indigo-100 text-indigo-600`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-600`;
    }
  }

  getReviewTypeLabel(reviewType: ReviewType): string {
    switch (reviewType) {
      case ReviewType.AccessCertification:
        return "Access Certification";
      case ReviewType.RoleCertification:
        return "Role Certification";
      case ReviewType.PermissionReview:
        return "Permission Review";
      case ReviewType.OrphanedAccountReview:
        return "Orphaned Account Review";
      case ReviewType.PrivilegedAccessReview:
        return "Privileged Access Review";
      case ReviewType.ComplianceReview:
        return "Compliance Review";
      default:
        return reviewType;
    }
  }

  getDueDateClass(review: AccessReview): string {
    if (review.status === ReviewStatus.Completed) return "text-success-600";
    if (review.status === ReviewStatus.Overdue || review.endDate < new Date()) {
      return "text-danger-600 font-medium";
    }
    const daysDiff = Math.ceil(
      (review.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff <= 7) return "text-warning-600 font-medium";
    return "text-secondary-900";
  }

  getFindingTypeLabel(type: FindingType): string {
    switch (type) {
      case FindingType.ExcessiveAccess:
        return "Excessive Access";
      case FindingType.OrphanedAccount:
        return "Orphaned Account";
      case FindingType.InactiveUser:
        return "Inactive User";
      case FindingType.PolicyViolation:
        return "Policy Violation";
      case FindingType.RiskFlag:
        return "Risk Flag";
      case FindingType.ComplianceGap:
        return "Compliance Gap";
      default:
        return type;
    }
  }

  getFindingSeverityClass(severity: FindingSeverity): string {
    const baseClass =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (severity) {
      case FindingSeverity.Critical:
        return `${baseClass} bg-purple-100 text-purple-800`;
      case FindingSeverity.High:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case FindingSeverity.Medium:
        return `${baseClass} bg-warning-100 text-warning-800`;
      case FindingSeverity.Low:
        return `${baseClass} bg-blue-100 text-blue-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }
}
