import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import {
  Application,
  UserAccessRequest,
  ExceptionHandling,
  BulkUpload,
  DashboardMetrics,
  WorkflowConfig,
  ADValidationResult,
  ActivityLog,
  ApplicationType,
  AccessLevel,
  AccessRequestType,
  AccessRequestStatus,
  ApprovalStatus,
  ApproverRole,
  ADValidationStatus,
  ExceptionType,
  ExceptionDecision,
  ExceptionStatus,
  Priority,
  UploadStatus,
  ActivityAction,
  EntityType,
} from "../interfaces/access-management.interface";

@Injectable({
  providedIn: "root",
})
export class AccessManagementService {
  // Mock data
  private mockApplications: Application[] = [
    {
      id: "app-001",
      name: "Salesforce CRM",
      type: ApplicationType.EnterpriseApp,
      description: "Customer Relationship Management System",
      owner: {
        id: "owner-001",
        name: "Sarah Wilson",
        email: "sarah.wilson@company.com",
        department: "Sales",
      },
      approvalWorkflow: {
        id: "wf-001",
        name: "Standard CRM Workflow",
        applicationId: "app-001",
        approvalLevels: [
          {
            level: 1,
            role: ApproverRole.Manager,
            approverIds: ["mgr-001"],
            deadlineHours: 24,
            isParallel: false,
            isOptional: false,
            autoApproveAfterDeadline: false,
          },
          {
            level: 2,
            role: ApproverRole.ITAdmin,
            approverIds: ["it-001"],
            deadlineHours: 24,
            isParallel: false,
            isOptional: false,
            autoApproveAfterDeadline: false,
          },
          {
            level: 3,
            role: ApproverRole.ApplicationOwner,
            approverIds: ["owner-001"],
            deadlineHours: 48,
            isParallel: false,
            isOptional: false,
            autoApproveAfterDeadline: true,
          },
        ],
        deadlineHours: 96,
        exceptionDeadlineDays: 7,
        notificationSettings: {
          enableEmail: true,
          enableInApp: true,
          reminderHours: [24, 4],
          escalationNotification: true,
          recipients: [],
        },
        isActive: true,
      },
      isActive: true,
      adValidationRequired: true,
      exceptionRetentionDays: 7,
    },
    {
      id: "app-002",
      name: "AWS Console",
      type: ApplicationType.CloudService,
      description: "Amazon Web Services Management Console",
      owner: {
        id: "owner-002",
        name: "Michael Chen",
        email: "michael.chen@company.com",
        department: "IT Infrastructure",
      },
      approvalWorkflow: {
        id: "wf-002",
        name: "Cloud Access Workflow",
        applicationId: "app-002",
        approvalLevels: [
          {
            level: 1,
            role: ApproverRole.Manager,
            approverIds: ["mgr-002"],
            deadlineHours: 24,
            isParallel: false,
            isOptional: false,
            autoApproveAfterDeadline: false,
          },
          {
            level: 2,
            role: ApproverRole.SecurityAdmin,
            approverIds: ["sec-001"],
            deadlineHours: 48,
            isParallel: false,
            isOptional: false,
            autoApproveAfterDeadline: false,
          },
          {
            level: 3,
            role: ApproverRole.ApplicationOwner,
            approverIds: ["owner-002"],
            deadlineHours: 24,
            isParallel: false,
            isOptional: false,
            autoApproveAfterDeadline: true,
          },
        ],
        deadlineHours: 120,
        exceptionDeadlineDays: 5,
        notificationSettings: {
          enableEmail: true,
          enableInApp: true,
          reminderHours: [48, 12],
          escalationNotification: true,
          recipients: [],
        },
        isActive: true,
      },
      isActive: true,
      adValidationRequired: true,
      exceptionRetentionDays: 5,
    },
  ];

  private mockAccessRequests: UserAccessRequest[] = [
    {
      id: "req-001",
      batchId: "batch-001",
      requesterId: "user-001",
      requesterName: "John Doe",
      userIds: ["jdoe", "asmith", "bwilson"],
      applicationId: "app-001",
      applicationName: "Salesforce CRM",
      accessLevel: AccessLevel.Read,
      justification: "Need access for Q1 sales reporting",
      department: "Sales",
      requestType: AccessRequestType.BulkUpload,
      status: AccessRequestStatus.InReview,
      currentApprovalLevel: 2,
      approvals: [
        {
          id: "appr-001",
          approverId: "mgr-001",
          approverName: "Jane Manager",
          approverRole: ApproverRole.Manager,
          level: 1,
          status: ApprovalStatus.Approved,
          comments: "Approved for sales team access",
          approvedAt: new Date("2024-01-15T10:00:00"),
          deadline: new Date("2024-01-16T10:00:00"),
          autoApproved: false,
        },
        {
          id: "appr-002",
          approverId: "it-001",
          approverName: "IT Admin",
          approverRole: ApproverRole.ITAdmin,
          level: 2,
          status: ApprovalStatus.Pending,
          deadline: new Date("2024-01-17T10:00:00"),
          autoApproved: false,
        },
      ],
      submittedAt: new Date("2024-01-15T09:00:00"),
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
      priority: Priority.Medium,
      adValidationResults: [
        {
          userId: "jdoe",
          status: ADValidationStatus.Valid,
          foundInAD: true,
          adGroups: ["Sales-Team", "CRM-Users"],
          lastValidated: new Date(),
        },
        {
          userId: "asmith",
          status: ADValidationStatus.NotFound,
          errorMessage: "User not found in Active Directory",
          foundInAD: false,
          lastValidated: new Date(),
        },
        {
          userId: "bwilson",
          status: ADValidationStatus.Valid,
          foundInAD: true,
          adGroups: ["Sales-Team"],
          lastValidated: new Date(),
        },
      ],
      autoProcessed: false,
    },
    {
      id: "req-002",
      batchId: "batch-002",
      requesterId: "user-002",
      requesterName: "Alice Manager",
      userIds: ["cjohnson"],
      applicationId: "app-001",
      applicationName: "Salesforce CRM",
      accessLevel: AccessLevel.Write,
      justification: "Access for campaign updates",
      department: "Marketing",
      requestType: AccessRequestType.NewAccess,
      status: AccessRequestStatus.AwaitingApproval,
      currentApprovalLevel: 1,
      approvals: [],
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      priority: Priority.High,
      autoProcessed: false,
    },
    {
      id: "req-003",
      batchId: "batch-003",
      requesterId: "user-003",
      requesterName: "Bob Smith",
      userIds: ["dlee", "efrost"],
      applicationId: "app-002",
      applicationName: "AWS Console",
      accessLevel: AccessLevel.Admin,
      justification: "Temporary admin for migration",
      department: "IT",
      requestType: AccessRequestType.ModifyAccess,
      status: AccessRequestStatus.InReview,
      currentApprovalLevel: 2,
      approvals: [],
      submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      priority: Priority.Critical,
      autoProcessed: false,
    },
    {
      id: "req-004",
      batchId: "batch-004",
      requesterId: "user-004",
      requesterName: "Carol White",
      userIds: ["gmartin"],
      applicationId: "app-001",
      applicationName: "Salesforce CRM",
      accessLevel: AccessLevel.Read,
      justification: "Reporting access",
      department: "Finance",
      requestType: AccessRequestType.NewAccess,
      status: AccessRequestStatus.AwaitingApproval,
      currentApprovalLevel: 1,
      approvals: [],
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
      priority: Priority.Medium,
      autoProcessed: false,
    },
    {
      id: "req-005",
      batchId: "batch-005",
      requesterId: "user-005",
      requesterName: "Eve Adams",
      userIds: ["hgarcia"],
      applicationId: "app-002",
      applicationName: "AWS Console",
      accessLevel: AccessLevel.Read,
      justification: "View logs",
      department: "Security",
      requestType: AccessRequestType.NewAccess,
      status: AccessRequestStatus.AwaitingApproval,
      currentApprovalLevel: 1,
      approvals: [],
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      priority: Priority.Low,
      autoProcessed: false,
    },
    {
      id: "req-006",
      batchId: "batch-006",
      requesterId: "user-006",
      requesterName: "Frank Norton",
      userIds: ["ijones"],
      applicationId: "app-001",
      applicationName: "Salesforce CRM",
      accessLevel: AccessLevel.Read,
      justification: "Ad-hoc request",
      department: "Sales",
      requestType: AccessRequestType.NewAccess,
      status: AccessRequestStatus.Submitted,
      currentApprovalLevel: 1,
      approvals: [],
      submittedAt: new Date(),
      deadline: new Date(Date.now() + 96 * 60 * 60 * 1000),
      priority: Priority.Low,
      autoProcessed: false,
    },
  ];

  private mockExceptions: ExceptionHandling[] = [
    {
      id: "exc-001",
      userId: "asmith",
      applicationId: "app-001",
      validationError: "User not found in Active Directory",
      exceptionType: ExceptionType.UserNotFound,
      ownerDecision: ExceptionDecision.Pending,
      autoDeleteDate: new Date("2024-01-22T09:00:00"),
      status: ExceptionStatus.UnderReview,
    },
  ];

  private mockBulkUploads: BulkUpload[] = [
    {
      id: "bulk-001",
      uploaderId: "user-001",
      uploaderName: "John Doe",
      fileName: "salesforce_access_request.xlsx",
      uploadedAt: new Date("2024-01-15T09:00:00"),
      totalRecords: 3,
      processedRecords: 3,
      successfulRecords: 2,
      failedRecords: 1,
      validationErrors: [
        {
          row: 2,
          field: "userId",
          value: "asmith",
          error: "User not found in Active Directory",
        },
      ],
      status: UploadStatus.PartialSuccess,
      downloadUrl: "/api/downloads/bulk-001-results.xlsx",
    },
  ];

  private dashboardMetrics: DashboardMetrics = {
    totalRequests: 156,
    pendingApprovals: 23,
    exceptionsCount: 8,
    overdueRequests: 5,
    autoProcessedToday: 12,
    applicationMetrics: [
      {
        applicationId: "app-001",
        applicationName: "Salesforce CRM",
        totalRequests: 45,
        pendingRequests: 8,
        exceptions: 3,
        averageProcessingTime: 2.5,
      },
      {
        applicationId: "app-002",
        applicationName: "AWS Console",
        totalRequests: 32,
        pendingRequests: 6,
        exceptions: 2,
        averageProcessingTime: 3.2,
      },
    ],
    recentActivity: [
      {
        id: "act-001",
        timestamp: new Date("2024-01-15T10:30:00"),
        action: ActivityAction.RequestApproved,
        userId: "mgr-001",
        userName: "Jane Manager",
        entityType: EntityType.AccessRequest,
        entityId: "req-001",
        details: "Approved level 1 for Salesforce CRM access",
      },
    ],
  };

  // Subjects for real-time updates
  private accessRequestsSubject = new BehaviorSubject<UserAccessRequest[]>(
    this.mockAccessRequests,
  );
  private exceptionsSubject = new BehaviorSubject<ExceptionHandling[]>(
    this.mockExceptions,
  );
  private dashboardMetricsSubject = new BehaviorSubject<DashboardMetrics>(
    this.dashboardMetrics,
  );

  public accessRequests$ = this.accessRequestsSubject.asObservable();
  public exceptions$ = this.exceptionsSubject.asObservable();
  public dashboardMetrics$ = this.dashboardMetricsSubject.asObservable();

  constructor() {}

  // Applications
  getApplications(): Observable<Application[]> {
    return of(this.mockApplications).pipe(delay(300));
  }

  getApplication(id: string): Observable<Application | undefined> {
    const app = this.mockApplications.find((a) => a.id === id);
    return of(app).pipe(delay(200));
  }

  // Access Requests
  getAccessRequests(): Observable<UserAccessRequest[]> {
    return of(this.mockAccessRequests).pipe(delay(400));
  }

  getAccessRequestsByApplication(
    applicationId: string,
  ): Observable<UserAccessRequest[]> {
    const requests = this.mockAccessRequests.filter(
      (r) => r.applicationId === applicationId,
    );
    return of(requests).pipe(delay(300));
  }

  createAccessRequest(
    request: Partial<UserAccessRequest>,
  ): Observable<UserAccessRequest> {
    const newRequest: UserAccessRequest = {
      id: `req-${Date.now()}`,
      requesterId: request.requesterId || "current-user",
      requesterName: request.requesterName || "Current User",
      userIds: request.userIds || [],
      applicationId: request.applicationId || "",
      applicationName: request.applicationName || "",
      accessLevel: request.accessLevel || AccessLevel.Read,
      justification: request.justification || "",
      department: request.department || "",
      requestType: request.requestType || AccessRequestType.NewAccess,
      status: AccessRequestStatus.Submitted,
      currentApprovalLevel: 1,
      approvals: [],
      submittedAt: new Date(),
      deadline: new Date(Date.now() + 96 * 60 * 60 * 1000), // 96 hours from now
      priority: request.priority || Priority.Medium,
      autoProcessed: false,
    };

    this.mockAccessRequests.unshift(newRequest);
    this.accessRequestsSubject.next([...this.mockAccessRequests]);
    return of(newRequest).pipe(delay(500));
  }

  approveRequest(
    requestId: string,
    approverId: string,
    comments?: string,
  ): Observable<boolean> {
    const request = this.mockAccessRequests.find((r) => r.id === requestId);
    if (request) {
      // Debug: log incoming approveRequest call
      // eslint-disable-next-line no-console
      console.log("[AccessManagement] approveRequest called", {
        requestId,
        approverId,
        comments,
        found: !!request,
      });

      if (!request.approvals) request.approvals = [];

      // Ensure there is an approval entry for the current level; if not, create one
      // Use a flexible any-typed variable so we can safely create or update it
      let currentApproval: any = request.approvals.find(
        (a) => a.level === request.currentApprovalLevel,
      );

      let createdNow = false;
      if (!currentApproval) {
        createdNow = true;
        currentApproval = {
          id: `appr-${Date.now()}`,
          approverId: approverId,
          approverName: approverId,
          approverRole: ApproverRole.Manager,
          level: request.currentApprovalLevel,
          status: ApprovalStatus.Pending,
          comments: undefined,
          approvedAt: undefined,
          deadline: request.deadline,
          autoApproved: false,
        } as any;
      }

      // Mark as approved by the approver
      currentApproval.status = ApprovalStatus.Approved;
      currentApproval.approvedAt = new Date();
      currentApproval.comments = comments;

      if (createdNow) {
        request.approvals.push(currentApproval as any);
      }

      // Move to next level or complete
      // Use total of 3 levels if not otherwise defined in mock data
      const maxLevels = 3;
      if ((request.currentApprovalLevel || 1) < maxLevels) {
        request.currentApprovalLevel = (request.currentApprovalLevel || 1) + 1;
        request.status = AccessRequestStatus.AwaitingApproval;
      } else {
        request.status = AccessRequestStatus.Approved;
        request.completedAt = new Date();
      }

      this.accessRequestsSubject.next([...this.mockAccessRequests]);

      // Debug: log updated access request state
      // eslint-disable-next-line no-console
      console.log("[AccessManagement] access request updated", {
        id: request.id,
        status: request.status,
        currentApprovalLevel: request.currentApprovalLevel,
        approvals: request.approvals,
      });
    }
    return of(true).pipe(delay(300));
  }

  rejectRequest(
    requestId: string,
    approverId: string,
    comments?: string,
  ): Observable<boolean> {
    const request = this.mockAccessRequests.find((r) => r.id === requestId);
    if (request) {
      // Mark request as rejected and append an approval record for traceability
      request.status = AccessRequestStatus.Rejected;
      request.completedAt = new Date();

      const rejectionApproval = {
        id: `appr-${Date.now()}`,
        approverId: approverId,
        approverName: approverId,
        approverRole: ApproverRole.ApplicationOwner,
        level: request.currentApprovalLevel || 1,
        status: ApprovalStatus.Rejected,
        comments: comments,
        approvedAt: new Date(),
        deadline: request.deadline,
        autoApproved: false,
      };

      if (!request.approvals) request.approvals = [];
      request.approvals.push(rejectionApproval as any);

      this.accessRequestsSubject.next([...this.mockAccessRequests]);
    }
    return of(true).pipe(delay(300));
  }

  // Exceptions
  getExceptions(): Observable<ExceptionHandling[]> {
    return of(this.mockExceptions).pipe(delay(400));
  }

  getExceptionsByApplication(
    applicationId: string,
  ): Observable<ExceptionHandling[]> {
    const exceptions = this.mockExceptions.filter(
      (e) => e.applicationId === applicationId,
    );
    return of(exceptions).pipe(delay(300));
  }

  markExceptionDecision(
    exceptionId: string,
    decision: ExceptionDecision,
    note?: string,
  ): Observable<boolean> {
    const exception = this.mockExceptions.find((e) => e.id === exceptionId);
    if (exception) {
      exception.ownerDecision = decision;
      exception.retentionNote = note;
      exception.markedAt = new Date();
      exception.status = ExceptionStatus.Resolved;
      this.exceptionsSubject.next([...this.mockExceptions]);
    }
    return of(true).pipe(delay(300));
  }

  // Bulk Upload
  processBulkUpload(file: File, applicationId: string): Observable<BulkUpload> {
    const upload: BulkUpload = {
      id: `bulk-${Date.now()}`,
      uploaderId: "current-user",
      uploaderName: "Current User",
      fileName: file.name,
      uploadedAt: new Date(),
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      validationErrors: [],
      status: UploadStatus.Processing,
    };

    // Simulate processing
    setTimeout(() => {
      upload.status = UploadStatus.Completed;
      upload.totalRecords = 10;
      upload.processedRecords = 10;
      upload.successfulRecords = 8;
      upload.failedRecords = 2;
    }, 2000);

    return of(upload).pipe(delay(500));
  }

  getBulkUploads(): Observable<BulkUpload[]> {
    return of(this.mockBulkUploads).pipe(delay(400));
  }

  // Dashboard
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return of(this.dashboardMetrics).pipe(delay(500));
  }

  // AD Validation
  validateUsersInAD(userIds: string[]): Observable<ADValidationResult[]> {
    const results: ADValidationResult[] = userIds.map((userId) => ({
      userId,
      status:
        Math.random() > 0.3
          ? ADValidationStatus.Valid
          : ADValidationStatus.NotFound,
      foundInAD: Math.random() > 0.3,
      adGroups: Math.random() > 0.3 ? ["Users", "Employees"] : [],
      lastValidated: new Date(),
    }));

    return of(results).pipe(delay(1000));
  }

  // Workflows
  getWorkflows(): Observable<WorkflowConfig[]> {
    const workflows = this.mockApplications.map((app) => app.approvalWorkflow);
    return of(workflows).pipe(delay(300));
  }

  updateWorkflow(
    workflowId: string,
    workflow: Partial<WorkflowConfig>,
  ): Observable<boolean> {
    // Mock update
    return of(true).pipe(delay(500));
  }

  // Auto Processing (simulate background processing)
  processExpiredRequests(): Observable<number> {
    let processedCount = 0;
    this.mockAccessRequests.forEach((request) => {
      if (
        new Date() > request.deadline &&
        request.status === AccessRequestStatus.AwaitingApproval
      ) {
        request.status = AccessRequestStatus.AutoProcessed;
        request.autoProcessed = true;
        request.completedAt = new Date();
        processedCount++;
      }
    });

    if (processedCount > 0) {
      this.accessRequestsSubject.next([...this.mockAccessRequests]);
    }

    return of(processedCount).pipe(delay(200));
  }

  // Application Owner actions
  reassignExceptionToManager(
    exceptionId: string,
    managerId: string,
  ): Observable<boolean> {
    const exception = this.mockExceptions.find((e) => e.id === exceptionId);
    if (exception) {
      exception.status = ExceptionStatus.UnderReview;
      exception.markedBy = managerId;
      this.exceptionsSubject.next([...this.mockExceptions]);
      // also log activity (not implemented fully)
    }
    return of(true).pipe(delay(300));
  }

  bulkGrantAccess(
    applicationId: string,
    userIds: string[],
    accessLevel: AccessLevel = AccessLevel.Read,
  ): Observable<boolean> {
    const application = this.mockApplications.find(
      (a) => a.id === applicationId,
    );
    const newRequest: UserAccessRequest = {
      id: `req-${Date.now()}`,
      requesterId: "app-owner",
      requesterName: application?.owner?.name || "Application Owner",
      userIds: userIds,
      applicationId,
      applicationName: application?.name || "Unknown",
      accessLevel,
      justification: "Bulk grant by application owner",
      department: application?.owner?.department || "",
      requestType: AccessRequestType.BulkUpload,
      status: AccessRequestStatus.Approved,
      currentApprovalLevel: 3,
      approvals: [],
      submittedAt: new Date(),
      deadline: new Date(),
      priority: Priority.Medium,
      autoProcessed: false,
    };

    this.mockAccessRequests.unshift(newRequest);
    this.accessRequestsSubject.next([...this.mockAccessRequests]);
    return of(true).pipe(delay(400));
  }

  bulkRevokeAccess(
    applicationId: string,
    userIds: string[],
  ): Observable<boolean> {
    const application = this.mockApplications.find(
      (a) => a.id === applicationId,
    );
    const newRequest: UserAccessRequest = {
      id: `req-${Date.now()}`,
      requesterId: "app-owner",
      requesterName: application?.owner?.name || "Application Owner",
      userIds: userIds,
      applicationId,
      applicationName: application?.name || "Unknown",
      accessLevel: AccessLevel.Read,
      justification: "Bulk revoke by application owner",
      department: application?.owner?.department || "",
      requestType: AccessRequestType.RemoveAccess,
      status: AccessRequestStatus.Completed,
      currentApprovalLevel: 3,
      approvals: [],
      submittedAt: new Date(),
      deadline: new Date(),
      priority: Priority.Medium,
      autoProcessed: false,
    };

    this.mockAccessRequests.unshift(newRequest);
    this.accessRequestsSubject.next([...this.mockAccessRequests]);
    return of(true).pipe(delay(400));
  }
}
