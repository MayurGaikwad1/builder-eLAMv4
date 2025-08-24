import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SystemAdminService } from '../../shared/services/system-admin.service';
import { SystemConfiguration, ConfigCategory } from '../../shared/interfaces/system-admin.interface';

interface ConfigurationSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: ConfigCategory;
  enabled: boolean;
  hasChanges: boolean;
}

interface NotificationResult {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

@Component({
  selector: 'app-system-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">System Configuration</h1>
          <p class="text-secondary-600 mt-1">Manage global system settings, security, and operational parameters</p>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            (click)="exportConfiguration()"
            class="btn-secondary"
            [disabled]="isExporting()"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
            </svg>
            {{ isExporting() ? 'Exporting...' : 'Export Config' }}
          </button>
          <button 
            (click)="importConfiguration()"
            class="btn-secondary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
            </svg>
            Import Config
          </button>
          <button 
            (click)="saveAllConfiguration()"
            [disabled]="isSaving() || !hasUnsavedChanges()"
            class="btn-primary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {{ isSaving() ? 'Saving...' : 'Save All Changes' }}
          </button>
        </div>
      </div>

      <!-- Notification -->
      <div 
        *ngIf="notification()"
        [class]="getNotificationClass(notification()!.type)"
        class="rounded-md p-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium">{{ notification()!.message }}</h3>
            <div *ngIf="notification()!.details" class="mt-2 text-sm">
              <p>{{ notification()!.details }}</p>
            </div>
          </div>
          <div class="ml-auto pl-3">
            <button (click)="clearNotification()" class="inline-flex rounded-md focus:outline-none">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Configuration Sections Navigation -->
      <div class="card">
        <div class="px-6 py-4">
          <h3 class="text-lg font-medium text-secondary-900 mb-4">Configuration Categories</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              *ngFor="let section of configurationSections()"
              (click)="setActiveSection(section.id)"
              [class]="getSectionButtonClass(section)"
              class="flex flex-col items-center p-4 rounded-lg text-sm font-medium transition-colors"
            >
              <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path [attr.d]="section.icon"></path>
              </svg>
              <span class="text-center">{{ section.title }}</span>
              <div *ngIf="section.hasChanges" class="w-2 h-2 bg-warning-500 rounded-full mt-1"></div>
            </button>
          </div>
        </div>
      </div>

      <form [formGroup]="configForm" class="space-y-6">
        <!-- General Settings -->
        <div *ngIf="activeSection() === 'general'" class="card">
          <div class="card-header">
            <h3 class="card-title">General System Settings</h3>
            <p class="card-subtitle">Basic system configuration and operational parameters</p>
          </div>
          <div formGroupName="general" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">System Name</label>
                <input
                  type="text"
                  formControlName="systemName"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="ELAM Production System"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">System Description</label>
                <textarea
                  formControlName="systemDescription"
                  rows="3"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enterprise Lifecycle and Access Management System"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Default Timezone</label>
                <select 
                  formControlName="defaultTimezone"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Default Language</label>
                <select 
                  formControlName="defaultLanguage"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Organization Name</label>
                <input
                  type="text"
                  formControlName="organizationName"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Acme Corporation"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  formControlName="contactEmail"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="admin@company.com"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">System URL</label>
                <input
                  type="url"
                  formControlName="systemUrl"
                  class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://elam.company.com"
                >
              </div>

              <div class="space-y-3">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="maintenanceMode"
                    class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-secondary-700">Enable maintenance mode</span>
                </label>

                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="debugMode"
                    class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-secondary-700">Enable debug mode</span>
                </label>

                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="analyticsEnabled"
                    class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-secondary-700">Enable analytics collection</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Configuration -->
        <div *ngIf="activeSection() === 'security'" class="card">
          <div class="card-header">
            <h3 class="card-title">Security Configuration</h3>
            <p class="card-subtitle">Security policies, encryption, and access control settings</p>
          </div>
          <div formGroupName="security" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">Password Policy</h4>
                
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Minimum Password Length</label>
                  <input
                    type="number"
                    formControlName="minPasswordLength"
                    min="8"
                    max="128"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Password Expiry (days)</label>
                  <input
                    type="number"
                    formControlName="passwordExpiryDays"
                    min="0"
                    max="365"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                  <p class="mt-1 text-xs text-secondary-500">Set to 0 for no expiry</p>
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="requireUppercase"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Require uppercase letters</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="requireLowercase"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Require lowercase letters</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="requireNumbers"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Require numbers</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="requireSpecialChars"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Require special characters</span>
                  </label>
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">Account Security</h4>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    formControlName="maxLoginAttempts"
                    min="3"
                    max="10"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Account Lockout Duration (minutes)</label>
                  <input
                    type="number"
                    formControlName="lockoutDurationMinutes"
                    min="5"
                    max="1440"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Idle Session Timeout (minutes)</label>
                  <input
                    type="number"
                    formControlName="idleTimeoutMinutes"
                    min="5"
                    max="480"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enforceIpWhitelist"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enforce IP whitelist</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="requireMfa"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Require multi-factor authentication</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="auditLogging"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable comprehensive audit logging</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Encryption Settings -->
            <div class="border-t border-secondary-200 pt-6">
              <h4 class="text-md font-medium text-secondary-900 mb-4">Encryption Settings</h4>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Encryption Algorithm</label>
                  <select 
                    formControlName="encryptionAlgorithm"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="AES-256">AES-256</option>
                    <option value="AES-192">AES-192</option>
                    <option value="AES-128">AES-128</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Key Rotation Interval (days)</label>
                  <input
                    type="number"
                    formControlName="keyRotationDays"
                    min="30"
                    max="365"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Authentication Settings -->
        <div *ngIf="activeSection() === 'authentication'" class="card">
          <div class="card-header">
            <h3 class="card-title">Authentication Settings</h3>
            <p class="card-subtitle">SSO, identity providers, and authentication methods</p>
          </div>
          <div formGroupName="authentication" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">Primary Authentication</h4>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Default Authentication Method</label>
                  <select 
                    formControlName="defaultAuthMethod"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="local">Local Authentication</option>
                    <option value="saml">SAML 2.0</option>
                    <option value="oidc">OpenID Connect</option>
                    <option value="ldap">LDAP/Active Directory</option>
                    <option value="oauth2">OAuth 2.0</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Session Duration (hours)</label>
                  <input
                    type="number"
                    formControlName="sessionDurationHours"
                    min="1"
                    max="72"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="allowRememberMe"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Allow "Remember Me" option</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableSso"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable Single Sign-On (SSO)</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="requireEmailVerification"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Require email verification</span>
                  </label>
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">Multi-Factor Authentication</h4>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableTotp"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable TOTP (Google Authenticator)</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableSmsAuth"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable SMS authentication</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableEmailAuth"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable email authentication</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableBiometric"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable biometric authentication</span>
                  </label>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">MFA Grace Period (hours)</label>
                  <input
                    type="number"
                    formControlName="mfaGracePeriodHours"
                    min="0"
                    max="168"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                  <p class="mt-1 text-xs text-secondary-500">Time before MFA is required again</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email & Notifications -->
        <div *ngIf="activeSection() === 'notifications'" class="card">
          <div class="card-header">
            <h3 class="card-title">Email & Notification Settings</h3>
            <p class="card-subtitle">SMTP configuration and notification preferences</p>
          </div>
          <div formGroupName="notifications" class="space-y-6">
            <!-- SMTP Configuration -->
            <div>
              <h4 class="text-md font-medium text-secondary-900 mb-4">SMTP Configuration</h4>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">SMTP Server</label>
                    <input
                      type="text"
                      formControlName="smtpServer"
                      class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="smtp.company.com"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">SMTP Port</label>
                    <input
                      type="number"
                      formControlName="smtpPort"
                      class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="587"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">From Email</label>
                    <input
                      type="email"
                      formControlName="fromEmail"
                      class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="noreply@company.com"
                    >
                  </div>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">SMTP Username</label>
                    <input
                      type="text"
                      formControlName="smtpUsername"
                      class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">SMTP Password</label>
                    <input
                      type="password"
                      formControlName="smtpPassword"
                      class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                  </div>

                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        formControlName="smtpSsl"
                        class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      >
                      <span class="ml-2 text-sm text-secondary-700">Use SSL/TLS</span>
                    </label>

                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        formControlName="enableEmailNotifications"
                        class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      >
                      <span class="ml-2 text-sm text-secondary-700">Enable email notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notification Types -->
            <div class="border-t border-secondary-200 pt-6">
              <h4 class="text-md font-medium text-secondary-900 mb-4">Notification Types</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifyUserRegistration"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">User registration</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifyPasswordReset"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Password reset</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifyAccessRequests"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Access requests</span>
                  </label>
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifySecurityAlerts"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Security alerts</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifySystemMaintenance"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">System maintenance</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifyComplianceViolations"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Compliance violations</span>
                  </label>
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifyWorkflowUpdates"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Workflow updates</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifyIntegrationErrors"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Integration errors</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifyScheduledReports"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Scheduled reports</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- API Settings -->
        <div *ngIf="activeSection() === 'api'" class="card">
          <div class="card-header">
            <h3 class="card-title">API Configuration</h3>
            <p class="card-subtitle">REST API settings, rate limiting, and security</p>
          </div>
          <div formGroupName="api" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">General API Settings</h4>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">API Base URL</label>
                  <input
                    type="url"
                    formControlName="baseUrl"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://api.company.com/v1"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">API Version</label>
                  <input
                    type="text"
                    formControlName="version"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="v1.0"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Request Timeout (seconds)</label>
                  <input
                    type="number"
                    formControlName="timeoutSeconds"
                    min="5"
                    max="300"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableApiDocs"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable API documentation</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableCors"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable CORS</span>
                  </label>
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">Rate Limiting</h4>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Requests per minute (per IP)</label>
                  <input
                    type="number"
                    formControlName="rateLimitPerMinute"
                    min="10"
                    max="10000"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Requests per hour (per user)</label>
                  <input
                    type="number"
                    formControlName="rateLimitPerHour"
                    min="100"
                    max="100000"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Burst Limit</label>
                  <input
                    type="number"
                    formControlName="burstLimit"
                    min="5"
                    max="1000"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableRateLimiting"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable rate limiting</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableApiKeyAuth"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Require API key authentication</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Backup & Maintenance -->
        <div *ngIf="activeSection() === 'backup'" class="card">
          <div class="card-header">
            <h3 class="card-title">Backup & Maintenance</h3>
            <p class="card-subtitle">Data backup, retention policies, and maintenance schedules</p>
          </div>
          <div formGroupName="backup" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">Backup Configuration</h4>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Backup Frequency</label>
                  <select 
                    formControlName="backupFrequency"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Retention Period (days)</label>
                  <input
                    type="number"
                    formControlName="retentionDays"
                    min="7"
                    max="2555"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Backup Storage Location</label>
                  <input
                    type="text"
                    formControlName="storageLocation"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="/backups or s3://bucket-name"
                  >
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableBackups"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable automatic backups</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="compressBackups"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Compress backup files</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="encryptBackups"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Encrypt backup files</span>
                  </label>
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">Maintenance Windows</h4>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Maintenance Day</label>
                  <select 
                    formControlName="maintenanceDay"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Maintenance Time</label>
                  <input
                    type="time"
                    formControlName="maintenanceTime"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Maintenance Duration (hours)</label>
                  <input
                    type="number"
                    formControlName="maintenanceDurationHours"
                    min="1"
                    max="8"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableMaintenanceMode"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable maintenance mode during windows</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="notifyUsersBeforeMaintenance"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Notify users before maintenance</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Logging & Monitoring -->
        <div *ngIf="activeSection() === 'logging'" class="card">
          <div class="card-header">
            <h3 class="card-title">Logging & Monitoring</h3>
            <p class="card-subtitle">System logs, performance monitoring, and alerting</p>
          </div>
          <div formGroupName="logging" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">Logging Configuration</h4>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Log Level</label>
                  <select 
                    formControlName="logLevel"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="error">ERROR</option>
                    <option value="warn">WARN</option>
                    <option value="info">INFO</option>
                    <option value="debug">DEBUG</option>
                    <option value="trace">TRACE</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Log Retention (days)</label>
                  <input
                    type="number"
                    formControlName="logRetentionDays"
                    min="7"
                    max="365"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Max Log File Size (MB)</label>
                  <input
                    type="number"
                    formControlName="maxLogFileSizeMb"
                    min="10"
                    max="1000"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableFileLogging"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable file logging</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableDatabaseLogging"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable database logging</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableRemoteLogging"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable remote logging (syslog)</span>
                  </label>
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="text-md font-medium text-secondary-900">Performance Monitoring</h4>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Metrics Collection Interval (seconds)</label>
                  <input
                    type="number"
                    formControlName="metricsInterval"
                    min="10"
                    max="300"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Performance Threshold (%)</label>
                  <input
                    type="number"
                    formControlName="performanceThreshold"
                    min="50"
                    max="95"
                    class="block w-full border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>

                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enablePerformanceMonitoring"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable performance monitoring</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableHealthChecks"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable health checks</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableAlerting"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Enable alerting</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Flags -->
        <div *ngIf="activeSection() === 'features'" class="card">
          <div class="card-header">
            <h3 class="card-title">Feature Flags & Toggles</h3>
            <p class="card-subtitle">Enable or disable system features and experimental functionality</p>
          </div>
          <div formGroupName="features" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="space-y-3">
                <h4 class="text-md font-medium text-secondary-900">Core Features</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableUserProvisioning"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">User Provisioning</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableAccessRequests"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Access Requests</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableApprovalWorkflows"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Approval Workflows</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableAuditTrails"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Audit Trails</span>
                  </label>
                </div>
              </div>

              <div class="space-y-3">
                <h4 class="text-md font-medium text-secondary-900">Advanced Features</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableRiskAnalysis"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Risk Analysis</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableMachineLearning"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Machine Learning</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableAdvancedReporting"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Advanced Reporting</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableAutoRemediation"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Auto Remediation</span>
                  </label>
                </div>
              </div>

              <div class="space-y-3">
                <h4 class="text-md font-medium text-secondary-900">Experimental</h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableBetaFeatures"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Beta Features</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableExperimentalUi"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">Experimental UI</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableNewWorkflowEngine"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">New Workflow Engine</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      formControlName="enableAiAssistant"
                      class="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                    <span class="ml-2 text-sm text-secondary-700">AI Assistant</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Configuration Test Modal -->
      <div 
        *ngIf="showTestModal()"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeTestModal()"
      >
        <div 
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full"
          (click)="$event.stopPropagation()"
        >
          <div class="px-6 py-4 border-b border-secondary-200">
            <h3 class="text-lg font-medium text-secondary-900">Test Configuration</h3>
          </div>
          
          <div class="px-6 py-4">
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-secondary-900">Configuration Test</h4>
                  <p class="text-sm text-secondary-600">Testing system configuration settings...</p>
                </div>
              </div>
              
              <div class="bg-secondary-50 rounded-lg p-4">
                <h5 class="text-sm font-medium text-secondary-900 mb-2">Test Results</h5>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-secondary-700">SMTP Connection</span>
                    <span class="text-sm text-success-600">✓ Success</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-secondary-700">Database Connection</span>
                    <span class="text-sm text-success-600">✓ Success</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-secondary-700">Authentication Service</span>
                    <span class="text-sm text-success-600">✓ Success</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-secondary-700">API Endpoints</span>
                    <span class="text-sm text-success-600">✓ Success</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-secondary-200 flex justify-end">
            <button (click)="closeTestModal()" class="btn-primary">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SystemConfigurationComponent implements OnInit {
  configForm!: FormGroup;
  activeSection = signal<string>('general');
  isSaving = signal(false);
  isExporting = signal(false);
  notification = signal<NotificationResult | null>(null);
  showTestModal = signal(false);

  configurationSections = signal<ConfigurationSection[]>([
    {
      id: 'general',
      title: 'General',
      description: 'Basic system settings',
      icon: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      category: ConfigCategory.General,
      enabled: true,
      hasChanges: false
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Security policies and encryption',
      icon: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      category: ConfigCategory.Security,
      enabled: true,
      hasChanges: false
    },
    {
      id: 'authentication',
      title: 'Authentication',
      description: 'SSO and identity providers',
      icon: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
      category: ConfigCategory.Authentication,
      enabled: true,
      hasChanges: false
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email and alerts',
      icon: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      category: ConfigCategory.Notifications,
      enabled: true,
      hasChanges: false
    },
    {
      id: 'api',
      title: 'API',
      description: 'REST API and rate limiting',
      icon: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      category: ConfigCategory.Api,
      enabled: true,
      hasChanges: false
    },
    {
      id: 'backup',
      title: 'Backup',
      description: 'Data backup and maintenance',
      icon: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
      category: ConfigCategory.Backup,
      enabled: true,
      hasChanges: false
    },
    {
      id: 'logging',
      title: 'Logging',
      description: 'System logs and monitoring',
      icon: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      category: ConfigCategory.Logging,
      enabled: true,
      hasChanges: false
    },
    {
      id: 'features',
      title: 'Features',
      description: 'Feature flags and toggles',
      icon: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 011.5-1.937c1.808-.377 3.694-.377 5.502 0A2 2 0 0111 5v4.09c.448-.02.896-.035 1.342-.05L11.35 7.5A2 2 0 0112.862 6h5.276a2 2 0 011.512 3.3l-1.553 1.773 1.553 1.773A2 2 0 0117.138 16h-5.276a2 2 0 01-1.512-1.5L11.342 12.96c-.446-.015-.894-.03-1.342-.05V17a4 4 0 01-4 4z',
      category: ConfigCategory.FeatureFlags,
      enabled: true,
      hasChanges: false
    }
  ]);

  constructor(
    private fb: FormBuilder,
    private adminService: SystemAdminService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadConfiguration();
    
    // Setup form change detection
    this.configForm.valueChanges.subscribe(() => {
      this.updateSectionChanges();
    });
  }

  private initializeForm(): void {
    this.configForm = this.fb.group({
      general: this.fb.group({
        systemName: ['ELAM Production System'],
        systemDescription: ['Enterprise Lifecycle and Access Management System'],
        organizationName: ['Acme Corporation'],
        contactEmail: ['admin@company.com'],
        systemUrl: ['https://elam.company.com'],
        defaultTimezone: ['UTC'],
        defaultLanguage: ['en'],
        maintenanceMode: [false],
        debugMode: [false],
        analyticsEnabled: [true]
      }),
      security: this.fb.group({
        minPasswordLength: [12],
        passwordExpiryDays: [90],
        requireUppercase: [true],
        requireLowercase: [true],
        requireNumbers: [true],
        requireSpecialChars: [true],
        maxLoginAttempts: [5],
        lockoutDurationMinutes: [30],
        idleTimeoutMinutes: [60],
        enforceIpWhitelist: [false],
        requireMfa: [true],
        auditLogging: [true],
        encryptionAlgorithm: ['AES-256'],
        keyRotationDays: [90]
      }),
      authentication: this.fb.group({
        defaultAuthMethod: ['saml'],
        sessionDurationHours: [8],
        allowRememberMe: [true],
        enableSso: [true],
        requireEmailVerification: [true],
        enableTotp: [true],
        enableSmsAuth: [false],
        enableEmailAuth: [true],
        enableBiometric: [false],
        mfaGracePeriodHours: [24]
      }),
      notifications: this.fb.group({
        smtpServer: [''],
        smtpPort: [587],
        smtpUsername: [''],
        smtpPassword: [''],
        fromEmail: ['noreply@company.com'],
        smtpSsl: [true],
        enableEmailNotifications: [true],
        notifyUserRegistration: [true],
        notifyPasswordReset: [true],
        notifyAccessRequests: [true],
        notifySecurityAlerts: [true],
        notifySystemMaintenance: [true],
        notifyComplianceViolations: [true],
        notifyWorkflowUpdates: [true],
        notifyIntegrationErrors: [true],
        notifyScheduledReports: [true]
      }),
      api: this.fb.group({
        baseUrl: ['https://api.company.com/v1'],
        version: ['v1.0'],
        timeoutSeconds: [30],
        enableApiDocs: [true],
        enableCors: [true],
        rateLimitPerMinute: [100],
        rateLimitPerHour: [1000],
        burstLimit: [20],
        enableRateLimiting: [true],
        enableApiKeyAuth: [true]
      }),
      backup: this.fb.group({
        enableBackups: [true],
        backupFrequency: ['daily'],
        retentionDays: [90],
        storageLocation: ['/backups'],
        compressBackups: [true],
        encryptBackups: [true],
        maintenanceDay: ['sunday'],
        maintenanceTime: ['02:00'],
        maintenanceDurationHours: [2],
        enableMaintenanceMode: [true],
        notifyUsersBeforeMaintenance: [true]
      }),
      logging: this.fb.group({
        logLevel: ['info'],
        logRetentionDays: [90],
        maxLogFileSizeMb: [100],
        enableFileLogging: [true],
        enableDatabaseLogging: [true],
        enableRemoteLogging: [false],
        metricsInterval: [60],
        performanceThreshold: [80],
        enablePerformanceMonitoring: [true],
        enableHealthChecks: [true],
        enableAlerting: [true]
      }),
      features: this.fb.group({
        enableUserProvisioning: [true],
        enableAccessRequests: [true],
        enableApprovalWorkflows: [true],
        enableAuditTrails: [true],
        enableRiskAnalysis: [true],
        enableMachineLearning: [false],
        enableAdvancedReporting: [true],
        enableAutoRemediation: [false],
        enableBetaFeatures: [false],
        enableExperimentalUi: [false],
        enableNewWorkflowEngine: [false],
        enableAiAssistant: [false]
      })
    });
  }

  private loadConfiguration(): void {
    this.adminService.getSystemConfiguration().subscribe(config => {
      if (config) {
        this.configForm.patchValue(config.settings);
      }
    });
  }

  private updateSectionChanges(): void {
    // Mark sections as having changes
    const sections = this.configurationSections();
    sections.forEach(section => {
      const sectionForm = this.configForm.get(section.id);
      section.hasChanges = sectionForm ? sectionForm.dirty : false;
    });
    this.configurationSections.set([...sections]);
  }

  // Section management
  setActiveSection(sectionId: string): void {
    this.activeSection.set(sectionId);
  }

  hasUnsavedChanges(): boolean {
    return this.configForm.dirty;
  }

  // Actions
  saveAllConfiguration(): void {
    if (!this.configForm.valid) return;

    this.isSaving.set(true);
    const configData = this.configForm.value;

    this.adminService.updateSystemConfiguration(configData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.configForm.markAsPristine();
        this.showNotification('success', 'Configuration saved successfully', 'All system settings have been updated.');
        this.updateSectionChanges();
      },
      error: (error) => {
        this.isSaving.set(false);
        this.showNotification('error', 'Failed to save configuration', error.message);
      }
    });
  }

  exportConfiguration(): void {
    this.isExporting.set(true);
    this.adminService.exportSystemConfiguration().subscribe({
      next: (configData) => {
        this.isExporting.set(false);
        this.downloadConfigFile(configData);
        this.showNotification('success', 'Configuration exported successfully');
      },
      error: (error) => {
        this.isExporting.set(false);
        this.showNotification('error', 'Failed to export configuration', error.message);
      }
    });
  }

  importConfiguration(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const configData = JSON.parse(e.target.result);
            this.configForm.patchValue(configData);
            this.showNotification('success', 'Configuration imported successfully', 'Please review and save the imported settings.');
          } catch (error) {
            this.showNotification('error', 'Failed to import configuration', 'Invalid configuration file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  private downloadConfigFile(configData: any): void {
    const dataStr = JSON.stringify(configData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elam-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  testConfiguration(): void {
    this.showTestModal.set(true);
  }

  closeTestModal(): void {
    this.showTestModal.set(false);
  }

  // Notification management
  private showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string, details?: string): void {
    this.notification.set({ type, message, details });
    setTimeout(() => this.clearNotification(), 5000);
  }

  clearNotification(): void {
    this.notification.set(null);
  }

  // Styling helper methods
  getSectionButtonClass(section: ConfigurationSection): string {
    const baseClass = 'flex flex-col items-center p-4 rounded-lg text-sm font-medium transition-colors';
    const isActive = this.activeSection() === section.id;
    
    if (isActive) {
      return `${baseClass} bg-primary-100 text-primary-800 border border-primary-200`;
    } else if (section.hasChanges) {
      return `${baseClass} bg-warning-50 text-warning-700 border border-warning-200 hover:bg-warning-100`;
    } else {
      return `${baseClass} bg-white text-secondary-600 border border-secondary-200 hover:bg-secondary-50`;
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-success-50 text-success-800 border border-success-200';
      case 'error': return 'bg-danger-50 text-danger-800 border border-danger-200';
      case 'warning': return 'bg-warning-50 text-warning-800 border border-warning-200';
      case 'info': return 'bg-blue-50 text-blue-800 border border-blue-200';
      default: return 'bg-secondary-50 text-secondary-800 border border-secondary-200';
    }
  }
}
