import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuditComplianceService } from '../../shared/services/audit-compliance.service';
import {
  ComplianceMetrics,
  AuditLog,
  PolicyViolation,
  ComplianceReport,
  AccessReview,
  ComplianceFinding,
  AuditSeverity,
  ViolationStatus,
  ViolationSeverity,
  ReviewStatus,
  FindingStatus,
  FindingSeverity,
  TrendDirection
} from '../../shared/interfaces/audit-compliance.interface';

@Component({
  selector: 'app-audit-compliance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">Audit & Compliance</h1>
          <p class="text-secondary-600 mt-1">Monitor compliance status, audit activities, and risk indicators</p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export Report
          </button>
          <button class="btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Generate Report
          </button>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Overall Compliance Score -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Overall Compliance</p>
              <p class="text-2xl font-semibold mt-2" [class]="getScoreColorClass(metrics().overallScore)">
                {{ metrics().overallScore }}%
              </p>
            </div>
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-success-600">↗ 2.3%</span>
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
              <span class="text-secondary-600">{{ getControlsPassRate() }}% pass rate</span>
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

        <!-- Remediation Progress -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Remediation Progress</p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">
                {{ getRemediationPercentage() }}%
              </p>
            </div>
            <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600">{{ metrics().remediationProgress?.overdue || 0 }} overdue</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Framework Scores and Risk Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Framework Compliance Scores -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Framework Compliance</h3>
            <p class="card-subtitle">Compliance scores by framework</p>
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
                  <p class="text-sm text-secondary-500">{{ framework.lastAssessment | date:'MMM d, y' }}</p>
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
              </div>
            </div>
          </div>
        </div>

        <!-- Risk Distribution -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Risk Distribution</h3>
            <p class="card-subtitle">Current risk level breakdown</p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-success-500 rounded-full"></div>
                <span class="text-secondary-700">Low Risk</span>
              </div>
              <span class="font-medium text-secondary-900">{{ metrics().riskDistribution?.low || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span class="text-secondary-700">Medium Risk</span>
              </div>
              <span class="font-medium text-secondary-900">{{ metrics().riskDistribution?.medium || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-danger-500 rounded-full"></div>
                <span class="text-secondary-700">High Risk</span>
              </div>
              <span class="font-medium text-secondary-900">{{ metrics().riskDistribution?.high || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span class="text-secondary-700">Critical Risk</span>
              </div>
              <span class="font-medium text-secondary-900">{{ metrics().riskDistribution?.critical || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities and Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Audit Logs -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Audit Events</h3>
            <a routerLink="/audit/logs" class="text-sm text-primary-600 hover:text-primary-700">View all</a>
          </div>
          <div class="space-y-3">
            <div *ngFor="let log of recentLogs().slice(0, 5)" class="flex items-start space-x-3">
              <div [class]="getSeverityIconClass(log.severity)">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-secondary-900 truncate">{{ log.action }}</p>
                <p class="text-xs text-secondary-500">{{ log.userName }} • {{ log.timestamp | date:'short' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Reviews -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Active Reviews</h3>
            <a routerLink="/audit/reviews" class="text-sm text-primary-600 hover:text-primary-700">View all</a>
          </div>
          <div class="space-y-3">
            <div *ngFor="let review of activeReviews().slice(0, 3)" class="border border-secondary-200 rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-secondary-900">{{ review.name }}</p>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                  {{ review.status }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs text-secondary-500">
                <span>{{ review.completedItems }}/{{ review.totalItems }} completed</span>
                <span>Due {{ review.endDate | date:'MMM d' }}</span>
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-1.5 mt-2">
                <div class="bg-primary-600 h-1.5 rounded-full" [style.width.%]="getReviewProgress(review)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Quick Actions</h3>
          </div>
          <div class="space-y-3">
            <button class="w-full flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors" routerLink="/audit/logs">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <span class="text-sm font-medium text-secondary-900">View Audit Logs</span>
              </div>
              <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <button class="w-full flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors" routerLink="/audit/compliance">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <span class="text-sm font-medium text-secondary-900">Compliance Reports</span>
              </div>
              <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <button class="w-full flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors" routerLink="/audit/reviews">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                </div>
                <span class="text-sm font-medium text-secondary-900">Access Reviews</span>
              </div>
              <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Policy Violations and Findings -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Violations -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Policy Violations</h3>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
              {{ openViolations().length }} open
            </span>
          </div>
          <div class="space-y-3">
            <div *ngFor="let violation of openViolations().slice(0, 4)" class="border border-secondary-200 rounded-lg p-3">
              <div class="flex items-start justify-between mb-2">
                <p class="text-sm font-medium text-secondary-900">{{ violation.description }}</p>
                <span [class]="getViolationSeverityClass(violation.severity)">
                  {{ violation.severity }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs text-secondary-500">
                <span>{{ violation.involvedUsers[0]?.userName }}</span>
                <span>{{ violation.detectedAt | date:'MMM d, h:mm a' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Open Findings -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Open Findings</h3>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
              {{ openFindings().length }} pending
            </span>
          </div>
          <div class="space-y-3">
            <div *ngFor="let finding of openFindings().slice(0, 4)" class="border border-secondary-200 rounded-lg p-3">
              <div class="flex items-start justify-between mb-2">
                <p class="text-sm font-medium text-secondary-900">{{ finding.title }}</p>
                <span [class]="getFindingSeverityClass(finding.severity)">
                  {{ finding.severity }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs text-secondary-500">
                <span>{{ finding.assignedTo }}</span>
                <span>Due {{ finding.dueDate | date:'MMM d' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuditComplianceComponent implements OnInit {
  metrics = signal<ComplianceMetrics>({} as ComplianceMetrics);
  recentLogs = signal<AuditLog[]>([]);
  activeReviews = signal<AccessReview[]>([]);
  openViolations = signal<PolicyViolation[]>([]);
  openFindings = signal<ComplianceFinding[]>([]);

  constructor(private auditService: AuditComplianceService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load compliance metrics
    this.auditService.getComplianceMetrics().subscribe(metrics => {
      this.metrics.set(metrics);
    });

    // Load recent audit logs
    this.auditService.getRecentAuditLogs(10).subscribe(logs => {
      this.recentLogs.set(logs);
    });

    // Load active reviews
    this.auditService.getActiveAccessReviews().subscribe(reviews => {
      this.activeReviews.set(reviews);
    });

    // Load open violations
    this.auditService.getOpenViolations().subscribe(violations => {
      this.openViolations.set(violations);
    });

    // Load open findings
    this.auditService.getOpenFindings().subscribe(findings => {
      this.openFindings.set(findings);
    });
  }

  getControlsPassRate(): number {
    const metrics = this.metrics();
    if (metrics.controlsTotal === 0) return 0;
    return Math.round((metrics.controlsPassed / metrics.controlsTotal) * 100);
  }

  getRemediationPercentage(): number {
    const progress = this.metrics().remediationProgress;
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  }

  getScoreColorClass(score: number): string {
    if (score >= 90) return 'text-success-600';
    if (score >= 75) return 'text-warning-600';
    return 'text-danger-600';
  }

  getFrameworkIconClass(framework: string): string {
    const baseClass = 'w-8 h-8 rounded-lg flex items-center justify-center';
    switch (framework.toLowerCase()) {
      case 'sox': return `${baseClass} bg-blue-100 text-blue-600`;
      case 'pci-dss': return `${baseClass} bg-purple-100 text-purple-600`;
      case 'iso 27001': return `${baseClass} bg-green-100 text-green-600`;
      case 'gdpr': return `${baseClass} bg-orange-100 text-orange-600`;
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

  getSeverityIconClass(severity: AuditSeverity): string {
    const baseClass = 'w-6 h-6 rounded-full flex items-center justify-center';
    switch (severity) {
      case AuditSeverity.Critical: return `${baseClass} bg-purple-100 text-purple-600`;
      case AuditSeverity.High: return `${baseClass} bg-danger-100 text-danger-600`;
      case AuditSeverity.Medium: return `${baseClass} bg-warning-100 text-warning-600`;
      case AuditSeverity.Low: return `${baseClass} bg-blue-100 text-blue-600`;
      case AuditSeverity.Informational: return `${baseClass} bg-secondary-100 text-secondary-600`;
      default: return `${baseClass} bg-secondary-100 text-secondary-600`;
    }
  }

  getReviewProgress(review: AccessReview): number {
    if (review.totalItems === 0) return 0;
    return Math.round((review.completedItems / review.totalItems) * 100);
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
