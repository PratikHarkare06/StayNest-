
let currentPage = 1;
let isFetching = false;
let totalPagesVal = 0; // Will be set from index.ejs

// Helper to get total pages from a hidden element
function setTotalPages(val) {
    totalPagesVal = parseInt(val);
}

// Initial state from URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('page')) {
    currentPage = parseInt(urlParams.get('page'));
}

const showSpinner = () => document.getElementById('loading-spinner').classList.remove('d-none');
const hideSpinner = () => document.getElementById('loading-spinner').classList.add('d-none');

window.addEventListener('scroll', async () => {
    // Check if near bottom
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
        if (!isFetching && currentPage < totalPagesVal) {
            isFetching = true;
            showSpinner();

            const nextPage = currentPage + 1;

            // Construct URL
            const currentSearch = new URLSearchParams(window.location.search);
            currentSearch.set('page', nextPage);
            currentSearch.set('mode', 'infinite');

            try {
                const response = await fetch(`/listings?${currentSearch.toString()}`);
                if (response.ok) {
                    const html = await response.text();
                    // Append to container
                    const container = document.getElementById('listings-container');
                    container.insertAdjacentHTML('beforeend', html);

                    currentPage++;

                    // Re-apply tax switch logic if needed (or prefer CSS)
                    const taxSwitch = document.getElementById("flexSwitchCheckDefault");
                    if (taxSwitch && taxSwitch.checked) {
                        let taxInfo = document.getElementsByClassName("tax-info");
                        for (info of taxInfo) info.style.display = "inline";
                    }
                }
            } catch (err) {
                console.error("Failed to load more listings", err);
            } finally {
                isFetching = false;
                hideSpinner();
            }
        }
    }
});
