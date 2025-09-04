import { UrgencyLevel, RiskLevel } from "./user.interface";

export interface ApprovalRequest {
  id: string;
  requestId: string;
  requestType: RequestType;
  requestedBy: UserInfo;
  requestedFor?: UserInfo;
  requestTitle: string;
  description: string;
  justification: string;
  urgency: UrgencyLevel;
  riskScore: number;
  riskFactors: RiskFactor[];
  requestedAccess: RequestedAccess[];
  currentLevel: number;
  totalLevels: number;
  approvalChain: ApprovalChainItem[];
  status: ApprovalStatus;
  submittedAt: Date;
  deadline?: Date;
  renewalDate?: Date;
  slaBreachWarning: boolean;
  conflictChecks: ConflictCheck[];
  attachments: RequestAttachment[];
  metadata: ApprovalMetadata;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  title: string;
  manager?: string;
  riskScore: number;
  avatar?: string;
}

export interface RequestedAccess {
  id: string;
  type: AccessType;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  system: string;
  permissions: string[];
  duration?: number;
  isTemporary: boolean;
  expiryDate?: Date;
}

export interface ApprovalChainItem {
  level: number;
  approverId: string;
  approverName: string;
  approverTitle: string;
  approverEmail: string;
  status: ApprovalDecision;
  isRequired: boolean;
  isDelegated: boolean;
  delegatedTo?: UserInfo;
  decision?: ApprovalDecision;
  comments?: string;
  timestamp?: Date;
  timeSpent?: number;
  escalationLevel: number;
}

export interface RiskFactor {
  type: RiskFactorType;
  description: string;
  severity: RiskLevel;
  impact: number;
  mitigation?: string;
  autoDetected: boolean;
}

export interface ConflictCheck {
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  conflictingAccess: string[];
  recommendation: string;
  canOverride: boolean;
  overrideJustification?: string;
}

export interface RequestAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  downloadUrl: string;
}

export interface ApprovalMetadata {
  priority: ApprovalPriority;
  source: string;
  workflowId?: string;
  complianceFlags: string[];
  auditTrail: AuditEntry[];
  tags: string[];
}

export interface AuditEntry {
  action: string;
  performedBy: string;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ApprovalAction {
  type: ApprovalActionType;
  requestId: string;
  comments?: string;
  timeSpent?: number;
  delegateTo?: string;
  escalateTo?: string;
  conditions?: ApprovalCondition[];
}

export interface ApprovalCondition {
  type: ConditionType;
  value: string;
  expiryDate?: Date;
  description: string;
}

export interface BulkApprovalAction {
  action: ApprovalActionType;
  requestIds: string[];
  comments?: string;
  conditions?: ApprovalCondition[];
}

export interface ApprovalStatistics {
  totalPending: number;
  highPriority: number;
  slaBreaches: number;
  avgProcessingTime: number;
  approvalRate: number;
  myPending: number;
  delegatedToMe: number;
  escalatedToMe: number;
  completedToday: number;
  queueDistribution: QueueDistribution;
  performanceMetrics: PerformanceMetrics;
}

export interface QueueDistribution {
  level1: number;
  level2: number;
  level3: number;
  emergency: number;
}

export interface PerformanceMetrics {
  avgDecisionTime: number;
  slaCompliance: number;
  escalationRate: number;
  delegationRate: number;
  throughput: number;
}

export interface ApprovalDelegation {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegateId: string;
  delegateName: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  scope: DelegationScope;
  conditions: string[];
  approvalTypes: RequestType[];
  maxRiskLevel: RiskLevel;
  createdAt: Date;
}

export interface DelegationScope {
  allRequests: boolean;
  departments: string[];
  maxAmount?: number;
  requestTypes: RequestType[];
  urgencyLevels: UrgencyLevel[];
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  requestTypes: RequestType[];
  isActive: boolean;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  slaHours: number;
  escalationRules: EscalationRule[];
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

export interface WorkflowStep {
  level: number;
  name: string;
  approverType: ApproverType;
  approverIds: string[];
  isRequired: boolean;
  isParallel: boolean;
  timeoutHours: number;
  conditions: StepCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: LogicalOperator;
}

export interface StepCondition {
  type: StepConditionType;
  value: any;
  description: string;
}

export interface EscalationRule {
  triggerAfterHours: number;
  escalateTo: string[];
  escalationType: EscalationType;
  notificationTemplate: string;
  isActive: boolean;
}

// Enums
export enum RequestType {
  AccessRequest = "access_request",
  RoleChange = "role_change",
  PermissionModification = "permission_modification",
  SystemAccess = "system_access",
  EmergencyAccess = "emergency_access",
  DataAccess = "data_access",
  AdminAccess = "admin_access",
}

export enum AccessType {
  SystemAccount = "system_account",
  ApplicationAccess = "application_access",
  DatabaseAccess = "database_access",
  NetworkAccess = "network_access",
  PhysicalAccess = "physical_access",
  DataAccess = "data_access",
  AdminRights = "admin_rights",
}

export enum ApprovalStatus {
  Pending = "pending",
  InReview = "in_review",
  Approved = "approved",
  Rejected = "rejected",
  Escalated = "escalated",
  Delegated = "delegated",
  Expired = "expired",
  OnHold = "on_hold",
}

export enum ApprovalDecision {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Escalated = "escalated",
  Delegated = "delegated",
  ConditionalApproval = "conditional_approval",
}

export enum ApprovalActionType {
  Approve = "approve",
  Reject = "reject",
  Delegate = "delegate",
  Escalate = "escalate",
  RequestMoreInfo = "request_more_info",
  ConditionalApprove = "conditional_approve",
  BulkApprove = "bulk_approve",
  BulkReject = "bulk_reject",
}

export enum ApprovalPriority {
  Low = "low",
  Normal = "normal",
  High = "high",
  Critical = "critical",
  Emergency = "emergency",
}

export enum RiskFactorType {
  HighPrivilegeAccess = "high_privilege_access",
  SensitiveData = "sensitive_data",
  ExternalSystem = "external_system",
  BypassControls = "bypass_controls",
  MultipleSystems = "multiple_systems",
  EmergencyRequest = "emergency_request",
  OutsideBusinessHours = "outside_business_hours",
}

export enum ConflictType {
  SeparationOfDuties = "separation_of_duties",
  PrivilegeEscalation = "privilege_escalation",
  DataClassificationConflict = "data_classification_conflict",
  GeographicalRestriction = "geographical_restriction",
  TimeRestriction = "time_restriction",
  ConcurrentAccess = "concurrent_access",
}

export enum ConflictSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
  Blocking = "blocking",
}

export enum ConditionType {
  TimeLimit = "time_limit",
  LocationRestriction = "location_restriction",
  DeviceRestriction = "device_restriction",
  DataClassification = "data_classification",
  MonitoringRequired = "monitoring_required",
  ReviewRequired = "review_required",
}

export enum ApproverType {
  DirectManager = "direct_manager",
  ResourceOwner = "resource_owner",
  SecurityTeam = "security_team",
  ComplianceOfficer = "compliance_officer",
  DataOwner = "data_owner",
  SystemOwner = "system_owner",
  SpecificUser = "specific_user",
  Role = "role",
}

export enum ConditionOperator {
  Equals = "equals",
  NotEquals = "not_equals",
  GreaterThan = "greater_than",
  LessThan = "less_than",
  Contains = "contains",
  In = "in",
  NotIn = "not_in",
}

export enum LogicalOperator {
  And = "and",
  Or = "or",
  Not = "not",
}

export enum StepConditionType {
  RiskThreshold = "risk_threshold",
  DepartmentMatch = "department_match",
  AmountThreshold = "amount_threshold",
  AccessType = "access_type",
  UserLevel = "user_level",
}

export enum EscalationType {
  AutoEscalate = "auto_escalate",
  NotifyOnly = "notify_only",
  RequireAction = "require_action",
}
