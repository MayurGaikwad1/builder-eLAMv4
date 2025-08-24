import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-placeholder",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md">
        <div
          class="w-20 h-20 mx-auto mb-6 bg-secondary-100 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-10 h-10 text-secondary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            ></path>
          </svg>
        </div>

        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">
          {{ title }}
        </h2>
        <p class="text-secondary-600 mb-6">
          This {{ moduleType }} is coming soon. The ELAM system is being built
          progressively with enterprise-grade features.
        </p>

        <div class="space-y-3 text-left bg-secondary-50 rounded-lg p-4 mb-6">
          <h3 class="font-medium text-secondary-900">Planned Features:</h3>
          <ul class="space-y-1 text-sm text-secondary-600">
            <li
              *ngFor="let feature of plannedFeatures"
              class="flex items-center"
            >
              <svg
                class="w-4 h-4 text-primary-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              {{ feature }}
            </li>
          </ul>
        </div>

        <button class="btn-primary">
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
          Continue Building This Module
        </button>

        <p class="text-xs text-secondary-500 mt-4">
          Ask the AI to implement this specific module to add its functionality.
        </p>
      </div>
    </div>
  `,
})
export class PlaceholderComponent {
  @Input() title = "Module Under Development";
  @Input() moduleType = "module";
  @Input() plannedFeatures: string[] = [
    "Enterprise-grade security controls",
    "Real-time workflow automation",
    "Advanced reporting and analytics",
    "Integration with external systems",
    "Compliance and audit trails",
  ];
}
