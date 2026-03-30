const checkInInput = document.getElementById('checkIn');
const checkOutInput = document.getElementById('checkOut');
const pricePerNightElement = document.getElementById('pricePerNight');
const totalPriceElement = document.getElementById('totalPrice');
const totalNightsElement = document.getElementById('totalNights');
const priceBreakdownElement = document.getElementById('priceBreakdown');

// Only run if all required elements exist
if (pricePerNightElement && checkInInput && checkOutInput && totalPriceElement && totalNightsElement && priceBreakdownElement) {
    const listingPrice = parseFloat(pricePerNightElement.dataset.price);

    function calculateTotal() {
        const checkInDate = new Date(checkInInput.value);
        const checkOutDate = new Date(checkOutInput.value);

        // Validate dates exist and checkout is after checkin
        if (checkInInput.value && checkOutInput.value && checkOutDate > checkInDate) {
            const timeDiff = Math.abs(checkOutDate - checkInDate);
            const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            const total = nights * listingPrice;

            totalNightsElement.innerText = nights;
            totalPriceElement.innerText = total.toLocaleString('en-IN');
            document.getElementById('totalPriceDisplay').innerText = total.toLocaleString('en-IN');
            priceBreakdownElement.classList.remove('d-none');
        } else {
            priceBreakdownElement.classList.add('d-none');
        }
    }

    checkInInput.addEventListener('change', calculateTotal);
    checkOutInput.addEventListener('change', calculateTotal);
}
