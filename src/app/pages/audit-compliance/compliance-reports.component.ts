import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuditComplianceService } from "../../shared/services/audit-compliance.service";
import {
  ComplianceReport,
  ComplianceMetrics,
  ComplianceFramework,
  ControlResult,
  PolicyViolation,
  ComplianceFinding,
  ReportType,
  ReportStatus,
  ReportFrequency,
} from "../../shared/interfaces/audit-compliance.interface";

@Component({
  selector: "app-compliance-reports",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-secondary-900">
            Compliance Reports
          </h1>
          <p class="text-secondary-600 mt-1">
            Monitor compliance across frameworks and generate assessment reports
          </p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary" (click)="refreshReports()">
            Refresh
          </button>
          <button class="btn-primary" (click)="showGenerateModal()">
            Generate Report
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Framework Compliance Scores</h3>
            <p class="card-subtitle">Current compliance status by framework</p>
          </div>
          <div class="space-y-4 p-4">
            <div
              *ngFor="let framework of metrics().frameworkScores"
              class="flex items-center justify-between"
            >
              <div>
                <p class="font-medium text-secondary-900">
                  {{ framework.framework }}
                </p>
                <p class="text-sm text-secondary-500">
                  Last assessed
                  {{ framework.lastAssessment | date: "MMM d, y" }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold">{{ framework.score }}%</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Reports</h3>
            <p class="card-subtitle">Latest generated reports</p>
          </div>
          <div class="p-4">
            <div *ngFor="let r of reports()" class="border-b py-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">{{ r.name }}</div>
                  <div class="text-xs text-secondary-500">
                    {{ r.generatedAt | date: "MMM d, y" }} •
                    {{ getStatusLabel(r.status) }}
                  </div>
                </div>
                <div>
                  <button
                    class="text-primary-600"
                    (click)="downloadReport(r.id)"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
            <div
              *ngIf="reports().length === 0"
              class="text-center py-8 text-secondary-500"
            >
              No reports found
            </div>
          </div>
        </div>
      </div>

      <!-- Generate Modal (simplified) -->
      <div
        *ngIf="showGenerate"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <h3 class="text-lg font-medium mb-4">Generate Compliance Report</h3>
          <div class="space-y-3">
            <label class="block text-sm font-medium">Report Name</label>
            <input
              [(ngModel)]="generateForm.name"
              class="w-full border px-3 py-2 rounded"
            />
            <label class="block text-sm font-medium">Framework</label>
            <select
              [(ngModel)]="generateForm.framework"
              class="w-full border px-3 py-2 rounded"
            >
              <option value="SOX">SOX</option>
              <option value="PCI-DSS">PCI-DSS</option>
            </select>
          </div>

          <div class="mt-4 flex justify-end space-x-2">
            <button class="btn-secondary" (click)="showGenerate = false">
              Cancel
            </button>
            <button class="btn-primary" (click)="generate()">Generate</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ComplianceReportsComponent implements OnInit {
  reports = signal<ComplianceReport[]>([]);
  metrics = signal<ComplianceMetrics>({} as ComplianceMetrics);
  showGenerate = false;

  generateForm = {
    name: "",
    framework: "SOX",
  };

  constructor(private svc: AuditComplianceService) {}

  ngOnInit() {
    this.refreshReports();
    this.svc.getComplianceReports().subscribe((r) => this.reports.set(r));
    this.svc.getLatestReports().subscribe((r) => this.reports.set(r));
    this.svc.getComplianceReports().subscribe();
    // If service exposes metrics subject
    this.svc.getComplianceReports();
    // Attempt to get metrics if available
    this.svc.getLatestReports().subscribe();
  }

  refreshReports() {
    this.svc.getLatestReports().subscribe((r) => this.reports.set(r));
    this.svc.getComplianceReports().subscribe((m) => {});
  }

  showGenerateModal() {
    this.showGenerate = true;
  }

  generate() {
    const cfg = {
      name: this.generateForm.name,
      framework: this.generateForm.framework,
    };
    this.svc.generateComplianceReport(cfg).subscribe((id) => {
      this.showGenerate = false;
      this.refreshReports();
    });
  }

  downloadReport(id: string) {
    // mock download
    console.log("download", id);
  }

  getStatusLabel(status: ReportStatus | string) {
    switch (status) {
      case ReportStatus.Draft:
        return "Draft";
      case ReportStatus.Approved:
        return "Approved";
      case ReportStatus.Published:
        return "Published";
      default:
        return String(status || "Unknown");
    }
  }
}
