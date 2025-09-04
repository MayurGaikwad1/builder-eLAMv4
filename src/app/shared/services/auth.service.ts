import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "user" | "application_owner";
  avatar?: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Demo users with different roles
  private demoUsers: User[] = [
    {
      id: "admin-001",
      email: "admin@company.com",
      name: "System Administrator",
      role: "admin",
      permissions: [
        "user.create",
        "user.read",
        "user.update",
        "user.delete",
        "role.create",
        "role.read",
        "role.update",
        "role.delete",
        "system.config",
        "system.admin",
        "audit.read",
        "integration.manage",
        "workflow.create",
        "approval.override",
      ],
      isActive: true,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: "manager-001",
      email: "manager@company.com",
      name: "Department Manager",
      role: "manager",
      permissions: [
        "user.read",
        "user.update",
        "approval.create",
        "approval.read",
        "approval.update",
        "request.approve",
        "report.read",
        "team.manage",
      ],
      isActive: true,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612c1d7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: "user-001",
      email: "user@company.com",
      name: "Regular User",
      role: "user",
      permissions: [
        "profile.read",
        "profile.update",
        "request.create",
        "request.read",
        "request.update",
      ],
      isActive: true,
      avatar:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: "owner-001",
      email: "sarah.wilson@company.com",
      name: "Sarah Wilson",
      role: "application_owner",
      permissions: [
        "app_owner.read",
        "app_owner.manage",
        "exception.assign",
        "bulk.access",
      ],
      isActive: true,
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: "owner-002",
      email: "michael.chen@company.com",
      name: "Michael Chen",
      role: "application_owner",
      permissions: [
        "app_owner.read",
        "app_owner.manage",
        "exception.assign",
        "bulk.access",
      ],
      isActive: true,
    },
  ];

  // Demo passwords (in real app, these would be hashed)
  private demoCredentials: Record<string, string> = {
    "admin@company.com": "admin123",
    "manager@company.com": "manager123",
    "user@company.com": "user123",
    "sarah.wilson@company.com": "owner123",
    "michael.chen@company.com": "owner123",
  };

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check for stored authentication on service initialization
    this.checkStoredAuth();
  }

  login(
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Observable<boolean> {
    return of(null).pipe(
      delay(1500), // Simulate network delay
      map(() => {
        // Check credentials
        const storedPassword = this.demoCredentials[email.toLowerCase()];
        if (!storedPassword || storedPassword !== password) {
          return false;
        }

        // Find user
        const user = this.demoUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (!user || !user.isActive) {
          return false;
        }

        // Update last login
        user.lastLogin = new Date();

        // Store authentication
        const authData = {
          user,
          token: this.generateDemoToken(),
          loginTime: new Date().toISOString(),
          rememberMe,
        };

        if (rememberMe) {
          localStorage.setItem("elam_auth", JSON.stringify(authData));
        } else {
          sessionStorage.setItem("elam_auth", JSON.stringify(authData));
        }

        // Update subjects
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        return true;
      }),
    );
  }

  logout(): Observable<boolean> {
    return of(null).pipe(
      delay(500),
      map(() => {
        // Clear stored authentication
        localStorage.removeItem("elam_auth");
        sessionStorage.removeItem("elam_auth");

        // Update subjects
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);

        return true;
      }),
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.permissions.includes(permission) : false;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  refreshToken(): Observable<boolean> {
    // In a real app, this would refresh the authentication token
    return of(this.isAuthenticated()).pipe(delay(500));
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<boolean> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const user = this.getCurrentUser();
        if (!user) return false;

        // In a real app, you would validate the current password and update it
        // For demo purposes, we'll just return success
        return true;
      }),
    );
  }

  updateProfile(profileData: Partial<User>): Observable<boolean> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        // Update user data
        const updatedUser = { ...currentUser, ...profileData };
        this.currentUserSubject.next(updatedUser);

        // Update stored auth data
        this.updateStoredAuth(updatedUser);

        return true;
      }),
    );
  }

  private checkStoredAuth(): void {
    const localAuth = localStorage.getItem("elam_auth");
    const sessionAuth = sessionStorage.getItem("elam_auth");

    const authData = localAuth || sessionAuth;
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);
        const loginTime = new Date(parsedAuth.loginTime);
        const now = new Date();

        // Check if session is still valid (24 hours for localStorage, 8 hours for sessionStorage)
        const maxAge = localAuth ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;

        if (now.getTime() - loginTime.getTime() < maxAge) {
          this.currentUserSubject.next(parsedAuth.user);
          this.isAuthenticatedSubject.next(true);
        } else {
          // Session expired
          this.logout().subscribe();
        }
      } catch (error) {
        // Invalid stored data
        this.logout().subscribe();
      }
    }
  }

  private updateStoredAuth(user: User): void {
    const localAuth = localStorage.getItem("elam_auth");
    const sessionAuth = sessionStorage.getItem("elam_auth");

    if (localAuth) {
      const authData = JSON.parse(localAuth);
      authData.user = user;
      localStorage.setItem("elam_auth", JSON.stringify(authData));
    }

    if (sessionAuth) {
      const authData = JSON.parse(sessionAuth);
      authData.user = user;
      sessionStorage.setItem("elam_auth", JSON.stringify(authData));
    }
  }

  private generateDemoToken(): string {
    // Generate a simple demo token
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Demo helper methods
  getDemoUsers(): User[] {
    return [...this.demoUsers];
  }

  getDemoCredentials(): Record<string, string> {
    return { ...this.demoCredentials };
  }
}
