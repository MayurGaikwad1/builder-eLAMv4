export interface Application {
  id: string;
  name: string;
  type: ApplicationType;
  description: string;
  owner: ApplicationOwner;
  approvalWorkflow: WorkflowConfig;
  isActive: boolean;
  adValidationRequired: boolean;
  exceptionRetentionDays: number;
}

export interface ApplicationOwner {
  id: string;
  name: string;
  email: string;
  department: string;
  delegateId?: string;
}

export interface UserAccessRequest {
  id: string;
  batchId?: string;
  requesterId: string;
  requesterName: string;
  userIds: string[];
  applicationId: string;
  applicationName: string;
  accessLevel: AccessLevel;
  justification: string;
  department: string;
  requestType: AccessRequestType;
  status: AccessRequestStatus;
  currentApprovalLevel: number;
  approvals: AccessApproval[];
  submittedAt: Date;
  deadline: Date;
  completedAt?: Date;
  priority: Priority;
  adValidationResults?: ADValidationResult[];
  exceptionHandling?: ExceptionHandling;
  autoProcessed: boolean;
}

export interface AccessApproval {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: ApproverRole;
  level: number;
  status: ApprovalStatus;
  comments?: string;
  approvedAt?: Date;
  deadline: Date;
  autoApproved: boolean;
}

export interface ADValidationResult {
  userId: string;
  status: ADValidationStatus;
  errorMessage?: string;
  foundInAD: boolean;
  adGroups?: string[];
  lastValidated: Date;
}

export interface ExceptionHandling {
  id: string;
  userId: string;
  applicationId: string;
  validationError: string;
  exceptionType: ExceptionType;
  ownerDecision?: ExceptionDecision;
  retentionNote?: string;
  markedBy?: string;
  markedAt?: Date;
  autoDeleteDate: Date;
  status: ExceptionStatus;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  applicationId: string;
  approvalLevels: ApprovalLevel[];
  autoApprovalRules?: AutoApprovalRule[];
  deadlineHours: number;
  exceptionDeadlineDays: number;
  notificationSettings: NotificationSettings;
  isActive: boolean;
}

export interface ApprovalLevel {
  level: number;
  role: ApproverRole;
  approverIds: string[];
  deadlineHours: number;
  isParallel: boolean;
  isOptional: boolean;
  autoApproveAfterDeadline: boolean;
}

export interface AutoApprovalRule {
  id: string;
  name: string;
  conditions: ApprovalCondition[];
  action: AutoApprovalAction;
  isActive: boolean;
}

export interface ApprovalCondition {
  field: string;
  operator: ConditionOperator;
  value: string;
}

export interface NotificationSettings {
  enableEmail: boolean;
  enableInApp: boolean;
  reminderHours: number[];
  escalationNotification: boolean;
  recipients: NotificationRecipient[];
}

export interface NotificationRecipient {
  type: RecipientType;
  email?: string;
  userId?: string;
  role?: string;
}

export interface BulkUpload {
  id: string;
  uploaderId: string;
  uploaderName: string;
  fileName: string;
  uploadedAt: Date;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  validationErrors: ValidationError[];
  status: UploadStatus;
  downloadUrl?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export interface DashboardMetrics {
  totalRequests: number;
  pendingApprovals: number;
  exceptionsCount: number;
  overdueRequests: number;
  autoProcessedToday: number;
  applicationMetrics: ApplicationMetrics[];
  recentActivity: ActivityLog[];
}

export interface ApplicationMetrics {
  applicationId: string;
  applicationName: string;
  totalRequests: number;
  pendingRequests: number;
  exceptions: number;
  averageProcessingTime: number;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  action: ActivityAction;
  userId: string;
  userName: string;
  entityType: EntityType;
  entityId: string;
  details: string;
  metadata?: Record<string, any>;
}

// Enums
export enum ApplicationType {
  EnterpriseApp = "enterprise_app",
  CloudService = "cloud_service",
  Database = "database",
  SystemIntegration = "system_integration",
  NetworkResource = "network_resource"
}

export enum AccessLevel {
  Read = "read",
  Write = "write",
  Admin = "admin",
  Full = "full",
  Custom = "custom"
}

export enum AccessRequestType {
  NewAccess = "new_access",
  ModifyAccess = "modify_access",
  RemoveAccess = "remove_access",
  BulkUpload = "bulk_upload"
}

export enum AccessRequestStatus {
  Draft = "draft",
  Submitted = "submitted",
  InReview = "in_review",
  AwaitingApproval = "awaiting_approval",
  Approved = "approved",
  Rejected = "rejected",
  Exception = "exception",
  AutoProcessed = "auto_processed",
  Completed = "completed",
  Expired = "expired"
}

export enum ApprovalStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Expired = "expired",
  AutoApproved = "auto_approved"
}

export enum ApproverRole {
  Manager = "manager",
  ITAdmin = "it_admin",
  SecurityAdmin = "security_admin",
  ApplicationOwner = "application_owner",
  Delegate = "delegate"
}

export enum ADValidationStatus {
  Valid = "valid",
  NotFound = "not_found",
  Inactive = "inactive",
  NoPermission = "no_permission",
  Error = "error"
}

export enum ExceptionType {
  UserNotFound = "user_not_found",
  GroupNotFound = "group_not_found",
  SystemNotFound = "system_not_found",
  IntegrationNotFound = "integration_not_found",
  PermissionDenied = "permission_denied"
}

export enum ExceptionDecision {
  Retain = "retain",
  Delete = "delete",
  Pending = "pending"
}

export enum ExceptionStatus {
  New = "new",
  UnderReview = "under_review",
  Resolved = "resolved",
  AutoDeleted = "auto_deleted"
}

export enum Priority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical"
}

export enum ConditionOperator {
  Equals = "equals",
  NotEquals = "not_equals",
  Contains = "contains",
  GreaterThan = "greater_than",
  LessThan = "less_than",
  In = "in"
}

export enum AutoApprovalAction {
  Approve = "approve",
  Reject = "reject",
  Escalate = "escalate"
}

export enum RecipientType {
  User = "user",
  Role = "role",
  Email = "email",
  Group = "group"
}

export enum UploadStatus {
  Uploading = "uploading",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
  PartialSuccess = "partial_success"
}

export enum ActivityAction {
  RequestSubmitted = "request_submitted",
  RequestApproved = "request_approved",
  RequestRejected = "request_rejected",
  ExceptionMarked = "exception_marked",
  AutoProcessed = "auto_processed",
  BulkUploaded = "bulk_uploaded",
  WorkflowModified = "workflow_modified",
  NotificationSent = "notification_sent"
}

export enum EntityType {
  AccessRequest = "access_request",
  Application = "application",
  User = "user",
  Workflow = "workflow",
  Exception = "exception",
  Bulk = "bulk"
}
