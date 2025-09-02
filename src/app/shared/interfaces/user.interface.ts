export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  department: string;
  title: string;
  manager?: string;
  roles: Role[];
  lastLogin?: Date;
  status: UserStatus;
  riskScore: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  riskLevel: RiskLevel;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  targetUserId?: string;
  targetUserName?: string;
  requestType: RequestType;
  application: string;
  requestedRoles: Role[];
  requestedResources: string[];
  justification: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  submittedAt: Date;
  approvals: Approval[];
  riskScore: number;
  deadline?: Date;
}

export interface Approval {
  id: string;
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comments?: string;
  timestamp: Date;
  level: number;
}

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
  Terminated = "terminated",
}

export enum RequestType {
  NewAccess = "new_access",
  ModifyAccess = "modify_access",
  RemoveAccess = "remove_access",
  Emergency = "emergency",
}

export enum RequestStatus {
  Draft = "draft",
  Submitted = "submitted",
  InReview = "in_review",
  Approved = "approved",
  Rejected = "rejected",
  Provisioning = "provisioning",
  Completed = "completed",
  Expired = "expired",
}

export enum ApprovalStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Delegated = "delegated",
}

export enum UrgencyLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

export enum RiskLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}
