import { RiskLevel, UrgencyLevel } from "./user.interface";

export interface AuditLog {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  userId: string;
  userName: string;
  userRole: string;
  targetResource: string;
  action: string;
  outcome: AuditOutcome;
  details: AuditDetails;
  complianceFlags: string[];
  ipAddress: string;
  userAgent?: string;
  location?: GeoLocation;
  sessionId?: string;
  correlationId?: string;
  metadata: Record<string, any>;
}

export interface AuditDetails {
  description: string;
  changedFields?: FieldChange[];
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  systemInfo: SystemInfo;
  additionalContext?: Record<string, any>;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: ChangeType;
}

export interface SystemInfo {
  systemName: string;
  version: string;
  environment: Environment;
  module: string;
  component?: string;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
}

export interface ComplianceReport {
  id: string;
  name: string;
  description: string;
  framework: ComplianceFramework;
  reportType: ReportType;
  scope: ComplianceScope;
  period: ReportPeriod;
  status: ReportStatus;
  overallScore: number;
  riskLevel: RiskLevel;
  controlResults: ControlResult[];
  violations: PolicyViolation[];
  findings: ComplianceFinding[];
  recommendations: Recommendation[];
  generatedAt: Date;
  generatedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  nextReviewDate: Date;
  metadata: ReportMetadata;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  categories: ComplianceCategory[];
  controls: ComplianceControl[];
  isActive: boolean;
  mandatoryControls: string[];
}

export interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  controls: string[];
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  category: string;
  controlType: ControlType;
  frequency: ControlFrequency;
  automationType: AutomationType;
  riskLevel: RiskLevel;
  testProcedure: string;
  acceptanceCriteria: string[];
  responsible: string[];
  evidence: string[];
  isActive: boolean;
  lastTested?: Date;
  nextTestDate: Date;
}

export interface ControlResult {
  controlId: string;
  controlName: string;
  status: ControlStatus;
  score: number;
  testedAt: Date;
  testedBy: string;
  evidence: Evidence[];
  exceptions: ControlException[];
  comments?: string;
  remediation?: RemediationPlan;
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  name: string;
  description: string;
  source: string;
  collectedAt: Date;
  collectedBy: string;
  fileUrl?: string;
  checksum?: string;
  metadata: Record<string, any>;
}

export interface ControlException {
  id: string;
  reason: string;
  justification: string;
  approvedBy: string;
  approvedAt: Date;
  expiryDate?: Date;
  riskAssessment: string;
  compensatingControls: string[];
}

export interface RemediationPlan {
  id: string;
  description: string;
  steps: RemediationStep[];
  assignedTo: string;
  targetDate: Date;
  priority: UrgencyLevel;
  status: RemediationStatus;
  estimatedEffort: number;
  costEstimate?: number;
}

export interface RemediationStep {
  stepNumber: number;
  description: string;
  responsible: string;
  estimatedDuration: number;
  dependencies: string[];
  status: StepStatus;
  completedAt?: Date;
  evidence?: string[];
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  policyName: string;
  violationType: ViolationType;
  severity: ViolationSeverity;
  description: string;
  violatedRule: string;
  detectedAt: Date;
  detectedBy: DetectionSource;
  involvedUsers: ViolationUser[];
  affectedResources: string[];
  riskScore: number;
  status: ViolationStatus;
  investigationNotes?: string;
  resolution?: ViolationResolution;
  falsePositive: boolean;
}

export interface ViolationUser {
  userId: string;
  userName: string;
  role: string;
  department: string;
  involementType: InvolvementType;
}

export interface ViolationResolution {
  resolvedAt: Date;
  resolvedBy: string;
  action: ResolutionAction;
  description: string;
  preventiveMeasures: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface ComplianceFinding {
  id: string;
  title: string;
  description: string;
  category: FindingCategory;
  severity: FindingSeverity;
  riskLevel: RiskLevel;
  affectedControls: string[];
  evidence: Evidence[];
  impact: string;
  likelihood: string;
  recommendation: string;
  status: FindingStatus;
  assignedTo: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: UrgencyLevel;
  effort: EffortLevel;
  cost: CostLevel;
  benefits: string[];
  risks: string[];
  implementation: ImplementationPlan;
  status: RecommendationStatus;
  assignedTo: string;
  targetDate: Date;
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  dependencies: string[];
  resources: RequiredResource[];
  timeline: number;
  milestones: Milestone[];
}

export interface ImplementationPhase {
  phase: number;
  name: string;
  description: string;
  duration: number;
  activities: string[];
  deliverables: string[];
}

export interface RequiredResource {
  type: ResourceType;
  description: string;
  quantity: number;
  cost?: number;
  availability?: string;
}

export interface Milestone {
  name: string;
  description: string;
  targetDate: Date;
  criteria: string[];
  responsible: string;
}

export interface AccessReview {
  id: string;
  name: string;
  description: string;
  reviewType: ReviewType;
  scope: ReviewScope;
  frequency: ReviewFrequency;
  status: ReviewStatus;
  startDate: Date;
  endDate: Date;
  completionDate?: Date;
  reviewedBy: string[];
  totalItems: number;
  completedItems: number;
  approvedItems: number;
  revokedItems: number;
  flaggedItems: number;
  riskScore: number;
  findings: ReviewFinding[];
  recommendations: string[];
  nextReviewDate: Date;
  metadata: ReviewMetadata;
}

export interface ReviewScope {
  includeUsers: boolean;
  includeGroups: boolean;
  includeRoles: boolean;
  includePermissions: boolean;
  departments: string[];
  systems: string[];
  accessTypes: string[];
  riskLevels: RiskLevel[];
  lastLoginDays?: number;
}

export interface ReviewFinding {
  id: string;
  type: FindingType;
  severity: FindingSeverity;
  description: string;
  affectedItems: string[];
  riskImpact: string;
  recommendation: string;
  status: FindingStatus;
  assignedTo: string;
  dueDate: Date;
}

export interface AccessCertification {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  resourceId: string;
  resourceName: string;
  accessType: string;
  permissions: string[];
  businessJustification: string;
  reviewedBy: string;
  reviewedAt: Date;
  decision: CertificationDecision;
  comments?: string;
  nextCertificationDate: Date;
  riskFlags: string[];
}

export interface ComplianceMetrics {
  overallScore: number;
  controlsTotal: number;
  controlsPassed: number;
  controlsFailed: number;
  controlsInProgress: number;
  violationsOpen: number;
  violationsClosed: number;
  riskDistribution: RiskDistribution;
  frameworkScores: FrameworkScore[];
  trendsData: ComplianceTrend[];
  topViolations: ViolationSummary[];
  remediationProgress: RemediationProgress;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface FrameworkScore {
  framework: string;
  score: number;
  trend: TrendDirection;
  lastAssessment: Date;
}

export interface ComplianceTrend {
  date: Date;
  score: number;
  violations: number;
  controlsPassed: number;
  riskLevel: RiskLevel;
}

export interface ViolationSummary {
  type: string;
  count: number;
  severity: ViolationSeverity;
  trend: TrendDirection;
}

export interface RemediationProgress {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  averageDays: number;
}

export interface ComplianceScope {
  departments: string[];
  systems: string[];
  users: string[];
  processes: string[];
  dataTypes: string[];
  geographicRegions: string[];
}

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  frequency: ReportFrequency;
  timezone: string;
}

export interface ReportMetadata {
  version: string;
  template: string;
  parameters: Record<string, any>;
  dataSourcesUsed: string[];
  confidentialityLevel: ConfidentialityLevel;
  distributionList: string[];
  retentionPeriod: number;
}

export interface ReviewMetadata {
  template: string;
  configuration: Record<string, any>;
  dataSourcesUsed: string[];
  automationLevel: number;
  reviewers: ReviewerInfo[];
}

export interface ReviewerInfo {
  userId: string;
  name: string;
  role: string;
  assignedItems: number;
  completedItems: number;
  lastActivity: Date;
}

// Enums
export enum AuditEventType {
  UserLogin = "user_login",
  UserLogout = "user_logout",
  AccessGranted = "access_granted",
  AccessDenied = "access_denied",
  PermissionChanged = "permission_changed",
  RoleAssigned = "role_assigned",
  RoleRevoked = "role_revoked",
  DataAccess = "data_access",
  DataModification = "data_modification",
  ConfigurationChange = "configuration_change",
  PolicyViolation = "policy_violation",
  SecurityIncident = "security_incident",
  SystemStartup = "system_startup",
  SystemShutdown = "system_shutdown",
  BackupCreated = "backup_created",
  BackupRestored = "backup_restored",
}

export enum AuditCategory {
  Authentication = "authentication",
  Authorization = "authorization",
  DataAccess = "data_access",
  SystemAdmin = "system_admin",
  Security = "security",
  Compliance = "compliance",
  Privacy = "privacy",
  Operations = "operations",
}

export enum AuditSeverity {
  Informational = "informational",
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

export enum AuditOutcome {
  Success = "success",
  Failure = "failure",
  Warning = "warning",
  Error = "error",
  Blocked = "blocked",
}

export enum ChangeType {
  Created = "created",
  Updated = "updated",
  Deleted = "deleted",
  Restored = "restored",
}

export enum Environment {
  Development = "development",
  Testing = "testing",
  Staging = "staging",
  Production = "production",
}

export enum ReportType {
  Compliance = "compliance",
  Security = "security",
  Risk = "risk",
  Performance = "performance",
  Audit = "audit",
  Custom = "custom",
}

export enum ReportStatus {
  Draft = "draft",
  InProgress = "in_progress",
  Review = "review",
  Approved = "approved",
  Published = "published",
  Archived = "archived",
}

export enum ReportFrequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Quarterly = "quarterly",
  SemiAnnually = "semi_annually",
  Annually = "annually",
  OnDemand = "on_demand",
}

export enum ControlType {
  Preventive = "preventive",
  Detective = "detective",
  Corrective = "corrective",
  Compensating = "compensating",
}

export enum ControlFrequency {
  Continuous = "continuous",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Quarterly = "quarterly",
  Annually = "annually",
}

export enum AutomationType {
  FullyAutomated = "fully_automated",
  SemiAutomated = "semi_automated",
  Manual = "manual",
}

export enum ControlStatus {
  Passed = "passed",
  Failed = "failed",
  Warning = "warning",
  NotTested = "not_tested",
  Exception = "exception",
  InProgress = "in_progress",
}

export enum EvidenceType {
  Screenshot = "screenshot",
  Document = "document",
  LogFile = "log_file",
  Configuration = "configuration",
  Report = "report",
  Certificate = "certificate",
  Testimony = "testimony",
}

export enum RemediationStatus {
  Planned = "planned",
  InProgress = "in_progress",
  Completed = "completed",
  Cancelled = "cancelled",
  OnHold = "on_hold",
}

export enum StepStatus {
  NotStarted = "not_started",
  InProgress = "in_progress",
  Completed = "completed",
  Blocked = "blocked",
  Skipped = "skipped",
}

export enum ViolationType {
  PolicyBreach = "policy_breach",
  AccessViolation = "access_violation",
  DataMisuse = "data_misuse",
  ProcedureViolation = "procedure_violation",
  ComplianceFailure = "compliance_failure",
  SecurityIncident = "security_incident",
}

export enum ViolationSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

export enum DetectionSource {
  Automated = "automated",
  ManualReview = "manual_review",
  UserReport = "user_report",
  Audit = "audit",
  Monitoring = "monitoring",
}

export enum ViolationStatus {
  Open = "open",
  InInvestigation = "in_investigation",
  Resolved = "resolved",
  Dismissed = "dismissed",
  Escalated = "escalated",
}

export enum InvolvementType {
  Primary = "primary",
  Secondary = "secondary",
  Witness = "witness",
  Approver = "approver",
}

export enum ResolutionAction {
  AccessRevoked = "access_revoked",
  UserTraining = "user_training",
  PolicyUpdate = "policy_update",
  ProcessImprovement = "process_improvement",
  SystemConfiguration = "system_configuration",
  NoAction = "no_action",
}

export enum FindingCategory {
  AccessControl = "access_control",
  DataProtection = "data_protection",
  SystemSecurity = "system_security",
  ProcessControl = "process_control",
  Governance = "governance",
  Monitoring = "monitoring",
}

export enum FindingSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

export enum FindingStatus {
  New = "new",
  Acknowledged = "acknowledged",
  InProgress = "in_progress",
  Resolved = "resolved",
  Accepted = "accepted",
  Deferred = "deferred",
}

export enum RecommendationCategory {
  Security = "security",
  Compliance = "compliance",
  Risk = "risk",
  Process = "process",
  Technology = "technology",
  Training = "training",
}

export enum RecommendationStatus {
  Proposed = "proposed",
  Approved = "approved",
  InImplementation = "in_implementation",
  Completed = "completed",
  Rejected = "rejected",
  OnHold = "on_hold",
}

export enum EffortLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
  VeryHigh = "very_high",
}

export enum CostLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
  VeryHigh = "very_high",
}

export enum ResourceType {
  Personnel = "personnel",
  Technology = "technology",
  Budget = "budget",
  External = "external",
}

export enum ReviewType {
  AccessCertification = "access_certification",
  RoleCertification = "role_certification",
  PermissionReview = "permission_review",
  OrphanedAccountReview = "orphaned_account_review",
  PrivilegedAccessReview = "privileged_access_review",
  ComplianceReview = "compliance_review",
}

export enum ReviewStatus {
  Planned = "planned",
  InProgress = "in_progress",
  Review = "review",
  Completed = "completed",
  Cancelled = "cancelled",
  Overdue = "overdue",
}

export enum ReviewFrequency {
  Monthly = "monthly",
  Quarterly = "quarterly",
  SemiAnnually = "semi_annually",
  Annually = "annually",
  Continuous = "continuous",
  OnDemand = "on_demand",
}

export enum FindingType {
  ExcessiveAccess = "excessive_access",
  OrphanedAccount = "orphaned_account",
  InactiveUser = "inactive_user",
  PolicyViolation = "policy_violation",
  RiskFlag = "risk_flag",
  ComplianceGap = "compliance_gap",
}

export enum CertificationDecision {
  Approved = "approved",
  Revoked = "revoked",
  Modified = "modified",
  Escalated = "escalated",
  Deferred = "deferred",
}

export enum TrendDirection {
  Improving = "improving",
  Stable = "stable",
  Declining = "declining",
}

export enum ConfidentialityLevel {
  Public = "public",
  Internal = "internal",
  Confidential = "confidential",
  Restricted = "restricted",
}
