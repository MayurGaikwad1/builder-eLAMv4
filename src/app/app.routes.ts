import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { AccessRequestsComponent } from './pages/access-requests.component';
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
    component: PlaceholderComponent,
    data: { 
      title: 'User Lifecycle Management', 
      moduleType: 'user management system',
      plannedFeatures: [
        'Automated provisioning/deprovisioning',
        'HRMS integration for JML',
        'Role mining and recommendations',
        'User access reviews',
        'Bulk user operations'
      ]
    }
  },
  { 
    path: 'users/all', 
    component: PlaceholderComponent,
    data: { title: 'All Users', moduleType: 'user directory' }
  },
  { 
    path: 'users/provisioning', 
    component: PlaceholderComponent,
    data: { title: 'User Provisioning', moduleType: 'provisioning system' }
  },
  { 
    path: 'users/deprovisioning', 
    component: PlaceholderComponent,
    data: { title: 'User Deprovisioning', moduleType: 'deprovisioning system' }
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
