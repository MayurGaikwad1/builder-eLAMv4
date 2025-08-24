import { Component, OnInit, signal, computed, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SystemAdminService } from '../../shared/services/system-admin.service';
import {
  SystemIntegration,
  IntegrationType,
  IntegrationCategory,
  IntegrationStatus,
  AuthenticationType,
  DataMapping,
  HealthCheck,
  MonitoringConfig,
  AuthenticationConfig
} from '../../shared/interfaces/system-admin.interface';

interface ConfigurationSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  required: boolean;
}

@Component({
  selector: 'app-integration-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Breadcrumb -->
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <div>
              <a routerLink="/admin" class="text-secondary-400 hover:text-secondary-500">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                <span class="sr-only">Home</span>
              </a>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <a routerLink="/admin" class="ml-4 text-sm font-medium text-secondary-500 hover:text-secondary-700">System Admin</a>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <a routerLink="/admin/integrations" class="ml-4 text-sm font-medium text-secondary-500 hover:text-secondary-700">Integrations</a>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="ml-4 text-sm font-medium text-secondary-900">{{ integration()?.displayName || 'New Integration' }} Configuration</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">
            {{ isNewIntegration() ? 'Create New Integration' : 'Configure Integration' }}
          </h1>
          <p class="text-secondary-600 mt-1">
            {{ isNewIntegration() ? 'Set up a new system integration' : 'Modify integration settings and connections' }}
          </p>
          <div *ngIf="!isNewIntegration() && integration()" class="flex items-center space-x-3 mt-3">
            <span [class]="getIntegrationStatusBadgeClass(integration()!.status)">
              {{ getIntegrationStatusLabel(integration()!.status) }}
            </span>
            <span class="text-sm text-secondary-500">{{ integration()!.vendor }} • v{{ integration()!.version }}</span>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            *ngIf="!isNewIntegration()" 
            (click)="testIntegrationConnection()"
            [disabled]="isTesting() || !isConfigurationValid()"
            class="btn-secondary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ isTesting() ? 'Testing...' : 'Test Connection' }}
          </button>
          <button (click)="saveConfiguration()" [disabled]="isSaving() || !isConfigurationValid()" class="btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {{ isSaving() ? 'Saving...' : (isNewIntegration() ? 'Create Integration' : 'Save Changes') }}
          </button>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div class="card">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-secondary-900">Configuration Progress</h3>
            <span class="text-sm font-medium text-secondary-600">
              {{ getCompletedSectionsCount() }}/{{ configurationSections().length }} completed
            </span>
          </div>
          <div class="mt-4">
            <div class="w-full bg-secondary-200 rounded-full h-2">
              <div 
                class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                [style.width.%]="getProgressPercentage()"
              ></div>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              *ngFor="let section of configurationSections()"
              (click)="setActiveSection(section.id)"
              [class]="getSectionButtonClass(section)"
              class="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path [attr.d]="section.icon"></path>
              </svg>
              <span>{{ section.title }}</span>
              <svg *ngIf="section.completed" class="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span *ngIf="section.required && !section.completed" class="text-danger-500">*</span>
            </button>
          </div>
        </div>
      </div>

      <form [formGroup]="configForm" class="space-y-6">
        <!-- Basic Information Section -->
        <div *ngIf="activeSection() === 'basic'" class="card">
          <div class="card-header">
            <h3 class="card-title">Basic Information</h3>
            <p class="card-subtitle">Configure the fundamental integration settings</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Integration Name <span class="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  formControlName="displayName"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Production Salesforce"
                >
                <div *ngIf="configForm.get('displayName')?.invalid && configForm.get('displayName')?.touched" class="mt-1 text-sm text-danger-600">
                  Integration name is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  System Identifier <span class="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  formControlName="name"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="prod-salesforce"
                >
                <p class="mt-1 text-xs text-secondary-500">Unique system identifier (alphanumeric and hyphens only)</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Integration Type <span class="text-danger-500">*</span>
                </label>
                <select 
                  formControlName="type"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select integration type</option>
                  <option value="identity">Identity Provider</option>
                  <option value="directory">Directory Service</option>
                  <option value="database">Database</option>
                  <option value="application">Application</option>
                  <option value="monitoring">Monitoring System</option>
                  <option value="security">Security System</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Category <span class="text-danger-500">*</span>
                </label>
                <select 
                  formControlName="category"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select category</option>
                  <option value="authentication">Authentication</option>
                  <option value="userProvisioning">User Provisioning</option>
                  <option value="dataSync">Data Synchronization</option>
                  <option value="monitoring">Monitoring & Alerting</option>
                  <option value="reporting">Reporting & Analytics</option>
                  <option value="workflow">Workflow Automation</option>
                </select>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Vendor <span class="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  formControlName="vendor"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Salesforce"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Version</label>
                <input
                  type="text"
                  formControlName="version"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="v58.0"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Description</label>
                <textarea
                  formControlName="description"
                  rows="4"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Integration description and purpose..."
                ></textarea>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="isActive"
                    class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-secondary-700">Enable integration after configuration</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Connection Configuration Section -->
        <div *ngIf="activeSection() === 'connection'" class="card">
          <div class="card-header">
            <h3 class="card-title">Connection Configuration</h3>
            <p class="card-subtitle">Configure the connection settings and endpoints</p>
          </div>
          <div formGroupName="configuration" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">
                    Protocol <span class="text-danger-500">*</span>
                  </label>
                  <select 
                    formControlName="protocol"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select protocol</option>
                    <option value="https">HTTPS</option>
                    <option value="http">HTTP</option>
                    <option value="ldap">LDAP</option>
                    <option value="ldaps">LDAPS</option>
                    <option value="jdbc">JDBC</option>
                    <option value="odbc">ODBC</option>
                    <option value="api">REST API</option>
                    <option value="soap">SOAP</option>
                    <option value="graphql">GraphQL</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">
                    Endpoint URL <span class="text-danger-500">*</span>
                  </label>
                  <input
                    type="url"
                    formControlName="endpoint"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://company.my.salesforce.com"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Port</label>
                  <input
                    type="number"
                    formControlName="port"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="443"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Connection String</label>
                  <textarea
                    formControlName="connectionString"
                    rows="3"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Custom connection string (if applicable)"
                  ></textarea>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Timeout (seconds)</label>
                  <input
                    type="number"
                    formControlName="timeout"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="30"
                    min="1"
                    max="300"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Retry Attempts</label>
                  <input
                    type="number"
                    formControlName="retryAttempts"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="3"
                    min="0"
                    max="10"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Batch Size</label>
                  <input
                    type="number"
                    formControlName="batchSize"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="100"
                    min="1"
                    max="10000"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Sync Interval (seconds)</label>
                  <input
                    type="number"
                    formControlName="syncInterval"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="3600"
                    min="60"
                    max="86400"
                  >
                  <p class="mt-1 text-xs text-secondary-500">How often to synchronize data (minimum 60 seconds)</p>
                </div>
              </div>
            </div>

            <!-- Custom Settings -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-medium text-secondary-700">Custom Settings</label>
                <button type="button" (click)="addCustomSetting()" class="text-sm text-primary-600 hover:text-primary-700">
                  + Add Setting
                </button>
              </div>
              <div formArrayName="customSettings" class="space-y-3">
                <div *ngFor="let setting of customSettingsArray.controls; let i = index" [formGroupName]="i" class="flex items-center space-x-3">
                  <input
                    type="text"
                    formControlName="key"
                    placeholder="Setting key"
                    class="flex-1 border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                  <input
                    type="text"
                    formControlName="value"
                    placeholder="Setting value"
                    class="flex-1 border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                  <button type="button" (click)="removeCustomSetting(i)" class="text-danger-600 hover:text-danger-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Authentication Section -->
        <div *ngIf="activeSection() === 'authentication'" class="card">
          <div class="card-header">
            <h3 class="card-title">Authentication Configuration</h3>
            <p class="card-subtitle">Configure authentication methods and credentials</p>
          </div>
          <div formGroupName="authentication" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">
                Authentication Type <span class="text-danger-500">*</span>
              </label>
              <select 
                formControlName="type"
                (change)="onAuthTypeChange($event)"
                class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select authentication type</option>
                <option value="basic">Basic Authentication</option>
                <option value="oauth2">OAuth 2.0</option>
                <option value="jwt">JWT Token</option>
                <option value="apiKey">API Key</option>
                <option value="certificate">Certificate</option>
                <option value="kerberos">Kerberos</option>
                <option value="saml">SAML</option>
              </select>
            </div>

            <!-- Basic Authentication -->
            <div *ngIf="authType() === 'basic'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Username</label>
                <input
                  type="text"
                  formControlName="username"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="service-account@company.com"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Password</label>
                <input
                  type="password"
                  formControlName="password"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                >
              </div>
            </div>

            <!-- OAuth 2.0 -->
            <div *ngIf="authType() === 'oauth2'" class="space-y-4">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Client ID</label>
                  <input
                    type="text"
                    formControlName="clientId"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your-client-id"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Client Secret</label>
                  <input
                    type="password"
                    formControlName="clientSecret"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="••••••••"
                  >
                </div>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Token URL</label>
                  <input
                    type="url"
                    formControlName="tokenUrl"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://login.salesforce.com/services/oauth2/token"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Scopes</label>
                  <input
                    type="text"
                    formControlName="scopes"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="read write admin"
                  >
                </div>
              </div>
            </div>

            <!-- API Key -->
            <div *ngIf="authType() === 'apiKey'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">API Key</label>
                <input
                  type="password"
                  formControlName="apiKey"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••••••••••"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Header Name</label>
                <input
                  type="text"
                  formControlName="headerName"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="X-API-Key"
                >
              </div>
            </div>

            <!-- JWT Token -->
            <div *ngIf="authType() === 'jwt'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">JWT Token</label>
                <textarea
                  formControlName="jwtToken"
                  rows="4"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                ></textarea>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Issuer</label>
                  <input
                    type="text"
                    formControlName="issuer"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://your-issuer.com"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Audience</label>
                  <input
                    type="text"
                    formControlName="audience"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://your-audience.com"
                  >
                </div>
              </div>
            </div>

            <!-- Certificate -->
            <div *ngIf="authType() === 'certificate'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Certificate</label>
                <textarea
                  formControlName="certificate"
                  rows="6"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJANXlQYMJ..."
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Private Key</label>
                <textarea
                  formControlName="privateKey"
                  rows="6"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQE..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Mapping Section -->
        <div *ngIf="activeSection() === 'mapping'" class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="card-title">Data Field Mappings</h3>
                <p class="card-subtitle">Map external system fields to internal data structure</p>
              </div>
              <button type="button" (click)="addDataMapping()" class="btn-secondary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Mapping
              </button>
            </div>
          </div>
          <div formArrayName="dataMappings" class="space-y-4">
            <div *ngFor="let mapping of dataMappingsArray.controls; let i = index" [formGroupName]="i" 
                 class="border border-secondary-200 rounded-lg p-4 bg-secondary-50">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-medium text-secondary-900">Mapping {{ i + 1 }}</h4>
                <button type="button" (click)="removeDataMapping(i)" class="text-danger-600 hover:text-danger-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Source Field</label>
                  <input
                    type="text"
                    formControlName="sourceField"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="external_user_id"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Target Field</label>
                  <input
                    type="text"
                    formControlName="targetField"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="userId"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Data Type</label>
                  <select
                    formControlName="dataType"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select type</option>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                    <option value="datetime">DateTime</option>
                    <option value="array">Array</option>
                    <option value="object">Object</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Transformation</label>
                  <input
                    type="text"
                    formControlName="transformation"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="uppercase, lowercase, etc."
                  >
                </div>
                <div class="flex items-end">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="isRequired"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Required</span>
                  </label>
                </div>
              </div>
            </div>
            <div *ngIf="dataMappingsArray.length === 0" class="text-center py-8 text-secondary-500">
              No data mappings configured. Click "Add Mapping" to create field mappings.
            </div>
          </div>
        </div>

        <!-- Health Check Section -->
        <div *ngIf="activeSection() === 'health'" class="card">
          <div class="card-header">
            <h3 class="card-title">Health Check Configuration</h3>
            <p class="card-subtitle">Configure health monitoring and availability checks</p>
          </div>
          <div formGroupName="healthCheck" class="space-y-6">
            <div>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="enabled"
                  class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm font-medium text-secondary-700">Enable health checks</span>
              </label>
            </div>

            <div *ngIf="configForm.get('healthCheck.enabled')?.value" class="space-y-4">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Check Interval (seconds)</label>
                  <input
                    type="number"
                    formControlName="interval"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="300"
                    min="30"
                    max="3600"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Timeout (seconds)</label>
                  <input
                    type="number"
                    formControlName="timeout"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="30"
                    min="5"
                    max="120"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Retry Attempts</label>
                  <input
                    type="number"
                    formControlName="retryAttempts"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="3"
                    min="0"
                    max="10"
                  >
                </div>
              </div>

              <!-- Health Check Types -->
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-3">Health Check Types</label>
                <div formArrayName="checks" class="space-y-3">
                  <div *ngFor="let check of healthChecksArray.controls; let i = index" [formGroupName]="i" 
                       class="flex items-center space-x-4 p-3 border border-secondary-200 rounded-lg">
                    <select
                      formControlName="type"
                      class="flex-1 border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select check type</option>
                      <option value="ping">Ping/Connection Test</option>
                      <option value="api">API Endpoint Check</option>
                      <option value="database">Database Query</option>
                      <option value="authentication">Authentication Test</option>
                      <option value="custom">Custom Check</option>
                    </select>
                    <input
                      type="text"
                      formControlName="endpoint"
                      placeholder="Check endpoint or query"
                      class="flex-2 border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                    <button type="button" (click)="removeHealthCheck(i)" class="text-danger-600 hover:text-danger-700">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <button type="button" (click)="addHealthCheck()" class="mt-3 text-sm text-primary-600 hover:text-primary-700">
                  + Add Health Check
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Monitoring Section -->
        <div *ngIf="activeSection() === 'monitoring'" class="card">
          <div class="card-header">
            <h3 class="card-title">Monitoring & Alerting</h3>
            <p class="card-subtitle">Configure monitoring, logging, and alert thresholds</p>
          </div>
          <div formGroupName="monitoring" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enabled"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm font-medium text-secondary-700">Enable monitoring</span>
                  </label>
                </div>

                <div>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="metricsCollection"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm font-medium text-secondary-700">Collect performance metrics</span>
                  </label>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Log Level</label>
                  <select
                    formControlName="logLevel"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                    <option value="trace">Trace</option>
                  </select>
                </div>
              </div>

              <div class="space-y-4">
                <div formGroupName="alerting">
                  <div>
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        formControlName="enabled"
                        class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      >
                      <span class="ml-2 text-sm font-medium text-secondary-700">Enable alerting</span>
                    </label>
                  </div>

                  <div *ngIf="configForm.get('monitoring.alerting.enabled')?.value">
                    <label class="block text-sm font-medium text-secondary-700 mb-2 mt-4">Alert Channels</label>
                    <div formArrayName="channels" class="space-y-2">
                      <div *ngFor="let channel of alertChannelsArray.controls; let i = index" class="flex items-center space-x-3">
                        <select
                          [formControlName]="i"
                          class="flex-1 border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select channel</option>
                          <option value="email">Email</option>
                          <option value="slack">Slack</option>
                          <option value="webhook">Webhook</option>
                          <option value="sms">SMS</option>
                          <option value="pagerduty">PagerDuty</option>
                        </select>
                        <button type="button" (click)="removeAlertChannel(i)" class="text-danger-600 hover:text-danger-700">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button type="button" (click)="addAlertChannel()" class="mt-2 text-sm text-primary-600 hover:text-primary-700">
                      + Add Alert Channel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Alert Thresholds -->
            <div *ngIf="configForm.get('monitoring.alerting.enabled')?.value" formGroupName="alerting">
              <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-medium text-secondary-700">Alert Thresholds</label>
                <button type="button" (click)="addAlertThreshold()" class="text-sm text-primary-600 hover:text-primary-700">
                  + Add Threshold
                </button>
              </div>
              <div formArrayName="thresholds" class="space-y-3">
                <div *ngFor="let threshold of alertThresholdsArray.controls; let i = index" [formGroupName]="i" 
                     class="grid grid-cols-1 lg:grid-cols-5 gap-4 p-3 border border-secondary-200 rounded-lg">
                  <div>
                    <input
                      type="text"
                      formControlName="metric"
                      placeholder="Metric name"
                      class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                  </div>
                  <div>
                    <select
                      formControlName="operator"
                      class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Operator</option>
                      <option value=">">&gt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<">&lt;</option>
                      <option value="<=">&lt;=</option>
                      <option value="==">==</option>
                      <option value="!=">!=</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      formControlName="value"
                      placeholder="Threshold value"
                      class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                  </div>
                  <div>
                    <select
                      formControlName="severity"
                      class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Severity</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div class="flex items-center">
                    <button type="button" (click)="removeAlertThreshold(i)" class="text-danger-600 hover:text-danger-700">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Test Results Modal -->
      <div 
        *ngIf="showTestResults()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeTestResults()"
      >
        <div 
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-secondary-900">Connection Test Results</h3>
              <button 
                (click)="closeTestResults()"
                class="text-secondary-400 hover:text-secondary-600"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="px-6 py-4">
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div [class]="testResults()?.success ? 'w-8 h-8 bg-success-100 rounded-full flex items-center justify-center' : 'w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center'">
                  <svg *ngIf="testResults()?.success" class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <svg *ngIf="!testResults()?.success" class="w-5 h-5 text-danger-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-medium" [class]="testResults()?.success ? 'text-success-900' : 'text-danger-900'">
                    {{ testResults()?.success ? 'Connection Successful' : 'Connection Failed' }}
                  </h4>
                  <p class="text-sm text-secondary-600">{{ testResults()?.message }}</p>
                </div>
              </div>
              
              <div *ngIf="testResults()?.details" class="bg-secondary-50 rounded-lg p-4">
                <h5 class="text-sm font-medium text-secondary-900 mb-2">Test Details</h5>
                <pre class="text-sm text-secondary-700 whitespace-pre-wrap">{{ testResults()?.details }}</pre>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-secondary-200 flex justify-end">
            <button (click)="closeTestResults()" class="btn-primary">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IntegrationConfigurationComponent implements OnInit {
  integrationId = input<string>();
  integration = signal<SystemIntegration | null>(null);
  isNewIntegration = computed(() => !this.integrationId() || this.integrationId() === 'new');
  
  configForm!: FormGroup;
  activeSection = signal<string>('basic');
  isSaving = signal(false);
  isTesting = signal(false);
  showTestResults = signal(false);
  testResults = signal<any>(null);
  authType = signal<string>('');

  configurationSections = signal<ConfigurationSection[]>([
    {
      id: 'basic',
      title: 'Basic Info',
      description: 'General integration information',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      completed: false,
      required: true
    },
    {
      id: 'connection',
      title: 'Connection',
      description: 'Connection and endpoint settings',
      icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      completed: false,
      required: true
    },
    {
      id: 'authentication',
      title: 'Authentication',
      description: 'Security and authentication setup',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      completed: false,
      required: true
    },
    {
      id: 'mapping',
      title: 'Data Mapping',
      description: 'Field mappings and transformations',
      icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7',
      completed: false,
      required: false
    },
    {
      id: 'health',
      title: 'Health Checks',
      description: 'Health monitoring configuration',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      completed: false,
      required: false
    },
    {
      id: 'monitoring',
      title: 'Monitoring',
      description: 'Monitoring and alerting setup',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      completed: false,
      required: false
    }
  ]);

  constructor(
    private fb: FormBuilder,
    private adminService: SystemAdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
    
    // Setup effect to watch for changes in route params
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'new') {
        this.loadIntegration(id);
      } else {
        this.resetToNewIntegration();
      }
    });
  }

  ngOnInit(): void {
    // Load integration if ID is provided
    const integrationId = this.route.snapshot.paramMap.get('id');
    if (integrationId && integrationId !== 'new') {
      this.loadIntegration(integrationId);
    }
    
    // Setup form change detection
    this.configForm.valueChanges.subscribe(() => {
      this.updateSectionCompletion();
    });
  }

  private initializeForm(): void {
    this.configForm = this.fb.group({
      displayName: ['', Validators.required],
      name: ['', Validators.required],
      type: ['', Validators.required],
      category: ['', Validators.required],
      vendor: ['', Validators.required],
      version: [''],
      description: [''],
      isActive: [true],
      configuration: this.fb.group({
        protocol: ['', Validators.required],
        endpoint: ['', Validators.required],
        port: [''],
        connectionString: [''],
        timeout: [30],
        retryAttempts: [3],
        batchSize: [100],
        syncInterval: [3600],
        customSettings: this.fb.array([])
      }),
      authentication: this.fb.group({
        type: ['', Validators.required],
        username: [''],
        password: [''],
        clientId: [''],
        clientSecret: [''],
        tokenUrl: [''],
        scopes: [''],
        apiKey: [''],
        headerName: [''],
        jwtToken: [''],
        issuer: [''],
        audience: [''],
        certificate: [''],
        privateKey: ['']
      }),
      dataMappings: this.fb.array([]),
      healthCheck: this.fb.group({
        enabled: [false],
        interval: [300],
        timeout: [30],
        retryAttempts: [3],
        checks: this.fb.array([])
      }),
      monitoring: this.fb.group({
        enabled: [false],
        metricsCollection: [false],
        logLevel: ['info'],
        alerting: this.fb.group({
          enabled: [false],
          channels: this.fb.array([]),
          thresholds: this.fb.array([])
        })
      })
    });

    // Watch auth type changes
    this.configForm.get('authentication.type')?.valueChanges.subscribe(type => {
      this.authType.set(type);
    });
  }

  private loadIntegration(id: string): void {
    this.adminService.getIntegration(id).subscribe(integration => {
      if (integration) {
        this.integration.set(integration);
        this.populateForm(integration);
      }
    });
  }

  private resetToNewIntegration(): void {
    this.integration.set(null);
    this.configForm.reset();
    this.setActiveSection('basic');
  }

  private populateForm(integration: SystemIntegration): void {
    this.configForm.patchValue({
      displayName: integration.displayName,
      name: integration.name,
      type: integration.type,
      category: integration.category,
      vendor: integration.vendor,
      version: integration.version,
      description: integration.description,
      isActive: integration.status === IntegrationStatus.Active,
      configuration: {
        protocol: integration.configuration.protocol,
        endpoint: integration.configuration.endpoint,
        port: integration.configuration.port,
        connectionString: integration.configuration.connectionString,
        timeout: integration.configuration.timeout,
        retryAttempts: integration.configuration.retryAttempts,
        batchSize: integration.configuration.batchSize,
        syncInterval: integration.configuration.syncInterval
      },
      authentication: {
        type: integration.authentication.type,
        // username: integration.authentication.username, // Not available in interface
        // Don't populate passwords/secrets for security
      },
      healthCheck: {
        enabled: integration.healthCheck.enabled,
        interval: integration.healthCheck.interval,
        timeout: integration.healthCheck.timeout,
        retryAttempts: integration.healthCheck.retryAttempts
      },
      monitoring: {
        enabled: integration.monitoring.enabled,
        metricsCollection: integration.monitoring.metricsCollection,
        logLevel: integration.monitoring.logLevel,
        alerting: {
          enabled: integration.monitoring.alerting.enabled
        }
      }
    });

    // Populate arrays
    this.populateDataMappings(integration.dataMappings);
    this.populateHealthChecks(integration.healthCheck.checks);
    this.populateCustomSettings(integration.configuration.customSettings);
    
    this.authType.set(integration.authentication.type);
    this.updateSectionCompletion();
  }

  private populateDataMappings(mappings: DataMapping[]): void {
    const mappingsArray = this.dataMappingsArray;
    mappingsArray.clear();
    
    mappings.forEach(mapping => {
      mappingsArray.push(this.fb.group({
        sourceField: [mapping.sourceField],
        targetField: [mapping.targetField],
        dataType: [mapping.dataType],
        transformation: [mapping.transformation],
        isRequired: [mapping.isRequired]
      }));
    });
  }

  private populateHealthChecks(checks: any[]): void {
    const checksArray = this.healthChecksArray;
    checksArray.clear();
    
    checks.forEach(check => {
      checksArray.push(this.fb.group({
        type: [check.type],
        endpoint: [check.endpoint]
      }));
    });
  }

  private populateCustomSettings(settings: Record<string, any>): void {
    const settingsArray = this.customSettingsArray;
    settingsArray.clear();
    
    Object.entries(settings || {}).forEach(([key, value]) => {
      settingsArray.push(this.fb.group({
        key: [key],
        value: [value]
      }));
    });
  }

  // Form array getters
  get customSettingsArray(): FormArray {
    return this.configForm.get('configuration.customSettings') as FormArray;
  }

  get dataMappingsArray(): FormArray {
    return this.configForm.get('dataMappings') as FormArray;
  }

  get healthChecksArray(): FormArray {
    return this.configForm.get('healthCheck.checks') as FormArray;
  }

  get alertChannelsArray(): FormArray {
    return this.configForm.get('monitoring.alerting.channels') as FormArray;
  }

  get alertThresholdsArray(): FormArray {
    return this.configForm.get('monitoring.alerting.thresholds') as FormArray;
  }

  // Section management
  setActiveSection(sectionId: string): void {
    this.activeSection.set(sectionId);
  }

  private updateSectionCompletion(): void {
    const sections = this.configurationSections();
    const form = this.configForm;

    sections.forEach(section => {
      switch (section.id) {
        case 'basic':
          section.completed = !!(form.get('displayName')?.value && form.get('name')?.value && 
                                form.get('type')?.value && form.get('category')?.value && 
                                form.get('vendor')?.value);
          break;
        case 'connection':
          section.completed = !!(form.get('configuration.protocol')?.value && 
                                form.get('configuration.endpoint')?.value);
          break;
        case 'authentication':
          section.completed = !!form.get('authentication.type')?.value;
          break;
        case 'mapping':
          section.completed = this.dataMappingsArray.length > 0;
          break;
        case 'health':
          section.completed = true; // Optional section
          break;
        case 'monitoring':
          section.completed = true; // Optional section
          break;
      }
    });

    this.configurationSections.set([...sections]);
  }

  // Progress calculation
  getCompletedSectionsCount(): number {
    return this.configurationSections().filter(s => s.completed).length;
  }

  getProgressPercentage(): number {
    const total = this.configurationSections().length;
    const completed = this.getCompletedSectionsCount();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  isConfigurationValid(): boolean {
    const requiredSections = this.configurationSections().filter(s => s.required);
    return requiredSections.every(s => s.completed);
  }

  // Array management methods
  addCustomSetting(): void {
    this.customSettingsArray.push(this.fb.group({
      key: [''],
      value: ['']
    }));
  }

  removeCustomSetting(index: number): void {
    this.customSettingsArray.removeAt(index);
  }

  addDataMapping(): void {
    this.dataMappingsArray.push(this.fb.group({
      sourceField: ['', Validators.required],
      targetField: ['', Validators.required],
      dataType: ['string'],
      transformation: [''],
      isRequired: [false]
    }));
  }

  removeDataMapping(index: number): void {
    this.dataMappingsArray.removeAt(index);
  }

  addHealthCheck(): void {
    this.healthChecksArray.push(this.fb.group({
      type: ['ping'],
      endpoint: ['']
    }));
  }

  removeHealthCheck(index: number): void {
    this.healthChecksArray.removeAt(index);
  }

  addAlertChannel(): void {
    this.alertChannelsArray.push(this.fb.control(''));
  }

  removeAlertChannel(index: number): void {
    this.alertChannelsArray.removeAt(index);
  }

  addAlertThreshold(): void {
    this.alertThresholdsArray.push(this.fb.group({
      metric: [''],
      operator: ['>'],
      value: [''],
      severity: ['warning']
    }));
  }

  removeAlertThreshold(index: number): void {
    this.alertThresholdsArray.removeAt(index);
  }

  // Event handlers
  onAuthTypeChange(event: any): void {
    this.authType.set(event.target.value);
  }

  // Actions
  testIntegrationConnection(): void {
    if (!this.isConfigurationValid()) return;

    this.isTesting.set(true);
    const formData = this.configForm.value;
    
    this.adminService.testIntegrationConfiguration(formData).subscribe({
      next: (result) => {
        this.testResults.set(result);
        this.showTestResults.set(true);
        this.isTesting.set(false);
      },
      error: (error) => {
        this.testResults.set({
          success: false,
          message: 'Connection test failed',
          details: error.message
        });
        this.showTestResults.set(true);
        this.isTesting.set(false);
      }
    });
  }

  saveConfiguration(): void {
    if (!this.isConfigurationValid()) return;

    this.isSaving.set(true);
    const formData = this.prepareFormData();

    const saveOperation = this.isNewIntegration() ?
      this.adminService.createIntegration(formData) :
      this.adminService.updateIntegration(this.integration()!.id, formData);

    saveOperation.subscribe({
      next: (result) => {
        this.isSaving.set(false);
        // Navigate back to integrations list
        this.router.navigate(['/admin/integrations']);
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('Save failed:', error);
      }
    });
  }

  private prepareFormData(): any {
    const formValue = this.configForm.value;
    
    // Convert custom settings array to object
    const customSettings: Record<string, any> = {};
    (formValue.configuration.customSettings || []).forEach((setting: any) => {
      if (setting.key && setting.value) {
        customSettings[setting.key] = setting.value;
      }
    });

    return {
      ...formValue,
      configuration: {
        ...formValue.configuration,
        customSettings
      }
    };
  }

  closeTestResults(): void {
    this.showTestResults.set(false);
    this.testResults.set(null);
  }

  // Styling helper methods
  getSectionButtonClass(section: ConfigurationSection): string {
    const baseClass = 'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors';
    const isActive = this.activeSection() === section.id;
    
    if (isActive) {
      return `${baseClass} bg-primary-100 text-primary-800 border border-primary-200`;
    } else if (section.completed) {
      return `${baseClass} bg-success-50 text-success-700 border border-success-200 hover:bg-success-100`;
    } else if (section.required) {
      return `${baseClass} bg-secondary-50 text-secondary-700 border border-secondary-200 hover:bg-secondary-100`;
    } else {
      return `${baseClass} bg-white text-secondary-600 border border-secondary-200 hover:bg-secondary-50`;
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
}
