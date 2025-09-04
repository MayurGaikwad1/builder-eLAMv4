import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SystemAdminService } from "../../shared/services/system-admin.service";
import {
  AdminAnalytics,
  SystemHealth,
  SystemStatus,
  SystemRole,
  SystemIntegration,
  IntegrationStatus,
  WorkflowDefinition,
  Policy,
} from "../../shared/interfaces/system-admin.interface";

@Component({
  selector: "app-system-admin",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">
            System Administration
          </h1>
          <p class="text-secondary-600 mt-1">
            Monitor system health, manage configurations, and oversee platform
            operations
          </p>
        </div>
        <div class="flex space-x-3">
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
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
            System Logs
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            Settings
          </button>
          <button class="btn-primary">
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
            Refresh Data
          </button>
        </div>
      </div>

      <!-- System Health Overview -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">System Health Overview</h3>
          <span
            [class]="
              getSystemStatusBadgeClass(analytics().systemHealth?.overallStatus)
            "
          >
            {{ getSystemStatusLabel(analytics().systemHealth?.overallStatus) }}
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Uptime -->
          <div class="text-center">
            <div class="text-3xl font-bold text-success-600">
              {{ analytics().systemHealth?.uptime || 0 }}%
            </div>
            <div class="text-sm text-secondary-600 mt-1">System Uptime</div>
          </div>
          <!-- Response Time -->
          <div class="text-center">
            <div class="text-3xl font-bold text-secondary-900">
              {{
                analytics().systemHealth?.performance?.averageResponseTime || 0
              }}ms
            </div>
            <div class="text-sm text-secondary-600 mt-1">Avg Response Time</div>
          </div>
          <!-- Throughput -->
          <div class="text-center">
            <div class="text-3xl font-bold text-primary-600">
              {{ analytics().systemHealth?.performance?.throughput || 0 }}
            </div>
            <div class="text-sm text-secondary-600 mt-1">Requests/min</div>
          </div>
          <!-- Error Rate -->
          <div class="text-center">
            <div
              class="text-3xl font-bold"
              [class]="
                getErrorRateClass(
                  analytics().systemHealth?.performance?.errorRate
                )
              "
            >
              {{ analytics().systemHealth?.performance?.errorRate || 0 }}%
            </div>
            <div class="text-sm text-secondary-600 mt-1">Error Rate</div>
          </div>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Users -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Total Users</p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">
                {{ analytics().userMetrics?.totalUsers || 0 }}
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-success-600"
                >{{ analytics().userMetrics?.activeUsers || 0 }} active</span
              >
              <span class="text-secondary-500 ml-2"
                >{{ analytics().userMetrics?.newUsers || 0 }} new this
                month</span
              >
            </div>
          </div>
        </div>

        <!-- Active Integrations -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Integrations</p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">
                {{ analytics().integrationMetrics?.activeIntegrations || 0 }}/{{
                  analytics().integrationMetrics?.totalIntegrations || 0
                }}
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
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-success-600"
                >{{
                  analytics().integrationMetrics?.healthyIntegrations || 0
                }}
                healthy</span
              >
              <span class="text-danger-600 ml-2"
                >{{
                  analytics().integrationMetrics?.failedIntegrations || 0
                }}
                failed</span
              >
            </div>
          </div>
        </div>

        <!-- Active Workflows -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Workflows</p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">
                {{ analytics().workflowMetrics?.activeWorkflows || 0 }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600"
                >{{ analytics().workflowMetrics?.slaCompliance || 0 }}% SLA
                compliance</span
              >
            </div>
          </div>
        </div>

      </div>

      <!-- Resource Usage and Service Status -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Resource Usage -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Resource Usage</h3>
            <p class="card-subtitle">Current system resource utilization</p>
          </div>
          <div class="space-y-4">
            <!-- CPU Usage -->
            <div>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-secondary-700">CPU Usage</span>
                <span class="font-medium text-secondary-900"
                  >{{
                    analytics().systemHealth?.resources?.cpuUsage || 0
                  }}%</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  [class]="
                    getResourceUsageClass(
                      analytics().systemHealth?.resources?.cpuUsage || 0
                    )
                  "
                  [style.width.%]="
                    analytics().systemHealth?.resources?.cpuUsage || 0
                  "
                ></div>
              </div>
            </div>

            <!-- Memory Usage -->
            <div>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-secondary-700">Memory Usage</span>
                <span class="font-medium text-secondary-900"
                  >{{
                    analytics().systemHealth?.resources?.memoryUsage || 0
                  }}%</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  [class]="
                    getResourceUsageClass(
                      analytics().systemHealth?.resources?.memoryUsage || 0
                    )
                  "
                  [style.width.%]="
                    analytics().systemHealth?.resources?.memoryUsage || 0
                  "
                ></div>
              </div>
            </div>

            <!-- Disk Usage -->
            <div>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-secondary-700">Disk Usage</span>
                <span class="font-medium text-secondary-900"
                  >{{
                    analytics().systemHealth?.resources?.diskUsage || 0
                  }}%</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  [class]="
                    getResourceUsageClass(
                      analytics().systemHealth?.resources?.diskUsage || 0
                    )
                  "
                  [style.width.%]="
                    analytics().systemHealth?.resources?.diskUsage || 0
                  "
                ></div>
              </div>
            </div>

            <!-- Network Usage -->
            <div>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-secondary-700">Network Usage</span>
                <span class="font-medium text-secondary-900"
                  >{{
                    analytics().systemHealth?.resources?.networkUsage || 0
                  }}%</span
                >
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  [class]="
                    getResourceUsageClass(
                      analytics().systemHealth?.resources?.networkUsage || 0
                    )
                  "
                  [style.width.%]="
                    analytics().systemHealth?.resources?.networkUsage || 0
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Status -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Service Status</h3>
            <p class="card-subtitle">Current status of system services</p>
          </div>
          <div class="space-y-3">
            <div
              *ngFor="let service of analytics().systemHealth?.services"
              class="flex items-center justify-between p-3 border border-secondary-200 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div [class]="getServiceStatusIconClass(service.status)">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-secondary-900">
                    {{ service.name }}
                  </p>
                  <p class="text-sm text-secondary-500">
                    v{{ service.version }} • {{ service.uptime }}% uptime
                  </p>
                </div>
              </div>
              <div class="text-right">
                <span [class]="getServiceStatusBadgeClass(service.status)">
                  {{ getServiceStatusLabel(service.status) }}
                </span>
                <p class="text-xs text-secondary-500 mt-1">
                  {{ service.lastCheck | date: "h:mm a" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions and Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Quick Actions</h3>
            <p class="card-subtitle">Common administrative tasks</p>
          </div>
          <div class="space-y-3">
            <button
              class="w-full flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              routerLink="/admin/roles"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <span class="text-sm font-medium text-secondary-900"
                  >Manage Roles & Policies</span
                >
              </div>
              <svg
                class="w-4 h-4 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>

            <button
              class="w-full flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              routerLink="/admin/integrations"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <span class="text-sm font-medium text-secondary-900"
                  >System Integrations</span
                >
              </div>
              <svg
                class="w-4 h-4 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>

            <button
              class="w-full flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              routerLink="/admin/config"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-green-600"
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
                </div>
                <span class="text-sm font-medium text-secondary-900"
                  >System Configuration</span
                >
              </div>
              <svg
                class="w-4 h-4 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>

            <button
              class="w-full flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              routerLink="/admin/workflows"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>
                <span class="text-sm font-medium text-secondary-900"
                  >Workflow Management</span
                >
              </div>
              <svg
                class="w-4 h-4 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Recent Integrations -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Integration Status</h3>
            <a
              routerLink="/admin/integrations"
              class="text-sm text-primary-600 hover:text-primary-700"
              >View all</a
            >
          </div>
          <div class="space-y-3">
            <div
              *ngFor="let integration of recentIntegrations().slice(0, 4)"
              class="flex items-center space-x-3"
            >
              <div [class]="getIntegrationStatusIconClass(integration.status)">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-secondary-900 truncate">
                  {{ integration.displayName }}
                </p>
                <p class="text-xs text-secondary-500">
                  {{ integration.vendor }} •
                  {{ integration.lastSync | date: "MMM d, h:mm a" }}
                </p>
              </div>
              <span
                [class]="getIntegrationStatusBadgeClass(integration.status)"
              >
                {{ getIntegrationStatusLabel(integration.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- System Summary -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">System Summary</h3>
            <p class="card-subtitle">Key system information</p>
          </div>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Total Roles</span>
                <span class="text-sm font-medium text-secondary-900">{{
                  totalRoles()
                }}</span>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Active Policies</span>
                <span class="text-sm font-medium text-secondary-900">{{
                  activePolicies()
                }}</span>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600"
                  >Failed Logins (24h)</span
                >
                <span class="text-sm font-medium text-danger-600">{{
                  analytics().userMetrics?.loginMetrics?.failedLogins || 0
                }}</span>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Security Events</span>
                <span class="text-sm font-medium text-warning-600">{{
                  analytics().securityMetrics?.securityEvents || 0
                }}</span>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">Compliance Score</span>
                <span class="text-sm font-medium text-primary-600"
                  >{{ analytics().complianceMetrics?.overallScore || 0 }}%</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SystemAdminComponent implements OnInit {
  analytics = signal<AdminAnalytics>({} as AdminAnalytics);
  recentIntegrations = signal<SystemIntegration[]>([]);
  totalRoles = signal<number>(0);
  activePolicies = signal<number>(0);

  constructor(private adminService: SystemAdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load analytics data
    this.adminService.getAnalytics().subscribe((analytics) => {
      this.analytics.set(analytics);
    });

    // Load integrations
    this.adminService.getIntegrations().subscribe((integrations) => {
      this.recentIntegrations.set(integrations);
    });

    // Load roles count
    this.adminService.getRoles().subscribe((roles) => {
      this.totalRoles.set(roles.length);
    });

    // Load policies count
    this.adminService.getPolicies().subscribe((policies) => {
      this.activePolicies.set(policies.filter((p) => p.isActive).length);
    });
  }

  // System Status helpers
  getSystemStatusBadgeClass(status?: SystemStatus): string {
    const baseClass =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case SystemStatus.Healthy:
        return `${baseClass} bg-success-100 text-success-800`;
      case SystemStatus.Warning:
        return `${baseClass} bg-warning-100 text-warning-800`;
      case SystemStatus.Critical:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case SystemStatus.Down:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case SystemStatus.Maintenance:
        return `${baseClass} bg-blue-100 text-blue-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getSystemStatusLabel(status?: SystemStatus): string {
    switch (status) {
      case SystemStatus.Healthy:
        return "Healthy";
      case SystemStatus.Warning:
        return "Warning";
      case SystemStatus.Critical:
        return "Critical";
      case SystemStatus.Down:
        return "Down";
      case SystemStatus.Maintenance:
        return "Maintenance";
      default:
        return "Unknown";
    }
  }

  getServiceStatusIconClass(status: SystemStatus): string {
    const baseClass = "w-6 h-6 rounded-full flex items-center justify-center";
    switch (status) {
      case SystemStatus.Healthy:
        return `${baseClass} bg-success-100 text-success-600`;
      case SystemStatus.Warning:
        return `${baseClass} bg-warning-100 text-warning-600`;
      case SystemStatus.Critical:
        return `${baseClass} bg-danger-100 text-danger-600`;
      case SystemStatus.Down:
        return `${baseClass} bg-danger-100 text-danger-600`;
      case SystemStatus.Maintenance:
        return `${baseClass} bg-blue-100 text-blue-600`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-600`;
    }
  }

  getServiceStatusBadgeClass(status: SystemStatus): string {
    const baseClass =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case SystemStatus.Healthy:
        return `${baseClass} bg-success-100 text-success-800`;
      case SystemStatus.Warning:
        return `${baseClass} bg-warning-100 text-warning-800`;
      case SystemStatus.Critical:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case SystemStatus.Down:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case SystemStatus.Maintenance:
        return `${baseClass} bg-blue-100 text-blue-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getServiceStatusLabel(status: SystemStatus): string {
    return this.getSystemStatusLabel(status);
  }

  // Integration Status helpers
  getIntegrationStatusIconClass(status: IntegrationStatus): string {
    const baseClass = "w-6 h-6 rounded-full flex items-center justify-center";
    switch (status) {
      case IntegrationStatus.Active:
        return `${baseClass} bg-success-100 text-success-600`;
      case IntegrationStatus.Inactive:
        return `${baseClass} bg-secondary-100 text-secondary-600`;
      case IntegrationStatus.Error:
        return `${baseClass} bg-danger-100 text-danger-600`;
      case IntegrationStatus.Pending:
        return `${baseClass} bg-warning-100 text-warning-600`;
      case IntegrationStatus.Configuring:
        return `${baseClass} bg-blue-100 text-blue-600`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-600`;
    }
  }

  getIntegrationStatusBadgeClass(status: IntegrationStatus): string {
    const baseClass =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case IntegrationStatus.Active:
        return `${baseClass} bg-success-100 text-success-800`;
      case IntegrationStatus.Inactive:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
      case IntegrationStatus.Error:
        return `${baseClass} bg-danger-100 text-danger-800`;
      case IntegrationStatus.Pending:
        return `${baseClass} bg-warning-100 text-warning-800`;
      case IntegrationStatus.Configuring:
        return `${baseClass} bg-blue-100 text-blue-800`;
      default:
        return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getIntegrationStatusLabel(status: IntegrationStatus): string {
    switch (status) {
      case IntegrationStatus.Active:
        return "Active";
      case IntegrationStatus.Inactive:
        return "Inactive";
      case IntegrationStatus.Error:
        return "Error";
      case IntegrationStatus.Pending:
        return "Pending";
      case IntegrationStatus.Configuring:
        return "Configuring";
      default:
        return "Unknown";
    }
  }

  // Resource Usage helpers
  getResourceUsageClass(usage: number): string {
    if (usage >= 90) return "bg-danger-500";
    if (usage >= 75) return "bg-warning-500";
    if (usage >= 50) return "bg-blue-500";
    return "bg-success-500";
  }

  // Score helpers
  getErrorRateClass(errorRate?: number): string {
    if (!errorRate) return "text-success-600";
    if (errorRate > 5) return "text-danger-600";
    if (errorRate > 1) return "text-warning-600";
    return "text-success-600";
  }

}
