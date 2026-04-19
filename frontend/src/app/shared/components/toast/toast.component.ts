import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <!-- This container locks all toasts to the bottom right of the screen permanently -->
    <div
      class="toast-container position-fixed bottom-0 end-0 p-3"
      style="z-index: 1060;"
    >
      <!-- Loop through every toast currently in the service's memory! -->
      @for (toast of toastService.toasts(); track toast) {
        <!-- The Bootstrap Toast Box (the color changes based on toast.type!) -->
        <div
          class="toast show align-items-center text-bg-{{
            toast.type
          }} border-0 mb-2 shadow-lg"
          role="alert"
        >
          <div class="d-flex">
            <div class="toast-body fw-bold">
              {{ toast.message }}
            </div>
            <!-- Allows the user to click the X to close the toast early -->
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              (click)="toastService.remove(toast)"
            ></button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  // We must inject the Service here, otherwise the HTML template can't see the array!
  toastService = inject(ToastService);
}
