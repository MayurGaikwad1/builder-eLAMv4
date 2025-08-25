import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WorkflowService } from '../../shared/services/workflow.service';
import {
  Workflow,
  WorkflowTemplate,
  WorkflowExecution,
  WorkflowAnalytics,
  WorkflowStatus,
  WorkflowExecutionStatus,
  WorkflowStep,
  WorkflowApprover
} from '../../shared/interfaces/workflow.interface';

@Component({
  selector: 'app-workflow-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">Workflow Management</h1>
          <p class="text-secondary-600">
            Design, configure, and manage approval workflows with visual builder
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            (click)="showTemplates = true"
            class="btn-secondary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Templates
          </button>
          <button 
            (click)="showAnalytics = true"
            class="btn-secondary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"></path>
            </svg>
            Analytics
          </button>
          <button 
            (click)="showCreateModal = true"
            class="btn-primary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Workflow
          </button>
        </div>
      </div>

      <!-- Analytics Overview -->
      <div *ngIf="analytics()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Total Workflows</p>
              <p class="text-2xl font-bold text-secondary-900">{{ analytics()?.totalWorkflows }}</p>
              <p class="text-xs text-primary-600">{{ analytics()?.activeWorkflows }} active</p>
            </div>
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Avg Completion</p>
              <p class="text-2xl font-bold text-secondary-900">{{ analytics()?.averageCompletionTime | number:'1.1-1' }}d</p>
              <p class="text-xs text-success-600">Within SLA</p>
            </div>
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">SLA Compliance</p>
              <p class="text-2xl font-bold text-secondary-900">{{ analytics()?.slaComplianceRate | number:'1.0-0' }}%</p>
              <p class="text-xs text-primary-600">{{ analytics()?.totalExecutions }} executions</p>
            </div>
            <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-secondary-600">Approval Rate</p>
              <p class="text-2xl font-bold text-secondary-900">{{ analytics()?.approvalRate | number:'1.0-0' }}%</p>
              <p class="text-xs text-secondary-600">Overall success</p>
            </div>
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Workflows List -->
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-secondary-900">Workflows</h2>
            <div class="flex items-center space-x-3">
              <select 
                [(ngModel)]="selectedStatus"
                (ngModelChange)="filterWorkflows()"
                class="text-sm border border-secondary-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div class="space-y-4">
            <div 
              *ngFor="let workflow of filteredWorkflows(); trackBy: trackByWorkflowId"
              class="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="font-medium text-secondary-900">{{ workflow.name }}</h3>
                    <span 
                      [class]="getStatusClass(workflow.status)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ workflow.status | titlecase }}
                    </span>
                    <span 
                      *ngIf="workflow.isDefault"
                      class="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full"
                    >
                      Default
                    </span>
                  </div>
                  <p class="text-sm text-secondary-600 mb-2">{{ workflow.description }}</p>
                  <div class="flex items-center space-x-4 text-xs text-secondary-500">
                    <span>{{ workflow.steps.length }} steps</span>
                    <span>v{{ workflow.version }}</span>
                    <span>{{ workflow.createdAt | date:'MMM d, y' }}</span>
                    <span *ngIf="workflow.stats">{{ workflow.stats.totalExecutions }} executions</span>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button 
                    *ngIf="workflow.status === 'draft'"
                    (click)="publishWorkflow(workflow.id)"
                    class="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Publish
                  </button>
                  <button 
                    (click)="editWorkflow(workflow)"
                    class="text-sm text-secondary-600 hover:text-secondary-700"
                  >
                    Edit
                  </button>
                  <button 
                    (click)="testWorkflow(workflow.id)"
                    class="text-sm text-success-600 hover:text-success-700"
                  >
                    Test
                  </button>
                  <div class="relative">
                    <button 
                      (click)="toggleWorkflowMenu(workflow.id)"
                      class="text-secondary-400 hover:text-secondary-600"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path d="M10 4a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path d="M10 20a2 2 0 100-4 2 2 0 000 4z"></path>
                      </svg>
                    </button>
                    <div 
                      *ngIf="openMenuId() === workflow.id"
                      class="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                    >
                      <div class="py-1">
                        <button 
                          *ngIf="workflow.status === 'published'"
                          (click)="archiveWorkflow(workflow.id)"
                          class="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                        >
                          Archive
                        </button>
                        <button 
                          (click)="duplicateWorkflow(workflow)"
                          class="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                        >
                          Duplicate
                        </button>
                        <button 
                          (click)="deleteWorkflow(workflow.id)"
                          class="block w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Workflow Stats -->
              <div 
                *ngIf="workflow.stats" 
                class="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-secondary-100"
              >
                <div class="text-center">
                  <p class="text-lg font-semibold text-secondary-900">{{ workflow.stats.averageCompletionTime | number:'1.1-1' }}</p>
                  <p class="text-xs text-secondary-600">Avg Days</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-semibold text-success-600">{{ workflow.stats.approvalRate }}%</p>
                  <p class="text-xs text-secondary-600">Approval Rate</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-semibold text-warning-600">{{ workflow.stats.slaCompliance }}%</p>
                  <p class="text-xs text-secondary-600">SLA Compliance</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-semibold text-primary-600">{{ workflow.stats.totalExecutions }}</p>
                  <p class="text-xs text-secondary-600">Executions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Executions -->
        <div class="card">
          <h2 class="text-lg font-semibold text-secondary-900 mb-6">Recent Executions</h2>
          <div class="space-y-4">
            <div 
              *ngFor="let execution of executions(); trackBy: trackByExecutionId"
              class="flex items-center justify-between p-3 border border-secondary-200 rounded-lg"
            >
              <div>
                <p class="font-medium text-secondary-900">{{ getWorkflowName(execution.workflowId) }}</p>
                <p class="text-sm text-secondary-600">{{ execution.requestId }}</p>
                <p class="text-xs text-secondary-500">{{ execution.startedAt | date:'MMM d, HH:mm' }}</p>
              </div>
              <div class="text-right">
                <span 
                  [class]="getExecutionStatusClass(execution.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ execution.status | titlecase }}
                </span>
                <p 
                  *ngIf="execution.executionTime"
                  class="text-xs text-secondary-500 mt-1"
                >
                  {{ execution.executionTime | number:'1.1-1' }}d
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Workflow Modal -->
      <div 
        *ngIf="showCreateModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="flex items-center justify-between p-6 border-b border-secondary-200">
            <h2 class="text-lg font-semibold text-secondary-900">Create New Workflow</h2>
            <button 
              (click)="showCreateModal = false"
              class="text-secondary-400 hover:text-secondary-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form (ngSubmit)="createWorkflow()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Workflow Name</label>
              <input 
                [(ngModel)]="newWorkflow.name"
                name="name"
                type="text"
                placeholder="Enter workflow name"
                class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Description</label>
              <textarea 
                [(ngModel)]="newWorkflow.description"
                name="description"
                rows="3"
                placeholder="Describe the purpose of this workflow"
                class="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              ></textarea>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-4">
              <button 
                type="button"
                (click)="showCreateModal = false"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="btn-primary"
                [disabled]="!newWorkflow.name"
              >
                Create & Configure
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Templates Modal -->
      <div 
        *ngIf="showTemplates"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between p-6 border-b border-secondary-200">
            <h2 class="text-lg font-semibold text-secondary-900">Workflow Templates</h2>
            <button 
              (click)="showTemplates = false"
              class="text-secondary-400 hover:text-secondary-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="p-6 space-y-4">
            <div 
              *ngFor="let template of templates(); trackBy: trackByTemplateId"
              class="border border-secondary-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h3 class="font-medium text-secondary-900">{{ template.name }}</h3>
                    <span 
                      [class]="getComplexityClass(template.complexity)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ template.complexity | titlecase }}
                    </span>
                  </div>
                  <p class="text-sm text-secondary-600 mb-2">{{ template.description }}</p>
                  <p class="text-xs text-secondary-500">
                    ~{{ template.estimatedSetupTime }} min setup time
                  </p>
                </div>
                <button 
                  (click)="createFromTemplate(template)"
                  class="btn-primary text-sm"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Modal -->
      <div 
        *ngIf="showAnalytics"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between p-6 border-b border-secondary-200">
            <h2 class="text-lg font-semibold text-secondary-900">Workflow Analytics</h2>
            <button 
              (click)="showAnalytics = false"
              class="text-secondary-400 hover:text-secondary-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="p-6 space-y-6">
            <!-- Performance Metrics -->
            <div>
              <h3 class="text-md font-semibold text-secondary-900 mb-4">Performance by Workflow</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-secondary-200">
                  <thead class="bg-secondary-50">
                    <tr>
                      <th class="table-header">Workflow</th>
                      <th class="table-header">Executions</th>
                      <th class="table-header">Avg Time</th>
                      <th class="table-header">SLA Compliance</th>
                      <th class="table-header">Approval Rate</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-secondary-200">
                    <tr *ngFor="let metric of analytics()?.performanceMetrics">
                      <td class="table-cell">{{ metric.workflowName }}</td>
                      <td class="table-cell">{{ metric.executions }}</td>
                      <td class="table-cell">{{ metric.averageTime | number:'1.1-1' }}d</td>
                      <td class="table-cell">
                        <span [class]="getSLAComplianceClass(metric.slaCompliance)">
                          {{ metric.slaCompliance }}%
                        </span>
                      </td>
                      <td class="table-cell">
                        <span [class]="getApprovalRateClass(metric.approvalRate)">
                          {{ metric.approvalRate }}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Top Bottlenecks -->
            <div *ngIf="analytics()?.topBottlenecks && analytics()!.topBottlenecks.length > 0">
              <h3 class="text-md font-semibold text-secondary-900 mb-4">Top Bottlenecks</h3>
              <div class="space-y-3">
                <div 
                  *ngFor="let bottleneck of analytics()!.topBottlenecks"
                  class="flex items-center justify-between p-3 bg-warning-50 border border-warning-200 rounded-lg"
                >
                  <div>
                    <p class="font-medium text-warning-800">{{ bottleneck.stepName }}</p>
                    <p class="text-sm text-warning-600">Average: {{ bottleneck.averageTime | number:'1.1-1' }} days</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-warning-800">{{ bottleneck.frequency }} times</p>
                    <p class="text-xs text-warning-600">Identified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Click outside to close menus -->
      <div 
        *ngIf="openMenuId()"
        (click)="openMenuId.set(null)"
        class="fixed inset-0 z-5"
      ></div>
    </div>
  `
})
export class WorkflowManagementComponent implements OnInit {
  workflows = signal<Workflow[]>([]);
  filteredWorkflows = signal<Workflow[]>([]);
  templates = signal<WorkflowTemplate[]>([]);
  executions = signal<WorkflowExecution[]>([]);
  analytics = signal<WorkflowAnalytics | null>(null);
  
  selectedStatus = '';
  showCreateModal = false;
  showTemplates = false;
  showAnalytics = false;
  openMenuId = signal<string | null>(null);
  
  newWorkflow = {
    name: '',
    description: ''
  };

  constructor(private workflowService: WorkflowService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.workflowService.getWorkflows().subscribe(workflows => {
      this.workflows.set(workflows);
      this.filteredWorkflows.set(workflows);
    });

    this.workflowService.getTemplates().subscribe(templates => {
      this.templates.set(templates);
    });

    this.workflowService.getExecutions().subscribe(executions => {
      this.executions.set(executions.slice(0, 10)); // Show only recent 10
    });

    this.workflowService.getAnalytics().subscribe(analytics => {
      this.analytics.set(analytics);
    });
  }

  filterWorkflows() {
    const workflows = this.workflows();
    if (!this.selectedStatus) {
      this.filteredWorkflows.set(workflows);
    } else {
      this.filteredWorkflows.set(
        workflows.filter(w => w.status === this.selectedStatus)
      );
    }
  }

  createWorkflow() {
    if (!this.newWorkflow.name) return;

    this.workflowService.createWorkflow(this.newWorkflow).subscribe(workflow => {
      this.loadData();
      this.showCreateModal = false;
      this.newWorkflow = { name: '', description: '' };
      // Here you would typically navigate to the workflow builder
      console.log('Navigate to workflow builder for:', workflow.id);
    });
  }

  createFromTemplate(template: WorkflowTemplate) {
    const workflowName = prompt(`Enter name for new workflow from template "${template.name}":`, template.name);
    if (workflowName) {
      this.workflowService.createFromTemplate(template.id, { name: workflowName }).subscribe(() => {
        this.loadData();
        this.showTemplates = false;
      });
    }
  }

  editWorkflow(workflow: Workflow) {
    // Navigate to workflow builder
    console.log('Edit workflow:', workflow.id);
  }

  publishWorkflow(workflowId: string) {
    this.workflowService.publishWorkflow(workflowId).subscribe(() => {
      this.loadData();
    });
  }

  archiveWorkflow(workflowId: string) {
    this.workflowService.archiveWorkflow(workflowId).subscribe(() => {
      this.loadData();
    });
  }

  duplicateWorkflow(workflow: Workflow) {
    const newName = `${workflow.name} (Copy)`;
    this.workflowService.createWorkflow({
      name: newName,
      description: workflow.description,
      steps: workflow.steps,
      triggers: workflow.triggers,
      slaConfig: workflow.slaConfig
    }).subscribe(() => {
      this.loadData();
    });
  }

  deleteWorkflow(workflowId: string) {
    if (confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      this.workflowService.deleteWorkflow(workflowId).subscribe(() => {
        this.loadData();
      });
    }
  }

  testWorkflow(workflowId: string) {
    this.workflowService.testWorkflow(workflowId, {}).subscribe(result => {
      alert(`Test completed in ${result.executionTime} days with ${result.errors.length} errors`);
    });
  }

  toggleWorkflowMenu(workflowId: string) {
    this.openMenuId.set(this.openMenuId() === workflowId ? null : workflowId);
  }

  getWorkflowName(workflowId: string): string {
    const workflow = this.workflows().find(w => w.id === workflowId);
    return workflow?.name || 'Unknown Workflow';
  }

  // Utility methods for CSS classes
  getStatusClass(status: WorkflowStatus): string {
    const classes = {
      [WorkflowStatus.Draft]: 'bg-secondary-100 text-secondary-800',
      [WorkflowStatus.Published]: 'bg-success-100 text-success-800',
      [WorkflowStatus.Archived]: 'bg-warning-100 text-warning-800',
      [WorkflowStatus.Testing]: 'bg-primary-100 text-primary-800'
    };
    return classes[status];
  }

  getExecutionStatusClass(status: WorkflowExecutionStatus): string {
    const classes = {
      [WorkflowExecutionStatus.Pending]: 'bg-secondary-100 text-secondary-800',
      [WorkflowExecutionStatus.InProgress]: 'bg-primary-100 text-primary-800',
      [WorkflowExecutionStatus.Approved]: 'bg-success-100 text-success-800',
      [WorkflowExecutionStatus.Rejected]: 'bg-danger-100 text-danger-800',
      [WorkflowExecutionStatus.Cancelled]: 'bg-warning-100 text-warning-800',
      [WorkflowExecutionStatus.TimedOut]: 'bg-danger-100 text-danger-800',
      [WorkflowExecutionStatus.Error]: 'bg-danger-100 text-danger-800'
    };
    return classes[status];
  }

  getComplexityClass(complexity: string): string {
    const classes = {
      'simple': 'bg-success-100 text-success-800',
      'moderate': 'bg-warning-100 text-warning-800',
      'complex': 'bg-danger-100 text-danger-800'
    };
    return classes[complexity as keyof typeof classes] || 'bg-secondary-100 text-secondary-800';
  }

  getSLAComplianceClass(compliance: number): string {
    if (compliance >= 95) return 'text-success-600 font-medium';
    if (compliance >= 80) return 'text-warning-600 font-medium';
    return 'text-danger-600 font-medium';
  }

  getApprovalRateClass(rate: number): string {
    if (rate >= 90) return 'text-success-600 font-medium';
    if (rate >= 70) return 'text-warning-600 font-medium';
    return 'text-danger-600 font-medium';
  }

  // Track by functions for ngFor
  trackByWorkflowId(index: number, workflow: Workflow): string {
    return workflow.id;
  }

  trackByTemplateId(index: number, template: WorkflowTemplate): string {
    return template.id;
  }

  trackByExecutionId(index: number, execution: WorkflowExecution): string {
    return execution.id;
  }
}
