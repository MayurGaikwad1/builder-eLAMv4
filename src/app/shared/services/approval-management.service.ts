import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import {
  ApprovalRequest,
  ApprovalAction,
  BulkApprovalAction,
  ApprovalStatistics,
  ApprovalDelegation,
  ApprovalWorkflow,
  RequestType,
  ApprovalStatus,
  ApprovalDecision,
  ApprovalActionType,
  ApprovalPriority,
  RiskFactorType,
  ConflictType,
  ConflictSeverity,
  AccessType,
} from "../interfaces/approval-management.interface";
import { UrgencyLevel, RiskLevel } from "../interfaces/user.interface";
import { AuthService } from "./auth.service";
import { AccessManagementService } from "./access-management.service";

@Injectable({
  providedIn: "root",
})
export class ApprovalManagementService {
  private approvalRequestsSubject = new BehaviorSubject<ApprovalRequest[]>([]);
  private delegationsSubject = new BehaviorSubject<ApprovalDelegation[]>([]);
  private workflowsSubject = new BehaviorSubject<ApprovalWorkflow[]>([]);
  private statisticsSubject = new BehaviorSubject<ApprovalStatistics>(
    {} as ApprovalStatistics,
  );

  private currentUserId = "current-user";
  private currentUserEmail = "";
  private currentUserName = "";

  constructor(private authService: AuthService, private accessManagementService: AccessManagementService) {
    // Keep approval service aware of the logged-in user
    this.authService.currentUser$.subscribe((u) => {
      this.currentUserId = u?.id || "current-user";
      this.currentUserEmail = (u?.email || "").toString().toLowerCase();
      this.currentUserName = (u?.name || "").toString().toLowerCase();
    });

    this.initializeMockData();

    // Debug helper: dump approval requests and specific request to console to aid tracing
    // This will log on service initialization (helpful after hot-reload)
    setTimeout(() => {
      try {
        // Log summary
        // eslint-disable-next-line no-console
        console.groupCollapsed && console.groupCollapsed('DEBUG: approvalRequests dump');
        // eslint-disable-next-line no-console
        console.log('Approval requests count:', this.approvalRequestsSubject.value.length);
        // eslint-disable-next-line no-console
        console.log(this.approvalRequestsSubject.value.map(r => ({ id: r.id, requestId: r.requestId, status: r.status, currentLevel: r.currentLevel })));

        const debugId = 'req-1757052178208';
        const byReq = this.approvalRequestsSubject.value.find(r => r.requestId === debugId || r.id === debugId);
        // eslint-disable-next-line no-console
        console.log('Lookup for', debugId, byReq || 'NOT FOUND');
        // eslint-disable-next-line no-console
        console.groupEnd && console.groupEnd();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Debug dump failed', e);
      }
    }, 1500);
  }

  // Allows other services/components to add approval requests (e.g. when a user submits an access request)
  public createApprovalRequestFromAccess(payload: Partial<ApprovalRequest>): ApprovalRequest {
    const request: ApprovalRequest = {
      id: payload.id || `apr-${Date.now()}`,
      requestId: payload.requestId || payload.id || `req-${Date.now()}`,
      requestType: payload.requestType || RequestType.AccessRequest,
      requestedBy: payload.requestedBy || ({} as any),
      requestedFor: payload.requestedFor,
      requestTitle: payload.requestTitle || payload.requestId || "Access Request",
      description: payload.description || payload.justification || "",
      justification: payload.justification || "",
      urgency: payload.urgency || UrgencyLevel.Medium,
      riskFactors: payload.riskFactors || [],
      requestedAccess: payload.requestedAccess || [],
      currentLevel: payload.currentLevel || 1,
      totalLevels: payload.totalLevels || 2,
      approvalChain: (payload.approvalChain || []).map((c: any) => ({
        ...c,
        approverEmail: (c?.approverEmail || "").toString().toLowerCase(),
        approverName: (c?.approverName || "").toString().toLowerCase(),
      })),
      status: payload.status || ApprovalStatus.Pending,
      submittedAt: payload.submittedAt || new Date(),
      deadline: payload.deadline,
      renewalDate: payload.renewalDate,
      slaBreachWarning: payload.slaBreachWarning || false,
      conflictChecks: payload.conflictChecks || [],
      attachments: payload.attachments || [],
      metadata:
        payload.metadata ||
        ({
          priority: ApprovalPriority.Normal,
          source: "ui",
          workflowId: (payload as any).metadata?.workflowId,
          complianceFlags: [],
          auditTrail: [],
          tags: [],
        } as any),
    };

    const current = this.approvalRequestsSubject.value;
    this.approvalRequestsSubject.next([request, ...current]);
    this.updateStatistics();

    return request;
  }

  // Approval Requests
  getApprovalRequests(): Observable<ApprovalRequest[]> {
    return this.approvalRequestsSubject.asObservable();
  }

  getPendingApprovals(): Observable<ApprovalRequest[]> {
    return this.approvalRequestsSubject.pipe(
      map((requests) =>
        requests.filter(
          (req) =>
            req.status === ApprovalStatus.Pending ||
            req.status === ApprovalStatus.InReview,
        ),
      ),
    );
  }

  getMyApprovals(): Observable<ApprovalRequest[]> {
    return this.approvalRequestsSubject.pipe(
      map((requests) =>
        requests.filter((req) => {
          const chainMatch = req.approvalChain.some((chain) => {
            const idMatch = chain.approverId === this.currentUserId;
            const emailMatch = ((chain as any).approverEmail || "").toString().toLowerCase() === this.currentUserEmail;
            const nameMatch = ((chain as any).approverName || "").toString().toLowerCase() === this.currentUserName;
            return (idMatch || emailMatch || nameMatch) && chain.status === ApprovalDecision.Pending;
          });

          if (chainMatch) return true;

          // Fallback: include requests where the current user is the manager of the requester
          const mgrRaw = req.requestedBy && (req.requestedBy as any).manager ? (req.requestedBy as any).manager : null;
          const mgr = mgrRaw ? mgrRaw.toString().toLowerCase() : null;
          const managerMatch = mgr ? (mgr === this.currentUserName || mgr === this.currentUserEmail) : false;

          if (managerMatch) {
            // Only include if there is at least one pending approval in the chain
            return req.approvalChain.some((c) => c.status === ApprovalDecision.Pending);
          }

          return false;
        }),
      ),
    );
  }

  getDelegatedApprovals(): Observable<ApprovalRequest[]> {
    return this.approvalRequestsSubject.pipe(
      map((requests) =>
        requests.filter((req) =>
          req.approvalChain.some(
            (chain) =>
              chain.isDelegated &&
              chain.delegatedTo?.id === this.currentUserId &&
              chain.status === ApprovalDecision.Pending,
          ),
        ),
      ),
    );
  }

  getEscalatedApprovals(): Observable<ApprovalRequest[]> {
    return this.approvalRequestsSubject.pipe(
      map((requests) =>
        requests.filter(
          (req) =>
            req.status === ApprovalStatus.Escalated &&
            req.approvalChain.some(
              (chain) => chain.approverId === this.currentUserId,
            ),
        ),
      ),
    );
  }

  getApprovalRequestById(id: string): Observable<ApprovalRequest | undefined> {
    return this.approvalRequestsSubject.pipe(
      map((requests) => requests.find((req) => req.id === id)),
    );
  }

  searchApprovalRequests(
    query: string,
    filters?: any,
  ): Observable<ApprovalRequest[]> {
    return this.approvalRequestsSubject.pipe(
      map((requests) => {
        let filtered = requests.filter(
          (req) =>
            req.requestTitle.toLowerCase().includes(query.toLowerCase()) ||
            req.requestedBy.name.toLowerCase().includes(query.toLowerCase()) ||
            req.description.toLowerCase().includes(query.toLowerCase()),
        );

        if (filters) {
          if (filters.status) {
            filtered = filtered.filter((req) => req.status === filters.status);
          }
          if (filters.urgency) {
            filtered = filtered.filter(
              (req) => req.urgency === filters.urgency,
            );
          }
        }

        return filtered;
      }),
      delay(300),
    );
  }

  // Approval Actions
  processApprovalAction(action: ApprovalAction): Observable<boolean> {
    const requests = this.approvalRequestsSubject.value;
    const request = requests.find((r) => r.id === action.requestId);

    if (request) {
      const currentChainItem = request.approvalChain.find(
        (chain) =>
          chain.approverId === this.currentUserId &&
          chain.status === ApprovalDecision.Pending,
      );

      if (currentChainItem) {
        currentChainItem.status = this.mapActionToDecision(action.type);
        currentChainItem.comments = action.comments;
        currentChainItem.timestamp = new Date();
        currentChainItem.timeSpent =
          action.timeSpent || Math.floor(Math.random() * 30) + 5;

        // Update request status based on approval chain
        this.updateRequestStatus(request);

        // Log audit entry
        this.addAuditEntry(request, action.type, action.comments);

        this.approvalRequestsSubject.next([...requests]);
        this.updateStatistics();

        // Sync to access management so Application Owner dashboard sees updates
        try {
          const mappedStatus = this.mapActionToDecision(action.type);
          // Debug: log approval request and mapping
          // eslint-disable-next-line no-console
          console.log('[ApprovalManagement] processApprovalAction:', { actionType: action.type, mappedStatus, approvalRequestId: request.id, approvalRequestRequestId: request.requestId, currentLevel: request.currentLevel, approvalChain: request.approvalChain.map(c => ({ level: c.level, status: c.status, approverId: c.approverId, approverEmail: (c as any).approverEmail })) });

          if (mappedStatus === ApprovalDecision.Approved) {
            // call access management approve
            this.accessManagementService.approveRequest(request.requestId, this.currentUserId, action.comments).subscribe((res) => {
              // eslint-disable-next-line no-console
              console.log('[ApprovalManagement] called accessManagement.approveRequest', { requestId: request.requestId, approverId: this.currentUserId, result: res });
            });
          } else if (mappedStatus === ApprovalDecision.Rejected) {
            // call access management reject
            this.accessManagementService.rejectRequest?.(request.requestId, this.currentUserId, action.comments)?.subscribe((res) => {
              // eslint-disable-next-line no-console
              console.log('[ApprovalManagement] called accessManagement.rejectRequest', { requestId: request.requestId, approverId: this.currentUserId, result: res });
            });
          }
        } catch (e) {
          // best-effort sync
          // eslint-disable-next-line no-console
          console.error('[ApprovalManagement] sync to access management failed', e);
        }
      }
    }

    return of(true).pipe(delay(500));
  }

  processBulkApprovalAction(
    bulkAction: BulkApprovalAction,
  ): Observable<boolean> {
    const requests = this.approvalRequestsSubject.value;

    bulkAction.requestIds.forEach((requestId) => {
      const action: ApprovalAction = {
        type: bulkAction.action,
        requestId,
        comments: bulkAction.comments,
        conditions: bulkAction.conditions,
      };
      this.processApprovalAction(action).subscribe();
    });

    return of(true).pipe(delay(800));
  }

  delegateApproval(
    requestId: string,
    delegateToId: string,
    comments?: string,
  ): Observable<boolean> {
    const requests = this.approvalRequestsSubject.value;
    const request = requests.find((r) => r.id === requestId);

    if (request) {
      const currentChainItem = request.approvalChain.find(
        (chain) =>
          chain.approverId === this.currentUserId &&
          chain.status === ApprovalDecision.Pending,
      );

      if (currentChainItem) {
        currentChainItem.isDelegated = true;
        currentChainItem.delegatedTo = {
          id: delegateToId,
          name: "Delegated User",
          email: "delegate@company.com",
          employeeId: "EMP999",
          department: "Various",
          title: "Delegate",
        };
        currentChainItem.status = ApprovalDecision.Delegated;
        currentChainItem.comments = comments;
        currentChainItem.timestamp = new Date();

        request.status = ApprovalStatus.Delegated;
        this.addAuditEntry(request, "delegated", comments);

        this.approvalRequestsSubject.next([...requests]);
      }
    }

    return of(true).pipe(delay(400));
  }

  // Statistics
  getApprovalStatistics(): Observable<ApprovalStatistics> {
    return this.statisticsSubject.asObservable();
  }

  // Delegations
  getDelegations(): Observable<ApprovalDelegation[]> {
    return this.delegationsSubject.asObservable();
  }

  createDelegation(
    delegation: Partial<ApprovalDelegation>,
  ): Observable<ApprovalDelegation> {
    const newDelegation: ApprovalDelegation = {
      id: `del-${Date.now()}`,
      delegatorId: this.currentUserId,
      delegatorName: "John Doe",
      delegateId: delegation.delegateId!,
      delegateName: delegation.delegateName!,
      startDate: delegation.startDate || new Date(),
      endDate: delegation.endDate!,
      isActive: true,
      scope: delegation.scope!,
      conditions: delegation.conditions || [],
      approvalTypes: delegation.approvalTypes || [RequestType.AccessRequest],
      maxRiskLevel: delegation.maxRiskLevel || RiskLevel.Medium,
      createdAt: new Date(),
    };

    const delegations = this.delegationsSubject.value;
    this.delegationsSubject.next([...delegations, newDelegation]);

    return of(newDelegation).pipe(delay(300));
  }

  // Workflows
  getWorkflows(): Observable<ApprovalWorkflow[]> {
    return this.workflowsSubject.asObservable();
  }

  // Helper methods
  private mapActionToDecision(
    actionType: ApprovalActionType,
  ): ApprovalDecision {
    const mapping = {
      [ApprovalActionType.Approve]: ApprovalDecision.Approved,
      [ApprovalActionType.Reject]: ApprovalDecision.Rejected,
      [ApprovalActionType.Delegate]: ApprovalDecision.Delegated,
      [ApprovalActionType.Escalate]: ApprovalDecision.Escalated,
      [ApprovalActionType.ConditionalApprove]:
        ApprovalDecision.ConditionalApproval,
      [ApprovalActionType.RequestMoreInfo]: ApprovalDecision.Pending,
      [ApprovalActionType.BulkApprove]: ApprovalDecision.Approved,
      [ApprovalActionType.BulkReject]: ApprovalDecision.Rejected,
    };
    return mapping[actionType];
  }

  private updateRequestStatus(request: ApprovalRequest): void {
    const pendingApprovals = request.approvalChain.filter(
      (chain) => chain.isRequired && chain.status === ApprovalDecision.Pending,
    );

    if (pendingApprovals.length === 0) {
      const hasRejections = request.approvalChain.some(
        (chain) => chain.status === ApprovalDecision.Rejected,
      );
      request.status = hasRejections
        ? ApprovalStatus.Rejected
        : ApprovalStatus.Approved;
    } else {
      request.status = ApprovalStatus.InReview;
    }
  }

  private addAuditEntry(
    request: ApprovalRequest,
    action: string,
    comments?: string,
  ): void {
    request.metadata.auditTrail.push({
      action,
      performedBy: this.currentUserId,
      timestamp: new Date(),
      details: { comments, action },
      ipAddress: "192.168.1.100",
    });
  }

  private getRiskRange(level: string): { min: number; max: number } {
    const ranges = {
      low: { min: 0, max: 25 },
      medium: { min: 26, max: 60 },
      high: { min: 61, max: 85 },
      critical: { min: 86, max: 100 },
    };
    return ranges[level as keyof typeof ranges] || { min: 0, max: 100 };
  }

  private updateStatistics(): void {
    const requests = this.approvalRequestsSubject.value;
    const pending = requests.filter(
      (r) =>
        r.status === ApprovalStatus.Pending ||
        r.status === ApprovalStatus.InReview,
    );
    const myPending = requests.filter((r) =>
      r.approvalChain.some(
        (chain) =>
          chain.approverId === this.currentUserId &&
          chain.status === ApprovalDecision.Pending,
      ),
    );

    const stats: ApprovalStatistics = {
      totalPending: pending.length,
      highPriority: pending.filter(
        (r) =>
          r.urgency === UrgencyLevel.High ||
          r.urgency === UrgencyLevel.Critical,
      ).length,
      slaBreaches: pending.filter((r) => r.slaBreachWarning).length,
      avgProcessingTime: 2.5,
      approvalRate: 87,
      myPending: myPending.length,
      delegatedToMe: 2,
      escalatedToMe: 1,
      completedToday: 12,
      queueDistribution: {
        level1: pending.filter((r) => r.currentLevel === 1).length,
        level2: pending.filter((r) => r.currentLevel === 2).length,
        level3: pending.filter((r) => r.currentLevel === 3).length,
        emergency: pending.filter((r) => r.urgency === UrgencyLevel.Critical)
          .length,
      },
      performanceMetrics: {
        avgDecisionTime: 1.8,
        slaCompliance: 94,
        escalationRate: 8,
        delegationRate: 12,
        throughput: 45,
      },
    };

    this.statisticsSubject.next(stats);
  }

  private initializeMockData(): void {
    const mockRequests: ApprovalRequest[] = [
      {
        id: "apr-001",
        requestId: "req-001",
        requestType: RequestType.SystemAccess,
        requestedBy: {
          id: "user-001",
          name: "Sarah Wilson",
          email: "sarah.wilson@company.com",
          employeeId: "EMP001",
          department: "Engineering",
          title: "Senior Software Engineer",
          manager: "Mike Johnson",
        },
        requestTitle: "Production Database Access",
        description:
          "Requesting access to production database for troubleshooting critical performance issues.",
        justification:
          "Critical production issue affecting customer transactions. Need immediate database access to identify and resolve performance bottlenecks.",
        urgency: UrgencyLevel.High,
        riskFactors: [
          {
            type: RiskFactorType.HighPrivilegeAccess,
            description: "Production database access with elevated privileges",
            severity: RiskLevel.High,
            impact: 8,
            autoDetected: true,
          },
          {
            type: RiskFactorType.SensitiveData,
            description: "Access to customer financial data",
            severity: RiskLevel.Medium,
            impact: 6,
            autoDetected: true,
          },
        ],
        requestedAccess: [
          {
            id: "acc-001",
            type: AccessType.DatabaseAccess,
            name: "Production DB - Read/Write",
            description: "Full read/write access to production database",
            riskLevel: RiskLevel.High,
            system: "PostgreSQL Production",
            permissions: ["SELECT", "UPDATE", "DELETE", "CREATE"],
            isTemporary: true,
            duration: 24,
            expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        ],
        currentLevel: 2,
        totalLevels: 3,
        approvalChain: [
          {
            level: 1,
            approverId: "mgr-001",
            approverName: "Mike Johnson",
            approverTitle: "Engineering Manager",
            approverEmail: "mike.johnson@company.com",
            status: ApprovalDecision.Approved,
            isRequired: true,
            isDelegated: false,
            decision: ApprovalDecision.Approved,
            comments: "Approved for production troubleshooting",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            timeSpent: 15,
            escalationLevel: 0,
          },
          {
            level: 2,
            approverId: "current-user",
            approverName: "John Doe",
            approverTitle: "Security Manager",
            approverEmail: "john.doe@company.com",
            status: ApprovalDecision.Pending,
            isRequired: true,
            isDelegated: false,
            escalationLevel: 0,
          },
          {
            level: 3,
            approverId: "dba-001",
            approverName: "Alice Smith",
            approverTitle: "Database Administrator",
            approverEmail: "alice.smith@company.com",
            status: ApprovalDecision.Pending,
            isRequired: true,
            isDelegated: false,
            escalationLevel: 0,
          },
        ],
        status: ApprovalStatus.InReview,
        submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
        slaBreachWarning: false,
        conflictChecks: [
          {
            type: ConflictType.SeparationOfDuties,
            severity: ConflictSeverity.Medium,
            description: "User already has development database access",
            conflictingAccess: ["Development DB Access"],
            recommendation: "Consider temporary time-bound access",
            canOverride: true,
          },
        ],
        attachments: [
          {
            id: "att-001",
            fileName: "incident-report.pdf",
            fileType: "application/pdf",
            fileSize: 245760,
            uploadedBy: "Sarah Wilson",
            uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            downloadUrl: "/api/attachments/att-001",
          },
        ],
        metadata: {
          priority: ApprovalPriority.High,
          source: "self-service-portal",
          complianceFlags: ["SOX", "PCI-DSS"],
          auditTrail: [
            {
              action: "request_submitted",
              performedBy: "user-001",
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
              details: { requestType: "system_access" },
              ipAddress: "192.168.1.150",
            },
          ],
          tags: ["production", "database", "emergency"],
        },
      },
      {
        id: "apr-002",
        requestId: "req-002",
        requestType: RequestType.RoleChange,
        requestedBy: {
          id: "user-002",
          name: "Alex Chen",
          email: "alex.chen@company.com",
          employeeId: "EMP002",
          department: "Security",
          title: "Security Analyst",
        },
        requestTitle: "Security Analyst Role Upgrade",
        description:
          "Requesting upgrade to Senior Security Analyst role with additional SIEM access.",
        justification:
          "Promotion approved by HR. Need additional privileges for advanced threat hunting and incident response.",
        urgency: UrgencyLevel.Medium,
        riskFactors: [
          {
            type: RiskFactorType.HighPrivilegeAccess,
            description: "Advanced SIEM and security tool access",
            severity: RiskLevel.Medium,
            impact: 5,
            autoDetected: true,
          },
        ],
        requestedAccess: [
          {
            id: "acc-002",
            type: AccessType.ApplicationAccess,
            name: "SIEM Advanced Features",
            description: "Advanced SIEM analysis and configuration tools",
            riskLevel: RiskLevel.Medium,
            system: "Splunk SIEM",
            permissions: [
              "advanced_search",
              "correlation_rules",
              "dashboard_admin",
            ],
            isTemporary: false,
          },
        ],
        currentLevel: 1,
        totalLevels: 2,
        approvalChain: [
          {
            level: 1,
            approverId: "current-user",
            approverName: "John Doe",
            approverTitle: "Security Manager",
            approverEmail: "john.doe@company.com",
            status: ApprovalDecision.Pending,
            isRequired: true,
            isDelegated: false,
            escalationLevel: 0,
          },
          {
            level: 2,
            approverId: "ciso-001",
            approverName: "David Brown",
            approverTitle: "CISO",
            approverEmail: "david.brown@company.com",
            status: ApprovalDecision.Pending,
            isRequired: true,
            isDelegated: false,
            escalationLevel: 0,
          },
        ],
        status: ApprovalStatus.Pending,
        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 47 * 60 * 60 * 1000),
        slaBreachWarning: false,
        conflictChecks: [],
        attachments: [],
        metadata: {
          priority: ApprovalPriority.Normal,
          source: "hr-system",
          complianceFlags: ["ISO27001"],
          auditTrail: [
            {
              action: "request_submitted",
              performedBy: "user-002",
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
              details: { requestType: "role_change" },
              ipAddress: "192.168.1.175",
            },
          ],
          tags: ["promotion", "security", "siem"],
        },
      },
      {
        id: "apr-003",
        requestId: "req-003",
        requestType: RequestType.EmergencyAccess,
        requestedBy: {
          id: "user-003",
          name: "Emma Davis",
          email: "emma.davis@company.com",
          employeeId: "EMP003",
          department: "Operations",
          title: "Operations Manager",
        },
        requestTitle: "Emergency Admin Access",
        description:
          "Emergency access required for critical system outage recovery.",
        justification:
          "Major system outage affecting all customer services. Need immediate administrative access to restore operations.",
        urgency: UrgencyLevel.Critical,
        riskFactors: [
          {
            type: RiskFactorType.EmergencyRequest,
            description: "Emergency access with elevated privileges",
            severity: RiskLevel.Critical,
            impact: 10,
            autoDetected: true,
          },
          {
            type: RiskFactorType.OutsideBusinessHours,
            description: "Request submitted outside business hours",
            severity: RiskLevel.Medium,
            impact: 3,
            autoDetected: true,
          },
        ],
        requestedAccess: [
          {
            id: "acc-003",
            type: AccessType.AdminRights,
            name: "Emergency Admin",
            description: "Full administrative access to production systems",
            riskLevel: RiskLevel.Critical,
            system: "All Production Systems",
            permissions: ["admin", "emergency_access"],
            isTemporary: true,
            duration: 4,
            expiryDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
          },
        ],
        currentLevel: 1,
        totalLevels: 1,
        approvalChain: [
          {
            level: 1,
            approverId: "current-user",
            approverName: "John Doe",
            approverTitle: "Security Manager",
            approverEmail: "john.doe@company.com",
            status: ApprovalDecision.Pending,
            isRequired: true,
            isDelegated: false,
            escalationLevel: 1,
          },
        ],
        status: ApprovalStatus.Escalated,
        submittedAt: new Date(Date.now() - 30 * 60 * 1000),
        deadline: new Date(Date.now() + 30 * 60 * 1000),
        slaBreachWarning: true,
        conflictChecks: [
          {
            type: ConflictType.PrivilegeEscalation,
            severity: ConflictSeverity.Critical,
            description: "Requesting significant privilege escalation",
            conflictingAccess: [],
            recommendation:
              "Immediate review required due to high privilege level",
            canOverride: false,
          },
        ],
        attachments: [],
        metadata: {
          priority: ApprovalPriority.Emergency,
          source: "emergency-portal",
          complianceFlags: ["EMERGENCY"],
          auditTrail: [
            {
              action: "emergency_request_submitted",
              performedBy: "user-003",
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              details: {
                requestType: "emergency_access",
                incident: "SYS-2024-001",
              },
              ipAddress: "192.168.1.200",
            },
          ],
          tags: ["emergency", "outage", "critical"],
        },
      },
      {
        id: "apr-004",
        requestId: "req-004",
        requestType: RequestType.AccessRequest,
        requestedBy: {
          id: "user-004",
          name: "Michael Lee",
          email: "michael.lee@company.com",
          employeeId: "EMP004",
          department: "Finance",
          title: "Finance Analyst",
        },
        requestTitle: "Financial Reporting System Access",
        description:
          "Access required to run monthly financial reports and reconciliations.",
        justification:
          "Monthly close activities require access to generate and validate reports.",
        urgency: UrgencyLevel.Medium,
        riskFactors: [
          {
            type: RiskFactorType.SensitiveData,
            description: "Access to financial records",
            severity: RiskLevel.Medium,
            impact: 5,
            autoDetected: false,
          },
        ],
        requestedAccess: [
          {
            id: "acc-004",
            type: AccessType.ApplicationAccess,
            name: "Financial Reports",
            description: "Generate and view financial reports",
            riskLevel: RiskLevel.Medium,
            system: "Financial Reporting",
            permissions: ["view_reports", "export_csv"],
            isTemporary: false,
          },
        ],
        currentLevel: 1,
        totalLevels: 2,
        approvalChain: [
          {
            level: 1,
            approverId: "current-user",
            approverName: "John Doe",
            approverTitle: "Security Manager",
            approverEmail: "john.doe@company.com",
            status: ApprovalDecision.Pending,
            isRequired: true,
            isDelegated: false,
            escalationLevel: 0,
          },
        ],
        status: ApprovalStatus.Pending,
        submittedAt: new Date(Date.now() - 10 * 60 * 1000),
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        slaBreachWarning: false,
        conflictChecks: [],
        attachments: [],
        metadata: {
          priority: ApprovalPriority.Normal,
          source: "self-service-portal",
          complianceFlags: [],
          auditTrail: [],
          tags: ["finance"],
        },
      },
      {
        id: "apr-005",
        requestId: "req-005",
        requestType: RequestType.AccessRequest,
        requestedBy: {
          id: "user-005",
          name: "Olivia Martinez",
          email: "olivia.martinez@company.com",
          employeeId: "EMP005",
          department: "HR",
          title: "HR Specialist",
        },
        requestTitle: "HR System Access",
        description:
          "Access requested to manage employee records and benefits enrollment.",
        justification:
          "Regular HR duties require access to update employee information and process enrollments.",
        urgency: UrgencyLevel.Low,
        riskFactors: [
          {
            type: RiskFactorType.SensitiveData,
            description: "Access to employee PII",
            severity: RiskLevel.High,
            impact: 6,
            autoDetected: false,
          },
        ],
        requestedAccess: [
          {
            id: "acc-005",
            type: AccessType.ApplicationAccess,
            name: "HR Portal",
            description: "Manage employee records",
            riskLevel: RiskLevel.Medium,
            system: "HR System",
            permissions: ["view_records", "edit_records"],
            isTemporary: false,
          },
        ],
        currentLevel: 1,
        totalLevels: 2,
        approvalChain: [
          {
            level: 1,
            approverId: "current-user",
            approverName: "John Doe",
            approverTitle: "Security Manager",
            approverEmail: "john.doe@company.com",
            status: ApprovalDecision.Pending,
            isRequired: true,
            isDelegated: false,
            escalationLevel: 0,
          },
        ],
        status: ApprovalStatus.Pending,
        submittedAt: new Date(Date.now() - 40 * 60 * 1000),
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        slaBreachWarning: false,
        conflictChecks: [],
        attachments: [],
        metadata: {
          priority: ApprovalPriority.Low,
          source: "self-service-portal",
          complianceFlags: [],
          auditTrail: [],
          tags: ["hr"],
        },
      },
    ];

    this.approvalRequestsSubject.next(mockRequests);
    this.updateStatistics();

    // Initialize delegations
    const mockDelegations: ApprovalDelegation[] = [
      {
        id: "del-001",
        delegatorId: "current-user",
        delegatorName: "John Doe",
        delegateId: "delegate-001",
        delegateName: "Jane Smith",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        scope: {
          allRequests: false,
          departments: ["Engineering"],
          maxAmount: 10000,
          requestTypes: [RequestType.AccessRequest],
          urgencyLevels: [UrgencyLevel.Low, UrgencyLevel.Medium],
        },
        conditions: ["Must be Engineering department requests only"],
        approvalTypes: [RequestType.AccessRequest, RequestType.SystemAccess],
        maxRiskLevel: RiskLevel.Medium,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    this.delegationsSubject.next(mockDelegations);
  }
}
