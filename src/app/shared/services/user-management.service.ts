import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import {
  UserProfile,
  ProvisioningWorkflow,
  WorkflowType,
  WorkflowStatus,
  TaskStatus,
  UserAnalytics,
  IntegrationStatus,
  AuditEvent,
  ComplianceStatus,
  SecurityClearance,
  DataClassification,
  ConnectionStatus,
  AuditResult,
  ComplianceFramework,
  CertificationStatus,
} from "../interfaces/user-management.interface";
import {
  UserStatus,
  RiskLevel,
  UrgencyLevel,
} from "../interfaces/user.interface";

@Injectable({
  providedIn: "root",
})
export class UserManagementService {
  private usersSubject = new BehaviorSubject<UserProfile[]>([]);
  private workflowsSubject = new BehaviorSubject<ProvisioningWorkflow[]>([]);
  private auditEventsSubject = new BehaviorSubject<AuditEvent[]>([]);

  constructor() {
    this.initializeMockData();
  }

  // User Management
  getUsers(): Observable<UserProfile[]> {
    return this.usersSubject.asObservable();
  }

  getUserById(id: string): Observable<UserProfile | undefined> {
    return this.usersSubject.pipe(
      map((users) => users.find((u) => u.id === id)),
    );
  }

  searchUsers(query: string): Observable<UserProfile[]> {
    return this.usersSubject.pipe(
      map((users) =>
        users.filter(
          (user) =>
            user.displayName.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase()) ||
            user.department.toLowerCase().includes(query.toLowerCase()) ||
            user.employeeId.includes(query),
        ),
      ),
      delay(300),
    );
  }

  createUser(userData: Partial<UserProfile>): Observable<UserProfile> {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      displayName: `${userData.firstName} ${userData.lastName}`,
      department: userData.department!,
      title: userData.title!,
      employeeId: userData.employeeId!,
      organizationUnit: userData.organizationUnit!,
      location: userData.location!,
      hireDate: userData.hireDate || new Date(),
      roles: userData.roles || [],
      status: UserStatus.Active,
      directReports: [],
      securityClearance:
        userData.securityClearance || SecurityClearance.Internal,
      complianceStatus: this.generateComplianceStatus(),
      mfaEnabled: false,
      sessionCount: 0,
      riskFactors: [],
      dataClassifications: [DataClassification.Internal],
    };

    const currentUsers = this.usersSubject.value;
    this.usersSubject.next([...currentUsers, newUser]);

    // Create provisioning workflow
    this.createProvisioningWorkflow(newUser.id, WorkflowType.UserProvisioning);

    return of(newUser).pipe(delay(500));
  }

  updateUser(
    id: string,
    updates: Partial<UserProfile>,
  ): Observable<UserProfile> {
    const users = this.usersSubject.value;
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex !== -1) {
      const updatedUser = { ...users[userIndex], ...updates };
      users[userIndex] = updatedUser;
      this.usersSubject.next([...users]);

      this.logAuditEvent(
        "user_updated",
        id,
        "User profile updated",
        AuditResult.Success,
      );
      return of(updatedUser).pipe(delay(300));
    }

    throw new Error("User not found");
  }

  deactivateUser(id: string, reason: string): Observable<boolean> {
    return this.updateUser(id, {
      status: UserStatus.Inactive,
      terminationDate: new Date(),
    }).pipe(
      map(() => {
        this.createProvisioningWorkflow(
          id,
          WorkflowType.UserDeprovisioning,
          reason,
        );
        this.logAuditEvent(
          "user_deactivated",
          id,
          `User deactivated: ${reason}`,
          AuditResult.Success,
        );
        return true;
      }),
    );
  }

  // Workflow Management
  getWorkflows(): Observable<ProvisioningWorkflow[]> {
    return this.workflowsSubject.asObservable();
  }

  getWorkflowsByType(type: WorkflowType): Observable<ProvisioningWorkflow[]> {
    return this.workflowsSubject.pipe(
      map((workflows) => workflows.filter((w) => w.workflowType === type)),
    );
  }

  createProvisioningWorkflow(
    userId: string,
    type: WorkflowType,
    reason?: string,
  ): Observable<ProvisioningWorkflow> {
    const user = this.usersSubject.value.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    const workflow: ProvisioningWorkflow = {
      id: `wf-${Date.now()}`,
      userId,
      userEmail: user.email,
      userName: user.displayName,
      workflowType: type,
      status: WorkflowStatus.Pending,
      priority: UrgencyLevel.Medium,
      requesterId: "system",
      requesterName: "System",
      approvals: this.generateApprovals(type),
      tasks: this.generateTasks(type),
      metadata: {
        source: "user_management",
        reason: reason || "Standard workflow",
        complianceRequirements: ["SOX", "PCI_DSS"],
        dataRetention: 2555, // 7 years in days
        auditLevel: "enhanced" as any,
        riskAssessment: {
          overallScore: Math.floor(Math.random() * 100),
          factors: [],
          reviewRequired: true,
          approvalLevel: 2,
        },
      },
      createdAt: new Date(),
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    const workflows = this.workflowsSubject.value;
    this.workflowsSubject.next([workflow, ...workflows]);

    return of(workflow).pipe(delay(300));
  }

  approveWorkflow(
    workflowId: string,
    approverId: string,
    comments?: string,
  ): Observable<boolean> {
    const workflows = this.workflowsSubject.value;
    const workflow = workflows.find((w) => w.id === workflowId);

    if (workflow) {
      const approval = workflow.approvals.find(
        (a) => a.approverId === approverId,
      );
      if (approval) {
        approval.status = "approved" as any;
        approval.comments = comments;
        approval.timestamp = new Date();
      }

      // Check if all required approvals are complete
      const allApproved = workflow.approvals
        .filter((a) => a.isRequired)
        .every((a) => a.status === "approved");

      if (allApproved) {
        workflow.status = WorkflowStatus.InProgress;
        this.startWorkflowTasks(workflowId);
      }

      this.workflowsSubject.next([...workflows]);
      this.logAuditEvent(
        "workflow_approved",
        workflowId,
        "Workflow approved",
        AuditResult.Success,
      );
    }

    return of(true).pipe(delay(300));
  }

  private startWorkflowTasks(workflowId: string): void {
    setTimeout(() => {
      const workflows = this.workflowsSubject.value;
      const workflow = workflows.find((w) => w.id === workflowId);

      if (workflow) {
        workflow.tasks.forEach((task) => {
          task.status = TaskStatus.Running;
          task.startedAt = new Date();

          // Simulate task completion
          setTimeout(
            () => {
              task.status = TaskStatus.Completed;
              task.completedAt = new Date();
            },
            Math.random() * 5000 + 1000,
          );
        });

        // Mark workflow as completed after all tasks
        setTimeout(() => {
          workflow.status = WorkflowStatus.Completed;
          workflow.completedAt = new Date();
          this.workflowsSubject.next([...workflows]);
        }, 6000);
      }
    }, 1000);
  }

  // Analytics
  getUserAnalytics(): Observable<UserAnalytics> {
    const users = this.usersSubject.value || [];
    const workflows = this.workflowsSubject.value || [];

    const analytics: UserAnalytics = {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === UserStatus.Active).length,
      inactiveUsers: users.filter((u) => u.status === UserStatus.Inactive)
        .length,
      pendingProvisioning: workflows.filter(
        (w) =>
          w.workflowType === WorkflowType.UserProvisioning &&
          w.status === WorkflowStatus.Pending,
      ).length,
      pendingDeprovisioning: workflows.filter(
        (w) =>
          w.workflowType === WorkflowType.UserDeprovisioning &&
          w.status === WorkflowStatus.Pending,
      ).length,
      riskDistribution: {
        low: users.filter((u) => u.riskScore < 25).length,
        medium: users.filter((u) => u.riskScore >= 25 && u.riskScore < 60)
          .length,
        high: users.filter((u) => u.riskScore >= 60 && u.riskScore < 85).length,
        critical: users.filter((u) => u.riskScore >= 85).length,
      },
      complianceMetrics: {
        compliantUsers: users.filter((u) => u.complianceStatus.isCompliant)
          .length,
        nonCompliantUsers: users.filter((u) => !u.complianceStatus.isCompliant)
          .length,
        pendingReviews: Math.floor(users.length * 0.15),
        expiredCertifications: Math.floor(users.length * 0.05),
        violationsCount: users.reduce(
          (acc, u) => acc + u.complianceStatus.violations.length,
          0,
        ),
      },
      activityMetrics: {
        dailyLogins: Math.floor(users.length * 0.7),
        weeklyLogins: Math.floor(users.length * 0.9),
        monthlyLogins: users.length,
        avgSessionDuration: 127, // minutes
        suspiciousActivities: 3,
      },
      trends: [
        {
          metric: "activeUsers",
          period: "month",
          value: users.length,
          change: 12,
          trend: "up",
        },
        {
          metric: "riskScore",
          period: "week",
          value: 45,
          change: -8,
          trend: "down",
        },
        {
          metric: "compliance",
          period: "month",
          value: 94,
          change: 3,
          trend: "up",
        },
      ],
    };

    return of(analytics).pipe(delay(400));
  }

  // Integration Status
  getIntegrationStatus(): Observable<IntegrationStatus[]> {
    const integrations: IntegrationStatus[] = [
      {
        systemId: "ad-001",
        systemName: "Active Directory",
        status: ConnectionStatus.Connected,
        lastSync: new Date(Date.now() - 15 * 60 * 1000),
        nextSync: new Date(Date.now() + 45 * 60 * 1000),
        errorCount: 0,
        latency: 45,
        healthScore: 98,
      },
      {
        systemId: "hrms-001",
        systemName: "Workday HRMS",
        status: ConnectionStatus.Connected,
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        nextSync: new Date(Date.now() + 22 * 60 * 60 * 1000),
        errorCount: 1,
        latency: 120,
        healthScore: 95,
      },
      {
        systemId: "aws-001",
        systemName: "AWS IAM",
        status: ConnectionStatus.Error,
        lastSync: new Date(Date.now() - 6 * 60 * 60 * 1000),
        errorCount: 3,
        lastError: "Authentication failed",
        latency: 0,
        healthScore: 65,
      },
    ];

    return of(integrations).pipe(delay(300));
  }

  // Audit Events
  getAuditEvents(): Observable<AuditEvent[]> {
    return this.auditEventsSubject.asObservable();
  }

  private logAuditEvent(
    action: string,
    resourceId: string,
    details: string,
    result: AuditResult,
  ): void {
    const event: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      actorId: "current-user",
      actorName: "John Doe",
      action,
      resource: "user",
      resourceId,
      result,
      details: { description: details },
      ipAddress: "192.168.1.100",
      severity: RiskLevel.Low,
    };

    const events = this.auditEventsSubject.value;
    this.auditEventsSubject.next([event, ...events.slice(0, 99)]); // Keep last 100 events
  }

  private initializeMockData(): void {
    const mockUsers: UserProfile[] = [
      {
        id: "usr-001",
        email: "sarah.wilson@company.com",
        firstName: "Sarah",
        lastName: "Wilson",
        displayName: "Sarah Wilson",
        department: "Engineering",
        title: "Senior Software Engineer",
        employeeId: "EMP001",
        organizationUnit: "Technology",
        location: "New York, NY",
        hireDate: new Date("2020-03-15"),
        roles: [],
        status: UserStatus.Active,
        directReports: [],
        securityClearance: SecurityClearance.Confidential,
        complianceStatus: this.generateComplianceStatus(),
        mfaEnabled: true,
        sessionCount: 5,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        riskFactors: [],
        accessReviewDate: new Date("2024-02-15"),
        dataClassifications: [DataClassification.Confidential],
      },
      {
        id: "usr-002",
        email: "alex.chen@company.com",
        firstName: "Alex",
        lastName: "Chen",
        displayName: "Alex Chen",
        department: "Security",
        title: "Security Analyst",
        employeeId: "EMP002",
        organizationUnit: "Security",
        location: "San Francisco, CA",
        hireDate: new Date("2019-08-22"),
        roles: [],
        status: UserStatus.Active,
        directReports: [],
        securityClearance: SecurityClearance.Secret,
        complianceStatus: this.generateComplianceStatus(),
        mfaEnabled: true,
        sessionCount: 3,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        riskFactors: [],
        accessReviewDate: new Date("2024-01-30"),
        dataClassifications: [DataClassification.Restricted],
      },
      {
        id: "usr-003",
        email: "emma.davis@company.com",
        firstName: "Emma",
        lastName: "Davis",
        displayName: "Emma Davis",
        department: "Operations",
        title: "Operations Manager",
        employeeId: "EMP003",
        organizationUnit: "Operations",
        location: "Chicago, IL",
        hireDate: new Date("2018-11-10"),
        roles: [],
        status: UserStatus.Inactive,
        directReports: [],
        securityClearance: SecurityClearance.Internal,
        complianceStatus: this.generateComplianceStatus(),
        mfaEnabled: false,
        sessionCount: 0,
        lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        riskFactors: [],
        accessReviewDate: new Date("2024-03-01"),
        dataClassifications: [DataClassification.Internal],
      },
    ];

    this.usersSubject.next(mockUsers);

    // Initialize with some workflows
    this.createProvisioningWorkflow(
      "usr-001",
      WorkflowType.AccessModification,
      "Role change request",
    );
    this.createProvisioningWorkflow(
      "usr-002",
      WorkflowType.ComplianceReview,
      "Quarterly review",
    );
  }

  private generateComplianceStatus(): ComplianceStatus {
    return {
      isCompliant: Math.random() > 0.2,
      frameworks: [ComplianceFramework.SOX, ComplianceFramework.PCI_DSS],
      violations: [],
      lastReview: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      certifications: [
        {
          id: "cert-001",
          name: "Security Awareness",
          issuedBy: "ComplianceTraining Inc",
          issuedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
          status: CertificationStatus.Valid,
        },
      ],
    };
  }

  private generateApprovals(type: WorkflowType): any[] {
    return [
      {
        id: `app-${Date.now()}`,
        workflowId: "",
        approverId: "mgr-001",
        approverName: "Jane Smith",
        approverRole: "Manager",
        status: "pending",
        timestamp: new Date(),
        level: 1,
        isRequired: true,
        isDelegated: false,
      },
    ];
  }

  private generateTasks(type: WorkflowType): any[] {
    const baseTasks = [
      {
        id: `task-${Date.now()}-1`,
        workflowId: "",
        taskType: "create_account",
        targetSystem: "Active Directory",
        action: "CREATE_USER",
        parameters: {},
        status: TaskStatus.Pending,
        retryCount: 0,
        dependencies: [],
      },
      {
        id: `task-${Date.now()}-2`,
        workflowId: "",
        taskType: "assign_role",
        targetSystem: "Application Server",
        action: "ASSIGN_ROLES",
        parameters: {},
        status: TaskStatus.Pending,
        retryCount: 0,
        dependencies: [`task-${Date.now()}-1`],
      },
    ];

    return baseTasks;
  }
}
