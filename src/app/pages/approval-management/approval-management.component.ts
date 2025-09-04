import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ApprovalManagementService } from "../../shared/services/approval-management.service";
import { AuthService } from "../../shared/services/auth.service";
import { Router } from "@angular/router";
import { ApprovalStatistics } from "../../shared/interfaces/approval-management.interface";

@Component({
  selector: "app-approval-management",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">
            Renewal Requests Approval
          </h1>
          <p class="text-secondary-600">
            Review and approve access requests with enterprise-grade workflows
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary" routerLink="/admin/workflows">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            Workflows
          </button>
          <button class="btn-primary" routerLink="/approvals/queue">
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
            Renewal Requests Queue
          </button>
        </div>
      </div>

      <!-- Statistics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          class="metric-card"
          [class.cursor-pointer]="isManager()"
          (click)="onPendingApprovalsClick()"
          role="button"
          aria-label="Open Pending Approvals"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Pending Approvals
              </p>
              <p class="text-2xl font-bold text-secondary-900">
                {{ statistics().totalPending || 0 }}
              </p>
              <p class="text-xs text-warning-600 flex items-center mt-1">
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ statistics().highPriority || 0 }} high priority
              </p>
            </div>
            <div
              class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-warning-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">My Queue</p>
              <p class="text-2xl font-bold text-secondary-900">
                {{ statistics().myPending || 0 }}
              </p>
              <p class="text-xs text-primary-600 flex items-center mt-1">
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ statistics().delegatedToMe || 0 }} delegated
              </p>
            </div>
            <div
              class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-primary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                SLA Compliance
              </p>
              <p class="text-2xl font-bold text-secondary-900">
                {{ getPerformanceMetric("slaCompliance") }}%
              </p>
              <p class="text-xs text-success-600 flex items-center mt-1">
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ statistics().slaBreaches || 0 }} breaches
              </p>
            </div>
            <div
              class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-success-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">
                Avg Decision Time
              </p>
              <p class="text-2xl font-bold text-secondary-900">
                {{ getPerformanceMetric("avgDecisionTime") }}h
              </p>
              <p class="text-xs text-success-600 flex items-center mt-1">
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                Target: 2h
              </p>
            </div>
            <div
              class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-primary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Queue Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-secondary-900">
              Renewal Requests Queue Distribution
            </h2>
            <button
              class="text-sm text-primary-600 hover:text-primary-700"
              routerLink="/approvals/analytics"
            >
              View Analytics
            </button>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600"
                  >Level 1 Approvals</span
                >
                <span class="text-sm font-medium text-primary-600"
                  >{{ getQueueDistribution("level1") }} requests</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="bg-primary-600 h-2 rounded-full"
                  [style.width.%]="getQueuePercentage('level1')"
                ></div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600"
                  >Level 2 Approvals</span
                >
                <span class="text-sm font-medium text-success-600"
                  >{{ getQueueDistribution("level2") }} requests</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="bg-success-600 h-2 rounded-full"
                  [style.width.%]="getQueuePercentage('level2')"
                ></div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600"
                  >Level 3 Approvals</span
                >
                <span class="text-sm font-medium text-warning-600"
                  >{{ getQueueDistribution("level3") }} requests</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="bg-warning-600 h-2 rounded-full"
                  [style.width.%]="getQueuePercentage('level3')"
                ></div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600"
                  >Emergency Approvals</span
                >
                <span class="text-sm font-medium text-danger-600"
                  >{{ getQueueDistribution("emergency") }} requests</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="bg-danger-600 h-2 rounded-full"
                  [style.width.%]="getQueuePercentage('emergency')"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h2 class="text-lg font-semibold text-secondary-900 mb-6">
            Quick Actions
          </h2>

          <div class="space-y-3">
            <button
              routerLink="/approvals/queue"
              class="w-full flex items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left group"
            >
              <svg
                class="w-8 h-8 text-primary-600 mr-4 group-hover:text-primary-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <div>
                <p
                  class="font-medium text-secondary-900 group-hover:text-secondary-800"
                >
                  Review Queue
                </p>
                <p class="text-sm text-secondary-600">
                  Process pending approvals
                </p>
              </div>
            </button>

            <button
              routerLink="/approvals/bulk"
              class="w-full flex items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left group"
            >
              <svg
                class="w-8 h-8 text-success-600 mr-4 group-hover:text-success-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p
                  class="font-medium text-secondary-900 group-hover:text-secondary-800"
                >
                  Bulk Actions
                </p>
                <p class="text-sm text-secondary-600">
                  Process multiple requests
                </p>
              </div>
            </button>

            <button
              routerLink="/approvals/delegations"
              class="w-full flex items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left group"
            >
              <svg
                class="w-8 h-8 text-warning-600 mr-4 group-hover:text-warning-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                ></path>
                <path
                  d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                ></path>
              </svg>
              <div>
                <p
                  class="font-medium text-secondary-900 group-hover:text-secondary-800"
                >
                  Delegations
                </p>
                <p class="text-sm text-secondary-600">
                  Manage approval delegations
                </p>
              </div>
            </button>

            <button
              routerLink="/approvals/escalations"
              class="w-full flex items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left group"
            >
              <svg
                class="w-8 h-8 text-danger-600 mr-4 group-hover:text-danger-700"
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
                <p
                  class="font-medium text-secondary-900 group-hover:text-secondary-800"
                >
                  Escalations
                </p>
                <p class="text-sm text-secondary-600">
                  {{ statistics().escalatedToMe || 0 }} escalated to me
                </p>
              </div>
            </button>
          </div>

          <div
            class="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 text-primary-600 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-primary-800">
                  Mobile Access
                </p>
                <p class="text-xs text-primary-700">
                  Approve requests on-the-go with our mobile app
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="card">
        <h2 class="text-lg font-semibold text-secondary-900 mb-6">
          Performance Metrics
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div class="text-center">
            <p class="text-2xl font-bold text-primary-600">
              {{ getPerformanceMetric("throughput") }}
            </p>
            <p class="text-sm text-secondary-600">Daily Throughput</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-success-600">
              {{ statistics().approvalRate || 0 }}%
            </p>
            <p class="text-sm text-secondary-600">Approval Rate</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-warning-600">
              {{ getPerformanceMetric("escalationRate") }}%
            </p>
            <p class="text-sm text-secondary-600">Escalation Rate</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-primary-600">
              {{ getPerformanceMetric("delegationRate") }}%
            </p>
            <p class="text-sm text-secondary-600">Delegation Rate</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-success-600">
              {{ statistics().completedToday || 0 }}
            </p>
            <p class="text-sm text-secondary-600">Completed Today</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ApprovalManagementComponent implements OnInit {
  statistics = signal<ApprovalStatistics>({
    totalPending: 0,
    highPriority: 0,
    slaBreaches: 0,
    avgProcessingTime: 0,
    approvalRate: 0,
    myPending: 0,
    delegatedToMe: 0,
    escalatedToMe: 0,
    completedToday: 0,
    queueDistribution: { level1: 0, level2: 0, level3: 0, emergency: 0 },
    performanceMetrics: {
      avgDecisionTime: 0,
      slaCompliance: 0,
      escalationRate: 0,
      delegationRate: 0,
      throughput: 0,
    },
  });

  constructor(
    private approvalService: ApprovalManagementService,
    private authService: AuthService,
    private router: Router,
  ) {}

  isManager(): boolean {
    return this.authService.hasAnyRole(["manager"]);
  }

  onPendingApprovalsClick() {
    if (this.isManager()) {
      this.router.navigate(["/approvals/queue"]);
    }
  }

  ngOnInit() {
    this.loadStatistics();
  }

  private loadStatistics() {
    this.approvalService.getApprovalStatistics().subscribe((stats) => {
      this.statistics.set(stats);
    });
  }

  getPerformanceMetric(metric: string): number {
    const metrics = this.statistics().performanceMetrics;
    return metrics ? (metrics as any)[metric] || 0 : 0;
  }

  getQueueDistribution(level: string): number {
    const distribution = this.statistics().queueDistribution;
    return distribution ? (distribution as any)[level] || 0 : 0;
  }

  getQueuePercentage(level: string): number {
    const stats = this.statistics();
    if (!stats.queueDistribution || stats.totalPending === 0) return 0;
    return ((stats.queueDistribution as any)[level] / stats.totalPending) * 100;
  }
}
