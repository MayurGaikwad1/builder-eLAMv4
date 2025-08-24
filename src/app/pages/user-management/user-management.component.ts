import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserManagementService } from '../../shared/services/user-management.service';
import { UserAnalytics, IntegrationStatus, ConnectionStatus } from '../../shared/interfaces/user-management.interface';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">User Lifecycle Management</h1>
          <p class="text-secondary-600">Comprehensive user provisioning, deprovisioning, and lifecycle management</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
            </svg>
            Import Users
          </button>
          <button class="btn-primary" routerLink="/users/provisioning">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New User
          </button>
        </div>
      </div>

      <!-- Analytics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Total Users</p>
              <p class="text-2xl font-bold text-secondary-900">{{ analytics().totalUsers | number }}</p>
              <p class="text-xs text-success-600 flex items-center mt-1">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                +12 this month
              </p>
            </div>
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Active Users</p>
              <p class="text-2xl font-bold text-secondary-900">{{ analytics().activeUsers | number }}</p>
              <p class="text-xs text-success-600 flex items-center mt-1">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                {{ getActiveUserPercentage() }}%
              </p>
            </div>
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Pending Workflows</p>
              <p class="text-2xl font-bold text-secondary-900">{{ getPendingWorkflows() }}</p>
              <p class="text-xs text-warning-600 flex items-center mt-1">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                Requires attention
              </p>
            </div>
            <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Compliance Score</p>
              <p class="text-2xl font-bold text-secondary-900">{{ getComplianceScore() }}%</p>
              <p class="text-xs text-success-600 flex items-center mt-1">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                +3% this month
              </p>
            </div>
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-secondary-900">Risk Distribution</h2>
            <button class="text-sm text-primary-600 hover:text-primary-700">View Details</button>
          </div>
          
          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Critical Risk</span>
                <span class="text-sm font-medium text-danger-600">{{ analytics().riskDistribution.critical }} users</span>
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div class="bg-danger-600 h-2 rounded-full" [style.width.%]="(analytics().riskDistribution.critical / analytics().totalUsers) * 100"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">High Risk</span>
                <span class="text-sm font-medium text-warning-600">{{ analytics().riskDistribution.high }} users</span>
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div class="bg-warning-600 h-2 rounded-full" [style.width.%]="(analytics().riskDistribution.high / analytics().totalUsers) * 100"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Medium Risk</span>
                <span class="text-sm font-medium text-primary-600">{{ analytics().riskDistribution.medium }} users</span>
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div class="bg-primary-600 h-2 rounded-full" [style.width.%]="(analytics().riskDistribution.medium / analytics().totalUsers) * 100"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Low Risk</span>
                <span class="text-sm font-medium text-success-600">{{ analytics().riskDistribution.low }} users</span>
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div class="bg-success-600 h-2 rounded-full" [style.width.%]="(analytics().riskDistribution.low / analytics().totalUsers) * 100"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Integration Status -->
        <div class="card">
          <h2 class="text-lg font-semibold text-secondary-900 mb-6">System Integrations</h2>
          
          <div class="space-y-4">
            <div *ngFor="let integration of integrations()" class="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
              <div class="flex items-center space-x-3">
                <div [class]="getIntegrationStatusClass(integration.status)" class="w-3 h-3 rounded-full"></div>
                <div>
                  <p class="font-medium text-secondary-900 text-sm">{{ integration.systemName }}</p>
                  <p class="text-xs text-secondary-500">Last sync: {{ integration.lastSync | date:'short' }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium" [class]="getHealthScoreClass(integration.healthScore)">
                  {{ integration.healthScore }}%
                </p>
                <p class="text-xs text-secondary-500">{{ integration.latency }}ms</p>
              </div>
            </div>
          </div>
          
          <button class="w-full mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
            Manage Integrations
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h2 class="text-lg font-semibold text-secondary-900 mb-6">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button routerLink="/users/all" class="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left group">
            <svg class="w-8 h-8 text-primary-600 mr-4 group-hover:text-primary-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
            <div>
              <p class="font-medium text-secondary-900 group-hover:text-secondary-800">View All Users</p>
              <p class="text-sm text-secondary-600">Browse and manage user accounts</p>
            </div>
          </button>
          
          <button routerLink="/users/provisioning" class="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left group">
            <svg class="w-8 h-8 text-success-600 mr-4 group-hover:text-success-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
            </svg>
            <div>
              <p class="font-medium text-secondary-900 group-hover:text-secondary-800">User Provisioning</p>
              <p class="text-sm text-secondary-600">Create new user accounts</p>
            </div>
          </button>
          
          <button routerLink="/users/deprovisioning" class="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left group">
            <svg class="w-8 h-8 text-warning-600 mr-4 group-hover:text-warning-700" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <p class="font-medium text-secondary-900 group-hover:text-secondary-800">User Deprovisioning</p>
              <p class="text-sm text-secondary-600">Deactivate user accounts</p>
            </div>
          </button>
          
          <button class="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left group">
            <svg class="w-8 h-8 text-primary-600 mr-4 group-hover:text-primary-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 00-1 1v6a1 1 0 001 1v1a2 2 0 01-2-2V5zM15 5a2 2 0 00-2-2v1a1 1 0 011 1v6a1 1 0 01-1 1v1a2 2 0 002-2V5z" clip-rule="evenodd"></path>
              <path d="M8 8a1 1 0 000 2h4a1 1 0 100-2H8z"></path>
            </svg>
            <div>
              <p class="font-medium text-secondary-900 group-hover:text-secondary-800">Compliance Report</p>
              <p class="text-sm text-secondary-600">Generate compliance reports</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  analytics = signal<UserAnalytics>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    pendingProvisioning: 0,
    pendingDeprovisioning: 0,
    riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
    complianceMetrics: {
      compliantUsers: 0,
      nonCompliantUsers: 0,
      pendingReviews: 0,
      expiredCertifications: 0,
      violationsCount: 0
    },
    activityMetrics: {
      dailyLogins: 0,
      weeklyLogins: 0,
      monthlyLogins: 0,
      avgSessionDuration: 0,
      suspiciousActivities: 0
    },
    trends: []
  });
  integrations = signal<IntegrationStatus[]>([]);

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit() {
    this.loadAnalytics();
    this.loadIntegrations();
  }

  private loadAnalytics() {
    this.userManagementService.getUserAnalytics().subscribe(analytics => {
      this.analytics.set(analytics);
    });
  }

  private loadIntegrations() {
    this.userManagementService.getIntegrationStatus().subscribe(integrations => {
      this.integrations.set(integrations);
    });
  }

  getActiveUserPercentage(): number {
    const analytics = this.analytics();
    if (!analytics || analytics.totalUsers === 0) return 0;
    return Math.round((analytics.activeUsers / analytics.totalUsers) * 100);
  }

  getPendingWorkflows(): number {
    const analytics = this.analytics();
    if (!analytics) return 0;
    return analytics.pendingProvisioning + analytics.pendingDeprovisioning;
  }

  getComplianceScore(): number {
    const analytics = this.analytics();
    if (!analytics || !analytics.complianceMetrics) return 0;
    const total = analytics.complianceMetrics.compliantUsers + analytics.complianceMetrics.nonCompliantUsers;
    return total > 0 ? Math.round((analytics.complianceMetrics.compliantUsers / total) * 100) : 0;
  }

  getIntegrationStatusClass(status: ConnectionStatus): string {
    const classes = {
      [ConnectionStatus.Connected]: 'bg-success-500',
      [ConnectionStatus.Disconnected]: 'bg-secondary-400',
      [ConnectionStatus.Error]: 'bg-danger-500',
      [ConnectionStatus.Maintenance]: 'bg-warning-500'
    };
    return classes[status];
  }

  getHealthScoreClass(score: number): string {
    if (score >= 90) return 'text-success-600';
    if (score >= 70) return 'text-warning-600';
    return 'text-danger-600';
  }

  getRiskPercentage(riskLevel: 'low' | 'medium' | 'high' | 'critical'): number {
    const analytics = this.analytics();
    if (!analytics || !analytics.riskDistribution || analytics.totalUsers === 0) return 0;
    return (analytics.riskDistribution[riskLevel] / analytics.totalUsers) * 100;
  }
}
