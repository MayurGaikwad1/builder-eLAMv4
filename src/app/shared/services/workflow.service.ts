import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import {
  Workflow,
  WorkflowTemplate,
  WorkflowExecution,
  WorkflowAnalytics,
  WorkflowStatus,
  WorkflowExecutionStatus,
  SLAConfiguration,
  WorkflowStep,
  WorkflowApprover,
  WorkflowTrigger,
  WorkflowCondition,
  WorkflowNode,
  PerformanceMetric,
} from "../interfaces/workflow.interface";

@Injectable({
  providedIn: "root",
})
export class WorkflowService {
  private workflowsSubject = new BehaviorSubject<Workflow[]>([]);
  public workflows$ = this.workflowsSubject.asObservable();

  private templatesSubject = new BehaviorSubject<WorkflowTemplate[]>([]);
  public templates$ = this.templatesSubject.asObservable();

  private executionsSubject = new BehaviorSubject<WorkflowExecution[]>([]);
  public executions$ = this.executionsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock Workflows
    const mockWorkflows: Workflow[] = [
      {
        id: "wf-1",
        name: "Standard Access Request",
        description: "Standard workflow for employee access requests",
        status: WorkflowStatus.Published,
        version: "1.2",
        isDefault: true,
        isActive: true,
        triggers: [
          {
            id: "tr-1",
            type: "request_type",
            conditions: [
              {
                id: "c-1",
                field: "requestType",
                operator: "equals",
                value: "new_access",
                logic: "and",
              },
            ],
          },
        ],
        steps: [
          {
            id: "step-1",
            name: "Manager Approval",
            type: "approval",
            order: 1,
            approvers: [
              {
                id: "app-1",
                type: "role",
                name: "Direct Manager",
                isRequired: true,
              },
            ],
            timeouts: {
              duration: 2,
              unit: "days",
              action: "escalate",
              escalateTo: "senior-manager",
            },
          },
          {
            id: "step-2",
            name: "Security Review",
            type: "approval",
            order: 2,
            approvers: [
              {
                id: "app-2",
                type: "group",
                name: "Security Team",
                isRequired: true,
              },
            ],
            conditions: [
              {
                id: "c-2",
                field: "riskLevel",
                operator: "greater_than",
                value: "low",
                logic: "and",
              },
            ],
          },
        ],
        slaConfig: {
          totalDuration: 5,
          unit: "days",
          escalationLevels: [
            {
              level: 1,
              triggerAfter: 3,
              unit: "days",
              escalateTo: [
                {
                  id: "esc-1",
                  type: "role",
                  name: "Senior Manager",
                  isRequired: true,
                },
              ],
              actions: [],
            },
          ],
        },
        createdBy: "admin",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20"),
        stats: {
          totalExecutions: 156,
          averageCompletionTime: 3.2,
          approvalRate: 89,
          slaCompliance: 94,
          bottlenecks: [
            {
              stepId: "step-2",
              stepName: "Security Review",
              averageTime: 1.8,
              frequency: 23,
            },
          ],
        },
      },
      {
        id: "wf-2",
        name: "Emergency Access Workflow",
        description: "Fast-track workflow for emergency access requests",
        status: WorkflowStatus.Published,
        version: "1.0",
        isDefault: false,
        isActive: true,
        triggers: [
          {
            id: "tr-2",
            type: "request_type",
            conditions: [
              {
                id: "c-3",
                field: "urgency",
                operator: "equals",
                value: "critical",
                logic: "and",
              },
            ],
          },
        ],
        steps: [
          {
            id: "step-3",
            name: "Emergency Approval",
            type: "approval",
            order: 1,
            approvers: [
              {
                id: "app-3",
                type: "group",
                name: "Emergency Approvers",
                isRequired: true,
              },
            ],
            timeouts: {
              duration: 1,
              unit: "hours",
              action: "auto_approve",
            },
          },
        ],
        slaConfig: {
          totalDuration: 2,
          unit: "hours",
          escalationLevels: [],
        },
        createdBy: "admin",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
        stats: {
          totalExecutions: 12,
          averageCompletionTime: 0.5,
          approvalRate: 100,
          slaCompliance: 100,
          bottlenecks: [],
        },
      },
      {
        id: "wf-3",
        name: "High-Risk Access Review",
        description: "Multi-level approval for high-risk access requests",
        status: WorkflowStatus.Draft,
        version: "0.1",
        isDefault: false,
        isActive: false,
        triggers: [
          {
            id: "tr-3",
            type: "risk_level",
            conditions: [
              {
                id: "c-4",
                field: "riskLevel",
                operator: "equals",
                value: "critical",
                logic: "and",
              },
            ],
          },
        ],
        steps: [
          {
            id: "step-4",
            name: "Manager Approval",
            type: "approval",
            order: 1,
            approvers: [
              {
                id: "app-4",
                type: "role",
                name: "Direct Manager",
                isRequired: true,
              },
            ],
          },
          {
            id: "step-5",
            name: "Security Review",
            type: "approval",
            order: 2,
            approvers: [
              {
                id: "app-5",
                type: "group",
                name: "Security Team",
                isRequired: true,
              },
            ],
          },
          {
            id: "step-6",
            name: "CISO Approval",
            type: "approval",
            order: 3,
            approvers: [
              {
                id: "app-6",
                type: "user",
                name: "Chief Information Security Officer",
                email: "ciso@company.com",
                isRequired: true,
              },
            ],
          },
        ],
        slaConfig: {
          totalDuration: 7,
          unit: "days",
          escalationLevels: [
            {
              level: 1,
              triggerAfter: 5,
              unit: "days",
              escalateTo: [
                {
                  id: "esc-2",
                  type: "user",
                  name: "Chief Technology Officer",
                  isRequired: true,
                },
              ],
              actions: [],
            },
          ],
        },
        createdBy: "security-admin",
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date("2024-02-15"),
      },
    ];

    // Mock Templates
    const mockTemplates: WorkflowTemplate[] = [
      {
        id: "tpl-1",
        name: "Simple Approval",
        category: "access_request",
        description: "Single-step approval workflow",
        complexity: "simple",
        estimatedSetupTime: 5,
        workflow: {
          name: "Simple Approval Workflow",
          steps: [
            {
              id: "step-tpl-1",
              name: "Single Approval",
              type: "approval",
              order: 1,
              approvers: [],
            },
          ],
        },
      },
      {
        id: "tpl-2",
        name: "Two-Stage Approval",
        category: "access_request",
        description: "Manager and security team approval",
        complexity: "moderate",
        estimatedSetupTime: 15,
        workflow: {
          name: "Two-Stage Approval Workflow",
          steps: [
            {
              id: "step-tpl-2",
              name: "Manager Approval",
              type: "approval",
              order: 1,
              approvers: [],
            },
            {
              id: "step-tpl-3",
              name: "Security Approval",
              type: "approval",
              order: 2,
              approvers: [],
            },
          ],
        },
      },
      {
        id: "tpl-3",
        name: "Risk-Based Workflow",
        category: "access_request",
        description: "Dynamic approval based on risk assessment",
        complexity: "complex",
        estimatedSetupTime: 30,
        workflow: {
          name: "Risk-Based Approval Workflow",
          steps: [
            {
              id: "step-tpl-4",
              name: "Risk Assessment",
              type: "validation",
              order: 1,
              approvers: [],
            },
            {
              id: "step-tpl-5",
              name: "Conditional Approval",
              type: "approval",
              order: 2,
              approvers: [],
            },
          ],
        },
      },
    ];

    // Mock Executions
    const mockExecutions: WorkflowExecution[] = [
      {
        id: "exec-1",
        workflowId: "wf-1",
        requestId: "req-001",
        status: WorkflowExecutionStatus.Approved,
        currentStep: "completed",
        startedAt: new Date("2024-02-20T09:00:00"),
        completedAt: new Date("2024-02-22T14:30:00"),
        executionTime: 2.23,
        approvals: [
          {
            stepId: "step-1",
            approverId: "mgr-001",
            decision: "approved",
            comments: "Approved for project requirements",
            decidedAt: new Date("2024-02-20T16:00:00"),
          },
          {
            stepId: "step-2",
            approverId: "sec-001",
            decision: "approved",
            comments: "Security review completed",
            decidedAt: new Date("2024-02-22T14:30:00"),
          },
        ],
      },
      {
        id: "exec-2",
        workflowId: "wf-2",
        requestId: "req-002",
        status: WorkflowExecutionStatus.InProgress,
        currentStep: "step-3",
        startedAt: new Date("2024-02-23T11:00:00"),
        approvals: [
          {
            stepId: "step-3",
            approverId: "emr-001",
            decision: "pending",
          },
        ],
      },
    ];

    this.workflowsSubject.next(mockWorkflows);
    this.templatesSubject.next(mockTemplates);
    this.executionsSubject.next(mockExecutions);
  }

  // Workflow CRUD Operations
  getWorkflows(): Observable<Workflow[]> {
    return this.workflows$.pipe(delay(300));
  }

  getWorkflow(id: string): Observable<Workflow | undefined> {
    return this.workflows$.pipe(
      map((workflows) => workflows.find((w) => w.id === id)),
      delay(200),
    );
  }

  createWorkflow(workflow: Partial<Workflow>): Observable<Workflow> {
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: workflow.name || "New Workflow",
      description: workflow.description || "",
      status: WorkflowStatus.Draft,
      version: "1.0",
      isDefault: false,
      isActive: false,
      triggers: workflow.triggers || [],
      steps: workflow.steps || [],
      slaConfig: workflow.slaConfig || {
        totalDuration: 5,
        unit: "days",
        escalationLevels: [],
      },
      createdBy: "current-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const currentWorkflows = this.workflowsSubject.value;
    this.workflowsSubject.next([...currentWorkflows, newWorkflow]);

    return of(newWorkflow).pipe(delay(500));
  }

  updateWorkflow(id: string, updates: Partial<Workflow>): Observable<Workflow> {
    const currentWorkflows = this.workflowsSubject.value;
    const index = currentWorkflows.findIndex((w) => w.id === id);

    if (index !== -1) {
      const updatedWorkflow = {
        ...currentWorkflows[index],
        ...updates,
        updatedAt: new Date(),
      };

      currentWorkflows[index] = updatedWorkflow;
      this.workflowsSubject.next([...currentWorkflows]);

      return of(updatedWorkflow).pipe(delay(500));
    }

    throw new Error("Workflow not found");
  }

  deleteWorkflow(id: string): Observable<boolean> {
    const currentWorkflows = this.workflowsSubject.value;
    const filteredWorkflows = currentWorkflows.filter((w) => w.id !== id);
    this.workflowsSubject.next(filteredWorkflows);

    return of(true).pipe(delay(300));
  }

  publishWorkflow(id: string): Observable<Workflow> {
    return this.updateWorkflow(id, {
      status: WorkflowStatus.Published,
      isActive: true,
    });
  }

  archiveWorkflow(id: string): Observable<Workflow> {
    return this.updateWorkflow(id, {
      status: WorkflowStatus.Archived,
      isActive: false,
    });
  }

  // Template Operations
  getTemplates(): Observable<WorkflowTemplate[]> {
    return this.templates$.pipe(delay(200));
  }

  createFromTemplate(
    templateId: string,
    workflowData: Partial<Workflow>,
  ): Observable<Workflow> {
    return this.templates$
      .pipe(
        map((templates) => {
          const template = templates.find((t) => t.id === templateId);
          if (!template) throw new Error("Template not found");

          const workflowFromTemplate: Partial<Workflow> = {
            ...template.workflow,
            ...workflowData,
            name: workflowData.name || template.workflow.name,
          };

          return workflowFromTemplate;
        }),
        delay(300),
      )
      .subscribe((workflowData) => {
        this.createWorkflow(workflowData);
      }) as any;
  }

  // Execution Operations
  getExecutions(): Observable<WorkflowExecution[]> {
    return this.executions$.pipe(delay(200));
  }

  getExecutionsByWorkflow(workflowId: string): Observable<WorkflowExecution[]> {
    return this.executions$.pipe(
      map((executions) =>
        executions.filter((e) => e.workflowId === workflowId),
      ),
      delay(200),
    );
  }

  // Analytics
  getAnalytics(): Observable<WorkflowAnalytics> {
    return this.workflows$.pipe(
      map((workflows) => {
        const analytics: WorkflowAnalytics = {
          totalWorkflows: workflows.length,
          activeWorkflows: workflows.filter((w) => w.isActive).length,
          draftWorkflows: workflows.filter(
            (w) => w.status === WorkflowStatus.Draft,
          ).length,
          totalExecutions: workflows.reduce(
            (sum, w) => sum + (w.stats?.totalExecutions || 0),
            0,
          ),
          averageCompletionTime:
            workflows.reduce(
              (sum, w) => sum + (w.stats?.averageCompletionTime || 0),
              0,
            ) / workflows.length,
          slaComplianceRate:
            workflows.reduce(
              (sum, w) => sum + (w.stats?.slaCompliance || 0),
              0,
            ) / workflows.length,
          approvalRate:
            workflows.reduce(
              (sum, w) => sum + (w.stats?.approvalRate || 0),
              0,
            ) / workflows.length,
          topBottlenecks: workflows
            .flatMap((w) => w.stats?.bottlenecks || [])
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5),
          performanceMetrics: workflows.map((w) => ({
            workflowId: w.id,
            workflowName: w.name,
            executions: w.stats?.totalExecutions || 0,
            averageTime: w.stats?.averageCompletionTime || 0,
            slaCompliance: w.stats?.slaCompliance || 0,
            approvalRate: w.stats?.approvalRate || 0,
          })),
        };
        return analytics;
      }),
      delay(300),
    );
  }

  // Workflow Testing
  testWorkflow(workflowId: string, testData: any): Observable<any> {
    return of({
      success: true,
      executionTime: 2.5,
      steps: [
        { stepId: "step-1", status: "completed", duration: 1.2 },
        { stepId: "step-2", status: "completed", duration: 1.3 },
      ],
      warnings: [],
      errors: [],
    }).pipe(delay(2000));
  }

  // Validation
  validateWorkflow(
    workflow: Workflow,
  ): Observable<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!workflow.name || workflow.name.trim().length === 0) {
      errors.push("Workflow name is required");
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push("At least one step is required");
    }

    if (workflow.steps) {
      workflow.steps.forEach((step, index) => {
        if (!step.approvers || step.approvers.length === 0) {
          errors.push(`Step ${index + 1} must have at least one approver`);
        }
      });
    }

    return of({
      isValid: errors.length === 0,
      errors,
    }).pipe(delay(300));
  }
}
