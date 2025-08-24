import { User, UserStatus, UrgencyLevel, RiskLevel } from "./user.interface";

export interface UserProfile extends User {
  employeeId: string;
  organizationUnit: string;
  location: string;
  hireDate: Date;
  terminationDate?: Date;
  manager?: string;
  directReports: string[];
  securityClearance?: SecurityClearance;
  complianceStatus: ComplianceStatus;
  lastPasswordChange?: Date;
  mfaEnabled: boolean;
  sessionCount: number;
  lastActivity?: Date;
  riskFactors: RiskFactor[];
  accessReviewDate?: Date;
  dataClassifications: DataClassification[];
}

export interface ProvisioningWorkflow {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  workflowType: WorkflowType;
  status: WorkflowStatus;
  priority: UrgencyLevel;
  requesterId: string;
  requesterName: string;
  approvals: WorkflowApproval[];
  tasks: ProvisioningTask[];
  metadata: WorkflowMetadata;
  createdAt: Date;
  scheduledFor?: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  slaDeadline?: Date;
}

export interface ProvisioningTask {
  id: string;
  workflowId: string;
  taskType: TaskType;
  targetSystem: string;
  action: string;
  parameters: Record<string, any>;
  status: TaskStatus;
  assignedTo?: string;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  dependencies: string[];
  rollbackData?: Record<string, any>;
}

export interface WorkflowApproval {
  id: string;
  workflowId: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: ApprovalStatus;
  comments?: string;
  timestamp: Date;
  level: number;
  isRequired: boolean;
  isDelegated: boolean;
  delegatedTo?: string;
}

export interface WorkflowMetadata {
  source: string;
  reason: string;
  businessJustification?: string;
  complianceRequirements: string[];
  dataRetention: number;
  auditLevel: AuditLevel;
  riskAssessment: RiskAssessment;
}

export interface RiskAssessment {
  overallScore: number;
  factors: RiskFactor[];
  mitigationPlan?: string;
  reviewRequired: boolean;
  approvalLevel: number;
}

export interface RiskFactor {
  type: RiskFactorType;
  description: string;
  severity: RiskLevel;
  impact: number;
  likelihood: number;
  mitigation?: string;
}

export interface ComplianceStatus {
  isCompliant: boolean;
  frameworks: ComplianceFramework[];
  violations: ComplianceViolation[];
  lastReview: Date;
  nextReview: Date;
  certifications: Certification[];
}

export interface ComplianceViolation {
  id: string;
  framework: string;
  rule: string;
  severity: RiskLevel;
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  remediationPlan?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  status: CertificationStatus;
}

export interface IntegrationStatus {
  systemId: string;
  systemName: string;
  status: ConnectionStatus;
  lastSync: Date;
  nextSync?: Date;
  errorCount: number;
  lastError?: string;
  latency: number;
  healthScore: number;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  actorId: string;
  actorName: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: AuditResult;
  details: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
  riskScore: number;
  severity: RiskLevel;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingProvisioning: number;
  pendingDeprovisioning: number;
  riskDistribution: RiskDistribution;
  complianceMetrics: ComplianceMetrics;
  activityMetrics: ActivityMetrics;
  trends: AnalyticsTrend[];
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface ComplianceMetrics {
  compliantUsers: number;
  nonCompliantUsers: number;
  pendingReviews: number;
  expiredCertifications: number;
  violationsCount: number;
}

export interface ActivityMetrics {
  dailyLogins: number;
  weeklyLogins: number;
  monthlyLogins: number;
  avgSessionDuration: number;
  suspiciousActivities: number;
}

export interface AnalyticsTrend {
  metric: string;
  period: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
}

// Enums
export enum WorkflowType {
  UserProvisioning = "user_provisioning",
  UserDeprovisioning = "user_deprovisioning",
  AccessModification = "access_modification",
  RoleAssignment = "role_assignment",
  ComplianceReview = "compliance_review",
  SecurityIncident = "security_incident",
}

export enum WorkflowStatus {
  Draft = "draft",
  Pending = "pending",
  InProgress = "in_progress",
  Approved = "approved",
  Rejected = "rejected",
  Completed = "completed",
  Failed = "failed",
  Cancelled = "cancelled",
  OnHold = "on_hold",
}

export enum TaskType {
  CreateAccount = "create_account",
  DeleteAccount = "delete_account",
  ModifyAccount = "modify_account",
  AssignRole = "assign_role",
  RevokeRole = "revoke_role",
  SetPermissions = "set_permissions",
  SendNotification = "send_notification",
  UpdateDirectory = "update_directory",
  SyncData = "sync_data",
  GenerateReport = "generate_report",
}

export enum TaskStatus {
  Pending = "pending",
  Running = "running",
  Completed = "completed",
  Failed = "failed",
  Skipped = "skipped",
  Cancelled = "cancelled",
  Retrying = "retrying",
}

export enum ApprovalStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Delegated = "delegated",
  Expired = "expired",
}

export enum SecurityClearance {
  Public = "public",
  Internal = "internal",
  Confidential = "confidential",
  Secret = "secret",
  TopSecret = "top_secret",
}

export enum DataClassification {
  Public = "public",
  Internal = "internal",
  Confidential = "confidential",
  Restricted = "restricted",
  Classified = "classified",
}

export enum AuditLevel {
  Basic = "basic",
  Enhanced = "enhanced",
  Comprehensive = "comprehensive",
}

export enum RiskFactorType {
  AccessLevel = "access_level",
  DataSensitivity = "data_sensitivity",
  SystemCriticality = "system_criticality",
  UserBehavior = "user_behavior",
  ComplianceImpact = "compliance_impact",
  GeographicLocation = "geographic_location",
  DeviceCompliance = "device_compliance",
}

export enum ComplianceFramework {
  SOX = "sox",
  PCI_DSS = "pci_dss",
  GDPR = "gdpr",
  HIPAA = "hipaa",
  ISO27001 = "iso27001",
  NIST = "nist",
  COSO = "coso",
}

export enum CertificationStatus {
  Valid = "valid",
  Expired = "expired",
  Expiring = "expiring",
  Suspended = "suspended",
  Revoked = "revoked",
}

export enum ConnectionStatus {
  Connected = "connected",
  Disconnected = "disconnected",
  Error = "error",
  Maintenance = "maintenance",
}

export enum AuditResult {
  Success = "success",
  Failure = "failure",
  Warning = "warning",
  Blocked = "blocked",
}
