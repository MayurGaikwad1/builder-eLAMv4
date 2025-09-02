import { Injectable } from "@angular/core";
import {
  CanActivate,
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(route, state.url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(route, state.url);
  }

  private checkAuth(route: ActivatedRouteSnapshot, url: string): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          // Store the attempted URL for redirecting after login
          sessionStorage.setItem("elam_redirect_url", url);
          this.router.navigate(["/login"]);
          return false;
        }

        // Check role requirements if specified in route data
        const requiredRoles = route.data?.['roles'] as string[];
        const requiredPermissions = route.data?.['permissions'] as string[];

        if (requiredRoles?.length > 0) {
          const hasRequiredRole = this.authService.hasAnyRole(requiredRoles);
          if (!hasRequiredRole) {
            this.router.navigate(["/dashboard"]);
            return false;
          }
        }

        if (requiredPermissions?.length > 0) {
          const hasAllPermissions = requiredPermissions.every(permission =>
            this.authService.hasPermission(permission)
          );
          if (!hasAllPermissions) {
            this.router.navigate(["/dashboard"]);
            return false;
          }
        }

        return true;
      }),
    );
  }
}
