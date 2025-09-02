import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, interval, of } from "rxjs";
import { delay, switchMap, tap } from "rxjs/operators";
import { AccessManagementService } from "./access-management.service";
import {
  UserAccessRequest,
  ExceptionHandling,
  Application,
  NotificationSettings,
  ActivityLog,
  AccessRequestStatus,
  ExceptionStatus,
  ExceptionDecision,
  ApprovalStatus,
  ActivityAction,
  EntityType
} from "../interfaces/access-management.interface";

export interface AutomationRule {
  id: string;
  name: string;
  type: AutomationRuleType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface AutomationAction {
  type: 'approve_request' | 'reject_request' | 'delete_exception' | 'send_notification' | 'escalate';
  parameters: Record<string, any>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  recipientEmail?: string;
  entityType: EntityType;
  entityId: string;
  scheduledAt: Date;
  sentAt?: Date;
  status: NotificationStatus;
  retryCount: number;
}

export enum AutomationRuleType {
  DEADLINE_AUTO_APPROVAL = "deadline_auto_approval",
  DEADLINE_AUTO_REJECTION = "deadline_auto_rejection",
  EXCEPTION_AUTO_DELETE = "exception_auto_delete",
  REMINDER_NOTIFICATION = "reminder_notification",
  ESCALATION_NOTIFICATION = "escalation_notification"
}

export enum NotificationType {
  APPROVAL_REMINDER = "approval_reminder",
  DEADLINE_WARNING = "deadline_warning",
  AUTO_PROCESSED = "auto_processed",
  EXCEPTION_REMINDER = "exception_reminder",
  ESCALATION = "escalation"
}

export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

@Injectable({
  providedIn: "root",
})
export class AutomationService {
  private automationRules: AutomationRule[] = [
    {
      id: "rule-001",
      name: "Auto-approve on deadline",
      type: AutomationRuleType.DEADLINE_AUTO_APPROVAL,
      conditions: [
        { field: "deadline", operator: "less_than", value: "now" },
        { field: "status", operator: "equals", value: AccessRequestStatus.AwaitingApproval }
      ],
      actions: [
        { type: "approve_request", parameters: { comment: "Auto-approved due to deadline" } },
        { type: "send_notification", parameters: { type: NotificationType.AUTO_PROCESSED } }
      ],
      isActive: true
    },
    {
      id: "rule-002", 
      name: "Auto-delete exceptions",
      type: AutomationRuleType.EXCEPTION_AUTO_DELETE,
      conditions: [
        { field: "autoDeleteDate", operator: "less_than", value: "now" },
        { field: "ownerDecision", operator: "equals", value: null }
      ],
      actions: [
        { type: "delete_exception", parameters: {} },
        { type: "send_notification", parameters: { type: NotificationType.AUTO_PROCESSED } }
      ],
      isActive: true
    },
    {
      id: "rule-003",
      name: "24-hour approval reminder",
      type: AutomationRuleType.REMINDER_NOTIFICATION,
      conditions: [
        { field: "deadline", operator: "less_than", value: "24_hours" },
        { field: "status", operator: "equals", value: AccessRequestStatus.AwaitingApproval }
      ],
      actions: [
        { type: "send_notification", parameters: { type: NotificationType.APPROVAL_REMINDER } }
      ],
      isActive: true
    }
  ];

  private notifications = new BehaviorSubject<Notification[]>([]);
  private activityLogs = new BehaviorSubject<ActivityLog[]>([]);
  
  public notifications$ = this.notifications.asObservable();
  public activityLogs$ = this.activityLogs.asObservable();

  constructor(private accessManagementService: AccessManagementService) {
    this.startAutomationEngine();
  }

  private startAutomationEngine() {
    // Run automation checks every 5 minutes
    interval(5 * 60 * 1000).pipe(
      switchMap(() => this.runAutomationCycle())
    ).subscribe();

    // Initial run after 10 seconds
    setTimeout(() => {
      this.runAutomationCycle().subscribe();
    }, 10000);
  }

  private runAutomationCycle(): Observable<any> {
    console.log('Running automation cycle...');
    
    return new Observable(observer => {
      // Process each automation rule
      this.automationRules.forEach(rule => {
        if (rule.isActive) {
          this.executeAutomationRule(rule);
        }
      });
      
      observer.next(true);
      observer.complete();
    });
  }

  private executeAutomationRule(rule: AutomationRule) {
    switch (rule.type) {
      case AutomationRuleType.DEADLINE_AUTO_APPROVAL:
        this.processDeadlineAutoApprovals(rule);
        break;
      case AutomationRuleType.EXCEPTION_AUTO_DELETE:
        this.processExceptionAutoDeletes(rule);
        break;
      case AutomationRuleType.REMINDER_NOTIFICATION:
        this.processReminderNotifications(rule);
        break;
    }
  }

  private processDeadlineAutoApprovals(rule: AutomationRule) {
    this.accessManagementService.getAccessRequests().subscribe(requests => {
      const eligibleRequests = requests.filter(request => {
        const now = new Date();
        const deadline = new Date(request.deadline);
        return deadline < now && 
               request.status === AccessRequestStatus.AwaitingApproval &&
               !request.autoProcessed;
      });

      eligibleRequests.forEach(request => {
        // Check if auto-approval is enabled for this workflow
        this.accessManagementService.getApplication(request.applicationId).subscribe(app => {
          if (app?.approvalWorkflow) {
            const currentLevel = app.approvalWorkflow.approvalLevels.find(
              level => level.level === request.currentApprovalLevel
            );
            
            if (currentLevel?.autoApproveAfterDeadline) {
              this.autoApproveRequest(request, rule);
            }
          }
        });
      });
    });
  }

  private processExceptionAutoDeletes(rule: AutomationRule) {
    this.accessManagementService.getExceptions().subscribe(exceptions => {
      const eligibleExceptions = exceptions.filter(exception => {
        const now = new Date();
        const autoDeleteDate = new Date(exception.autoDeleteDate);
        return autoDeleteDate < now && 
               !exception.ownerDecision &&
               exception.status !== ExceptionStatus.AutoDeleted;
      });

      eligibleExceptions.forEach(exception => {
        this.autoDeleteException(exception, rule);
      });
    });
  }

  private processReminderNotifications(rule: AutomationRule) {
    this.accessManagementService.getAccessRequests().subscribe(requests => {
      const eligibleRequests = requests.filter(request => {
        const now = new Date();
        const deadline = new Date(request.deadline);
        const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        return hoursUntilDeadline <= 24 && 
               hoursUntilDeadline > 0 &&
               request.status === AccessRequestStatus.AwaitingApproval;
      });

      eligibleRequests.forEach(request => {
        this.sendReminderNotification(request, rule);
      });
    });
  }

  private autoApproveRequest(request: UserAccessRequest, rule: AutomationRule) {
    this.accessManagementService.approveRequest(
      request.id, 
      'automation-system', 
      'Auto-approved due to deadline expiration'
    ).subscribe(() => {
      this.logActivity({
        action: ActivityAction.AutoProcessed,
        userId: 'automation-system',
        userName: 'Automation System',
        entityType: EntityType.AccessRequest,
        entityId: request.id,
        details: `Auto-approved request ${request.id} due to deadline expiration`
      });

      this.scheduleNotification({
        type: NotificationType.AUTO_PROCESSED,
        title: 'Request Auto-Approved',
        message: `Access request ${request.id} has been automatically approved due to deadline expiration.`,
        recipientId: request.requesterId,
        entityType: EntityType.AccessRequest,
        entityId: request.id
      });
    });
  }

  private autoDeleteException(exception: ExceptionHandling, rule: AutomationRule) {
    this.accessManagementService.markExceptionDecision(
      exception.id, 
      ExceptionDecision.Delete,
      'Auto-deleted due to deadline expiration'
    ).subscribe(() => {
      this.logActivity({
        action: ActivityAction.AutoProcessed,
        userId: 'automation-system',
        userName: 'Automation System',
        entityType: EntityType.Exception,
        entityId: exception.id,
        details: `Auto-deleted exception for user ${exception.userId} due to deadline expiration`
      });

      this.scheduleNotification({
        type: NotificationType.AUTO_PROCESSED,
        title: 'Exception Auto-Deleted',
        message: `Exception for user ${exception.userId} has been automatically deleted due to deadline expiration.`,
        recipientId: 'application-owner',
        entityType: EntityType.Exception,
        entityId: exception.id
      });
    });
  }

  private sendReminderNotification(request: UserAccessRequest, rule: AutomationRule) {
    // Check if reminder was already sent recently
    const recentNotifications = this.notifications.value.filter(n => 
      n.entityId === request.id && 
      n.type === NotificationType.APPROVAL_REMINDER &&
      new Date().getTime() - new Date(n.scheduledAt).getTime() < 12 * 60 * 60 * 1000 // 12 hours
    );

    if (recentNotifications.length === 0) {
      this.scheduleNotification({
        type: NotificationType.APPROVAL_REMINDER,
        title: 'Approval Reminder',
        message: `Access request ${request.id} is awaiting your approval. Deadline: ${new Date(request.deadline).toLocaleDateString()}`,
        recipientId: 'current-approver',
        entityType: EntityType.AccessRequest,
        entityId: request.id
      });
    }
  }

  private scheduleNotification(notification: Partial<Notification>) {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: notification.type!,
      title: notification.title!,
      message: notification.message!,
      recipientId: notification.recipientId!,
      entityType: notification.entityType!,
      entityId: notification.entityId!,
      scheduledAt: new Date(),
      status: NotificationStatus.PENDING,
      retryCount: 0
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, newNotification]);

    // Simulate sending notification
    setTimeout(() => {
      this.markNotificationSent(newNotification.id);
    }, 2000);
  }

  private markNotificationSent(notificationId: string) {
    const notifications = this.notifications.value;
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      this.notifications.next([...notifications]);
    }
  }

  private logActivity(activity: Partial<ActivityLog>) {
    const newActivity: ActivityLog = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: activity.action!,
      userId: activity.userId!,
      userName: activity.userName!,
      entityType: activity.entityType!,
      entityId: activity.entityId!,
      details: activity.details!,
      metadata: activity.metadata
    };

    const currentLogs = this.activityLogs.value;
    this.activityLogs.next([newActivity, ...currentLogs.slice(0, 99)]); // Keep last 100 logs
  }

  // Public methods for manual automation
  processExpiredRequests(): Observable<number> {
    return this.accessManagementService.processExpiredRequests();
  }

  processExpiredExceptions(): Observable<number> {
    return new Observable(observer => {
      this.accessManagementService.getExceptions().subscribe(exceptions => {
        const expired = exceptions.filter(e => {
          const now = new Date();
          const deleteDate = new Date(e.autoDeleteDate);
          return deleteDate < now && !e.ownerDecision;
        });

        expired.forEach(exception => {
          this.autoDeleteException(exception, this.automationRules[1]);
        });

        observer.next(expired.length);
        observer.complete();
      });
    });
  }

  sendPendingNotifications(): Observable<number> {
    const pendingNotifications = this.notifications.value.filter(
      n => n.status === NotificationStatus.PENDING
    );

    pendingNotifications.forEach(notification => {
      this.markNotificationSent(notification.id);
    });

    return of(pendingNotifications.length).pipe(delay(1000));
  }

  // Configuration methods
  getAutomationRules(): Observable<AutomationRule[]> {
    return of(this.automationRules).pipe(delay(200));
  }

  updateAutomationRule(ruleId: string, updates: Partial<AutomationRule>): Observable<boolean> {
    const rule = this.automationRules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  getNotificationHistory(): Observable<Notification[]> {
    return this.notifications$;
  }

  getActivityLogs(): Observable<ActivityLog[]> {
    return this.activityLogs$;
  }

  // Statistics methods
  getAutomationStats(): Observable<any> {
    const stats = {
      totalProcessedToday: this.activityLogs.value.filter(log => 
        log.action === ActivityAction.AutoProcessed &&
        new Date(log.timestamp).toDateString() === new Date().toDateString()
      ).length,
      notificationsSentToday: this.notifications.value.filter(n => 
        n.sentAt && 
        new Date(n.sentAt).toDateString() === new Date().toDateString()
      ).length,
      activeRules: this.automationRules.filter(r => r.isActive).length,
      totalRules: this.automationRules.length
    };

    return of(stats).pipe(delay(200));
  }
}
