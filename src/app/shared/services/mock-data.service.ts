import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import {
  AccessRequest,
  User,
  RequestStatus,
  UrgencyLevel,
  RiskLevel,
  UserStatus,
  RequestType,
  ApprovalStatus,
} from "../interfaces/user.interface";
import { ApprovalManagementService } from "./approval-management.service";
import { ApprovalDecision, ApprovalStatus as AMApprovalStatus, RequestType as AMRequestType } from "../interfaces/approval-management.interface";
import { AuthService } from "./auth.service";
import { AccessManagementService } from "./access-management.service";

@Injectable({
  providedIn: "root",
})
export class MockDataService {
  constructor(private approvalService: ApprovalManagementService, private authService: AuthService, private accessManagementService: any) {}
  private currentUser = {
    id: "1",
    email: "john.doe@company.com",
    firstName: "John",
    lastName: "Doe",
    displayName: "John Doe",
    department: "Engineering",
    title: "Senior Software Engineer",
    manager: "Jane Smith",
    roles: [
      {
        id: "r1",
        name: "Employee",
        description: "Standard employee access",
        permissions: [],
        riskLevel: RiskLevel.Low,
      },
    ],
    status: UserStatus.Active,
  };

  private dashboardMetrics = {
    totalRequests: 1247,
    pendingApprovals: 23,
    activeUsers: 3842,
    requestsTrend: "+12%",
    approvalsTrend: "-8%",
    usersTrend: "+3%",
    riskTrend: "+5%",
  };

  private mockRequests: AccessRequest[] = [
    {
      id: "req-001",
      requesterId: "2",
      requesterName: "Sarah Wilson",
      requestType: RequestType.NewAccess,
      application: "database",
      requestedRoles: [
        {
          id: "r2",
          name: "Database Admin",
          description: "Database administration access",
          permissions: [],
          riskLevel: RiskLevel.High,
        },
      ],
      requestedResources: ["Production Database", "Backup Systems"],
      justification:
        "Need access to troubleshoot critical production issues and perform database maintenance tasks.",
      urgency: UrgencyLevel.High,
      status: RequestStatus.InReview,
      submittedAt: new Date("2024-01-15T10:30:00"),
      approvals: [
        {
          id: "app-001",
          approverId: "3",
          approverName: "Mike Johnson",
          status: ApprovalStatus.Approved,
          comments: "Approved for production support",
          timestamp: new Date("2024-01-15T11:00:00"),
          level: 1,
        },
      ],
      deadline: new Date("2024-01-17T17:00:00"),
    },
    {
      id: "req-002",
      requesterId: "4",
      requesterName: "Alex Chen",
      requestType: RequestType.ModifyAccess,
      application: "jira",
      requestedRoles: [
        {
          id: "r3",
          name: "Security Analyst",
          description: "Security analysis and monitoring",
          permissions: [],
          riskLevel: RiskLevel.Medium,
        },
      ],
      requestedResources: ["SIEM Tools", "Security Dashboards"],
      justification:
        "Temporary assignment to security team for Q1 compliance audit.",
      urgency: UrgencyLevel.Medium,
      status: RequestStatus.Submitted,
      submittedAt: new Date("2024-01-16T09:15:00"),
      approvals: [],
    },
    {
      id: "req-003",
      requesterId: "5",
      requesterName: "Emma Davis",
      requestType: RequestType.Emergency,
      application: "aws",
      requestedRoles: [
        {
          id: "r4",
          name: "Emergency Admin",
          description: "Emergency administrative access",
          permissions: [],
          riskLevel: RiskLevel.Critical,
        },
      ],
      requestedResources: ["All Systems"],
      justification:
        "Critical system outage - need immediate access to restore services.",
      urgency: UrgencyLevel.Critical,
      status: RequestStatus.Approved,
      submittedAt: new Date("2024-01-16T14:45:00"),
      approvals: [
        {
          id: "app-002",
          approverId: "6",
          approverName: "David Brown",
          status: ApprovalStatus.Approved,
          comments: "Emergency approval granted",
          timestamp: new Date("2024-01-16T14:50:00"),
          level: 1,
        },
      ],
      deadline: new Date("2024-01-16T18:00:00"),
    },
  ];

  getCurrentUser(): Observable<User> {
    return of(this.currentUser).pipe(delay(300));
  }

  getDashboardMetrics(): Observable<any> {
    return of(this.dashboardMetrics).pipe(delay(500));
  }

  getAccessRequests(): Observable<AccessRequest[]> {
    return of(this.mockRequests).pipe(delay(400));
  }

  getPendingApprovals(): Observable<AccessRequest[]> {
    const pending = this.mockRequests.filter(
      (req) =>
        req.status === RequestStatus.InReview ||
        req.status === RequestStatus.Submitted,
    );
    return of(pending).pipe(delay(400));
  }

  getMyRequests(userId: string): Observable<AccessRequest[]> {
    const myRequests = this.mockRequests.filter(
      (req) => req.requesterId === userId,
    );
    return of(myRequests).pipe(delay(400));
  }

  submitAccessRequest(
    request: Partial<AccessRequest>,
  ): Observable<AccessRequest> {
    const authUser = this.authService.getCurrentUser();

    const requesterId = authUser?.id || this.currentUser.id;
    const requesterName = authUser?.name || this.currentUser.displayName;

    // Build payload for AccessManagementService so the access request is created in the central store
    const accessPayload: any = {
      requesterId: requesterId,
      requesterName: requesterName,
      userIds: request.requestedResources || [],
      applicationId: "",
      applicationName: (request as any).application || "",
      accessLevel: undefined,
      justification: request.justification || "",
      department: (authUser as any)?.department || (this.currentUser as any).department || '',
      requestType: request.requestType,
      priority: undefined,
    };

    // Create the access request in AccessManagementService so the Application Owner UI sees it
    try {
      return this.approvalService
        ? this.approvalService
            .createApprovalRequestFromAccess
            ? this.createRequestAndApproval(accessPayload, requesterId, requesterName)
            : of(null as any)
        : of(null as any);
    } catch (e) {
      return of(null as any);
    }
  }

  // Helper to create access request in AccessManagementService then create approval
  private createRequestAndApproval(accessPayload: any, requesterId: string, requesterName: string): Observable<AccessRequest> {
    // Use the central AccessManagementService to create the access request so the Application Owner UI sees it
    try {
      return this.accessManagementService
        .createAccessRequest(accessPayload)
        .pipe(
          map((created: any) => {
            // Once access request exists in AccessManagementService, create corresponding approval payload
            try {
              const demoUsers = this.authService.getDemoUsers ? this.authService.getDemoUsers() : [];
              const managerDemo = demoUsers.find((u: any) => u.role === "manager");
              const ownerDemo = demoUsers.find((u: any) => u.role === "application_owner");
              const approvalPayload: any = {
                requestId: created.id,
                requestType: AMRequestType.AccessRequest,
                requestedBy: {
                  id: requesterId,
                  name: requesterName,
                  email: (this.authService.getCurrentUser() as any)?.email || this.currentUser.email || '',
                  employeeId: requesterId,
                  department: (this.authService.getCurrentUser() as any)?.department || (this.currentUser as any).department || '',
                  title: (this.authService.getCurrentUser() as any)?.title || (this.currentUser as any).title || '',
                  manager: (this.authService.getCurrentUser() as any)?.manager || (this.currentUser as any).manager || '',
                },
                requestTitle: `${created.requestType || 'Request'} - ${created.applicationName || created.application || 'Application'}`,
                description: created.justification || '',
                justification: created.justification || '',
                urgency: created.urgency || UrgencyLevel.Medium,
                riskFactors: [],
                requestedAccess: (created.userIds || []).map((r: any, idx: number) => ({
                  id: `ra-${idx}`,
                  type: "application_access",
                  name: r,
                  description: r,
                  riskLevel: RiskLevel.Low,
                  system: created.applicationName || created.application || "",
                  permissions: [],
                  isTemporary: false,
                })),
                currentLevel: 1,
                totalLevels: 2,
                approvalChain: [
                  {
                    level: 1,
                    approverId: managerDemo?.id || "manager-001",
                    approverName: managerDemo?.name || "Department Manager",
                    approverTitle: "Manager",
                    approverEmail: managerDemo?.email || "manager@company.com",
                    status: ApprovalDecision.Pending,
                    isRequired: true,
                    isDelegated: false,
                    escalationLevel: 0,
                  },
                  {
                    level: 2,
                    approverId: ownerDemo?.id || "owner-001",
                    approverName: ownerDemo?.name || "Application Owner",
                    approverTitle: "App Owner",
                    approverEmail: ownerDemo?.email || "owner@company.com",
                    status: ApprovalDecision.Pending,
                    isRequired: true,
                    isDelegated: false,
                    escalationLevel: 0,
                  },
                ],
                status: AMApprovalStatus.Pending,
                submittedAt: created.submittedAt,
                slaBreachWarning: false,
                conflictChecks: [],
                attachments: [],
                metadata: {
                  priority: "normal",
                  source: "ui",
                  complianceFlags: [],
                  auditTrail: [],
                  tags: [],
                },
              };

              this.approvalService.createApprovalRequestFromAccess(approvalPayload);
            } catch (e) {
              // swallow
            }

            // Also keep a local copy for MockDataService consumers
            this.mockRequests.unshift(created as any);

            return created as AccessRequest;
          }),
        );
    } catch (e) {
      return of({} as AccessRequest).pipe(delay(100));
    }
  }

  approveRequest(requestId: string, comments?: string): Observable<boolean> {
    const request = this.mockRequests.find((r) => r.id === requestId);
    if (request) {
      request.status = RequestStatus.Approved;
      request.approvals.push({
        id: `app-${Date.now()}`,
        approverId: this.currentUser.id,
        approverName: this.currentUser.displayName,
        status: ApprovalStatus.Approved,
        comments: comments,
        timestamp: new Date(),
        level: 1,
      });
    }
    return of(true).pipe(delay(300));
  }

  rejectRequest(requestId: string, comments: string): Observable<boolean> {
    const request = this.mockRequests.find((r) => r.id === requestId);
    if (request) {
      request.status = RequestStatus.Rejected;
      request.approvals.push({
        id: `app-${Date.now()}`,
        approverId: this.currentUser.id,
        approverName: this.currentUser.displayName,
        status: ApprovalStatus.Rejected,
        comments: comments,
        timestamp: new Date(),
        level: 1,
      });
    }
    return of(true).pipe(delay(300));
  }
}
