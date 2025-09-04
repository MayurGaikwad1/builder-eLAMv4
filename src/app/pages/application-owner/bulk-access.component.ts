import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AccessManagementService } from "../../shared/services/access-management.service";
import {
  Application,
  AccessLevel,
} from "../../shared/interfaces/access-management.interface";

@Component({
  selector: "app-bulk-access",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">
            Bulk Access Operations
          </h1>
          <p class="text-secondary-600">
            Grant or revoke access in bulk for users within your applications.
          </p>
        </div>
        <div>
          <button (click)="refreshApplications()" class="btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700"
              >Application</label
            >
            <select
              [(ngModel)]="form.applicationId"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Application</option>
              <option *ngFor="let app of applications()" [value]="app.id">
                {{ app.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700"
              >Access Level</label
            >
            <select
              [(ngModel)]="form.accessLevel"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2"
            >
              <option [ngValue]="'read'">Read</option>
              <option [ngValue]="'write'">Write</option>
              <option [ngValue]="'admin'">Admin</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700"
              >User IDs (comma separated)</label
            >
            <input
              type="text"
              [(ngModel)]="form.userIdsCsv"
              placeholder="e.g. jdoe,asmith"
              class="w-full border border-secondary-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div class="mt-4 flex items-center space-x-3">
          <button
            (click)="onGrant()"
            [disabled]="!canSubmit()"
            class="btn-primary"
          >
            Grant Access
          </button>
          <button
            (click)="onRevoke()"
            [disabled]="!canSubmit()"
            class="btn-danger"
          >
            Revoke Access
          </button>
          <button (click)="clearForm()" class="btn-secondary">Clear</button>
        </div>

        <div *ngIf="message" class="mt-4">
          <p class="text-sm text-secondary-700">{{ message }}</p>
        </div>
      </div>
    </div>
  `,
})
export class BulkAccessComponent implements OnInit {
  applications = signal<Application[]>([]);
  form = {
    applicationId: "",
    accessLevel: "read" as AccessLevel | string,
    userIdsCsv: "",
  };

  message = "";

  constructor(private accessService: AccessManagementService) {}

  ngOnInit() {
    this.refreshApplications();
  }

  refreshApplications() {
    this.accessService.getApplications().subscribe((apps) => {
      this.applications.set(apps);
    });
  }

  parseUserIds(): string[] {
    return this.form.userIdsCsv
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  canSubmit(): boolean {
    return !!this.form.applicationId && this.parseUserIds().length > 0;
  }

  onGrant() {
    const userIds = this.parseUserIds();
    this.accessService
      .bulkGrantAccess(
        this.form.applicationId,
        userIds,
        this.form.accessLevel as AccessLevel,
      )
      .subscribe(() => {
        this.message = `Granted access to ${userIds.length} users for application.`;
        this.clearForm(false);
      });
  }

  onRevoke() {
    const userIds = this.parseUserIds();
    this.accessService
      .bulkRevokeAccess(this.form.applicationId, userIds)
      .subscribe(() => {
        this.message = `Revoked access for ${userIds.length} users for application.`;
        this.clearForm(false);
      });
  }

  clearForm(clearMessage = true) {
    this.form = { applicationId: "", accessLevel: "read", userIdsCsv: "" };
    if (clearMessage) this.message = "";
  }
}
