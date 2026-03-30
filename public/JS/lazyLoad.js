/**
 * Lazy Loading Images
 * Improves page load performance by loading images only when they're about to enter the viewport
 */

document.addEventListener('DOMContentLoaded', function () {
    // Get all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');

    // Intersection Observer options
    const imageObserverOptions = {
        root: null,
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01
    };

    // Callback function when image enters viewport
    const imageObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                // Replace src with data-src
                if (img.dataset.src) {
                    img.src = img.dataset.src;

                    // Add loaded class for fade-in effect
                    img.classList.add('lazy-loaded');

                    // Remove data-src attribute
                    delete img.dataset.src;

                    // Stop observing this image
                    observer.unobserve(img);
                }
            }
        });
    };

    // Create observer
    const imageObserver = new IntersectionObserver(imageObserverCallback, imageObserverOptions);

    // Observe all lazy images
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });

    // Fallback for browsers that don't support Intersection Observer
    if (!('IntersectionObserver' in window)) {
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
            }
        });
    }
});
