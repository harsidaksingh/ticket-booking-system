import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'danger' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // We use a Signal to hold an array of Toasts!
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'danger' | 'info' = 'success') {
    const newToast = { message, type };
    this.toasts.update((currentToasts) => [...currentToasts, newToast]);

    // Automatically remove the toast after 3 seconds
    setTimeout(() => {
      this.remove(newToast);
    }, 3000);
  }

  remove(toastToRemove: Toast) {
    this.toasts.update((currentToasts) =>
      currentToasts.filter((t) => t !== toastToRemove),
    );
  }
}
