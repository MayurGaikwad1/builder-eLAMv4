import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SystemAdminService } from '../../shared/services/system-admin.service';
import {
  SystemIntegration,
  IntegrationType,
  IntegrationCategory,
  IntegrationStatus,
  AuthenticationType,
  DataMapping,
  HealthCheck,
  MonitoringConfig
} from '../../shared/interfaces/system-admin.interface';

interface IntegrationFilters {
  searchQuery: string;
  type: string;
  category: string;
  status: string;
}

@Component({
  selector: 'app-system-integrations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">System Integrations</h1>
          <p class="text-secondary-600 mt-1">Manage connections to external systems and data sources</p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary" (click)="showCreateIntegrationModal()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Integration
          </button>
          <button class="btn-secondary" (click)="syncAllIntegrations()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Sync All
          </button>
          <button class="btn-primary" (click)="refreshIntegrations()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Integration Status Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Integrations -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Total Integrations</p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">{{ integrations().length }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-success-600">{{ getActiveIntegrationsCount() }} active</span>
            </div>
          </div>
        </div>

        <!-- Healthy Integrations -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Healthy</p>
              <p class="text-2xl font-semibold text-success-600 mt-2">{{ getHealthyIntegrationsCount() }}</p>
            </div>
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600">{{ getHealthPercentage() }}% uptime</span>
            </div>
          </div>
        </div>

        <!-- Failed Integrations -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Failed</p>
              <p class="text-2xl font-semibold text-danger-600 mt-2">{{ getFailedIntegrationsCount() }}</p>
            </div>
            <div class="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-danger-600">Require attention</span>
            </div>
          </div>
        </div>

        <!-- Last Sync -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Last Sync</p>
              <p class="text-2xl font-semibold text-secondary-900 mt-2">{{ getLastSyncTime() }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-secondary-600">Auto-sync enabled</span>
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
                placeholder="Search integrations by name, vendor, or description..."
                class="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
            </div>
          </div>
          <div class="flex space-x-3">
            <select 
              [(ngModel)]="filters().type"
              (ngModelChange)="onFilterChange()"
              class="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              <option value="identity">Identity</option>
              <option value="directory">Directory</option>
              <option value="database">Database</option>
              <option value="application">Application</option>
              <option value="monitoring">Monitoring</option>
              <option value="security">Security</option>
            </select>
            <select 
              [(ngModel)]="filters().status"
              (ngModelChange)="onFilterChange()"
              class="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
              <option value="pending">Pending</option>
              <option value="configuring">Configuring</option>
            </select>
            <span class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-primary-100 text-primary-800">
              {{ filteredIntegrations().length }} integrations
            </span>
          </div>
        </div>
      </div>

      <!-- Integrations List -->
      <div class="space-y-4">
        <div 
          *ngFor="let integration of filteredIntegrations()" 
          class="card hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4 flex-1">
              <!-- Integration Icon -->
              <div [class]="getIntegrationIconClass(integration.type)">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                </svg>
              </div>

              <!-- Integration Details -->
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h4 class="text-lg font-medium text-secondary-900">{{ integration.displayName }}</h4>
                  <span [class]="getIntegrationStatusBadgeClass(integration.status)">
                    {{ getIntegrationStatusLabel(integration.status) }}
                  </span>
                  <span [class]="getIntegrationTypeBadgeClass(integration.type)">
                    {{ getIntegrationTypeLabel(integration.type) }}
                  </span>
                </div>
                
                <p class="text-sm text-secondary-600 mb-3">{{ integration.description }}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-secondary-500">Vendor:</span>
                    <span class="ml-1 text-secondary-900 font-medium">{{ integration.vendor }}</span>
                  </div>
                  <div>
                    <span class="text-secondary-500">Version:</span>
                    <span class="ml-1 text-secondary-900">{{ integration.version }}</span>
                  </div>
                  <div *ngIf="integration.lastSync">
                    <span class="text-secondary-500">Last Sync:</span>
                    <span class="ml-1 text-secondary-900">{{ integration.lastSync | date:'MMM d, h:mm a' }}</span>
                  </div>
                  <div *ngIf="integration.lastHealthCheck">
                    <span class="text-secondary-500">Health Check:</span>
                    <span class="ml-1" [class]="getHealthCheckClass(integration.lastHealthCheck)">
                      {{ integration.lastHealthCheck | date:'h:mm a' }}
                    </span>
                  </div>
                </div>

                <!-- Data Mappings Summary -->
                <div *ngIf="integration.dataMappings.length > 0" class="mt-3">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-secondary-700">Data Mappings:</span>
                    <span class="text-sm text-secondary-600">{{ integration.dataMappings.length }} field mappings configured</span>
                  </div>
                </div>

                <!-- Connection Details -->
                <div class="mt-3 flex items-center space-x-4 text-sm">
                  <div class="flex items-center space-x-2">
                    <div [class]="getConnectionStatusClass(integration.status)">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <span class="text-secondary-600">{{ getConnectionEndpoint(integration) }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-secondary-500">Auth:</span>
                    <span class="text-secondary-900">{{ getAuthTypeLabel(integration.authentication.type) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-2 ml-4">
              <button 
                (click)="testConnection(integration)"
                [disabled]="testingConnection() === integration.id"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {{ testingConnection() === integration.id ? 'Testing...' : 'Test' }}
              </button>
              <button 
                (click)="syncIntegration(integration)"
                [disabled]="syncingIntegration() === integration.id"
                class="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
              >
                {{ syncingIntegration() === integration.id ? 'Syncing...' : 'Sync' }}
              </button>
              <button 
                (click)="configureIntegration(integration)"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Configure
              </button>
              <button 
                (click)="viewIntegrationDetails(integration)"
                class="text-secondary-600 hover:text-secondary-700 text-sm font-medium"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Integration Details Modal -->
      <div 
        *ngIf="selectedIntegration()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeIntegrationDetails()"
      >
        <div 
          class="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-secondary-900">{{ selectedIntegration()!.displayName }}</h3>
                <p class="text-sm text-secondary-600 mt-1">{{ selectedIntegration()!.description }}</p>
              </div>
              <button 
                (click)="closeIntegrationDetails()"
                class="text-secondary-400 hover:text-secondary-600"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <!-- Tab Navigation -->
            <div class="border-b border-secondary-200 mb-6">
              <nav class="-mb-px flex space-x-8">
                <button 
                  [class]="detailsTab() === 'overview' ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                  (click)="setDetailsTab('overview')"
                >
                  Overview
                </button>
                <button 
                  [class]="detailsTab() === 'configuration' ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                  (click)="setDetailsTab('configuration')"
                >
                  Configuration
                </button>
                <button 
                  [class]="detailsTab() === 'mappings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                  (click)="setDetailsTab('mappings')"
                >
                  Data Mappings
                </button>
                <button 
                  [class]="detailsTab() === 'monitoring' ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                  (click)="setDetailsTab('monitoring')"
                >
                  Monitoring
                </button>
              </nav>
            </div>

            <!-- Overview Tab -->
            <div *ngIf="detailsTab() === 'overview'" class="space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Basic Information -->
                <div class="space-y-4">
                  <h4 class="text-lg font-medium text-secondary-900">Basic Information</h4>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-secondary-700">Integration Type</label>
                      <p class="mt-1 text-sm text-secondary-900">{{ getIntegrationTypeLabel(selectedIntegration()!.type) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-secondary-700">Category</label>
                      <p class="mt-1 text-sm text-secondary-900">{{ getIntegrationCategoryLabel(selectedIntegration()!.category) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-secondary-700">Vendor</label>
                      <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.vendor }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-secondary-700">Version</label>
                      <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.version }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-secondary-700">Status</label>
                      <span class="mt-1" [class]="getIntegrationStatusBadgeClass(selectedIntegration()!.status)">
                        {{ getIntegrationStatusLabel(selectedIntegration()!.status) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Connection Information -->
                <div class="space-y-4">
                  <h4 class="text-lg font-medium text-secondary-900">Connection Information</h4>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-secondary-700">Endpoint</label>
                      <p class="mt-1 text-sm text-secondary-900 font-mono">{{ getConnectionEndpoint(selectedIntegration()!) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-secondary-700">Protocol</label>
                      <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.configuration.protocol }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-secondary-700">Authentication</label>
                      <p class="mt-1 text-sm text-secondary-900">{{ getAuthTypeLabel(selectedIntegration()!.authentication.type) }}</p>
                    </div>
                    <div *ngIf="selectedIntegration()!.lastSync">
                      <label class="block text-sm font-medium text-secondary-700">Last Sync</label>
                      <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.lastSync | date:'MMM d, y h:mm a' }}</p>
                    </div>
                    <div *ngIf="selectedIntegration()!.lastHealthCheck">
                      <label class="block text-sm font-medium text-secondary-700">Last Health Check</label>
                      <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.lastHealthCheck | date:'MMM d, y h:mm a' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuration Tab -->
            <div *ngIf="detailsTab() === 'configuration'" class="space-y-6">
              <h4 class="text-lg font-medium text-secondary-900">Configuration Settings</h4>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary-700">Timeout (ms)</label>
                    <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.configuration.timeout }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-700">Retry Attempts</label>
                    <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.configuration.retryAttempts }}</p>
                  </div>
                  <div *ngIf="selectedIntegration()!.configuration.batchSize">
                    <label class="block text-sm font-medium text-secondary-700">Batch Size</label>
                    <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.configuration.batchSize }}</p>
                  </div>
                </div>
                <div class="space-y-4">
                  <div *ngIf="selectedIntegration()!.configuration.syncInterval">
                    <label class="block text-sm font-medium text-secondary-700">Sync Interval (seconds)</label>
                    <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.configuration.syncInterval }}</p>
                  </div>
                  <div *ngIf="selectedIntegration()!.configuration.port">
                    <label class="block text-sm font-medium text-secondary-700">Port</label>
                    <p class="mt-1 text-sm text-secondary-900">{{ selectedIntegration()!.configuration.port }}</p>
                  </div>
                </div>
              </div>

              <!-- Custom Settings -->
              <div *ngIf="hasCustomSettings(selectedIntegration()!)">
                <h5 class="text-md font-medium text-secondary-900 mb-3">Custom Settings</h5>
                <div class="bg-secondary-50 rounded-lg p-4">
                  <pre class="text-sm text-secondary-900 whitespace-pre-wrap">{{ formatCustomSettings(selectedIntegration()!.configuration.customSettings) }}</pre>
                </div>
              </div>
            </div>

            <!-- Data Mappings Tab -->
            <div *ngIf="detailsTab() === 'mappings'" class="space-y-6">
              <div class="flex items-center justify-between">
                <h4 class="text-lg font-medium text-secondary-900">Data Mappings</h4>
                <span class="text-sm text-secondary-600">{{ selectedIntegration()!.dataMappings.length }} mappings configured</span>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-secondary-200">
                  <thead class="bg-secondary-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Source Field</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Target Field</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Data Type</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Required</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Transformation</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-secondary-200">
                    <tr *ngFor="let mapping of selectedIntegration()!.dataMappings">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-secondary-900">{{ mapping.sourceField }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-secondary-900">{{ mapping.targetField }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{{ mapping.dataType }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span [class]="mapping.isRequired ? 'text-danger-600' : 'text-secondary-500'" class="text-sm">
                          {{ mapping.isRequired ? 'Required' : 'Optional' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {{ mapping.transformation || 'None' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Monitoring Tab -->
            <div *ngIf="detailsTab() === 'monitoring'" class="space-y-6">
              <h4 class="text-lg font-medium text-secondary-900">Monitoring & Health Checks</h4>
              
              <!-- Health Check Configuration -->
              <div class="border border-secondary-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                  <h5 class="text-md font-medium text-secondary-900">Health Check Settings</h5>
                  <span [class]="selectedIntegration()!.healthCheck.enabled ? 'text-success-600' : 'text-secondary-500'" class="text-sm">
                    {{ selectedIntegration()!.healthCheck.enabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-secondary-500">Interval:</span>
                    <span class="ml-1 text-secondary-900">{{ selectedIntegration()!.healthCheck.interval }}s</span>
                  </div>
                  <div>
                    <span class="text-secondary-500">Timeout:</span>
                    <span class="ml-1 text-secondary-900">{{ selectedIntegration()!.healthCheck.timeout }}s</span>
                  </div>
                  <div>
                    <span class="text-secondary-500">Checks:</span>
                    <span class="ml-1 text-secondary-900">{{ selectedIntegration()!.healthCheck.checks.length }}</span>
                  </div>
                </div>
              </div>

              <!-- Monitoring Configuration -->
              <div class="border border-secondary-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                  <h5 class="text-md font-medium text-secondary-900">Monitoring Settings</h5>
                  <span [class]="selectedIntegration()!.monitoring.enabled ? 'text-success-600' : 'text-secondary-500'" class="text-sm">
                    {{ selectedIntegration()!.monitoring.enabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-secondary-500">Metrics:</span>
                    <span class="ml-1 text-secondary-900">{{ selectedIntegration()!.monitoring.metricsCollection ? 'Enabled' : 'Disabled' }}</span>
                  </div>
                  <div>
                    <span class="text-secondary-500">Log Level:</span>
                    <span class="ml-1 text-secondary-900">{{ selectedIntegration()!.monitoring.logLevel }}</span>
                  </div>
                  <div>
                    <span class="text-secondary-500">Alerting:</span>
                    <span class="ml-1 text-secondary-900">{{ selectedIntegration()!.monitoring.alerting.enabled ? 'Enabled' : 'Disabled' }}</span>
                  </div>
                </div>
              </div>

              <!-- Alert Thresholds -->
              <div *ngIf="selectedIntegration()!.monitoring.alerting.thresholds.length > 0">
                <h5 class="text-md font-medium text-secondary-900 mb-3">Alert Thresholds</h5>
                <div class="space-y-2">
                  <div *ngFor="let threshold of selectedIntegration()!.monitoring.alerting.thresholds" 
                       class="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                    <div class="flex items-center space-x-4">
                      <span class="font-medium text-secondary-900">{{ threshold.metric }}</span>
                      <span class="text-secondary-600">{{ threshold.operator }} {{ threshold.value }}</span>
                    </div>
                    <span [class]="getAlertSeverityClass(threshold.severity)">
                      {{ threshold.severity }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3">
            <button 
              (click)="testConnection(selectedIntegration()!)"
              class="btn-secondary"
            >
              Test Connection
            </button>
            <button 
              (click)="configureIntegration(selectedIntegration()!)"
              class="btn-secondary"
            >
              Configure
            </button>
            <button 
              (click)="closeIntegrationDetails()"
              class="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Create Integration Modal -->
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
            <h3 class="text-lg font-medium text-secondary-900">Add New Integration</h3>
          </div>
          
          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2">Integration Name</label>
                <input
                  type="text"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Production Salesforce"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Type</label>
                <select class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                  <option value="application">Application</option>
                  <option value="identity">Identity Provider</option>
                  <option value="directory">Directory Service</option>
                  <option value="database">Database</option>
                  <option value="monitoring">Monitoring System</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Vendor</label>
                <input
                  type="text"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Salesforce"
                >
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2">Endpoint URL</label>
                <input
                  type="url"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://company.my.salesforce.com"
                >
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-secondary-700 mb-2">Description</label>
                <textarea
                  rows="3"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Integration description and purpose..."
                ></textarea>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3">
            <button (click)="closeCreateModal()" class="btn-secondary">Cancel</button>
            <button (click)="createIntegration()" class="btn-primary">Create Integration</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SystemIntegrationsComponent implements OnInit {
  integrations = signal<SystemIntegration[]>([]);
  selectedIntegration = signal<SystemIntegration | null>(null);
  showCreateModal = signal(false);
  testingConnection = signal<string | null>(null);
  syncingIntegration = signal<string | null>(null);
  detailsTab = signal<string>('overview');
  isLoading = signal(false);

  filters = signal<IntegrationFilters>({
    searchQuery: '',
    type: '',
    category: '',
    status: ''
  });

  // Computed properties
  filteredIntegrations = computed(() => {
    let filtered = this.integrations();
    const f = this.filters();

    if (f.searchQuery) {
      const query = f.searchQuery.toLowerCase();
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(query) ||
        integration.displayName.toLowerCase().includes(query) ||
        integration.vendor.toLowerCase().includes(query) ||
        integration.description.toLowerCase().includes(query)
      );
    }

    if (f.type) {
      filtered = filtered.filter(integration => integration.type === f.type);
    }

    if (f.category) {
      filtered = filtered.filter(integration => integration.category === f.category);
    }

    if (f.status) {
      filtered = filtered.filter(integration => integration.status === f.status);
    }

    return filtered.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
  });

  constructor(private adminService: SystemAdminService) {}

  ngOnInit(): void {
    this.loadIntegrations();
  }

  private loadIntegrations(): void {
    this.isLoading.set(true);
    this.adminService.getIntegrations().subscribe(integrations => {
      this.integrations.set(integrations);
      this.isLoading.set(false);
    });
  }

  // Filter handlers
  onFilterChange(): void {
    // Filtering is handled by computed property
  }

  // Integration operations
  testConnection(integration: SystemIntegration): void {
    this.testingConnection.set(integration.id);
    this.adminService.testIntegrationConnection(integration.id).subscribe(result => {
      console.log('Connection test result:', result);
      this.testingConnection.set(null);
      // Show result notification
    });
  }

  syncIntegration(integration: SystemIntegration): void {
    this.syncingIntegration.set(integration.id);
    this.adminService.syncIntegrationData(integration.id).subscribe(result => {
      console.log('Sync result:', result);
      this.syncingIntegration.set(null);
      this.loadIntegrations();
    });
  }

  syncAllIntegrations(): void {
    const activeIntegrations = this.integrations().filter(i => i.status === IntegrationStatus.Active);
    activeIntegrations.forEach(integration => {
      this.syncIntegration(integration);
    });
  }

  configureIntegration(integration: SystemIntegration): void {
    console.log('Configure integration:', integration.id);
    // Navigate to configuration page or open configuration modal
  }

  viewIntegrationDetails(integration: SystemIntegration): void {
    this.selectedIntegration.set(integration);
    this.setDetailsTab('overview');
  }

  closeIntegrationDetails(): void {
    this.selectedIntegration.set(null);
  }

  setDetailsTab(tab: string): void {
    this.detailsTab.set(tab);
  }

  showCreateIntegrationModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createIntegration(): void {
    // Implement integration creation
    console.log('Create integration');
    this.closeCreateModal();
  }

  refreshIntegrations(): void {
    this.loadIntegrations();
  }

  // Utility methods
  getActiveIntegrationsCount(): number {
    return this.integrations().filter(i => i.status === IntegrationStatus.Active).length;
  }

  getHealthyIntegrationsCount(): number {
    return this.integrations().filter(i => 
      i.status === IntegrationStatus.Active && 
      i.lastHealthCheck && 
      (Date.now() - i.lastHealthCheck.getTime()) < 600000 // 10 minutes
    ).length;
  }

  getFailedIntegrationsCount(): number {
    return this.integrations().filter(i => i.status === IntegrationStatus.Error).length;
  }

  getHealthPercentage(): number {
    const total = this.getActiveIntegrationsCount();
    const healthy = this.getHealthyIntegrationsCount();
    return total > 0 ? Math.round((healthy / total) * 100) : 0;
  }

  getLastSyncTime(): string {
    const integrations = this.integrations();
    if (integrations.length === 0) return '—';
    
    const lastSync = integrations
      .filter(i => i.lastSync)
      .sort((a, b) => b.lastSync!.getTime() - a.lastSync!.getTime())[0];
    
    if (!lastSync?.lastSync) return 'Never';
    
    const diffMs = Date.now() - lastSync.lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  // Styling helper methods
  getIntegrationIconClass(type: IntegrationType): string {
    const baseClass = 'w-10 h-10 rounded-lg flex items-center justify-center';
    switch (type) {
      case IntegrationType.Identity: return `${baseClass} bg-blue-100 text-blue-600`;
      case IntegrationType.Directory: return `${baseClass} bg-green-100 text-green-600`;
      case IntegrationType.Database: return `${baseClass} bg-purple-100 text-purple-600`;
      case IntegrationType.Application: return `${baseClass} bg-orange-100 text-orange-600`;
      case IntegrationType.Monitoring: return `${baseClass} bg-red-100 text-red-600`;
      case IntegrationType.Security: return `${baseClass} bg-yellow-100 text-yellow-600`;
      default: return `${baseClass} bg-secondary-100 text-secondary-600`;
    }
  }

  getIntegrationStatusBadgeClass(status: IntegrationStatus): string {
    const baseClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case IntegrationStatus.Active: return `${baseClass} bg-success-100 text-success-800`;
      case IntegrationStatus.Inactive: return `${baseClass} bg-secondary-100 text-secondary-800`;
      case IntegrationStatus.Error: return `${baseClass} bg-danger-100 text-danger-800`;
      case IntegrationStatus.Pending: return `${baseClass} bg-warning-100 text-warning-800`;
      case IntegrationStatus.Configuring: return `${baseClass} bg-blue-100 text-blue-800`;
      default: return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getIntegrationStatusLabel(status: IntegrationStatus): string {
    switch (status) {
      case IntegrationStatus.Active: return 'Active';
      case IntegrationStatus.Inactive: return 'Inactive';
      case IntegrationStatus.Error: return 'Error';
      case IntegrationStatus.Pending: return 'Pending';
      case IntegrationStatus.Configuring: return 'Configuring';
      default: return 'Unknown';
    }
  }

  getIntegrationTypeBadgeClass(type: IntegrationType): string {
    const baseClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    switch (type) {
      case IntegrationType.Identity: return `${baseClass} bg-blue-100 text-blue-800`;
      case IntegrationType.Directory: return `${baseClass} bg-green-100 text-green-800`;
      case IntegrationType.Database: return `${baseClass} bg-purple-100 text-purple-800`;
      case IntegrationType.Application: return `${baseClass} bg-orange-100 text-orange-800`;
      case IntegrationType.Monitoring: return `${baseClass} bg-red-100 text-red-800`;
      case IntegrationType.Security: return `${baseClass} bg-yellow-100 text-yellow-800`;
      default: return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  getIntegrationTypeLabel(type: IntegrationType): string {
    switch (type) {
      case IntegrationType.Identity: return 'Identity';
      case IntegrationType.Directory: return 'Directory';
      case IntegrationType.Database: return 'Database';
      case IntegrationType.Application: return 'Application';
      case IntegrationType.Monitoring: return 'Monitoring';
      case IntegrationType.Security: return 'Security';
      default: return type;
    }
  }

  getIntegrationCategoryLabel(category: IntegrationCategory): string {
    switch (category) {
      case IntegrationCategory.Authentication: return 'Authentication';
      case IntegrationCategory.UserProvisioning: return 'User Provisioning';
      case IntegrationCategory.DataSync: return 'Data Sync';
      case IntegrationCategory.Monitoring: return 'Monitoring';
      case IntegrationCategory.Reporting: return 'Reporting';
      case IntegrationCategory.Workflow: return 'Workflow';
      default: return category;
    }
  }

  getAuthTypeLabel(type: AuthenticationType): string {
    switch (type) {
      case AuthenticationType.Basic: return 'Basic Auth';
      case AuthenticationType.OAuth2: return 'OAuth 2.0';
      case AuthenticationType.JWT: return 'JWT';
      case AuthenticationType.ApiKey: return 'API Key';
      case AuthenticationType.Certificate: return 'Certificate';
      case AuthenticationType.Kerberos: return 'Kerberos';
      case AuthenticationType.SAML: return 'SAML';
      default: return type;
    }
  }

  getConnectionEndpoint(integration: SystemIntegration): string {
    return integration.configuration.endpoint || integration.configuration.connectionString || 'Not configured';
  }

  getConnectionStatusClass(status: IntegrationStatus): string {
    const baseClass = 'w-4 h-4 rounded-full flex items-center justify-center';
    switch (status) {
      case IntegrationStatus.Active: return `${baseClass} bg-success-100 text-success-600`;
      case IntegrationStatus.Error: return `${baseClass} bg-danger-100 text-danger-600`;
      case IntegrationStatus.Pending: return `${baseClass} bg-warning-100 text-warning-600`;
      default: return `${baseClass} bg-secondary-100 text-secondary-600`;
    }
  }

  getHealthCheckClass(lastCheck: Date): string {
    const diffMs = Date.now() - lastCheck.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 10) return 'text-success-600';
    if (diffMins < 30) return 'text-warning-600';
    return 'text-danger-600';
  }

  getAlertSeverityClass(severity: any): string {
    const baseClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    switch (severity) {
      case 'critical': return `${baseClass} bg-danger-100 text-danger-800`;
      case 'warning': return `${baseClass} bg-warning-100 text-warning-800`;
      case 'info': return `${baseClass} bg-blue-100 text-blue-800`;
      default: return `${baseClass} bg-secondary-100 text-secondary-800`;
    }
  }

  hasCustomSettings(integration: SystemIntegration): boolean {
    return integration.configuration.customSettings && 
           Object.keys(integration.configuration.customSettings).length > 0;
  }

  formatCustomSettings(settings: Record<string, any>): string {
    return JSON.stringify(settings, null, 2);
  }
}
