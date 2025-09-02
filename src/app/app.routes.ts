import { Routes } from "@angular/router";
import { DashboardComponent } from "./pages/dashboard.component";
import { LoginComponent } from "./pages/login.component";
import { AccessRequestsComponent } from "./pages/access-requests.component";
import { UserManagementComponent } from "./pages/user-management/user-management.component";
import { AllUsersComponent } from "./pages/user-management/all-users.component";
import { UserProvisioningComponent } from "./pages/user-management/user-provisioning.component";
import { UserDeprovisioningComponent } from "./pages/user-management/user-deprovisioning.component";
import { ApprovalManagementComponent } from "./pages/approval-management/approval-management.component";
import { ApprovalQueueComponent } from "./pages/approval-management/approval-queue.component";
import { AuditComplianceComponent } from "./pages/audit-compliance/audit-compliance.component";
import { AuditLogsComponent } from "./pages/audit-compliance/audit-logs.component";
import { ComplianceReportsComponent } from "./pages/audit-compliance/compliance-reports.component";
import { AccessReviewsComponent } from "./pages/audit-compliance/access-reviews.component";
import { SystemAdminComponent } from "./pages/system-admin/system-admin.component";
import { RolesPoliciesComponent } from "./pages/system-admin/roles-policies.component";
import { SystemIntegrationsComponent } from "./pages/system-admin/system-integrations.component";
import { IntegrationConfigurationComponent } from "./pages/system-admin/integration-configuration.component";
import { SystemConfigurationComponent } from "./pages/system-admin/system-configuration.component";
import { WorkflowManagementComponent } from "./pages/workflow-management/workflow-management.component";
import { PlaceholderComponent } from "./pages/placeholder.component";
import { AuthGuard } from "./shared/guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "requests",
    component: AccessRequestsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "requests/my-requests",
    component: AccessRequestsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "requests/new",
    component: AccessRequestsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "requests/history",
    component: AccessRequestsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "approvals",
    component: ApprovalManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "approvals/queue",
    component: ApprovalQueueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "approvals/bulk",
    component: PlaceholderComponent,
    data: {
      title: "Bulk Approval Operations",
      moduleType: "bulk approval system",
      plannedFeatures: [
        "Advanced bulk approval workflows",
        "Conditional bulk approvals",
        "Risk-based auto-approval rules",
        "Bulk delegation capabilities",
        "Mass approval analytics",
      ],
    },
  },
  {
    path: "approvals/delegations",
    component: PlaceholderComponent,
    data: {
      title: "Approval Delegations",
      moduleType: "delegation management",
      plannedFeatures: [
        "Delegation rule configuration",
        "Time-bound delegation setup",
        "Conditional delegation policies",
        "Delegation approval history",
        "Auto-delegation scheduling",
      ],
    },
  },
  {
    path: "approvals/escalations",
    component: PlaceholderComponent,
    data: {
      title: "Approval Escalations",
      moduleType: "escalation management",
      plannedFeatures: [
        "SLA breach notifications",
        "Auto-escalation workflows",
        "Escalation path configuration",
        "Emergency approval processes",
        "Escalation analytics",
      ],
    },
  },
  {
    path: "approvals/analytics",
    component: PlaceholderComponent,
    data: {
      title: "Approval Analytics",
      moduleType: "approval analytics dashboard",
      plannedFeatures: [
        "Performance metrics dashboard",
        "SLA compliance tracking",
        "Bottleneck identification",
        "Approval pattern analysis",
        "Custom reporting tools",
      ],
    },
  },
  {
    path: "users",
    component: UserManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "users/all",
    component: AllUsersComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "users/provisioning",
    component: UserProvisioningComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "users/deprovisioning",
    component: UserDeprovisioningComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "audit",
    component: AuditComplianceComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "audit/logs",
    component: AuditLogsComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "audit/compliance",
    component: ComplianceReportsComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "audit/reviews",
    component: AccessReviewsComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "admin",
    component: SystemAdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "admin/roles",
    component: RolesPoliciesComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "admin/integrations",
    component: SystemIntegrationsComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "admin/integrations/configure/:id",
    component: IntegrationConfigurationComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "admin/config",
    component: SystemConfigurationComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "admin/workflows",
    component: WorkflowManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "**",
    redirectTo: "/dashboard",
  },
];
