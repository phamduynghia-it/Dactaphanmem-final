export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  timestamp: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public show(
    type: ToastType,
    message: string,
    duration?: number
  ): string {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const toastDuration = duration !== undefined ? duration : (type === 'error' ? 5000 : 3500);

    const newToast: ToastItem = {
      id,
      type,
      message,
      duration: toastDuration,
      timestamp: Date.now(),
    };

    // Log ra console để kiểm tra
    if (type === 'error') {
      console.error(`[THÔNG BÁO LỖI] ${message}`);
    } else if (type === 'warning') {
      console.warn(`[CẢNH BÁO] ${message}`);
    } else {
      console.log(`[THÔNG BÁO] ${message}`);
    }

    // Giữ tối đa 4 thông báo cùng lúc trên góc trên phải màn hình
    this.toasts = [newToast, ...this.toasts.slice(0, 3)];
    this.notify();

    return id;
  }

  public error(message: string, duration?: number): string {
    return this.show('error', message, duration);
  }

  public success(message: string, duration?: number): string {
    return this.show('success', message, duration);
  }

  public warning(message: string, duration?: number): string {
    return this.show('warning', message, duration);
  }

  public info(message: string, duration?: number): string {
    return this.show('info', message, duration);
  }

  public dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public clearAll() {
    this.toasts = [];
    this.notify();
  }
}

export const toast = new ToastManager();
