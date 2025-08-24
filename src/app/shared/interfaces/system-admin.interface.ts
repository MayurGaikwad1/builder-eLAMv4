import { RiskLevel, UrgencyLevel } from './user.interface';

// Role Management Interfaces
export interface SystemRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: RoleType;
  isBuiltIn: boolean;
  isActive: boolean;
  permissions: Permission[];
  constraints: RoleConstraint[];
  inheritedRoles: string[];
  assignedUsers: number;
  riskLevel: RiskLevel;
  lastModified: Date;
  modifiedBy: string;
  createdAt: Date;
  createdBy: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  actions: PermissionAction[];
  conditions: PermissionCondition[];
  isActive: boolean;
  riskScore: number;
}

export interface PermissionAction {
  action: ActionType;
  scope: ActionScope;
  restrictions: string[];
}

export interface PermissionCondition {
  type: ConditionType;
  operator: ConditionOperator;
  value: any;
  description: string;
}

export interface RoleConstraint {
  type: ConstraintType;
  value: any;
  description: string;
  isActive: boolean;
}

export interface Policy {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: PolicyType;
  category: PolicyCategory;
  enforcement: EnforcementLevel;
  isActive: boolean;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  exceptions: PolicyException[];
  compliance: ComplianceRequirement[];
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;
  lastModified: Date;
  modifiedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface PolicyCondition {
  id: string;
  type: PolicyConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: LogicalOperator;
  group?: string;
}

export interface PolicyAction {
  type: PolicyActionType;
  parameters: Record<string, any>;
  priority: number;
  isBlocking: boolean;
}

export interface PolicyException {
  id: string;
  reason: string;
  justification: string;
  approvedBy: string;
  approvedAt: Date;
  expiryDate?: Date;
  conditions: string[];
  isActive: boolean;
}

export interface ComplianceRequirement {
  framework: string;
  requirement: string;
  description: string;
  mandatory: boolean;
}

// Integration Management Interfaces
export interface SystemIntegration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: IntegrationType;
  category: IntegrationCategory;
  vendor: string;
  version: string;
  status: IntegrationStatus;
  isEnabled: boolean;
  configuration: IntegrationConfig;
  authentication: AuthenticationConfig;
  dataMappings: DataMapping[];
  healthCheck: HealthCheckConfig;
  monitoring: MonitoringConfig;
  lastSync?: Date;
  lastHealthCheck?: Date;
  createdAt: Date;
  modifiedAt: Date;
  modifiedBy: string;
}

export interface IntegrationConfig {
  connectionString?: string;
  endpoint?: string;
  port?: number;
  protocol: string;
  timeout: number;
  retryAttempts: number;
  batchSize?: number;
  syncInterval?: number;
  customSettings: Record<string, any>;
}

export interface AuthenticationConfig {
  type: AuthenticationType;
  credentials: AuthenticationCredentials;
  tokenExpiry?: number;
  refreshToken?: boolean;
  certificatePath?: string;
  keyPath?: string;
}

export interface AuthenticationCredentials {
  username?: string;
  password?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  token?: string;
  customFields?: Record<string, any>;
}

export interface DataMapping {
  id: string;
  sourceField: string;
  targetField: string;
  dataType: DataType;
  transformation?: string;
  validation?: ValidationRule[];
  isRequired: boolean;
  defaultValue?: any;
}

export interface ValidationRule {
  type: ValidationType;
  parameters: Record<string, any>;
  errorMessage: string;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  endpoint?: string;
  expectedResponse?: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  type: HealthCheckType;
  parameters: Record<string, any>;
  threshold?: number;
  alertOnFailure: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsCollection: boolean;
  logLevel: LogLevel;
  alerting: AlertingConfig;
  dashboard: DashboardConfig;
}

export interface AlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThreshold[];
  escalation: EscalationRule[];
}

export interface AlertChannel {
  type: AlertChannelType;
  configuration: Record<string, any>;
  isActive: boolean;
}

export interface AlertThreshold {
  metric: string;
  operator: ThresholdOperator;
  value: number;
  severity: AlertSeverity;
  duration?: number;
}

export interface EscalationRule {
  level: number;
  triggerAfter: number;
  escalateTo: string[];
  actions: string[];
}

export interface DashboardConfig {
  enabled: boolean;
  widgets: DashboardWidget[];
  refreshInterval: number;
}

export interface DashboardWidget {
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: WidgetPosition;
  configuration: Record<string, any>;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// System Configuration Interfaces
export interface SystemConfiguration {
  id: string;
  category: ConfigCategory;
  settings: ConfigSetting[];
  lastModified: Date;
  modifiedBy: string;
  version: string;
}

export interface ConfigSetting {
  key: string;
  value: any;
  dataType: DataType;
  displayName: string;
  description: string;
  isReadOnly: boolean;
  isRequired: boolean;
  validation?: ValidationRule[];
  defaultValue?: any;
  possibleValues?: any[];
  group?: string;
  order: number;
  isSecure: boolean;
}

export interface SecurityConfig {
  passwordPolicy: PasswordPolicy;
  sessionManagement: SessionConfig;
  encryption: EncryptionConfig;
  accessControl: AccessControlConfig;
  auditSettings: AuditConfig;
  complianceSettings: ComplianceConfig;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  maxAge: number;
  lockoutThreshold: number;
  lockoutDuration: number;
}

export interface SessionConfig {
  timeout: number;
  maxConcurrentSessions: number;
  enableRememberMe: boolean;
  rememberMeDuration: number;
  enableMultiDevice: boolean;
  forceLogoutOnPasswordChange: boolean;
}

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  enableDataEncryption: boolean;
  enableTransportEncryption: boolean;
  certificateValidation: boolean;
  keyRotationInterval: number;
}

export interface AccessControlConfig {
  enableMFA: boolean;
  mfaMethods: MFAMethod[];
  enableSSO: boolean;
  ssoProviders: SSOProvider[];
  enableRBAC: boolean;
  enableABAC: boolean;
  defaultRole: string;
}

export interface MFAMethod {
  type: MFAType;
  isEnabled: boolean;
  configuration: Record<string, any>;
}

export interface SSOProvider {
  name: string;
  type: SSOType;
  isEnabled: boolean;
  configuration: Record<string, any>;
}

export interface AuditConfig {
  enableAuditLogging: boolean;
  retentionPeriod: number;
  logLevel: LogLevel;
  enableRealTimeAlerts: boolean;
  enableDataIntegrity: boolean;
  exportFormats: string[];
}

export interface ComplianceConfig {
  frameworks: ComplianceFramework[];
  enableAutomatedReporting: boolean;
  reportSchedule: ReportSchedule[];
  dataRetention: DataRetentionPolicy[];
}

export interface ComplianceFramework {
  name: string;
  version: string;
  isEnabled: boolean;
  requirements: string[];
  reportingFrequency: ReportFrequency;
}

export interface ReportSchedule {
  name: string;
  frequency: ReportFrequency;
  format: string;
  recipients: string[];
  isActive: boolean;
}

export interface DataRetentionPolicy {
  dataType: string;
  retentionPeriod: number;
  archiveAfter?: number;
  deleteAfter?: number;
  complianceRequirement?: string;
}

// Workflow Management Interfaces
export interface WorkflowDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: WorkflowCategory;
  type: WorkflowType;
  isActive: boolean;
  version: string;
  stages: WorkflowStage[];
  triggers: WorkflowTrigger[];
  variables: WorkflowVariable[];
  slaSettings: SLASettings;
  escalationRules: WorkflowEscalationRule[];
  metadata: WorkflowMetadata;
  createdAt: Date;
  createdBy: string;
  lastModified: Date;
  modifiedBy: string;
}

export interface WorkflowStage {
  id: string;
  name: string;
  displayName: string;
  type: StageType;
  order: number;
  isRequired: boolean;
  conditions: StageCondition[];
  actions: StageAction[];
  approvers: StageApprover[];
  timeouts: StageTimeout[];
  notifications: StageNotification[];
  parallelExecution: boolean;
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  type: TriggerType;
  conditions: TriggerCondition[];
  isActive: boolean;
}

export interface TriggerCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: LogicalOperator;
}

export interface WorkflowVariable {
  name: string;
  dataType: DataType;
  defaultValue?: any;
  isRequired: boolean;
  description: string;
  scope: VariableScope;
}

export interface SLASettings {
  enabled: boolean;
  overallSLA: number;
  stageSLAs: StageSLA[];
  escalationEnabled: boolean;
  warningThreshold: number;
}

export interface StageSLA {
  stageId: string;
  slaHours: number;
  warningHours: number;
  escalationHours: number;
}

export interface WorkflowEscalationRule {
  id: string;
  stageId?: string;
  triggerAfter: number;
  escalateTo: string[];
  actions: EscalationAction[];
  conditions: EscalationCondition[];
  isActive: boolean;
}

export interface EscalationAction {
  type: EscalationActionType;
  parameters: Record<string, any>;
  delay?: number;
}

export interface EscalationCondition {
  type: string;
  value: any;
  operator: ConditionOperator;
}

export interface WorkflowMetadata {
  tags: string[];
  documentation: string;
  changeLog: ChangeLogEntry[];
  dependencies: string[];
  testing: TestingConfig;
}

export interface ChangeLogEntry {
  version: string;
  date: Date;
  author: string;
  changes: string[];
}

export interface TestingConfig {
  enabled: boolean;
  testCases: WorkflowTestCase[];
  automatedTesting: boolean;
}

export interface WorkflowTestCase {
  id: string;
  name: string;
  description: string;
  input: Record<string, any>;
  expectedOutput: Record<string, any>;
  isActive: boolean;
}

export interface StageCondition {
  type: ConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: LogicalOperator;
}

export interface StageAction {
  type: ActionType;
  parameters: Record<string, any>;
  order: number;
  isAsync: boolean;
  retryConfig?: RetryConfig;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
}

export interface StageApprover {
  type: ApproverType;
  identifier: string;
  isRequired: boolean;
  weight: number;
  conditions: ApproverCondition[];
}

export interface ApproverCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface StageTimeout {
  type: TimeoutType;
  duration: number;
  action: TimeoutAction;
  warningBefore?: number;
}

export interface StageNotification {
  type: NotificationType;
  recipients: NotificationRecipient[];
  template: string;
  trigger: NotificationTrigger;
  channels: NotificationChannel[];
}

export interface NotificationRecipient {
  type: RecipientType;
  identifier: string;
  conditions?: NotificationCondition[];
}

export interface NotificationCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

// Statistics and Analytics Interfaces
export interface AdminAnalytics {
  systemHealth: SystemHealth;
  userMetrics: UserMetrics;
  integrationMetrics: IntegrationMetrics;
  workflowMetrics: WorkflowMetrics;
  securityMetrics: SecurityMetrics;
  complianceMetrics: AdminComplianceMetrics;
}

export interface SystemHealth {
  overallStatus: SystemStatus;
  uptime: number;
  performance: PerformanceMetrics;
  resources: ResourceMetrics;
  services: ServiceStatus[];
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
}

export interface ResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
}

export interface ServiceStatus {
  name: string;
  status: SystemStatus;
  lastCheck: Date;
  uptime: number;
  version: string;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  roleDistribution: RoleDistribution[];
  loginMetrics: LoginMetrics;
}

export interface RoleDistribution {
  roleName: string;
  userCount: number;
  percentage: number;
}

export interface LoginMetrics {
  totalLogins: number;
  uniqueLogins: number;
  failedLogins: number;
  averageSessionDuration: number;
}

export interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  healthyIntegrations: number;
  failedIntegrations: number;
  syncMetrics: SyncMetrics[];
}

export interface SyncMetrics {
  integrationId: string;
  integrationName: string;
  lastSync: Date;
  recordsProcessed: number;
  errors: number;
  duration: number;
}

export interface WorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedInstances: number;
  pendingInstances: number;
  averageProcessingTime: number;
  slaCompliance: number;
}

export interface SecurityMetrics {
  securityEvents: number;
  blockedAttempts: number;
  policyViolations: number;
  riskScore: number;
  vulnerabilities: VulnerabilityMetrics;
}

export interface VulnerabilityMetrics {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AdminComplianceMetrics {
  overallScore: number;
  frameworkScores: FrameworkScore[];
  controlsStatus: ControlsStatus;
  auditFindings: number;
}

export interface FrameworkScore {
  framework: string;
  score: number;
  lastAssessment: Date;
}

export interface ControlsStatus {
  total: number;
  passed: number;
  failed: number;
  pending: number;
}

// Enums
export enum RoleType {
  System = 'system',
  Business = 'business',
  Application = 'application',
  Custom = 'custom'
}

export enum ActionType {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Execute = 'execute',
  Approve = 'approve',
  Assign = 'assign'
}

export enum ActionScope {
  Own = 'own',
  Department = 'department',
  Organization = 'organization',
  System = 'system'
}

export enum ConditionType {
  Time = 'time',
  Location = 'location',
  Device = 'device',
  Network = 'network',
  Risk = 'risk',
  Custom = 'custom'
}

export enum ConditionOperator {
  Equals = 'equals',
  NotEquals = 'not_equals',
  GreaterThan = 'greater_than',
  LessThan = 'less_than',
  GreaterThanOrEqual = 'greater_than_or_equal',
  LessThanOrEqual = 'less_than_or_equal',
  Contains = 'contains',
  StartsWith = 'starts_with',
  EndsWith = 'ends_with',
  In = 'in',
  NotIn = 'not_in',
  Between = 'between',
  Exists = 'exists',
  NotExists = 'not_exists'
}

export enum LogicalOperator {
  And = 'and',
  Or = 'or',
  Not = 'not'
}

export enum ConstraintType {
  Time = 'time',
  Location = 'location',
  Concurrency = 'concurrency',
  Approval = 'approval',
  Segregation = 'segregation'
}

export enum PolicyType {
  Access = 'access',
  Security = 'security',
  Compliance = 'compliance',
  Business = 'business',
  Technical = 'technical'
}

export enum PolicyCategory {
  Authentication = 'authentication',
  Authorization = 'authorization',
  DataProtection = 'data_protection',
  AuditLogging = 'audit_logging',
  RiskManagement = 'risk_management',
  ChangeManagement = 'change_management'
}

export enum EnforcementLevel {
  Advisory = 'advisory',
  Warning = 'warning',
  Blocking = 'blocking',
  Automatic = 'automatic'
}

export enum PolicyConditionType {
  User = 'user',
  Resource = 'resource',
  Action = 'action',
  Time = 'time',
  Location = 'location',
  Risk = 'risk'
}

export enum PolicyActionType {
  Allow = 'allow',
  Deny = 'deny',
  Require = 'require',
  Log = 'log',
  Alert = 'alert',
  Escalate = 'escalate'
}

export enum IntegrationType {
  Identity = 'identity',
  Directory = 'directory',
  Database = 'database',
  Application = 'application',
  Monitoring = 'monitoring',
  Security = 'security',
  Compliance = 'compliance'
}

export enum IntegrationCategory {
  Authentication = 'authentication',
  UserProvisioning = 'user_provisioning',
  DataSync = 'data_sync',
  Monitoring = 'monitoring',
  Reporting = 'reporting',
  Workflow = 'workflow'
}

export enum IntegrationStatus {
  Active = 'active',
  Inactive = 'inactive',
  Error = 'error',
  Pending = 'pending',
  Configuring = 'configuring'
}

export enum AuthenticationType {
  Basic = 'basic',
  OAuth2 = 'oauth2',
  JWT = 'jwt',
  ApiKey = 'api_key',
  Certificate = 'certificate',
  Kerberos = 'kerberos',
  SAML = 'saml'
}

export enum DataType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
  Array = 'array',
  Object = 'object',
  Email = 'email',
  URL = 'url',
  Password = 'password'
}

export enum ValidationType {
  Required = 'required',
  Pattern = 'pattern',
  Length = 'length',
  Range = 'range',
  Custom = 'custom'
}

export enum HealthCheckType {
  Ping = 'ping',
  HTTP = 'http',
  Database = 'database',
  Service = 'service',
  Custom = 'custom'
}

export enum LogLevel {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace'
}

export enum AlertChannelType {
  Email = 'email',
  SMS = 'sms',
  Slack = 'slack',
  Teams = 'teams',
  Webhook = 'webhook',
  PagerDuty = 'pagerduty'
}

export enum ThresholdOperator {
  GreaterThan = 'greater_than',
  LessThan = 'less_than',
  Equals = 'equals',
  NotEquals = 'not_equals'
}

export enum AlertSeverity {
  Info = 'info',
  Warning = 'warning',
  Critical = 'critical',
  Emergency = 'emergency'
}

export enum WidgetType {
  Chart = 'chart',
  Table = 'table',
  Metric = 'metric',
  Status = 'status',
  Log = 'log',
  Custom = 'custom'
}

export enum WidgetSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'extra_large'
}

export enum ConfigCategory {
  Security = 'security',
  Authentication = 'authentication',
  Authorization = 'authorization',
  Audit = 'audit',
  Performance = 'performance',
  Integration = 'integration',
  Notification = 'notification',
  Compliance = 'compliance'
}

export enum MFAType {
  SMS = 'sms',
  Email = 'email',
  TOTP = 'totp',
  Push = 'push',
  Hardware = 'hardware',
  Biometric = 'biometric'
}

export enum SSOType {
  SAML = 'saml',
  OAuth2 = 'oauth2',
  OpenIDConnect = 'openid_connect',
  LDAP = 'ldap',
  Kerberos = 'kerberos'
}

export enum ReportFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Annually = 'annually'
}

export enum WorkflowCategory {
  AccessManagement = 'access_management',
  UserLifecycle = 'user_lifecycle',
  Compliance = 'compliance',
  Security = 'security',
  Business = 'business',
  Custom = 'custom'
}

export enum WorkflowType {
  Sequential = 'sequential',
  Parallel = 'parallel',
  Conditional = 'conditional',
  Loop = 'loop',
  Hybrid = 'hybrid'
}

export enum StageType {
  Approval = 'approval',
  Review = 'review',
  Execution = 'execution',
  Notification = 'notification',
  Wait = 'wait',
  Decision = 'decision'
}

export enum TriggerType {
  Manual = 'manual',
  Automatic = 'automatic',
  Scheduled = 'scheduled',
  Event = 'event',
  Condition = 'condition'
}

export enum VariableScope {
  Workflow = 'workflow',
  Stage = 'stage',
  Global = 'global'
}

export enum EscalationActionType {
  Notify = 'notify',
  Reassign = 'reassign',
  AutoApprove = 'auto_approve',
  Escalate = 'escalate',
  Cancel = 'cancel'
}

export enum ApproverType {
  User = 'user',
  Role = 'role',
  Group = 'group',
  Manager = 'manager',
  ResourceOwner = 'resource_owner'
}

export enum TimeoutType {
  Stage = 'stage',
  Approval = 'approval',
  Response = 'response'
}

export enum TimeoutAction {
  AutoApprove = 'auto_approve',
  AutoReject = 'auto_reject',
  Escalate = 'escalate',
  Notify = 'notify'
}

export enum NotificationType {
  Email = 'email',
  SMS = 'sms',
  InApp = 'in_app',
  Push = 'push',
  Webhook = 'webhook'
}

export enum RecipientType {
  User = 'user',
  Role = 'role',
  Group = 'group',
  Email = 'email'
}

export enum NotificationTrigger {
  StageStart = 'stage_start',
  StageComplete = 'stage_complete',
  Approval = 'approval',
  Rejection = 'rejection',
  Timeout = 'timeout',
  Escalation = 'escalation'
}

export enum NotificationChannel {
  Email = 'email',
  SMS = 'sms',
  Slack = 'slack',
  Teams = 'teams',
  InApp = 'in_app'
}

export enum SystemStatus {
  Healthy = 'healthy',
  Warning = 'warning',
  Critical = 'critical',
  Down = 'down',
  Maintenance = 'maintenance'
}
