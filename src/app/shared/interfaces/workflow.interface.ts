export interface WorkflowNode {
  id: string;
  type: "start" | "approval" | "condition" | "action" | "end";
  title: string;
  description?: string;
  position: { x: number; y: number };
  config?: any;
  connections?: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: "approval" | "notification" | "validation" | "assignment";
  approvers: WorkflowApprover[];
  conditions?: WorkflowCondition[];
  timeouts?: WorkflowTimeout;
  actions?: WorkflowAction[];
  order: number;
}

export interface WorkflowApprover {
  id: string;
  type: "user" | "role" | "group";
  name: string;
  email?: string;
  isRequired: boolean;
  delegateId?: string;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "in";
  value: any;
  logic: "and" | "or";
}

export interface WorkflowTimeout {
  duration: number;
  unit: "minutes" | "hours" | "days";
  action: "escalate" | "auto_approve" | "auto_reject" | "notify";
  escalateTo?: string;
}

export interface WorkflowAction {
  id: string;
  type: "email" | "webhook" | "assignment" | "notification";
  config: any;
  trigger: "on_approval" | "on_rejection" | "on_timeout" | "on_completion";
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  version: string;
  isDefault: boolean;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  nodes?: WorkflowNode[];
  slaConfig: SLAConfiguration;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  stats?: WorkflowStats;
}

export interface WorkflowTrigger {
  id: string;
  type:
    | "request_type"
    | "risk_level"
    | "department"
    | "amount"
    | "resource_type";
  conditions: WorkflowCondition[];
}

export interface SLAConfiguration {
  totalDuration: number;
  unit: "hours" | "days";
  escalationLevels: EscalationLevel[];
  businessHours?: BusinessHours;
}

export interface EscalationLevel {
  level: number;
  triggerAfter: number;
  unit: "hours" | "days";
  escalateTo: WorkflowApprover[];
  actions: WorkflowAction[];
}

export interface BusinessHours {
  startTime: string;
  endTime: string;
  workDays: number[];
  timezone: string;
}

export interface WorkflowStats {
  totalExecutions: number;
  averageCompletionTime: number;
  approvalRate: number;
  slaCompliance: number;
  bottlenecks: WorkflowBottleneck[];
}

export interface WorkflowBottleneck {
  stepId: string;
  stepName: string;
  averageTime: number;
  frequency: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  category:
    | "access_request"
    | "provisioning"
    | "deprovisioning"
    | "emergency"
    | "custom";
  description: string;
  complexity: "simple" | "moderate" | "complex";
  estimatedSetupTime: number;
  workflow: Partial<Workflow>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  requestId: string;
  status: WorkflowExecutionStatus;
  currentStep: string;
  startedAt: Date;
  completedAt?: Date;
  executionTime?: number;
  approvals: WorkflowApprovalRecord[];
  errors?: string[];
}

export interface WorkflowApprovalRecord {
  stepId: string;
  approverId: string;
  decision: "approved" | "rejected" | "pending";
  comments?: string;
  decidedAt?: Date;
  delegatedFrom?: string;
}

export enum WorkflowStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
  Testing = "testing",
}

export enum WorkflowExecutionStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Approved = "approved",
  Rejected = "rejected",
  Cancelled = "cancelled",
  TimedOut = "timed_out",
  Error = "error",
}

export interface WorkflowAnalytics {
  totalWorkflows: number;
  activeWorkflows: number;
  draftWorkflows: number;
  totalExecutions: number;
  averageCompletionTime: number;
  slaComplianceRate: number;
  approvalRate: number;
  topBottlenecks: WorkflowBottleneck[];
  performanceMetrics: PerformanceMetric[];
}

export interface PerformanceMetric {
  workflowId: string;
  workflowName: string;
  executions: number;
  averageTime: number;
  slaCompliance: number;
  approvalRate: number;
}
