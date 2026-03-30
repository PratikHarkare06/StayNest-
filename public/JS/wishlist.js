/**
 * Wishlist AJAX Functionality
 * Handles adding/removing items from wishlist without page reload
 */

document.addEventListener('DOMContentLoaded', () => {
    const wishlistForms = document.querySelectorAll('.wishlist-form');

    wishlistForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = form.querySelector('button');
            const icon = btn.querySelector('i');
            const url = form.action;

            // Optimistic UI update
            const isHeartFilled = icon.classList.contains('fa-solid');

            // Toggle visual state immediately
            if (isHeartFilled) {
                icon.classList.remove('fa-solid', 'text-danger');
                icon.classList.add('fa-regular');
            } else {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid', 'text-danger');
                // Add pop animation class
                icon.classList.add('fa-beat');
                setTimeout(() => icon.classList.remove('fa-beat'), 1000);
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    // Show toast notification
                    if (typeof toastSuccess === 'function') {
                        // Use simpler message for mobile
                        const msg = window.innerWidth < 768 ?
                            (data.action === 'added' ? 'Saved' : 'Removed') :
                            data.message;

                        toastSuccess(data.action === 'added' ? 'Wishlist' : 'Removed', msg, 2000);
                    }

                    // Re-sync UI just in case server returned different state
                    if (data.action === 'added') {
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid', 'text-danger');
                    } else {
                        icon.classList.remove('fa-solid', 'text-danger');
                        icon.classList.add('fa-regular');

                        // If we are on the wishlist tab of dashboard, remove the card smoothly
                        if (window.location.pathname.includes('/dashboard') ||
                            document.getElementById('wishlist')?.classList.contains('active')) {
                            const cardCol = form.closest('.col');
                            if (cardCol) {
                                cardCol.style.transition = 'all 0.3s ease';
                                cardCol.style.opacity = '0';
                                cardCol.style.transform = 'scale(0.9)';
                                setTimeout(() => cardCol.remove(), 300);
                            }
                        }
                    }
                } else {
                    // Revert UI on failure
                    revertUI(icon, isHeartFilled);
                    if (typeof toastError === 'function') {
                        toastError('Error', data.message || 'Something went wrong');
                    }
                }
            } catch (err) {
                console.error('Wishlist error:', err);
                // Revert UI
                revertUI(icon, isHeartFilled);
                if (typeof toastError === 'function') {
                    toastError('Error', 'Network error. Please try again.');
                }
            }
        });
    });

    function revertUI(icon, wasFilled) {
        if (wasFilled) {
            icon.classList.add('fa-solid', 'text-danger');
            icon.classList.remove('fa-regular');
        } else {
            icon.classList.add('fa-regular');
            icon.classList.remove('fa-solid', 'text-danger');
        }
    }
});
