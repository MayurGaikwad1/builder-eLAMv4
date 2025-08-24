import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { AccessRequestsComponent } from './pages/access-requests.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { AllUsersComponent } from './pages/user-management/all-users.component';
import { UserProvisioningComponent } from './pages/user-management/user-provisioning.component';
import { UserDeprovisioningComponent } from './pages/user-management/user-deprovisioning.component';
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
    component: PlaceholderComponent,
    data: { 
      title: 'Approval Management', 
      moduleType: 'approval system',
      plannedFeatures: [
        'Multi-level approval workflows',
        'Bulk approval capabilities',
        'Delegation and proxy approvals',
        'SoD conflict detection',
        'Mobile approval interface'
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
    component: PlaceholderComponent,
    data: { 
      title: 'Audit & Compliance', 
      moduleType: 'audit system',
      plannedFeatures: [
        'Immutable audit logging',
        'Compliance reporting (SOX, PCI, GDPR)',
        'Access certification campaigns',
        'Anomaly detection',
        'Evidence management'
      ]
    }
  },
  { 
    path: 'audit/logs', 
    component: PlaceholderComponent,
    data: { title: 'Audit Logs', moduleType: 'audit viewer' }
  },
  { 
    path: 'audit/compliance', 
    component: PlaceholderComponent,
    data: { title: 'Compliance Reports', moduleType: 'compliance dashboard' }
  },
  { 
    path: 'audit/reviews', 
    component: PlaceholderComponent,
    data: { title: 'Access Reviews', moduleType: 'review management' }
  },
  { 
    path: 'admin', 
    component: PlaceholderComponent,
    data: { 
      title: 'System Administration', 
      moduleType: 'admin console',
      plannedFeatures: [
        'Role and policy management',
        'Integration configuration',
        'Workflow design tools',
        'System monitoring',
        'Security configuration'
      ]
    }
  },
  { 
    path: 'admin/roles', 
    component: PlaceholderComponent,
    data: { title: 'Roles & Policies', moduleType: 'role management' }
  },
  { 
    path: 'admin/integrations', 
    component: PlaceholderComponent,
    data: { title: 'System Integrations', moduleType: 'integration management' }
  },
  { 
    path: 'admin/config', 
    component: PlaceholderComponent,
    data: { title: 'System Configuration', moduleType: 'configuration panel' }
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];
