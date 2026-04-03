/**
 * StayNest — Infinite Scroll Engine (v2)
 * Uses IntersectionObserver to trigger JSON API fetches.
 * Cards are rendered client-side for maximum performance.
 * Images use IntersectionObserver for lazy-loading.
 */

// ─── State ──────────────────────────────────────────────────────────────────
let currentPage = 1;
let totalPagesVal = 0;
let isFetching = false;
let currUserId = null; // Injected below from EJS

// ─── Initialise from URL ─────────────────────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('page')) currentPage = parseInt(urlParams.get('page'));

// ─── Public helpers called from index.ejs ────────────────────────────────────
function setTotalPages(val) { totalPagesVal = parseInt(val) || 0; }
function setCurrentUser(id) { currUserId = id; }

// ─── Skeleton HTML ───────────────────────────────────────────────────────────
function buildSkeletonCard() {
  return `
    <div class="col mb-4 skeleton-col">
      <div class="skeleton-card">
        <div class="skeleton-shimmer skeleton-img"></div>
        <div class="skeleton-shimmer skeleton-text mt-2" style="width:65%;"></div>
        <div class="skeleton-shimmer skeleton-text mt-1" style="width:40%;"></div>
        <div class="skeleton-shimmer skeleton-text mt-1" style="width:30%;"></div>
      </div>
    </div>`;
}

function showSkeletons(count = 4) {
  const container = document.getElementById('listings-container');
  if (!container) return;
  let html = '';
  for (let i = 0; i < count; i++) html += buildSkeletonCard();
  const wrap = document.createElement('div');
  wrap.id = 'infinite-skeletons';
  wrap.className = 'row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 w-100';
  wrap.innerHTML = html;
  container.parentElement.insertBefore(wrap, container.nextSibling);
}

function hideSkeletons() {
  const el = document.getElementById('infinite-skeletons');
  if (el) el.remove();
}

// ─── Card Renderer ───────────────────────────────────────────────────────────
function buildCard(listing, isWishlisted) {
  const imgUrl = listing.image && listing.image.url
    ? listing.image.url
    : '/images/placeholder.jpg';

  const price = listing.price
    ? `&#8377; ${Number(listing.price).toLocaleString('en-IN')}`
    : '';

  const heartClass = isWishlisted
    ? 'fa-solid text-danger'
    : 'fa-regular';

  const wishlistBtn = currUserId
    ? `<form action="/users/wishlist/${listing._id}" method="POST"
         class="position-absolute end-0 top-0 m-3 wishlist-form" style="z-index:10;">
         <button class="btn btn-sm rounded-circle d-flex align-items-center
           justify-content-center border-0 shadow-sm"
           style="background-color:white;width:35px;height:35px;cursor:pointer;">
           <i class="${heartClass} fa-heart"></i>
         </button>
       </form>`
    : '';

  return `
    <div class="col mb-4 infinite-card" style="opacity:0;transition:opacity 0.4s ease-out;">
      <div class="card h-100 listing-card position-relative">
        <img
          src="/images/placeholder.jpg"
          data-src="${imgUrl}"
          class="card-img-top lazy-load"
          alt="${listing.title}"
          style="height:20rem;object-fit:cover;"
        />
        <div class="card-img-overlay p-0">${wishlistBtn}</div>
        <div class="card-body">
          <a href="/listings/${listing._id}" class="text-decoration-none text-dark stretched-link">
            <p class="card-text">
              <b>${listing.title}</b><br/>
              <span class="listing-price" data-base-price="${listing.price}">
                ${price}
              </span>
              <span class="text-muted">/ night</span>
              <i class="tax-info text-muted ms-1" style="display:none;font-size:0.85em;">&nbsp;+18% GST</i>
            </p>
          </a>
        </div>
      </div>
    </div>`;
}

// ─── Lazy Image Loading ───────────────────────────────────────────────────────
let lazyObserver = null;

function initLazyImages(root = document) {
  const images = root.querySelectorAll('img.lazy-load');
  if (!images.length) return;

  if (!lazyObserver) {
    lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.classList.remove('lazy-load');
            img.onload = () => img.classList.add('loaded');
            lazyObserver.unobserve(img);
          }
        }
      });
    }, { rootMargin: '200px 0px' });
  }

  images.forEach(img => lazyObserver.observe(img));
}

// ─── Card Fade-in ─────────────────────────────────────────────────────────────
function fadeInCards(cards) {
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.style.opacity = '1';
    }, i * 60);
  });
}

// ─── Fetch More Listings ─────────────────────────────────────────────────────
async function fetchMoreListings() {
  if (isFetching || currentPage >= totalPagesVal) return;
  isFetching = true;

  showSkeletons(4);

  const params = new URLSearchParams(window.location.search);
  params.set('page', currentPage + 1);
  params.set('mode', 'api');

  try {
    const res = await fetch(`/listings?${params.toString()}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();

    hideSkeletons();

    const container = document.getElementById('listings-container');
    if (!container || !data.listings || !data.listings.length) return;

    // Check current tax switch state
    const taxChecked = document.getElementById('flexSwitchCheckDefault')?.checked;

    data.listings.forEach(listing => {
      container.insertAdjacentHTML('beforeend', buildCard(listing, false));
    });

    // Fade in new cards
    const newCards = container.querySelectorAll('.infinite-card');
    fadeInCards([...newCards]);

    // Apply tax display if toggle is on
    if (taxChecked) applyTaxDisplay(true);

    // Lazy-load images in new cards
    initLazyImages(container);

    currentPage = data.currentPage;
    totalPagesVal = data.totalPages;

  } catch (err) {
    console.error('Infinite scroll fetch failed:', err);
    hideSkeletons();
  } finally {
    isFetching = false;
  }
}

// ─── Tax Display Helper ──────────────────────────────────────────────────────
function applyTaxDisplay(showTax) {
  document.querySelectorAll('.listing-price').forEach(el => {
    const base = parseFloat(el.dataset.basePrice);
    if (!base) return;
    el.innerHTML = showTax
      ? `&#8377; ${(base * 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      : `&#8377; ${base.toLocaleString('en-IN')}`;
  });
  document.querySelectorAll('.tax-info').forEach(el => {
    el.style.display = showTax ? 'inline' : 'none';
    if (showTax) el.innerText = ' incl. taxes';
  });
}

// ─── Sentinel Observer (Trigger Point) ───────────────────────────────────────
function initSentinel() {
  // Create a tiny invisible sentinel div at the bottom of listings
  const sentinel = document.createElement('div');
  sentinel.id = 'scroll-sentinel';
  sentinel.style.height = '1px';

  const container = document.getElementById('listings-container');
  if (container) container.parentElement.appendChild(sentinel);

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchMoreListings();
    }
  }, { rootMargin: '600px 0px' }); // Trigger 600px before bottom

  observer.observe(sentinel);
}

// ─── Boot ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 1. Lazy-load all initial images
  initLazyImages();

  // 2. Fade in the initial server-rendered cards
  const initCards = document.querySelectorAll('#listings-container .col');
  fadeInCards([...initCards]);

  // 3. Attach sentinel for infinite scroll
  initSentinel();
});
