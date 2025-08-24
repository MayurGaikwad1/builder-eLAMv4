import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  SystemRole,
  Permission,
  Policy,
  SystemIntegration,
  SystemConfiguration,
  WorkflowDefinition,
  AdminAnalytics,
  SystemHealth,
  UserMetrics,
  IntegrationMetrics,
  WorkflowMetrics,
  SecurityMetrics,
  AdminComplianceMetrics,
  RoleType,
  ActionType,
  ActionScope,
  ConditionType,
  ConditionOperator,
  PolicyType,
  PolicyCategory,
  EnforcementLevel,
  PolicyConditionType,
  PolicyActionType,
  IntegrationType,
  IntegrationCategory,
  IntegrationStatus,
  AuthenticationType,
  DataType,
  ConfigCategory,
  WorkflowCategory,
  WorkflowType,
  StageType,
  TriggerType,
  SystemStatus,
  LogLevel,
  AlertSeverity
} from '../interfaces/system-admin.interface';
import { RiskLevel, UrgencyLevel } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class SystemAdminService {
  private rolesSubject = new BehaviorSubject<SystemRole[]>([]);
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  private policiesSubject = new BehaviorSubject<Policy[]>([]);
  private integrationsSubject = new BehaviorSubject<SystemIntegration[]>([]);
  private configurationsSubject = new BehaviorSubject<SystemConfiguration[]>([]);
  private workflowsSubject = new BehaviorSubject<WorkflowDefinition[]>([]);
  private analyticsSubject = new BehaviorSubject<AdminAnalytics>({} as AdminAnalytics);

  constructor() {
    this.initializeMockData();
  }

  // Role Management
  getRoles(): Observable<SystemRole[]> {
    return this.rolesSubject.asObservable();
  }

  getPermissions(): Observable<Permission[]> {
    return this.permissionsSubject.asObservable();
  }

  createRole(role: Partial<SystemRole>): Observable<SystemRole> {
    const newRole: SystemRole = {
      id: `role-${Date.now()}`,
      name: role.name || '',
      displayName: role.displayName || '',
      description: role.description || '',
      type: role.type || RoleType.Custom,
      isBuiltIn: false,
      isActive: true,
      permissions: role.permissions || [],
      constraints: role.constraints || [],
      inheritedRoles: role.inheritedRoles || [],
      assignedUsers: 0,
      riskLevel: role.riskLevel || RiskLevel.Low,
      lastModified: new Date(),
      modifiedBy: 'current-user',
      createdAt: new Date(),
      createdBy: 'current-user'
    };

    const roles = this.rolesSubject.value;
    this.rolesSubject.next([...roles, newRole]);
    
    return of(newRole).pipe(delay(300));
  }

  updateRole(id: string, updates: Partial<SystemRole>): Observable<SystemRole> {
    const roles = this.rolesSubject.value;
    const roleIndex = roles.findIndex(r => r.id === id);
    
    if (roleIndex !== -1) {
      const updatedRole = {
        ...roles[roleIndex],
        ...updates,
        lastModified: new Date(),
        modifiedBy: 'current-user'
      };
      
      roles[roleIndex] = updatedRole;
      this.rolesSubject.next([...roles]);
      
      return of(updatedRole).pipe(delay(300));
    }
    
    throw new Error('Role not found');
  }

  deleteRole(id: string): Observable<boolean> {
    const roles = this.rolesSubject.value;
    const filteredRoles = roles.filter(r => r.id !== id);
    this.rolesSubject.next(filteredRoles);
    
    return of(true).pipe(delay(300));
  }

  // Policy Management
  getPolicies(): Observable<Policy[]> {
    return this.policiesSubject.asObservable();
  }

  createPolicy(policy: Partial<Policy>): Observable<Policy> {
    const newPolicy: Policy = {
      id: `policy-${Date.now()}`,
      name: policy.name || '',
      displayName: policy.displayName || '',
      description: policy.description || '',
      type: policy.type || PolicyType.Access,
      category: policy.category || PolicyCategory.Authorization,
      enforcement: policy.enforcement || EnforcementLevel.Warning,
      isActive: true,
      conditions: policy.conditions || [],
      actions: policy.actions || [],
      exceptions: policy.exceptions || [],
      compliance: policy.compliance || [],
      version: '1.0',
      effectiveDate: new Date(),
      lastModified: new Date(),
      modifiedBy: 'current-user'
    };

    const policies = this.policiesSubject.value;
    this.policiesSubject.next([...policies, newPolicy]);
    
    return of(newPolicy).pipe(delay(300));
  }

  updatePolicy(id: string, updates: Partial<Policy>): Observable<Policy> {
    const policies = this.policiesSubject.value;
    const policyIndex = policies.findIndex(p => p.id === id);
    
    if (policyIndex !== -1) {
      const updatedPolicy = {
        ...policies[policyIndex],
        ...updates,
        lastModified: new Date(),
        modifiedBy: 'current-user'
      };
      
      policies[policyIndex] = updatedPolicy;
      this.policiesSubject.next([...policies]);
      
      return of(updatedPolicy).pipe(delay(300));
    }
    
    throw new Error('Policy not found');
  }

  // Integration Management
  getIntegrations(): Observable<SystemIntegration[]> {
    return this.integrationsSubject.asObservable();
  }


  testIntegrationConnection(id: string): Observable<boolean> {
    // Simulate connection test
    return of(Math.random() > 0.2).pipe(delay(2000));
  }

  syncIntegrationData(id: string): Observable<any> {
    // Simulate data sync
    return of({
      recordsProcessed: Math.floor(Math.random() * 1000) + 100,
      errors: Math.floor(Math.random() * 10),
      duration: Math.floor(Math.random() * 30) + 5
    }).pipe(delay(3000));
  }

  getIntegration(id: string): Observable<SystemIntegration | null> {
    const integrations = this.integrationsSubject.value;
    const integration = integrations.find(i => i.id === id);
    return of(integration || null).pipe(delay(500));
  }

  testIntegrationConfiguration(configData: any): Observable<any> {
    // Simulate configuration test
    return of({
      success: Math.random() > 0.3, // 70% success rate for demo
      message: Math.random() > 0.3 ? 'Connection successful' : 'Connection failed: Invalid credentials',
      details: Math.random() > 0.3 ? 'All configuration parameters validated successfully' : 'Authentication failed at endpoint verification'
    }).pipe(delay(2000));
  }

  createIntegration(integrationData: any): Observable<SystemIntegration> {
    const newIntegration: SystemIntegration = {
      id: `int-${Date.now()}`,
      name: integrationData.name,
      displayName: integrationData.displayName,
      description: integrationData.description,
      type: integrationData.type,
      category: integrationData.category,
      vendor: integrationData.vendor,
      version: integrationData.version || '1.0.0',
      status: integrationData.isActive ? IntegrationStatus.Active : IntegrationStatus.Inactive,
      isEnabled: integrationData.isActive,
      configuration: {
        endpoint: integrationData.configuration.endpoint,
        protocol: integrationData.configuration.protocol,
        port: integrationData.configuration.port,
        connectionString: integrationData.configuration.connectionString,
        timeout: integrationData.configuration.timeout || 30,
        retryAttempts: integrationData.configuration.retryAttempts || 3,
        batchSize: integrationData.configuration.batchSize || 100,
        syncInterval: integrationData.configuration.syncInterval || 3600,
        customSettings: integrationData.configuration.customSettings || {}
      },
      authentication: {
        type: integrationData.authentication.type,
        credentials: {}, // Don't store sensitive data in mock
        tokenExpiry: 3600,
        refreshToken: false
      },
      dataMappings: integrationData.dataMappings || [],
      healthCheck: {
        enabled: integrationData.healthCheck.enabled || false,
        interval: integrationData.healthCheck.interval || 300,
        timeout: integrationData.healthCheck.timeout || 30,
        checks: integrationData.healthCheck.checks || []
      },
      monitoring: {
        enabled: integrationData.monitoring.enabled || false,
        metricsCollection: integrationData.monitoring.metricsCollection || false,
        logLevel: integrationData.monitoring.logLevel || LogLevel.Info,
        alerting: {
          enabled: integrationData.monitoring.alerting.enabled || false,
          channels: integrationData.monitoring.alerting.channels || [],
          thresholds: integrationData.monitoring.alerting.thresholds || [],
          escalation: integrationData.monitoring.alerting.escalation || []
        }
      },
      lastSync: null,
      lastHealthCheck: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
      modifiedBy: 'system-admin'
    };

    // Add to the subject
    const currentIntegrations = this.integrationsSubject.value;
    this.integrationsSubject.next([...currentIntegrations, newIntegration]);

    return of(newIntegration).pipe(delay(1000));
  }

  updateIntegration(id: string, integrationData: any): Observable<SystemIntegration> {
    const currentIntegrations = this.integrationsSubject.value;
    const index = currentIntegrations.findIndex(i => i.id === id);

    if (index === -1) {
      throw new Error('Integration not found');
    }

    const updatedIntegration: SystemIntegration = {
      ...currentIntegrations[index],
      name: integrationData.name,
      displayName: integrationData.displayName,
      description: integrationData.description,
      type: integrationData.type,
      category: integrationData.category,
      vendor: integrationData.vendor,
      version: integrationData.version,
      status: integrationData.isActive ? IntegrationStatus.Active : IntegrationStatus.Inactive,
      isEnabled: integrationData.isActive,
      configuration: {
        ...currentIntegrations[index].configuration,
        ...integrationData.configuration
      },
      authentication: {
        ...currentIntegrations[index].authentication,
        type: integrationData.authentication.type
      },
      dataMappings: integrationData.dataMappings || [],
      healthCheck: {
        ...currentIntegrations[index].healthCheck,
        ...integrationData.healthCheck
      },
      monitoring: {
        ...currentIntegrations[index].monitoring,
        ...integrationData.monitoring
      },
      modifiedAt: new Date(),
      modifiedBy: 'system-admin'
    };

    currentIntegrations[index] = updatedIntegration;
    this.integrationsSubject.next([...currentIntegrations]);

    return of(updatedIntegration).pipe(delay(1000));
  }

  // System Configuration
  getConfigurations(): Observable<SystemConfiguration[]> {
    return this.configurationsSubject.asObservable();
  }

  updateConfiguration(category: ConfigCategory, settings: any): Observable<SystemConfiguration> {
    const configurations = this.configurationsSubject.value;
    const configIndex = configurations.findIndex(c => c.category === category);
    
    if (configIndex !== -1) {
      const updatedConfig = {
        ...configurations[configIndex],
        settings: settings,
        lastModified: new Date(),
        modifiedBy: 'current-user'
      };
      
      configurations[configIndex] = updatedConfig;
      this.configurationsSubject.next([...configurations]);
      
      return of(updatedConfig).pipe(delay(300));
    }
    
    throw new Error('Configuration not found');
  }

  // Workflow Management
  getWorkflows(): Observable<WorkflowDefinition[]> {
    return this.workflowsSubject.asObservable();
  }

  createWorkflow(workflow: Partial<WorkflowDefinition>): Observable<WorkflowDefinition> {
    const newWorkflow: WorkflowDefinition = {
      id: `workflow-${Date.now()}`,
      name: workflow.name || '',
      displayName: workflow.displayName || '',
      description: workflow.description || '',
      category: workflow.category || WorkflowCategory.AccessManagement,
      type: workflow.type || WorkflowType.Sequential,
      isActive: true,
      version: '1.0',
      stages: workflow.stages || [],
      triggers: workflow.triggers || [],
      variables: workflow.variables || [],
      slaSettings: workflow.slaSettings || {
        enabled: false,
        overallSLA: 48,
        stageSLAs: [],
        escalationEnabled: false,
        warningThreshold: 80
      },
      escalationRules: workflow.escalationRules || [],
      metadata: workflow.metadata || {
        tags: [],
        documentation: '',
        changeLog: [],
        dependencies: [],
        testing: {
          enabled: false,
          testCases: [],
          automatedTesting: false
        }
      },
      createdAt: new Date(),
      createdBy: 'current-user',
      lastModified: new Date(),
      modifiedBy: 'current-user'
    };

    const workflows = this.workflowsSubject.value;
    this.workflowsSubject.next([...workflows, newWorkflow]);
    
    return of(newWorkflow).pipe(delay(500));
  }

  testWorkflow(id: string, testData: any): Observable<any> {
    // Simulate workflow testing
    return of({
      success: Math.random() > 0.1,
      executionTime: Math.floor(Math.random() * 5000) + 1000,
      stagesCompleted: Math.floor(Math.random() * 5) + 1,
      errors: Math.random() > 0.8 ? ['Sample error message'] : []
    }).pipe(delay(2000));
  }

  // Analytics
  getAnalytics(): Observable<AdminAnalytics> {
    return this.analyticsSubject.asObservable();
  }

  // System Configuration Management
  getSystemConfiguration(): Observable<SystemConfiguration | null> {
    // Return mock configuration data
    const mockConfig: SystemConfiguration = {
      id: 'config-001',
      name: 'Production Configuration',
      description: 'Production environment system configuration',
      category: ConfigCategory.Performance,
      settings: [],
      lastModified: new Date(),
      modifiedBy: 'system-admin',
      version: '1.0.0'
    };

    return of(mockConfig).pipe(delay(500));
  }

  updateSystemConfiguration(configData: any): Observable<SystemConfiguration> {
    // Simulate configuration update
    const updatedConfig: SystemConfiguration = {
      id: 'config-001',
      category: ConfigCategory.Performance,
      settings: [],
      lastModified: new Date(),
      modifiedBy: 'system-admin',
      version: '1.0.1'
    };

    return of(updatedConfig).pipe(delay(1000));
  }

  exportSystemConfiguration(): Observable<any> {
    // Return configuration data for export
    return this.getSystemConfiguration().pipe(
      map(config => config?.settings || {}),
      delay(1500)
    );
  }

  // Helper methods
  searchRoles(query: string): Observable<SystemRole[]> {
    return this.rolesSubject.pipe(
      map(roles => roles.filter(role =>
        role.name.toLowerCase().includes(query.toLowerCase()) ||
        role.displayName.toLowerCase().includes(query.toLowerCase()) ||
        role.description.toLowerCase().includes(query.toLowerCase())
      )),
      delay(300)
    );
  }

  searchPolicies(query: string): Observable<Policy[]> {
    return this.policiesSubject.pipe(
      map(policies => policies.filter(policy =>
        policy.name.toLowerCase().includes(query.toLowerCase()) ||
        policy.displayName.toLowerCase().includes(query.toLowerCase()) ||
        policy.description.toLowerCase().includes(query.toLowerCase())
      )),
      delay(300)
    );
  }

  searchIntegrations(query: string): Observable<SystemIntegration[]> {
    return this.integrationsSubject.pipe(
      map(integrations => integrations.filter(integration =>
        integration.name.toLowerCase().includes(query.toLowerCase()) ||
        integration.displayName.toLowerCase().includes(query.toLowerCase()) ||
        integration.vendor.toLowerCase().includes(query.toLowerCase())
      )),
      delay(300)
    );
  }

  private initializeMockData(): void {
    // Initialize Permissions
    const mockPermissions: Permission[] = [
      {
        id: 'perm-001',
        name: 'user.read',
        displayName: 'Read Users',
        description: 'View user profiles and information',
        resource: 'users',
        actions: [
          {
            action: ActionType.Read,
            scope: ActionScope.Organization,
            restrictions: []
          }
        ],
        conditions: [],
        isActive: true,
        riskScore: 15
      },
      {
        id: 'perm-002',
        name: 'user.create',
        displayName: 'Create Users',
        description: 'Create new user accounts',
        resource: 'users',
        actions: [
          {
            action: ActionType.Create,
            scope: ActionScope.Department,
            restrictions: ['requires_approval']
          }
        ],
        conditions: [
          {
            type: ConditionType.Time,
            operator: ConditionOperator.Between,
            value: ['09:00', '17:00'],
            description: 'Only during business hours'
          }
        ],
        isActive: true,
        riskScore: 65
      },
      {
        id: 'perm-003',
        name: 'admin.full',
        displayName: 'Full Administrative Access',
        description: 'Complete system administration privileges',
        resource: '*',
        actions: [
          {
            action: ActionType.Create,
            scope: ActionScope.System,
            restrictions: []
          },
          {
            action: ActionType.Read,
            scope: ActionScope.System,
            restrictions: []
          },
          {
            action: ActionType.Update,
            scope: ActionScope.System,
            restrictions: []
          },
          {
            action: ActionType.Delete,
            scope: ActionScope.System,
            restrictions: []
          }
        ],
        conditions: [],
        isActive: true,
        riskScore: 95
      }
    ];

    // Initialize Roles
    const mockRoles: SystemRole[] = [
      {
        id: 'role-001',
        name: 'system_admin',
        displayName: 'System Administrator',
        description: 'Full system administration privileges',
        type: RoleType.System,
        isBuiltIn: true,
        isActive: true,
        permissions: [mockPermissions[2]],
        constraints: [
          {
            type: 'concurrency' as any,
            value: 1,
            description: 'Only one concurrent session allowed',
            isActive: true
          }
        ],
        inheritedRoles: [],
        assignedUsers: 3,
        riskLevel: RiskLevel.Critical,
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        modifiedBy: 'system',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        createdBy: 'system'
      },
      {
        id: 'role-002',
        name: 'user_manager',
        displayName: 'User Manager',
        description: 'Manage user accounts and basic administration',
        type: RoleType.Business,
        isBuiltIn: false,
        isActive: true,
        permissions: [mockPermissions[0], mockPermissions[1]],
        constraints: [],
        inheritedRoles: [],
        assignedUsers: 12,
        riskLevel: RiskLevel.Medium,
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        modifiedBy: 'admin-001',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        createdBy: 'admin-001'
      },
      {
        id: 'role-003',
        name: 'readonly_auditor',
        displayName: 'Read-Only Auditor',
        description: 'Read-only access for audit and compliance purposes',
        type: RoleType.Custom,
        isBuiltIn: false,
        isActive: true,
        permissions: [mockPermissions[0]],
        constraints: [
          {
            type: 'time' as any,
            value: { start: '08:00', end: '18:00' },
            description: 'Access restricted to business hours',
            isActive: true
          }
        ],
        inheritedRoles: [],
        assignedUsers: 5,
        riskLevel: RiskLevel.Low,
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        modifiedBy: 'admin-001',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'admin-001'
      }
    ];

    // Initialize Policies
    const mockPolicies: Policy[] = [
      {
        id: 'policy-001',
        name: 'password_policy',
        displayName: 'Password Security Policy',
        description: 'Enforces strong password requirements across the organization',
        type: PolicyType.Security,
        category: PolicyCategory.Authentication,
        enforcement: EnforcementLevel.Blocking,
        isActive: true,
        conditions: [
          {
            id: 'cond-001',
            type: PolicyConditionType.User,
            field: 'password',
            operator: ConditionOperator.Contains,
            value: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$'
          }
        ],
        actions: [
          {
            type: PolicyActionType.Require,
            parameters: { minLength: 12, complexity: true },
            priority: 1,
            isBlocking: true
          }
        ],
        exceptions: [],
        compliance: [
          {
            framework: 'ISO 27001',
            requirement: 'A.9.4.3',
            description: 'Password management system',
            mandatory: true
          }
        ],
        version: '2.1',
        effectiveDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        modifiedBy: 'security-admin',
        approvedBy: 'ciso',
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'policy-002',
        name: 'access_review_policy',
        displayName: 'Quarterly Access Review Policy',
        description: 'Mandates quarterly review of user access rights',
        type: PolicyType.Compliance,
        category: PolicyCategory.Authorization,
        enforcement: EnforcementLevel.Warning,
        isActive: true,
        conditions: [
          {
            id: 'cond-002',
            type: PolicyConditionType.Time,
            field: 'lastReview',
            operator: ConditionOperator.GreaterThan,
            value: 90
          }
        ],
        actions: [
          {
            type: PolicyActionType.Alert,
            parameters: { recipients: ['managers'], template: 'access_review_due' },
            priority: 2,
            isBlocking: false
          }
        ],
        exceptions: [],
        compliance: [
          {
            framework: 'SOX',
            requirement: 'Section 404',
            description: 'Internal controls over financial reporting',
            mandatory: true
          }
        ],
        version: '1.0',
        effectiveDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        modifiedBy: 'compliance-officer'
      }
    ];

    // Initialize Integrations
    const mockIntegrations: SystemIntegration[] = [
      {
        id: 'int-001',
        name: 'active_directory',
        displayName: 'Active Directory',
        description: 'Microsoft Active Directory integration for user synchronization',
        type: IntegrationType.Directory,
        category: IntegrationCategory.UserProvisioning,
        vendor: 'Microsoft',
        version: '2019',
        status: IntegrationStatus.Active,
        isEnabled: true,
        configuration: {
          endpoint: 'ldaps://dc.company.com:636',
          port: 636,
          protocol: 'LDAPS',
          timeout: 30000,
          retryAttempts: 3,
          batchSize: 100,
          syncInterval: 3600,
          customSettings: {
            searchBase: 'OU=Users,DC=company,DC=com',
            userFilter: '(&(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))'
          }
        },
        authentication: {
          type: AuthenticationType.Basic,
          credentials: {
            username: 'service-account@company.com',
            password: '***encrypted***'
          }
        },
        dataMappings: [
          {
            id: 'map-001',
            sourceField: 'sAMAccountName',
            targetField: 'username',
            dataType: DataType.String,
            isRequired: true
          },
          {
            id: 'map-002',
            sourceField: 'mail',
            targetField: 'email',
            dataType: DataType.Email,
            isRequired: true
          }
        ],
        healthCheck: {
          enabled: true,
          interval: 300,
          timeout: 30,
          endpoint: 'ldaps://dc.company.com:636',
          checks: [
            {
              name: 'LDAP Connection',
              type: 'database' as any,
              parameters: { query: 'basic_bind' },
              alertOnFailure: true
            }
          ]
        },
        monitoring: {
          enabled: true,
          metricsCollection: true,
          logLevel: LogLevel.Info,
          alerting: {
            enabled: true,
            channels: [
              {
                type: 'email' as any,
                configuration: { recipients: ['admin@company.com'] },
                isActive: true
              }
            ],
            thresholds: [
              {
                metric: 'response_time',
                operator: 'greater_than' as any,
                value: 5000,
                severity: AlertSeverity.Warning
              }
            ],
            escalation: []
          },
          dashboard: {
            enabled: true,
            widgets: [],
            refreshInterval: 60
          }
        },
        lastSync: new Date(Date.now() - 30 * 60 * 1000),
        lastHealthCheck: new Date(Date.now() - 5 * 60 * 1000),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        modifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        modifiedBy: 'integration-admin'
      },
      {
        id: 'int-002',
        name: 'salesforce',
        displayName: 'Salesforce CRM',
        description: 'Salesforce integration for customer data synchronization',
        type: IntegrationType.Application,
        category: IntegrationCategory.DataSync,
        vendor: 'Salesforce',
        version: 'Spring 24',
        status: IntegrationStatus.Active,
        isEnabled: true,
        configuration: {
          endpoint: 'https://company.my.salesforce.com',
          protocol: 'HTTPS',
          timeout: 30000,
          retryAttempts: 3,
          batchSize: 200,
          syncInterval: 7200,
          customSettings: {
            apiVersion: '59.0',
            sobjectTypes: ['User', 'Account', 'Contact']
          }
        },
        authentication: {
          type: AuthenticationType.OAuth2,
          credentials: {
            clientId: 'sf_client_id',
            clientSecret: '***encrypted***',
            token: '***encrypted***'
          },
          tokenExpiry: 7200,
          refreshToken: true
        },
        dataMappings: [
          {
            id: 'map-003',
            sourceField: 'Username',
            targetField: 'email',
            dataType: DataType.Email,
            isRequired: true
          },
          {
            id: 'map-004',
            sourceField: 'IsActive',
            targetField: 'status',
            dataType: DataType.Boolean,
            isRequired: true
          }
        ],
        healthCheck: {
          enabled: true,
          interval: 600,
          timeout: 30,
          endpoint: 'https://company.my.salesforce.com/services/data/v59.0/',
          checks: [
            {
              name: 'API Health',
              type: 'http' as any,
              parameters: { method: 'GET', expectedStatus: 200 },
              alertOnFailure: true
            }
          ]
        },
        monitoring: {
          enabled: true,
          metricsCollection: true,
          logLevel: LogLevel.Info,
          alerting: {
            enabled: true,
            channels: [
              {
                type: 'email' as any,
                configuration: { recipients: ['admin@company.com'] },
                isActive: true
              }
            ],
            thresholds: [
              {
                metric: 'api_calls_remaining',
                operator: 'less_than' as any,
                value: 1000,
                severity: AlertSeverity.Warning
              }
            ],
            escalation: []
          },
          dashboard: {
            enabled: true,
            widgets: [],
            refreshInterval: 300
          }
        },
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastHealthCheck: new Date(Date.now() - 10 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        modifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        modifiedBy: 'integration-admin'
      },
      {
        id: 'int-003',
        name: 'okta',
        displayName: 'Okta Identity Provider',
        description: 'Okta SSO integration for federated authentication',
        type: IntegrationType.Identity,
        category: IntegrationCategory.Authentication,
        vendor: 'Okta',
        version: '2023.11',
        status: IntegrationStatus.Error,
        isEnabled: false,
        configuration: {
          endpoint: 'https://company.okta.com',
          protocol: 'HTTPS',
          timeout: 15000,
          retryAttempts: 2,
          customSettings: {
            domain: 'company.okta.com',
            orgUrl: 'https://company.okta.com'
          }
        },
        authentication: {
          type: AuthenticationType.ApiKey,
          credentials: {
            apiKey: '***encrypted***'
          }
        },
        dataMappings: [
          {
            id: 'map-005',
            sourceField: 'login',
            targetField: 'username',
            dataType: DataType.String,
            isRequired: true
          },
          {
            id: 'map-006',
            sourceField: 'status',
            targetField: 'accountStatus',
            dataType: DataType.String,
            isRequired: true
          }
        ],
        healthCheck: {
          enabled: true,
          interval: 300,
          timeout: 15,
          endpoint: 'https://company.okta.com/api/v1/users/me',
          checks: [
            {
              name: 'API Connectivity',
              type: 'http' as any,
              parameters: { method: 'GET', expectedStatus: 200 },
              alertOnFailure: true
            }
          ]
        },
        monitoring: {
          enabled: true,
          metricsCollection: true,
          logLevel: LogLevel.Warning,
          alerting: {
            enabled: true,
            channels: [
              {
                type: 'email' as any,
                configuration: { recipients: ['admin@company.com', 'security@company.com'] },
                isActive: true
              }
            ],
            thresholds: [
              {
                metric: 'error_rate',
                operator: 'greater_than' as any,
                value: 5,
                severity: AlertSeverity.Critical
              }
            ],
            escalation: []
          },
          dashboard: {
            enabled: true,
            widgets: [],
            refreshInterval: 60
          }
        },
        lastHealthCheck: new Date(Date.now() - 15 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        modifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        modifiedBy: 'integration-admin'
      }
    ];

    // Initialize Configurations
    const mockConfigurations: SystemConfiguration[] = [
      {
        id: 'config-security',
        category: ConfigCategory.Security,
        settings: [
          {
            key: 'session.timeout',
            value: 3600,
            dataType: DataType.Number,
            displayName: 'Session Timeout (seconds)',
            description: 'Automatic logout after inactivity',
            isReadOnly: false,
            isRequired: true,
            defaultValue: 3600,
            group: 'Session Management',
            order: 1,
            isSecure: false
          },
          {
            key: 'password.minLength',
            value: 12,
            dataType: DataType.Number,
            displayName: 'Minimum Password Length',
            description: 'Minimum number of characters required for passwords',
            isReadOnly: false,
            isRequired: true,
            defaultValue: 8,
            possibleValues: [8, 10, 12, 14, 16],
            group: 'Password Policy',
            order: 2,
            isSecure: false
          },
          {
            key: 'mfa.enabled',
            value: true,
            dataType: DataType.Boolean,
            displayName: 'Enable Multi-Factor Authentication',
            description: 'Require MFA for all user logins',
            isReadOnly: false,
            isRequired: true,
            defaultValue: false,
            group: 'Authentication',
            order: 3,
            isSecure: false
          }
        ],
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        modifiedBy: 'security-admin',
        version: '1.2'
      },
      {
        id: 'config-audit',
        category: ConfigCategory.Audit,
        settings: [
          {
            key: 'audit.retention',
            value: 2555,
            dataType: DataType.Number,
            displayName: 'Audit Log Retention (days)',
            description: 'Number of days to retain audit logs',
            isReadOnly: false,
            isRequired: true,
            defaultValue: 365,
            group: 'Log Management',
            order: 1,
            isSecure: false
          },
          {
            key: 'audit.realTimeAlerts',
            value: true,
            dataType: DataType.Boolean,
            displayName: 'Real-time Security Alerts',
            description: 'Send immediate alerts for security events',
            isReadOnly: false,
            isRequired: false,
            defaultValue: true,
            group: 'Alerting',
            order: 2,
            isSecure: false
          }
        ],
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        modifiedBy: 'audit-admin',
        version: '1.0'
      }
    ];

    // Initialize Workflows
    const mockWorkflows: WorkflowDefinition[] = [
      {
        id: 'workflow-001',
        name: 'user_onboarding',
        displayName: 'User Onboarding Workflow',
        description: 'Complete workflow for onboarding new employees',
        category: WorkflowCategory.UserLifecycle,
        type: WorkflowType.Sequential,
        isActive: true,
        version: '2.1',
        stages: [
          {
            id: 'stage-001',
            name: 'manager_approval',
            displayName: 'Manager Approval',
            type: StageType.Approval,
            order: 1,
            isRequired: true,
            conditions: [],
            actions: [],
            approvers: [
              {
                type: 'manager' as any,
                identifier: 'direct_manager',
                isRequired: true,
                weight: 1,
                conditions: []
              }
            ],
            timeouts: [
              {
                type: 'approval' as any,
                duration: 48,
                action: 'escalate' as any,
                warningBefore: 8
              }
            ],
            notifications: [],
            parallelExecution: false
          },
          {
            id: 'stage-002',
            name: 'hr_review',
            displayName: 'HR Review',
            type: StageType.Review,
            order: 2,
            isRequired: true,
            conditions: [],
            actions: [],
            approvers: [
              {
                type: 'role' as any,
                identifier: 'hr_representative',
                isRequired: true,
                weight: 1,
                conditions: []
              }
            ],
            timeouts: [],
            notifications: [],
            parallelExecution: false
          },
          {
            id: 'stage-003',
            name: 'account_creation',
            displayName: 'Account Creation',
            type: StageType.Execution,
            order: 3,
            isRequired: true,
            conditions: [],
            actions: [
              {
                type: ActionType.Create,
                parameters: { resource: 'user_account', template: 'standard_employee' },
                order: 1,
                isAsync: false
              }
            ],
            approvers: [],
            timeouts: [],
            notifications: [],
            parallelExecution: false
          }
        ],
        triggers: [
          {
            id: 'trigger-001',
            name: 'hr_system_request',
            type: TriggerType.Event,
            conditions: [
              {
                field: 'source',
                operator: ConditionOperator.Equals,
                value: 'hr_system'
              }
            ],
            isActive: true
          }
        ],
        variables: [
          {
            name: 'employee_type',
            dataType: DataType.String,
            defaultValue: 'full_time',
            isRequired: true,
            description: 'Type of employee (full_time, contractor, intern)',
            scope: 'workflow' as any
          }
        ],
        slaSettings: {
          enabled: true,
          overallSLA: 72,
          stageSLAs: [
            { stageId: 'stage-001', slaHours: 48, warningHours: 40, escalationHours: 48 },
            { stageId: 'stage-002', slaHours: 24, warningHours: 20, escalationHours: 24 }
          ],
          escalationEnabled: true,
          warningThreshold: 80
        },
        escalationRules: [
          {
            id: 'esc-001',
            stageId: 'stage-001',
            triggerAfter: 48,
            escalateTo: ['senior_manager'],
            actions: [
              {
                type: 'notify' as any,
                parameters: { template: 'escalation_notice' }
              }
            ],
            conditions: [],
            isActive: true
          }
        ],
        metadata: {
          tags: ['onboarding', 'hr', 'user_lifecycle'],
          documentation: 'Standard employee onboarding process with manager and HR approval stages',
          changeLog: [
            {
              version: '2.1',
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              author: 'workflow-admin',
              changes: ['Added HR review stage', 'Updated SLA settings']
            }
          ],
          dependencies: ['hr_system', 'user_management'],
          testing: {
            enabled: true,
            testCases: [
              {
                id: 'test-001',
                name: 'Standard Employee Onboarding',
                description: 'Test full-time employee onboarding process',
                input: { employee_type: 'full_time', department: 'Engineering' },
                expectedOutput: { account_created: true, duration: '<72h' },
                isActive: true
              }
            ],
            automatedTesting: false
          }
        },
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        createdBy: 'workflow-admin',
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        modifiedBy: 'workflow-admin'
      }
    ];

    // Initialize Analytics
    const mockAnalytics: AdminAnalytics = {
      systemHealth: {
        overallStatus: SystemStatus.Healthy,
        uptime: 99.97,
        performance: {
          averageResponseTime: 145,
          throughput: 1250,
          errorRate: 0.03,
          availability: 99.97
        },
        resources: {
          cpuUsage: 45,
          memoryUsage: 67,
          diskUsage: 34,
          networkUsage: 23
        },
        services: [
          {
            name: 'Authentication Service',
            status: SystemStatus.Healthy,
            lastCheck: new Date(Date.now() - 2 * 60 * 1000),
            uptime: 99.99,
            version: '2.1.3'
          },
          {
            name: 'User Management API',
            status: SystemStatus.Healthy,
            lastCheck: new Date(Date.now() - 1 * 60 * 1000),
            uptime: 99.95,
            version: '1.8.2'
          },
          {
            name: 'Integration Gateway',
            status: SystemStatus.Warning,
            lastCheck: new Date(Date.now() - 30 * 1000),
            uptime: 99.85,
            version: '3.2.1'
          }
        ]
      },
      userMetrics: {
        totalUsers: 1247,
        activeUsers: 1189,
        newUsers: 23,
        roleDistribution: [
          { roleName: 'Employee', userCount: 1050, percentage: 84.2 },
          { roleName: 'Manager', userCount: 87, percentage: 7.0 },
          { roleName: 'Admin', userCount: 45, percentage: 3.6 },
          { roleName: 'Contractor', userCount: 65, percentage: 5.2 }
        ],
        loginMetrics: {
          totalLogins: 3456,
          uniqueLogins: 1189,
          failedLogins: 23,
          averageSessionDuration: 6.5
        }
      },
      integrationMetrics: {
        totalIntegrations: 12,
        activeIntegrations: 10,
        healthyIntegrations: 9,
        failedIntegrations: 1,
        syncMetrics: [
          {
            integrationId: 'int-001',
            integrationName: 'Active Directory',
            lastSync: new Date(Date.now() - 30 * 60 * 1000),
            recordsProcessed: 1247,
            errors: 0,
            duration: 45
          },
          {
            integrationId: 'int-002',
            integrationName: 'Salesforce CRM',
            lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
            recordsProcessed: 892,
            errors: 2,
            duration: 128
          }
        ]
      },
      workflowMetrics: {
        totalWorkflows: 8,
        activeWorkflows: 6,
        completedInstances: 234,
        pendingInstances: 12,
        averageProcessingTime: 18.5,
        slaCompliance: 94.2
      },
      securityMetrics: {
        securityEvents: 145,
        blockedAttempts: 23,
        policyViolations: 8,
        riskScore: 32,
        vulnerabilities: {
          critical: 0,
          high: 2,
          medium: 5,
          low: 12
        }
      },
      complianceMetrics: {
        overallScore: 87,
        frameworkScores: [
          { framework: 'SOX', score: 92, lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { framework: 'ISO 27001', score: 89, lastAssessment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          { framework: 'PCI-DSS', score: 85, lastAssessment: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) }
        ],
        controlsStatus: {
          total: 156,
          passed: 142,
          failed: 8,
          pending: 6
        },
        auditFindings: 14
      }
    };

    // Set all mock data
    this.permissionsSubject.next(mockPermissions);
    this.rolesSubject.next(mockRoles);
    this.policiesSubject.next(mockPolicies);
    this.integrationsSubject.next(mockIntegrations);
    this.configurationsSubject.next(mockConfigurations);
    this.workflowsSubject.next(mockWorkflows);
    this.analyticsSubject.next(mockAnalytics);
  }
}
