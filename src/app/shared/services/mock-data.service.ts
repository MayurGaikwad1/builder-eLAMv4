import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
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

@Injectable({
  providedIn: "root",
})
export class MockDataService {
  constructor(private approvalService: ApprovalManagementService) {}
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
    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      requesterId: this.currentUser.id,
      requesterName: this.currentUser.displayName,
      requestType: request.requestType || RequestType.NewAccess,
      application: (request as any).application || "",
      requestedRoles: request.requestedRoles || [],
      requestedResources: request.requestedResources || [],
      justification: request.justification || "",
      urgency: request.urgency || UrgencyLevel.Medium,
      status: RequestStatus.Submitted,
      submittedAt: new Date(),
      approvals: [],
    };

    this.mockRequests.unshift(newRequest);
    return of(newRequest).pipe(delay(300));
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
