import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuditComplianceService } from "../../shared/services/audit-compliance.service";
import {
  ComplianceReport,
  ComplianceMetrics,
  ComplianceFramework,
  ControlResult,
  PolicyViolation,
  ComplianceFinding,
  ReportType,
  ReportStatus,
  ReportFrequency,
  ControlStatus,
  FindingSeverity,
  ViolationSeverity,
  TrendDirection,
  ConfidentialityLevel,
} from "../../shared/interfaces/audit-compliance.interface";

interface ReportFilters {
  searchQuery: string;
  status: string;
  framework: string;
  dateFrom: string;
  dateTo: string;
}

@Component({
  selector: "app-compliance-reports",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">
            Compliance Reports
          </h1>
          <p class="text-secondary-600 mt-1">
            Monitor compliance across frameworks and generate assessment reports
          </p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary" (click)="showGenerateModal()">
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
            Generate Report
          </button>
          <button class="btn-secondary" (click)="exportReports()">
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
          <button class="btn-primary" (click)="refreshReports()">
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

      <!-- Metrics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Overall Compliance Score -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Overall Score
              </p>
              <p
                class="text-2xl font-semibold mt-2"
                [class]="getScoreColorClass(metrics().overallScore)"
              >
                {{ metrics().overallScore }}%
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-success-600">↗ +3.2%</span>
              <span class="text-secondary-500 ml-1">vs last quarter</span>
            </div>
          </div>
        </div>

        <!-- Controls Status -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Controls Passed
              </p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">
                {{ metrics().controlsPassed }}/{{ metrics().controlsTotal }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600"
                >{{ getControlPassRate() }}% pass rate</span
              >
            </div>
          </div>
        </div>

        <!-- Active Reports -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Active Reports
              </p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">
                {{ getActiveReportsCount() }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600"
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
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600"
                >{{ reports().length }} total reports</span
              >
            </div>
          </div>
        </div>

        <!-- Open Violations -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Open Violations
              </p>
              <p class="text-2xl font-semibold text-danger-600 mt-2">
                {{ metrics().violationsOpen }}
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
              <span class="text-success-600"
                >{{ metrics().violationsClosed }} resolved</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Framework Scores Chart -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Framework Compliance -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Framework Compliance Scores</h3>
            <p class="card-subtitle">Current compliance status by framework</p>
          </div>
          <div class="space-y-4">
            <div
              *ngFor="let framework of metrics().frameworkScores"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div [class]="getFrameworkIconClass(framework.framework)">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-secondary-900">
                    {{ framework.framework }}
                  </p>
                  <p class="text-sm text-secondary-500">
                    Last assessed
                    {{ framework.lastAssessment | date: "MMM d, y" }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="text-right">
                  <p
                    class="font-semibold"
                    [class]="getScoreColorClass(framework.score)"
                  >
                    {{ framework.score }}%
                  </p>
                  <div class="flex items-center text-sm">
                    <span [class]="getTrendColorClass(framework.trend)">
                      {{ getTrendIcon(framework.trend) }}
                      {{ getTrendText(framework.trend) }}
                    </span>
                  </div>
                </div>
                <div class="w-16 bg-secondary-200 rounded-full h-2">
                  <div
                    [class]="getScoreBarClass(framework.score)"
                    class="h-2 rounded-full transition-all duration-300"
                    [style.width.%]="framework.score"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Control Status Breakdown -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Control Status Distribution</h3>
            <p class="card-subtitle">
              Current status of all compliance controls
            </p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-success-500 rounded-full"></div>
                <span class="text-secondary-700">Passed</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium text-secondary-900">{{
                  metrics().controlsPassed
                }}</span>
                <span class="text-sm text-secondary-500"
                  >({{ getControlPassRate() }}%)</span
                >
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-danger-500 rounded-full"></div>
                <span class="text-secondary-700">Failed</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium text-secondary-900">{{
                  metrics().controlsFailed
                }}</span>
                <span class="text-sm text-secondary-500"
                  >({{ getControlFailRate() }}%)</span
                >
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span class="text-secondary-700">In Progress</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium text-secondary-900">{{
                  metrics().controlsInProgress
                }}</span>
                <span class="text-sm text-secondary-500"
                  >({{ getControlInProgressRate() }}%)</span
                >
              </div>
            </div>
            <div class="w-full bg-secondary-200 rounded-full h-3 mt-4">
              <div class="flex h-3 rounded-full overflow-hidden">
                <div
                  class="bg-success-500"
                  [style.width.%]="getControlPassRate()"
                ></div>
                <div
                  class="bg-danger-500"
                  [style.width.%]="getControlFailRate()"
                ></div>
                <div
                  class="bg-warning-500"
                  [style.width.%]="getControlInProgressRate()"
                ></div>
              </div>
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
                placeholder="Search reports by name, framework, or description..."
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
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              [(ngModel)]="filters().framework"
              (ngModelChange)="onFilterChange()"
              class="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Frameworks</option>
              <option value="SOX">SOX</option>
              <option value="PCI-DSS">PCI-DSS</option>
              <option value="ISO 27001">ISO 27001</option>
              <option value="GDPR">GDPR</option>
              <option value="NIST">NIST</option>
              <option value="HIPAA">HIPAA</option>
            </select>
            <span
              class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-primary-100 text-primary-800"
            >
              {{ filteredReports().length }} reports
            </span>
          </div>
        </div>
      </div>

      <!-- Reports List -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          *ngFor="let report of filteredReports()"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          (click)="viewReportDetails(report)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h4 class="text-lg font-medium text-secondary-900 mb-2">
                {{ report.name }}
              </h4>
              <p class="text-sm text-secondary-600 line-clamp-2">
                {{ report.description }}
              </p>
            </div>
            <span [class]="getStatusBadgeClass(report.status)">
              {{ getStatusLabel(report.status) }}
            </span>
          </div>

          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center space-x-2">
              <div
                [class]="getFrameworkIconClass(report.framework.name)"
                class="w-6 h-6"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">... (truncated for brevity)