/**
 * Toast Notification System
 * Beautiful, animated notifications for user feedback
 */

class ToastNotification {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    /**
     * Show a toast notification
     * @param {string} type - success, error, warning, info
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Duration in ms (default: 3000)
     */
    show(type = 'info', title = '', message = '', duration = 3000) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;

        // Icon based on type
        const icons = {
            success: '<i class="fa-solid fa-check"></i>',
            error: '<i class="fa-solid fa-xmark"></i>',
            warning: '<i class="fa-solid fa-exclamation"></i>',
            info: '<i class="fa-solid fa-info"></i>'
        };

        // Build toast HTML
        toast.innerHTML = `
      <div class="toast-icon">
        ${icons[type] || icons.info}
      </div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="toast-progress"></div>
    `;

        // Add to container
        this.container.appendChild(toast);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    }

    remove(toast) {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300); // Match animation duration
    }

    // Convenience methods
    success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    error(title, message, duration) {
        return this.show('error', title, message, duration);
    }

    warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    }

    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }
}

// Create global instance
const toast = new ToastNotification();

// Make it available globally
window.toast = toast;

// Also expose individual methods for convenience
window.showToast = (type, title, message, duration) => toast.show(type, title, message, duration);
window.toastSuccess = (title, message, duration) => toast.success(title, message, duration);
window.toastError = (title, message, duration) => toast.error(title, message, duration);
window.toastWarning = (title, message, duration) => toast.warning(title, message, duration);
window.toastInfo = (title, message, duration) => toast.info(title, message, duration);
