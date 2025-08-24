import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './components/layout/sidebar.component';
import { HeaderComponent } from './components/layout/header.component';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ELAM - Enterprise Lifecycle & Access Management');
  protected readonly currentPageTitle = signal('Dashboard');
  protected readonly currentPageSubtitle = signal('');
  protected readonly sidebarCollapsed = signal(false);

  constructor(private router: Router) {
    // Update page title based on route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageTitle(event.url);
    });
  }

  private updatePageTitle(url: string) {
    const routeTitles: Record<string, { title: string; subtitle: string }> = {
      '/dashboard': { 
        title: 'Executive Dashboard', 
        subtitle: 'Enterprise access management overview' 
      },
      '/requests': { 
        title: 'Access Requests', 
        subtitle: 'Request and manage system access' 
      },
      '/approvals': { 
        title: 'Approval Management', 
        subtitle: 'Review and approve access requests' 
      },
      '/users': { 
        title: 'User Management', 
        subtitle: 'Manage user lifecycle and provisioning' 
      },
      '/audit': { 
        title: 'Audit & Compliance', 
        subtitle: 'Security monitoring and compliance reporting' 
      },
      '/admin': { 
        title: 'System Administration', 
        subtitle: 'Configure roles, policies, and integrations' 
      }
    };

    // Find matching route (check for partial matches too)
    const route = Object.keys(routeTitles).find(key => url.startsWith(key));
    if (route) {
      this.currentPageTitle.set(routeTitles[route].title);
      this.currentPageSubtitle.set(routeTitles[route].subtitle);
    } else {
      this.currentPageTitle.set('Dashboard');
      this.currentPageSubtitle.set('');
    }
  }

  onMenuToggle() {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }
}
