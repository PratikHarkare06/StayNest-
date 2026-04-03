// Currency Converter Logic for StayNest
const exchangeRates = {
    'INR': { rate: 1, symbol: '&#8377;', locale: 'en-IN', name: 'INR' },
    'USD': { rate: 0.012, symbol: '$', locale: 'en-US', name: 'USD' },
    'EUR': { rate: 0.011, symbol: '&euro;', locale: 'en-IE', name: 'EUR' }
};

let currentCurrency = localStorage.getItem('staynest_currency') || 'INR';

window.formatCurrency = function(inrAmount) {
    const config = exchangeRates[currentCurrency];
    const converted = inrAmount * config.rate;
    const formattedNum = converted.toLocaleString(config.locale, {
        maximumFractionDigits: currentCurrency === 'INR' ? 0 : 2,
        minimumFractionDigits: currentCurrency === 'INR' ? 0 : 2
    });
    return `${config.symbol} ${formattedNum}`;
};

function updatePricesOnPage() {
    // 1. Update general listing prices (index.ejs and show.ejs main price)
    const priceElements = document.querySelectorAll('.listing-price');
    priceElements.forEach(el => {
        let basePrice = parseFloat(el.getAttribute('data-base-price'));
        
        // Handle Tax toggle if it exists and is checked
        let taxSwitch = document.getElementById("flexSwitchCheckDefault");
        if (taxSwitch && taxSwitch.checked) {
            basePrice = basePrice * 1.18; // Apply tax
        }

        if (!isNaN(basePrice)) {
            el.innerHTML = window.formatCurrency(basePrice);
        }
    });

    // 2. Update navbar dropdown
    const config = exchangeRates[currentCurrency];
    const btn = document.getElementById('currencyDropdownBtn');
    if (btn) {
        let iconClass = 'fa-indian-rupee-sign';
        if (currentCurrency === 'USD') iconClass = 'fa-dollar-sign';
        if (currentCurrency === 'EUR') iconClass = 'fa-euro-sign';
        btn.innerHTML = `<i class="fa-solid ${iconClass} me-1"></i> ${config.name}`;
    }

    // 3. Update dropdown items to mark active
    document.querySelectorAll('.currency-option').forEach(item => {
        if(item.dataset.currency === currentCurrency) {
            item.classList.add('active', 'disabled');
        } else {
            item.classList.remove('active', 'disabled');
        }
    });

    // 4. Update the breakdown fixed prices in show.ejs
    const breakdownPrices = document.querySelectorAll('.breakdown-price');
    breakdownPrices.forEach(el => {
        let basePrice = parseFloat(el.getAttribute('data-base-price'));
        if (!isNaN(basePrice)) {
            el.innerHTML = window.formatCurrency(basePrice);
        }
    });

    // trigger booking.js recalculate if available
    if (typeof window.calculateTotal === 'function') {
        window.calculateTotal();
    }
}

window.setCurrency = function(currencyStr) {
    if (exchangeRates[currencyStr]) {
        currentCurrency = currencyStr;
        localStorage.setItem('staynest_currency', currentCurrency);
        updatePricesOnPage();
    }
}

document.addEventListener('DOMContentLoaded', updatePricesOnPage);
