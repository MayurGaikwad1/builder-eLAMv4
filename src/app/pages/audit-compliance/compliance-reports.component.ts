import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuditComplianceService } from '../../shared/services/audit-compliance.service';
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
  ConfidentialityLevel
} from '../../shared/interfaces/audit-compliance.interface';

interface ReportFilters {
  searchQuery: string;
  status: string;
  framework: string;
  dateFrom: string;
  dateTo: string;
}

@Component({
  selector: 'app-compliance-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">Compliance Reports</h1>
          <p class="text-secondary-600 mt-1">Monitor compliance across frameworks and generate assessment reports</p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary" (click)="showGenerateModal()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Generate Report
          </button>
          <button class="btn-secondary" (click)="exportReports()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export
          </button>
          <button class="btn-primary" (click)="refreshReports()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
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
              <p class="text-sm font-medium text-secondary-600">Overall Score</p>
              <p class="text-2xl font-semibold mt-2" [class]="getScoreColorClass(metrics().overallScore)">
                {{ metrics().overallScore }}%
              </p>
            </div>
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
              <p class="text-sm font-medium text-secondary-600">Controls Passed</p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">
                {{ metrics().controlsPassed }}/{{ metrics().controlsTotal }}
              </p>
            </div>
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600">{{ getControlPassRate() }}% pass rate</span>
            </div>
          </div>
        </div>

        <!-- Active Reports -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Active Reports</p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">{{ getActiveReportsCount() }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600">{{ reports().length }} total reports</span>
            </div>
          </div>
        </div>

        <!-- Open Violations -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Open Violations</p>
              <p class="text-2xl font-semibold text-danger-600 mt-2">{{ metrics().violationsOpen }}</p>
            </div>
            <div class="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-success-600">{{ metrics().violationsClosed }} resolved</span>
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
            <div *ngFor="let framework of metrics().frameworkScores" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div [class]="getFrameworkIconClass(framework.framework)">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-secondary-900">{{ framework.framework }}</p>
                  <p class="text-sm text-secondary-500">Last assessed {{ framework.lastAssessment | date:'MMM d, y' }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="text-right">
                  <p class="font-semibold" [class]="getScoreColorClass(framework.score)">{{ framework.score }}%</p>
                  <div class="flex items-center text-sm">
                    <span [class]="getTrendColorClass(framework.trend)">
                      {{ getTrendIcon(framework.trend) }} {{ getTrendText(framework.trend) }}
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
            <p class="card-subtitle">Current status of all compliance controls</p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-success-500 rounded-full"></div>
                <span class="text-secondary-700">Passed</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium text-secondary-900">{{ metrics().controlsPassed }}</span>
                <span class="text-sm text-secondary-500">({{ getControlPassRate() }}%)</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-danger-500 rounded-full"></div>
                <span class="text-secondary-700">Failed</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium text-secondary-900">{{ metrics().controlsFailed }}</span>
                <span class="text-sm text-secondary-500">({{ getControlFailRate() }}%)</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span class="text-secondary-700">In Progress</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium text-secondary-900">{{ metrics().controlsInProgress }}</span>
                <span class="text-sm text-secondary-500">({{ getControlInProgressRate() }}%)</span>
              </div>
            </div>
            <div class="w-full bg-secondary-200 rounded-full h-3 mt-4">
              <div class="flex h-3 rounded-full overflow-hidden">
                <div class="bg-success-500" [style.width.%]="getControlPassRate()"></div>
                <div class="bg-danger-500" [style.width.%]="getControlFailRate()"></div>
                <div class="bg-warning-500" [style.width.%]="getControlInProgressRate()"></div>
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
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                [(ngModel)]="filters().searchQuery"
                (ngModelChange)="onFilterChange()"
                placeholder="Search reports by name, framework, or description..."
                class="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
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
            <span class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-primary-100 text-primary-800">
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
              <h4 class="text-lg font-medium text-secondary-900 mb-2">{{ report.name }}</h4>
              <p class="text-sm text-secondary-600 line-clamp-2">{{ report.description }}</p>
            </div>
            <span [class]="getStatusBadgeClass(report.status)">
              {{ getStatusLabel(report.status) }}
            </span>
          </div>

          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center space-x-2">
              <div [class]="getFrameworkIconClass(report.framework.name)" class="w-6 h-6">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span class="text-sm text-secondary-700">{{ report.framework.name }}</span>
            </div>
            <div class="text-sm text-secondary-500">
              {{ report.generatedAt | date:'MMM d, y' }}
            </div>
          </div>

          <div class="flex items-center justify-between mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold" [class]="getScoreColorClass(report.overallScore)">
                {{ report.overallScore }}%
              </div>
              <div class="text-xs text-secondary-500">Overall Score</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-secondary-900">
                {{ getPassedControlsCount(report) }}/{{ report.controlResults.length }}
              </div>
              <div class="text-xs text-secondary-500">Controls Passed</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-danger-600">
                {{ report.violations.length }}
              </div>
              <div class="text-xs text-secondary-500">Violations</div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2 text-sm text-secondary-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span>{{ report.generatedBy }}</span>
            </div>
            <button 
              (click)="downloadReport(report, $event)"
              class="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredReports().length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-secondary-900">No reports found</h3>
        <p class="mt-1 text-sm text-secondary-500">Get started by generating your first compliance report.</p>
        <div class="mt-6">
          <button class="btn-primary" (click)="showGenerateModal()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Generate Report
          </button>
        </div>
      </div>

      <!-- Report Details Modal -->
      <div 
        *ngIf="selectedReport()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeReportDetails()"
      >
        <div 
          class="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-secondary-900">{{ selectedReport()!.name }}</h3>
                <p class="text-sm text-secondary-600 mt-1">{{ selectedReport()!.description }}</p>
              </div>
              <button 
                (click)="closeReportDetails()"
                class="text-secondary-400 hover:text-secondary-600"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <!-- Report Summary -->
              <div class="lg:col-span-1 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700">Overall Score</label>
                  <div class="mt-1 flex items-center space-x-2">
                    <span class="text-2xl font-bold" [class]="getScoreColorClass(selectedReport()!.overallScore)">
                      {{ selectedReport()!.overallScore }}%
                    </span>
                    <div class="flex-1 bg-secondary-200 rounded-full h-3">
                      <div 
                        [class]="getScoreBarClass(selectedReport()!.overallScore)" 
                        class="h-3 rounded-full"
                        [style.width.%]="selectedReport()!.overallScore"
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700">Framework</label>
                  <p class="mt-1 text-sm text-secondary-900">{{ selectedReport()!.framework.name }} v{{ selectedReport()!.framework.version }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700">Period</label>
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedReport()!.period.startDate | date:'MMM d, y' }} - 
                    {{ selectedReport()!.period.endDate | date:'MMM d, y' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700">Status</label>
                  <span class="mt-1" [class]="getStatusBadgeClass(selectedReport()!.status)">
                    {{ getStatusLabel(selectedReport()!.status) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700">Generated</label>
                  <p class="mt-1 text-sm text-secondary-900">
                    {{ selectedReport()!.generatedAt | date:'MMM d, y h:mm a' }} by {{ selectedReport()!.generatedBy }}
                  </p>
                </div>
              </div>

              <!-- Control Results -->
              <div class="lg:col-span-2">
                <h4 class="text-lg font-medium text-secondary-900 mb-4">Control Results</h4>
                <div class="space-y-3 max-h-96 overflow-y-auto">
                  <div *ngFor="let control of selectedReport()!.controlResults" class="border border-secondary-200 rounded-lg p-3">
                    <div class="flex items-center justify-between mb-2">
                      <h5 class="font-medium text-secondary-900">{{ control.controlName }}</h5>
                      <span [class]="getControlStatusBadgeClass(control.status)">
                        {{ control.status }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-sm text-secondary-600">
                      <span>Score: {{ control.score }}%</span>
                      <span>Tested: {{ control.testedAt | date:'MMM d, y' }}</span>
                    </div>
                    <p *ngIf="control.comments" class="text-sm text-secondary-600 mt-2">{{ control.comments }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Violations -->
            <div *ngIf="selectedReport()!.violations.length > 0" class="mb-6">
              <h4 class="text-lg font-medium text-secondary-900 mb-4">Policy Violations</h4>
              <div class="space-y-3">
                <div *ngFor="let violation of selectedReport()!.violations" class="border border-secondary-200 rounded-lg p-3">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h5 class="font-medium text-secondary-900">{{ violation.description }}</h5>
                      <p class="text-sm text-secondary-600 mt-1">{{ violation.violatedRule }}</p>
                    </div>
                    <span [class]="getViolationSeverityClass(violation.severity)">
                      {{ violation.severity }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-sm text-secondary-500 mt-2">
                    <span>{{ violation.involvedUsers[0]?.userName }}</span>
                    <span>{{ violation.detectedAt | date:'MMM d, h:mm a' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Findings -->
            <div *ngIf="selectedReport()!.findings.length > 0">
              <h4 class="text-lg font-medium text-secondary-900 mb-4">Compliance Findings</h4>
              <div class="space-y-3">
                <div *ngFor="let finding of selectedReport()!.findings" class="border border-secondary-200 rounded-lg p-3">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h5 class="font-medium text-secondary-900">{{ finding.title }}</h5>
                      <p class="text-sm text-secondary-600 mt-1">{{ finding.description }}</p>
                      <p class="text-sm text-primary-600 mt-2">{{ finding.recommendation }}</p>
                    </div>
                    <span [class]="getFindingSeverityClass(finding.severity)">
                      {{ finding.severity }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-sm text-secondary-500 mt-2">
                    <span>Assigned to: {{ finding.assignedTo }}</span>
                    <span>Due: {{ finding.dueDate | date:'MMM d, y' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3">
            <button 
              (click)="downloadReport(selectedReport()!)"
              class="btn-secondary"
            >
              Download Report
            </button>
            <button 
              (click)="closeReportDetails()"
              class="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Generate Report Modal -->
      <div 
        *ngIf="showGenerateReportModal()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeGenerateModal()"
      >
        <div 
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <h3 class="text-lg font-medium text-secondary-900">Generate Compliance Report</h3>
          </div>
          
          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Report Name</label>
                <input
                  type="text"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Q1 2024 SOX Compliance Report"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Framework</label>
                <select class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                  <option>SOX</option>
                  <option>PCI-DSS</option>
                  <option>ISO 27001</option>
                  <option>GDPR</option>
                  <option>NIST</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Start Date</label>
                <input
                  type="date"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">End Date</label>
                <input
                  type="date"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2">Description</label>
                <textarea
                  rows="3"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of the compliance report..."
                ></textarea>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3">
            <button (click)="closeGenerateModal()" class="btn-secondary">Cancel</button>
            <button (click)="generateReport()" class="btn-primary">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComplianceReportsComponent implements OnInit {
  reports = signal<ComplianceReport[]>([]);
  metrics = signal<ComplianceMetrics>({} as ComplianceMetrics);
  selectedReport = signal<ComplianceReport | null>(null);
  showGenerateReportModal = signal(false);
  isLoading = signal(false);

  filters = signal<ReportFilters>({
    searchQuery: '',
    status: '',
    framework: '',
    dateFrom: '',
    dateTo: ''
  });

  // Computed properties
  filteredReports = computed(() => {
    let filtered = this.reports();
    const f = this.filters();

    if (f.searchQuery) {
      const query = f.searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        report.framework.name.toLowerCase().includes(query)
      );
    }

    if (f.status) {
      filtered = filtered.filter(report => report.status === f.status);
    }

    if (f.framework) {
      filtered = filtered.filter(report => report.framework.name === f.framework);
    }

    if (f.dateFrom) {
      filtered = filtered.filter(report => report.generatedAt >= new Date(f.dateFrom));
    }

    if (f.dateTo) {
      filtered = filtered.filter(report => report.generatedAt <= new Date(f.dateTo));
    }

    return filtered.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  });

  constructor(private auditService: AuditComplianceService) {}

  ngOnInit(): void {
    this.loadReports();
    this.loadMetrics();
  }

  private loadReports(): void {
    this.isLoading.set(true);
    this.auditService.getComplianceReports().subscribe(reports => {
      this.reports.set(reports);
      this.isLoading.set(false);
    });
  }

  private loadMetrics(): void {
    this.auditService.getComplianceMetrics().subscribe(metrics => {
      this.metrics.set(metrics);
    });
  }

  onFilterChange(): void {
    // Filtering is handled by computed property
  }

  refreshReports(): void {
    this.loadReports();
    this.loadMetrics();
  }

  exportReports(): void {
    const dataStr = JSON.stringify(this.filteredReports(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance-reports-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  downloadReport(report: ComplianceReport, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  viewReportDetails(report: ComplianceReport): void {
    this.selectedReport.set(report);
  }

  closeReportDetails(): void {
    this.selectedReport.set(null);
  }

  showGenerateModal(): void {
    this.showGenerateReportModal.set(true);
  }

  closeGenerateModal(): void {
    this.showGenerateReportModal.set(false);
  }

  generateReport(): void {
    // Simulate report generation
    this.isLoading.set(true);
    this.auditService.generateComplianceReport({}).subscribe(reportId => {
      console.log('Generated report:', reportId);
      this.closeGenerateModal();
      this.loadReports();
      this.isLoading.set(false);
    });
  }

  // Utility methods
  getActiveReportsCount(): number {
    return this.reports().filter(r => 
      r.status === ReportStatus.InProgress || 
      r.status === ReportStatus.Review
    ).length;
  }

  getControlPassRate(): number {
    const metrics = this.metrics();
    if (metrics.controlsTotal === 0) return 0;
    return Math.round((metrics.controlsPassed / metrics.controlsTotal) * 100);
  }

  getControlFailRate(): number {
    const metrics = this.metrics();
    if (metrics.controlsTotal === 0) return 0;
    return Math.round((metrics.controlsFailed / metrics.controlsTotal) * 100);
  }

  getControlInProgressRate(): number {
    const metrics = this.metrics();
    if (metrics.controlsTotal === 0) return 0;
    return Math.round((metrics.controlsInProgress / metrics.controlsTotal) * 100);
  }

  getPassedControlsCount(report: ComplianceReport): number {
    return report.controlResults.filter(c => c.status === ControlStatus.Passed).length;
  }

  getScoreColorClass(score: number): string {
    if (score >= 90) return 'text-success-600';
    if (score >= 75) return 'text-warning-600';
    return 'text-danger-600';
  }

  getScoreBarClass(score: number): string {
    if (score >= 90) return 'bg-success-500';
    if (score >= 75) return 'bg-warning-500';
    return 'bg-danger-500';
  }

  getFrameworkIconClass(framework: string): string {
    const baseClass = 'w-8 h-8 rounded-lg flex items-center justify-center';
    switch (framework.toLowerCase()) {
      case 'sox': return `${baseClass} bg-blue-100 text-blue-600`;
      case 'pci-dss': return `${baseClass} bg-purple-100 text-purple-600`;
      case 'iso 27001': return `${baseClass} bg-green-100 text-green-600`;
      case 'gdpr': return `${baseClass} bg-orange-100 text-orange-600`;
      case 'nist': return `${baseClass} bg-indigo-100 text-indigo-600`;
      default: return `${baseClass} bg-secondary-100 text-secondary-600`;
    }
  }

  getTrendColorClass(trend: TrendDirection): string {
    switch (trend) {
      case TrendDirection.Improving: return 'text-success-600';
      case TrendDirection.Stable: return 'text-secondary-600';
      case TrendDirection.Declining: return 'text-danger-600';
      default: return 'text-secondary-600';
    }
  }

  getTrendIcon(trend: TrendDirection): string {
    switch (trend) {
      case TrendDirection.Improving: return '↗';
      case TrendDirection.Stable: return '→';
      case TrendDirection.Declining: return '↘';
      default: return '→';
    }
  }

  getTrendText(trend: TrendDirection): string {
    switch (trend) {
      case TrendDirection.Improving: return 'Improving';
      case TrendDirection.Stable: return 'Stable';
      case TrendDirection.Declining: return 'Declining';
      default: return 'Stable';
    }
  }

  getStatusBadgeClass(status: ReportStatus): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case ReportStatus.Draft: return `${baseClass} bg-secondary-100 text-secondary-800`;
      case ReportStatus.InProgress: return `${baseClass} bg-blue-100 text-blue-800`;
      case ReportStatus.Review: return `${baseClass} bg-warning-100 text-warning-800`;
      case ReportStatus.Approved: return `${baseClass} bg-success-100 text-success-800`;
      case ReportStatus.Published: return `${baseClass} bg-primary-100 text-primary-800`;
      case ReportStatus.Archived: return `${baseClass} bg-secondary-100 text-secondary-800`;
      default: return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getStatusLabel(status: ReportStatus): string {
    switch (status) {
      case ReportStatus.InProgress: return 'In Progress';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  getControlStatusBadgeClass(status: ControlStatus): string {
    const baseClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case ControlStatus.Passed: return `${baseClass} bg-success-100 text-success-800`;
      case ControlStatus.Failed: return `${baseClass} bg-danger-100 text-danger-800`;
      case ControlStatus.Warning: return `${baseClass} bg-warning-100 text-warning-800`;
      case ControlStatus.InProgress: return `${baseClass} bg-blue-100 text-blue-800`;
      case ControlStatus.NotTested: return `${baseClass} bg-secondary-100 text-secondary-800`;
      case ControlStatus.Exception: return `${baseClass} bg-purple-100 text-purple-800`;
      default: return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getViolationSeverityClass(severity: ViolationSeverity): string {
    const baseClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    switch (severity) {
      case ViolationSeverity.Critical: return `${baseClass} bg-purple-100 text-purple-800`;
      case ViolationSeverity.High: return `${baseClass} bg-danger-100 text-danger-800`;
      case ViolationSeverity.Medium: return `${baseClass} bg-warning-100 text-warning-800`;
      case ViolationSeverity.Low: return `${baseClass} bg-blue-100 text-blue-800`;
      default: return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getFindingSeverityClass(severity: FindingSeverity): string {
    const baseClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    switch (severity) {
      case FindingSeverity.Critical: return `${baseClass} bg-purple-100 text-purple-800`;
      case FindingSeverity.High: return `${baseClass} bg-danger-100 text-danger-800`;
      case FindingSeverity.Medium: return `${baseClass} bg-warning-100 text-warning-800`;
      case FindingSeverity.Low: return `${baseClass} bg-blue-100 text-blue-800`;
      default: return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }
}
