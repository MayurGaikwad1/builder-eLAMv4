import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import {
  AuditLog,
  ComplianceReport,
  AccessReview,
  AccessCertification,
  PolicyViolation,
  ComplianceMetrics,
  ComplianceFinding,
  Recommendation,
  AuditEventType,
  AuditCategory,
  AuditSeverity,
  AuditOutcome,
  ChangeType,
  Environment,
  ReportType,
  ReportStatus,
  ReportFrequency,
  ControlType,
  ControlStatus,
  AutomationType,
  ViolationType,
  ViolationSeverity,
  DetectionSource,
  ViolationStatus,
  FindingCategory,
  FindingSeverity,
  FindingStatus,
  ReviewType,
  ReviewStatus,
  ReviewFrequency,
  CertificationDecision,
  TrendDirection,
  ConfidentialityLevel,
  RecommendationCategory,
  RecommendationStatus,
  EffortLevel,
  CostLevel,
} from "../interfaces/audit-compliance.interface";
import { RiskLevel, UrgencyLevel } from "../interfaces/user.interface";

@Injectable({
  providedIn: "root",
})
export class AuditComplianceService {
  private auditLogsSubject = new BehaviorSubject<AuditLog[]>([]);
  private complianceReportsSubject = new BehaviorSubject<ComplianceReport[]>(
    [],
  );
  private accessReviewsSubject = new BehaviorSubject<AccessReview[]>([]);
  private policyViolationsSubject = new BehaviorSubject<PolicyViolation[]>([]);
  private complianceMetricsSubject = new BehaviorSubject<ComplianceMetrics>(
    {} as ComplianceMetrics,
  );
  private complianceFindingsSubject = new BehaviorSubject<ComplianceFinding[]>(
    [],
  );
  private recommendationsSubject = new BehaviorSubject<Recommendation[]>([]);
  private accessCertificationsSubject = new BehaviorSubject<
    AccessCertification[]
  >([]);

  constructor() {
    this.initializeMockData();
  }

  // Audit Logs
  getAuditLogs(): Observable<AuditLog[]> {
    return this.auditLogsSubject.asObservable();
  }

  searchAuditLogs(query: string, filters?: any): Observable<AuditLog[]> {
    return this.auditLogsSubject.pipe(
      map((logs) => {
        let filtered = logs.filter(
          (log) =>
            log.userName.toLowerCase().includes(query.toLowerCase()) ||
            log.action.toLowerCase().includes(query.toLowerCase()) ||
            log.targetResource.toLowerCase().includes(query.toLowerCase()) ||
            log.details.description.toLowerCase().includes(query.toLowerCase()),
        );

        if (filters) {
          if (filters.eventType) {
            filtered = filtered.filter(
              (log) => log.eventType === filters.eventType,
            );
          }
          if (filters.category) {
            filtered = filtered.filter(
              (log) => log.category === filters.category,
            );
          }
          if (filters.severity) {
            filtered = filtered.filter(
              (log) => log.severity === filters.severity,
            );
          }
          if (filters.outcome) {
            filtered = filtered.filter(
              (log) => log.outcome === filters.outcome,
            );
          }
          if (filters.dateFrom) {
            filtered = filtered.filter(
              (log) => log.timestamp >= new Date(filters.dateFrom),
            );
          }
          if (filters.dateTo) {
            filtered = filtered.filter(
              (log) => log.timestamp <= new Date(filters.dateTo),
            );
          }
          if (filters.userId) {
            filtered = filtered.filter((log) => log.userId === filters.userId);
          }
        }

        return filtered.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
        );
      }),
      delay(300),
    );
  }

  getAuditLogById(id: string): Observable<AuditLog | undefined> {
    return this.auditLogsSubject.pipe(
      map((logs) => logs.find((log) => log.id === id)),
    );
  }

  getRecentAuditLogs(limit: number = 10): Observable<AuditLog[]> {
    return this.auditLogsSubject.pipe(
      map((logs) =>
        logs
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit),
      ),
    );
  }

  getHighRiskAuditLogs(): Observable<AuditLog[]> {
    return this.auditLogsSubject.pipe(
      map((logs) =>
        logs.filter(
          (log) =>
            log.severity === AuditSeverity.High ||
            log.severity === AuditSeverity.Critical,
        ),
      ),
    );
  }

  // Compliance Reports
  getComplianceReports(): Observable<ComplianceReport[]> {
    return this.complianceReportsSubject.asObservable();
  }

  getComplianceReportById(
    id: string,
  ): Observable<ComplianceReport | undefined> {
    return this.complianceReportsSubject.pipe(
      map((reports) => reports.find((report) => report.id === id)),
    );
  }

  generateComplianceReport(config: any): Observable<string> {
    // Simulate report generation
    const reportId = `rpt-${Date.now()}`;
    return of(reportId).pipe(delay(2000));
  }

  getLatestReports(limit: number = 5): Observable<ComplianceReport[]> {
    return this.complianceReportsSubject.pipe(
      map((reports) =>
        reports
          .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
          .slice(0, limit),
      ),
    );
  }

  // Access Reviews
  getAccessReviews(): Observable<AccessReview[]> {
    return this.accessReviewsSubject.asObservable();
  }

  getActiveAccessReviews(): Observable<AccessReview[]> {
    return this.accessReviewsSubject.pipe(
      map((reviews) =>
        reviews.filter(
          (review) =>
            review.status === ReviewStatus.InProgress ||
            review.status === ReviewStatus.Review,
        ),
      ),
    );
  }

  getOverdueAccessReviews(): Observable<AccessReview[]> {
    return this.accessReviewsSubject.pipe(
      map((reviews) =>
        reviews.filter(
          (review) =>
            review.status === ReviewStatus.Overdue ||
            (review.endDate < new Date() &&
              review.status !== ReviewStatus.Completed),
        ),
      ),
    );
  }

  createAccessReview(config: any): Observable<string> {
    const reviewId = `rev-${Date.now()}`;
    return of(reviewId).pipe(delay(1000));
  }

  // Access Certifications
  getAccessCertifications(): Observable<AccessCertification[]> {
    return this.accessCertificationsSubject.asObservable();
  }

  certifyAccess(
    certificationId: string,
    decision: CertificationDecision,
    comments?: string,
  ): Observable<boolean> {
    const certifications = this.accessCertificationsSubject.value;
    const certification = certifications.find((c) => c.id === certificationId);

    if (certification) {
      certification.decision = decision;
      certification.comments = comments;
      certification.reviewedAt = new Date();
      certification.reviewedBy = "current-user";

      this.accessCertificationsSubject.next([...certifications]);
    }

    return of(true).pipe(delay(500));
  }

  // Policy Violations
  getPolicyViolations(): Observable<PolicyViolation[]> {
    return this.policyViolationsSubject.asObservable();
  }

  getOpenViolations(): Observable<PolicyViolation[]> {
    return this.policyViolationsSubject.pipe(
      map((violations) =>
        violations.filter(
          (violation) =>
            violation.status === ViolationStatus.Open ||
            violation.status === ViolationStatus.InInvestigation,
        ),
      ),
    );
  }

  resolveViolation(violationId: string, resolution: any): Observable<boolean> {
    const violations = this.policyViolationsSubject.value;
    const violation = violations.find((v) => v.id === violationId);

    if (violation) {
      violation.status = ViolationStatus.Resolved;
      violation.resolution = {
        resolvedAt: new Date(),
        resolvedBy: "current-user",
        action: resolution.action,
        description: resolution.description,
        preventiveMeasures: resolution.preventiveMeasures || [],
        followUpRequired: resolution.followUpRequired || false,
        followUpDate: resolution.followUpDate,
      };

      this.policyViolationsSubject.next([...violations]);
    }

    return of(true).pipe(delay(500));
  }

  // Compliance Findings
  getComplianceFindings(): Observable<ComplianceFinding[]> {
    return this.complianceFindingsSubject.asObservable();
  }

  getOpenFindings(): Observable<ComplianceFinding[]> {
    return this.complianceFindingsSubject.pipe(
      map((findings) =>
        findings.filter(
          (finding) =>
            finding.status === FindingStatus.New ||
            finding.status === FindingStatus.InProgress ||
            finding.status === FindingStatus.Acknowledged,
        ),
      ),
    );
  }

  updateFindingStatus(
    findingId: string,
    status: FindingStatus,
    comments?: string,
  ): Observable<boolean> {
    const findings = this.complianceFindingsSubject.value;
    const finding = findings.find((f) => f.id === findingId);

    if (finding) {
      finding.status = status;
      finding.updatedAt = new Date();

      this.complianceFindingsSubject.next([...findings]);
    }

    return of(true).pipe(delay(300));
  }

  // Recommendations
  getRecommendations(): Observable<Recommendation[]> {
    return this.recommendationsSubject.asObservable();
  }

  getPendingRecommendations(): Observable<Recommendation[]> {
    return this.recommendationsSubject.pipe(
      map((recommendations) =>
        recommendations.filter(
          (rec) =>
            rec.status === RecommendationStatus.Proposed ||
            rec.status === RecommendationStatus.Approved,
        ),
      ),
    );
  }

  updateRecommendationStatus(
    recommendationId: string,
    status: RecommendationStatus,
  ): Observable<boolean> {
    const recommendations = this.recommendationsSubject.value;
    const recommendation = recommendations.find(
      (r) => r.id === recommendationId,
    );

    if (recommendation) {
      recommendation.status = status;
      this.recommendationsSubject.next([...recommendations]);
    }

    return of(true).pipe(delay(300));
  }

  // Compliance Metrics
  getComplianceMetrics(): Observable<ComplianceMetrics> {
    return this.complianceMetricsSubject.asObservable();
  }

  // Helper methods
  private getRiskRange(level: string): { min: number; max: number } {
    const ranges = {
      low: { min: 0, max: 25 },
      medium: { min: 26, max: 60 },
      high: { min: 61, max: 85 },
      critical: { min: 86, max: 100 },
    };
    return ranges[level as keyof typeof ranges] || { min: 0, max: 100 };
  }

  private updateMetrics(): void {
    const auditLogs = this.auditLogsSubject.value;
    const violations = this.policyViolationsSubject.value;
    const reports = this.complianceReportsSubject.value;
    const findings = this.complianceFindingsSubject.value;

    const latestReport = reports
      .filter((r) => r.status === ReportStatus.Approved)
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())[0];

    const metrics: ComplianceMetrics = {
      overallScore: latestReport?.overallScore || 85,
      controlsTotal: latestReport?.controlResults.length || 125,
      controlsPassed:
        latestReport?.controlResults.filter(
          (c) => c.status === ControlStatus.Passed,
        ).length || 106,
      controlsFailed:
        latestReport?.controlResults.filter(
          (c) => c.status === ControlStatus.Failed,
        ).length || 12,
      controlsInProgress:
        latestReport?.controlResults.filter(
          (c) => c.status === ControlStatus.InProgress,
        ).length || 7,
      violationsOpen: violations.filter(
        (v) => v.status === ViolationStatus.Open,
      ).length,
      violationsClosed: violations.filter(
        (v) => v.status === ViolationStatus.Resolved,
      ).length,
      riskDistribution: {
        low: auditLogs.filter((l) => l.severity === AuditSeverity.Low).length,
        medium: auditLogs.filter((l) => l.severity === AuditSeverity.Medium)
          .length,
        high: auditLogs.filter((l) => l.severity === AuditSeverity.High)
          .length,
        critical: auditLogs.filter((l) => l.severity === AuditSeverity.Critical)
          .length,
      },
      frameworkScores: [
        {
          framework: "SOX",
          score: 92,
          trend: TrendDirection.Improving,
          lastAssessment: new Date(),
        },
        {
          framework: "PCI-DSS",
          score: 88,
          trend: TrendDirection.Stable,
          lastAssessment: new Date(),
        },
        {
          framework: "ISO 27001",
          score: 81,
          trend: TrendDirection.Declining,
          lastAssessment: new Date(),
        },
        {
          framework: "GDPR",
          score: 95,
          trend: TrendDirection.Improving,
          lastAssessment: new Date(),
        },
      ],
      trendsData: this.generateTrendData(),
      topViolations: this.getTopViolations(violations),
      remediationProgress: this.calculateRemediationProgress(findings),
    };

    this.complianceMetricsSubject.next(metrics);
  }

  private generateTrendData(): any[] {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      data.push({
        date,
        score: 80 + Math.random() * 15,
        violations: Math.floor(Math.random() * 20) + 5,
        controlsPassed: Math.floor(Math.random() * 30) + 100,
        riskLevel: [RiskLevel.Low, RiskLevel.Medium, RiskLevel.High][
          Math.floor(Math.random() * 3)
        ],
      });
    }
    return data;
  }

  private getTopViolations(violations: PolicyViolation[]): any[] {
    const violationTypes = violations.reduce((acc, violation) => {
      const type = violation.violationType.toString();
      if (!acc[type]) {
        acc[type] = { type, count: 0, severity: violation.severity };
      }
      acc[type].count++;
      return acc;
    }, {} as any);

    return Object.values(violationTypes)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)
      .map((v: any) => ({
        ...v,
        trend: [
          TrendDirection.Improving,
          TrendDirection.Stable,
          TrendDirection.Declining,
        ][Math.floor(Math.random() * 3)],
      }));
  }

  private calculateRemediationProgress(findings: ComplianceFinding[]): any {
    const total = findings.length;
    const completed = findings.filter(
      (f) => f.status === FindingStatus.Resolved,
    ).length;
    const inProgress = findings.filter(
      (f) => f.status === FindingStatus.InProgress,
    ).length;
    const overdue = findings.filter(
      (f) => f.dueDate < new Date() && f.status !== FindingStatus.Resolved,
    ).length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      averageDays: 12,
    };
  }

  private initializeMockData(): void {
    // Initialize Audit Logs
    const mockAuditLogs: AuditLog[] = [
      {
        id: "audit-001",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        eventType: AuditEventType.UserLogin,
        category: AuditCategory.Authentication,
        severity: AuditSeverity.Informational,
        userId: "user-001",
        userName: "Sarah Wilson",
        userRole: "Software Engineer",
        targetResource: "ELAM Portal",
        action: "User Login",
        outcome: AuditOutcome.Success,
        details: {
          description: "Successful user login to ELAM portal",
          systemInfo: {
            systemName: "ELAM",
            version: "2.1.0",
            environment: Environment.Production,
            module: "Authentication",
          },
        },
        complianceFlags: ["ISO27001"],
        ipAddress: "192.168.1.150",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: {
          country: "United States",
          region: "California",
          city: "San Francisco",
          timezone: "America/Los_Angeles",
        },
        sessionId: "sess-abc123",
        correlationId: "corr-def456",
        metadata: {
          loginMethod: "SSO",
          deviceTrusted: true,
        },
      },
      {
        id: "audit-002",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        eventType: AuditEventType.PermissionChanged,
        category: AuditCategory.Authorization,
        severity: AuditSeverity.Medium,
        userId: "admin-001",
        userName: "John Doe",
        userRole: "Security Manager",
        targetResource: "User: Alex Chen",
        action: "Role Assignment",
        outcome: AuditOutcome.Success,
        details: {
          description: "Security analyst role assigned to user",
          changedFields: [
            {
              field: "roles",
              oldValue: ["basic_user"],
              newValue: ["basic_user", "security_analyst"],
              changeType: ChangeType.Updated,
            },
          ],
          beforeState: { roles: ["basic_user"] },
          afterState: { roles: ["basic_user", "security_analyst"] },
          systemInfo: {
            systemName: "ELAM",
            version: "2.1.0",
            environment: Environment.Production,
            module: "User Management",
          },
        },
        complianceFlags: ["SOX", "ISO27001"],
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: {
          country: "United States",
          region: "California",
          city: "San Francisco",
          timezone: "America/Los_Angeles",
        },
        sessionId: "sess-xyz789",
        correlationId: "corr-ghi012",
        metadata: {
          approvalId: "apr-002",
          justification: "Promotion approved by HR",
        },
      },
      {
        id: "audit-003",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        eventType: AuditEventType.PolicyViolation,
        category: AuditCategory.Security,
        severity: AuditSeverity.High,
        userId: "user-003",
        userName: "Emma Davis",
        userRole: "Operations Manager",
        targetResource: "Production Database",
        action: "Unauthorized Access Attempt",
        outcome: AuditOutcome.Blocked,
        details: {
          description:
            "Attempted access to production database without proper authorization",
          systemInfo: {
            systemName: "PostgreSQL",
            version: "13.4",
            environment: Environment.Production,
            module: "Database Access Control",
          },
          additionalContext: {
            blockedReason: "Insufficient privileges",
            requiredRole: "database_admin",
          },
        },
        complianceFlags: ["SOX", "PCI-DSS"],
        ipAddress: "192.168.1.200",
        userAgent: "pgAdmin 4.28",
        location: {
          country: "United States",
          region: "California",
          city: "San Francisco",
          timezone: "America/Los_Angeles",
        },
        correlationId: "corr-jkl345",
        metadata: {
          alertTriggered: true,
          securityTeamNotified: true,
        },
      },
      {
        id: "audit-004",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        eventType: AuditEventType.ConfigurationChange,
        category: AuditCategory.SystemAdmin,
        severity: AuditSeverity.Medium,
        userId: "admin-002",
        userName: "Mike Johnson",
        userRole: "System Administrator",
        targetResource: "ELAM Configuration",
        action: "Security Policy Update",
        outcome: AuditOutcome.Success,
        details: {
          description: "Updated password policy configuration",
          changedFields: [
            {
              field: "passwordMinLength",
              oldValue: 8,
              newValue: 12,
              changeType: ChangeType.Updated,
            },
            {
              field: "passwordComplexityRequired",
              oldValue: false,
              newValue: true,
              changeType: ChangeType.Updated,
            },
          ],
          systemInfo: {
            systemName: "ELAM",
            version: "2.1.0",
            environment: Environment.Production,
            module: "Security Configuration",
          },
        },
        complianceFlags: ["ISO27001", "NIST"],
        ipAddress: "192.168.1.110",
        location: {
          country: "United States",
          region: "California",
          city: "San Francisco",
          timezone: "America/Los_Angeles",
        },
        metadata: {
          changeRequestId: "CR-2024-001",
          approvedBy: "security-team",
        },
      },
    ];

    // Initialize Compliance Reports
    const mockComplianceReports: ComplianceReport[] = [
      {
        id: "rpt-001",
        name: "Q4 2024 SOX Compliance Report",
        description:
          "Quarterly Sarbanes-Oxley compliance assessment covering IT controls and financial systems",
        framework: {
          id: "sox-2024",
          name: "Sarbanes-Oxley Act",
          version: "2024.1",
          description: "SOX compliance framework for IT controls",
          categories: [
            {
              id: "itgc",
              name: "IT General Controls",
              description: "Controls over IT infrastructure and operations",
              weight: 40,
              controls: ["itgc-001", "itgc-002", "itgc-003"],
            },
            {
              id: "access",
              name: "Access Controls",
              description: "User access and authorization controls",
              weight: 35,
              controls: ["acc-001", "acc-002", "acc-003"],
            },
            {
              id: "change",
              name: "Change Management",
              description: "System change and configuration controls",
              weight: 25,
              controls: ["chg-001", "chg-002"],
            },
          ],
          controls: [
            {
              id: "itgc-001",
              name: "Network Security Controls",
              description: "Controls to ensure network security and monitoring",
              category: "itgc",
              controlType: ControlType.Preventive,
              frequency: "continuous" as any,
              automationType: AutomationType.SemiAutomated,
              riskLevel: RiskLevel.High,
              testProcedure:
                "Review firewall configurations and network monitoring logs",
              acceptanceCriteria: [
                "Firewall rules properly configured",
                "Network monitoring active",
              ],
              responsible: ["network-team", "security-team"],
              evidence: ["firewall-configs", "monitoring-reports"],
              isActive: true,
              nextTestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          ],
          isActive: true,
          mandatoryControls: ["itgc-001", "acc-001", "chg-001"],
        },
        reportType: ReportType.Compliance,
        scope: {
          departments: ["IT", "Finance", "Operations"],
          systems: ["ELAM", "ERP", "CRM"],
          users: [],
          processes: [
            "user-provisioning",
            "access-reviews",
            "change-management",
          ],
          dataTypes: ["financial", "customer", "employee"],
          geographicRegions: ["US", "EU"],
        },
        period: {
          startDate: new Date(2024, 9, 1),
          endDate: new Date(2024, 11, 31),
          frequency: ReportFrequency.Quarterly,
          timezone: "America/Los_Angeles",
        },
        status: ReportStatus.Approved,
        overallScore: 87,
        riskLevel: RiskLevel.Medium,
        controlResults: [
          {
            controlId: "itgc-001",
            controlName: "Network Security Controls",
            status: ControlStatus.Passed,
            score: 92,
            testedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            testedBy: "security-auditor",
            evidence: [
              {
                id: "ev-001",
                type: "configuration" as any,
                name: "Firewall Configuration",
                description: "Current firewall rule set and configurations",
                source: "firewall-system",
                collectedAt: new Date(),
                collectedBy: "auto-collector",
                metadata: { rules: 245, deniedConnections: 1240 },
              },
            ],
            exceptions: [],
            comments:
              "All network security controls operating within acceptable parameters",
          },
        ],
        violations: [
          {
            id: "viol-001",
            policyId: "pol-001",
            policyName: "Access Management Policy",
            violationType: ViolationType.AccessViolation,
            severity: ViolationSeverity.Medium,
            description:
              "User account not deactivated within required timeframe after termination",
            violatedRule: "Account deactivation within 24 hours of termination",
            detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            detectedBy: DetectionSource.Automated,
            involvedUsers: [
              {
                userId: "user-term-001",
                userName: "Former Employee",
                role: "analyst",
                department: "Finance",
                involementType: "primary" as any,
              },
            ],
            affectedResources: ["ELAM Portal", "ERP System"],
            status: ViolationStatus.Resolved,
            falsePositive: false,
            resolution: {
              resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              resolvedBy: "security-team",
              action: "access_revoked" as any,
              description: "Account immediately deactivated and access revoked",
              preventiveMeasures: [
                "Automated termination workflow implemented",
              ],
              followUpRequired: false,
            },
          },
        ],
        findings: [
          {
            id: "find-001",
            title: "Insufficient Access Review Documentation",
            description:
              "Access review process lacks proper documentation and audit trail",
            category: FindingCategory.AccessControl,
            severity: FindingSeverity.Medium,
            riskLevel: RiskLevel.Medium,
            affectedControls: ["acc-002"],
            evidence: [],
            impact: "Limited audit trail for access decisions",
            likelihood: "Medium",
            recommendation:
              "Implement comprehensive access review documentation system",
            status: FindingStatus.InProgress,
            assignedTo: "access-team",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
        recommendations: [
          {
            id: "rec-001",
            title: "Implement Automated Access Reviews",
            description:
              "Deploy automated access review system to improve efficiency and compliance",
            category: RecommendationCategory.Process,
            priority: UrgencyLevel.Medium,
            effort: EffortLevel.Medium,
            cost: CostLevel.Medium,
            benefits: [
              "Improved compliance",
              "Reduced manual effort",
              "Better audit trail",
            ],
            risks: ["Implementation complexity", "User training required"],
            implementation: {
              phases: [
                {
                  phase: 1,
                  name: "Requirements Analysis",
                  description:
                    "Analyze current process and define requirements",
                  duration: 30,
                  activities: [
                    "Current state analysis",
                    "Stakeholder interviews",
                  ],
                  deliverables: ["Requirements document", "Process map"],
                },
              ],
              dependencies: ["Budget approval", "Resource allocation"],
              resources: [
                {
                  type: "personnel" as any,
                  description: "Business Analyst",
                  quantity: 1,
                  cost: 15000,
                },
              ],
              timeline: 90,
              milestones: [
                {
                  name: "Requirements Complete",
                  description: "All requirements documented and approved",
                  targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  criteria: ["Requirements approved by stakeholders"],
                  responsible: "business-analyst",
                },
              ],
            },
            status: RecommendationStatus.Approved,
            assignedTo: "project-manager",
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        ],
        generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        generatedBy: "compliance-officer",
        approvedBy: "audit-manager",
        approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        metadata: {
          version: "1.0",
          template: "sox-quarterly",
          parameters: { includeFindings: true, includeTrends: true },
          dataSourcesUsed: ["ELAM", "AD", "SIEM"],
          confidentialityLevel: ConfidentialityLevel.Confidential,
          distributionList: ["audit-committee", "ciso", "cfo"],
          retentionPeriod: 2555, // 7 years in days
        },
      },
    ];

    // Initialize Access Reviews
    const mockAccessReviews: AccessReview[] = [
      {
        id: "rev-001",
        name: "Q4 2024 Privileged Access Review",
        description: "Quarterly review of all privileged access assignments",
        reviewType: ReviewType.PrivilegedAccessReview,
        scope: {
          includeUsers: true,
          includeGroups: true,
          includeRoles: true,
          includePermissions: false,
          departments: ["IT", "Security", "Operations"],
          systems: ["ELAM", "Active Directory", "Production Servers"],
          accessTypes: ["admin", "privileged"],
          riskLevels: [RiskLevel.High, RiskLevel.Critical],
          lastLoginDays: 90,
        },
        frequency: ReviewFrequency.Quarterly,
        status: ReviewStatus.InProgress,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        reviewedBy: ["security-manager", "audit-team"],
        totalItems: 245,
        completedItems: 180,
        approvedItems: 165,
        revokedItems: 12,
        flaggedItems: 3,
        riskScore: 35,
        findings: [
          {
            id: "rf-001",
            type: "excessive_access" as any,
            severity: FindingSeverity.Medium,
            description:
              "3 users have administrative access that appears excessive for their roles",
            affectedItems: [
              "user-admin-001",
              "user-admin-002",
              "user-admin-003",
            ],
            riskImpact: "Potential for unauthorized system modifications",
            recommendation:
              "Review and potentially revoke unnecessary administrative privileges",
            status: FindingStatus.New,
            assignedTo: "security-team",
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          },
        ],
        recommendations: [
          "Implement role-based access model",
          "Regular privilege review automation",
        ],
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        metadata: {
          template: "privileged-access-quarterly",
          configuration: { riskThreshold: 70, autoApproveThreshold: 30 },
          dataSourcesUsed: ["Active Directory", "ELAM"],
          automationLevel: 65,
          reviewers: [
            {
              userId: "sec-mgr-001",
              name: "Security Manager",
              role: "Security Manager",
              assignedItems: 120,
              completedItems: 95,
              lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
          ],
        },
      },
    ];

    // Initialize Policy Violations
    const mockViolations: PolicyViolation[] = [
      {
        id: "viol-002",
        policyId: "pol-002",
        policyName: "Data Access Policy",
        violationType: ViolationType.DataMisuse,
        severity: ViolationSeverity.High,
        description:
          "Unauthorized access to customer PII data outside business hours",
        violatedRule:
          "Customer data access restricted to business hours (8 AM - 6 PM)",
        detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        detectedBy: DetectionSource.Monitoring,
        involvedUsers: [
          {
            userId: "user-004",
            userName: "Data Analyst X",
            role: "Senior Data Analyst",
            department: "Analytics",
            involementType: "primary" as any,
          },
        ],
        affectedResources: ["Customer Database", "PII Records"],
        riskScore: 80,
        status: ViolationStatus.InInvestigation,
        investigationNotes:
          "User claims legitimate business need for after-hours access. Investigating justification.",
        falsePositive: false,
      },
    ];

    // Initialize Access Certifications
    const mockCertifications: AccessCertification[] = [
      {
        id: "cert-001",
        reviewId: "rev-001",
        userId: "user-005",
        userName: "Database Admin",
        resourceId: "res-db-001",
        resourceName: "Production Database",
        accessType: "administrative",
        permissions: ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP"],
        businessJustification: "Database administration and maintenance tasks",
        reviewedBy: "security-manager",
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        decision: CertificationDecision.Approved,
        comments: "Access appropriate for role responsibilities",
        nextCertificationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        riskFlags: [],
      },
      {
        id: "cert-002",
        reviewId: "rev-001",
        userId: "user-006",
        userName: "Former Project Manager",
        resourceId: "res-proj-001",
        resourceName: "Project Management System",
        accessType: "standard",
        permissions: ["READ", "WRITE"],
        businessJustification: "Project management and coordination",
        reviewedBy: "security-manager",
        reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        decision: CertificationDecision.Revoked,
        comments: "User no longer in project management role",
        nextCertificationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        riskFlags: ["role_change", "access_not_used"],
      },
    ];

    // Initialize Compliance Findings
    const mockFindings: ComplianceFinding[] = [
      {
        id: "find-002",
        title: "Weak Password Policy Implementation",
        description:
          "Current password policy does not meet industry best practices",
        category: FindingCategory.SystemSecurity,
        severity: FindingSeverity.Medium,
        riskLevel: RiskLevel.Medium,
        affectedControls: ["sec-001", "sec-002"],
        evidence: [],
        impact: "Increased risk of credential compromise",
        likelihood: "Medium",
        recommendation:
          "Update password policy to require 12+ characters with complexity",
        status: FindingStatus.Acknowledged,
        assignedTo: "security-team",
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    // Initialize Recommendations
    const mockRecommendations: Recommendation[] = [
      {
        id: "rec-002",
        title: "Implement Zero Trust Architecture",
        description:
          "Transition to zero trust security model for enhanced protection",
        category: RecommendationCategory.Security,
        priority: UrgencyLevel.High,
        effort: EffortLevel.VeryHigh,
        cost: CostLevel.High,
        benefits: [
          "Enhanced security posture",
          "Better compliance",
          "Reduced breach risk",
        ],
        risks: [
          "Complex implementation",
          "User experience impact",
          "High cost",
        ],
        implementation: {
          phases: [
            {
              phase: 1,
              name: "Assessment and Planning",
              description:
                "Current state assessment and implementation planning",
              duration: 60,
              activities: ["Security assessment", "Architecture design"],
              deliverables: ["Assessment report", "Implementation plan"],
            },
          ],
          dependencies: ["Executive buy-in", "Budget allocation"],
          resources: [
            {
              type: "personnel" as any,
              description: "Security Architect",
              quantity: 2,
              cost: 50000,
            },
          ],
          timeline: 365,
          milestones: [
            {
              name: "Phase 1 Complete",
              description: "Assessment and planning phase completed",
              targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              criteria: ["Assessment approved", "Plan documented"],
              responsible: "security-architect",
            },
          ],
        },
        status: RecommendationStatus.Proposed,
        assignedTo: "ciso",
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];

    // Set mock data
    this.auditLogsSubject.next(mockAuditLogs);
    this.complianceReportsSubject.next(mockComplianceReports);
    this.accessReviewsSubject.next(mockAccessReviews);
    this.policyViolationsSubject.next(mockViolations);
    this.complianceFindingsSubject.next(mockFindings);
    this.recommendationsSubject.next(mockRecommendations);
    this.accessCertificationsSubject.next(mockCertifications);

    // Update metrics
    this.updateMetrics();
  }
}
