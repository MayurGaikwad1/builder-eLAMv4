import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { AccessRequestsComponent } from './pages/access-requests.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { AllUsersComponent } from './pages/user-management/all-users.component';
import { UserProvisioningComponent } from './pages/user-management/user-provisioning.component';
import { UserDeprovisioningComponent } from './pages/user-management/user-deprovisioning.component';
import { ApprovalManagementComponent } from './pages/approval-management/approval-management.component';
import { ApprovalQueueComponent } from './pages/approval-management/approval-queue.component';
import { AuditComplianceComponent } from './pages/audit-compliance/audit-compliance.component';
import { AuditLogsComponent } from './pages/audit-compliance/audit-logs.component';
import { ComplianceReportsComponent } from './pages/audit-compliance/compliance-reports.component';
import { AccessReviewsComponent } from './pages/audit-compliance/access-reviews.component';
import { SystemAdminComponent } from './pages/system-admin/system-admin.component';
import { RolesPoliciesComponent } from './pages/system-admin/roles-policies.component';
import { SystemIntegrationsComponent } from './pages/system-admin/system-integrations.component';
import { PlaceholderComponent } from './pages/placeholder.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent 
  },
  { 
    path: 'requests', 
    component: AccessRequestsComponent 
  },
  { 
    path: 'requests/my-requests', 
    component: AccessRequestsComponent 
  },
  { 
    path: 'requests/new', 
    component: AccessRequestsComponent 
  },
  { 
    path: 'requests/history', 
    component: AccessRequestsComponent 
  },
  { 
    path: 'approvals', 
    component: ApprovalManagementComponent
  },
  { 
    path: 'approvals/queue', 
    component: ApprovalQueueComponent
  },
  { 
    path: 'approvals/bulk', 
    component: PlaceholderComponent,
    data: { 
      title: 'Bulk Approval Operations', 
      moduleType: 'bulk approval system',
      plannedFeatures: [
        'Advanced bulk approval workflows',
        'Conditional bulk approvals',
        'Risk-based auto-approval rules',
        'Bulk delegation capabilities',
        'Mass approval analytics'
      ]
    }
  },
  { 
    path: 'approvals/delegations', 
    component: PlaceholderComponent,
    data: { 
      title: 'Approval Delegations', 
      moduleType: 'delegation management',
      plannedFeatures: [
        'Delegation rule configuration',
        'Time-bound delegation setup',
        'Conditional delegation policies',
        'Delegation approval history',
        'Auto-delegation scheduling'
      ]
    }
  },
  { 
    path: 'approvals/escalations', 
    component: PlaceholderComponent,
    data: { 
      title: 'Approval Escalations', 
      moduleType: 'escalation management',
      plannedFeatures: [
        'SLA breach notifications',
        'Auto-escalation workflows',
        'Escalation path configuration',
        'Emergency approval processes',
        'Escalation analytics'
      ]
    }
  },
  { 
    path: 'approvals/analytics', 
    component: PlaceholderComponent,
    data: { 
      title: 'Approval Analytics', 
      moduleType: 'approval analytics dashboard',
      plannedFeatures: [
        'Performance metrics dashboard',
        'SLA compliance tracking',
        'Bottleneck identification',
        'Approval pattern analysis',
        'Custom reporting tools'
      ]
    }
  },
  { 
    path: 'users', 
    component: UserManagementComponent
  },
  { 
    path: 'users/all', 
    component: AllUsersComponent
  },
  { 
    path: 'users/provisioning', 
    component: UserProvisioningComponent
  },
  { 
    path: 'users/deprovisioning', 
    component: UserDeprovisioningComponent
  },
  {
    path: 'audit',
    component: AuditComplianceComponent
  },
  {
    path: 'audit/logs',
    component: AuditLogsComponent
  },
  {
    path: 'audit/compliance',
    component: ComplianceReportsComponent
  },
  {
    path: 'audit/reviews',
    component: AccessReviewsComponent
  },
  {
    path: 'admin',
    component: SystemAdminComponent
  },
  {
    path: 'admin/roles',
    component: RolesPoliciesComponent
  },
  {
    path: 'admin/integrations',
    component: SystemIntegrationsComponent
  },
  { 
    path: 'admin/config', 
    component: PlaceholderComponent,
    data: { title: 'System Configuration', moduleType: 'configuration panel' }
  },
  { 
    path: 'admin/workflows', 
    component: PlaceholderComponent,
    data: { 
      title: 'Workflow Management', 
      moduleType: 'workflow designer',
      plannedFeatures: [
        'Visual workflow builder',
        'Multi-level approval chains',
        'Conditional routing logic',
        'SLA and escalation rules',
        'Workflow testing and simulation'
      ]
    }
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];
