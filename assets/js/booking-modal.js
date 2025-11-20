/* ==============================================================
   BOOKING FORM + GOOGLE PLACES + MODAL POPULATION (FIXED)
   ============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const bookingForm   = document.getElementById('bookingForm');
  const pickupInput   = document.getElementById('pickupLocation');
  const dropoffInput  = document.getElementById('dropoffLocation');
  const pickupDate    = document.getElementById('pick-up-Date');
  const pickupTime    = document.getElementById('pickupTime');
  const modal         = document.getElementById('checkoutModal');
  const closeBtn      = modal.querySelector('.close');
  const checkoutForm  = document.getElementById('checkout-form');

  // ---------- Google Places Autocomplete ----------
  window.initGoogleAutocomplete = function () {
    const usBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(25.82, -124.39),
      new google.maps.LatLng(49.38, -66.94)
    );

    const pickupAuto = new google.maps.places.Autocomplete(pickupInput, {
      bounds: usBounds,
      strictBounds: true,
      types: ['geocode'],
      componentRestrictions: { country: 'us' }
    });

    const dropoffAuto = new google.maps.places.Autocomplete(dropoffInput, {
      bounds: usBounds,
      strictBounds: true,
      types: ['geocode'],
      componentRestrictions: { country: 'us' }
    });

    pickupAuto.addListener('place_changed', () => {
      const place = pickupAuto.getPlace();
      pickupInput.dataset.place = JSON.stringify(place);
    });

    dropoffAuto.addListener('place_changed', () => {
      const place = dropoffAuto.getPlace();
      dropoffInput.dataset.place = JSON.stringify(place);
    });
  };

  // ---------- Open modal on “Book Now” ----------
  bookingForm.addEventListener('submit', e => {
    e.preventDefault();

    if (!pickupInput.value || !pickupDate.value || !pickupTime.value) {
      toastr.error('Please fill all required fields.');
      return;
    }

    const pickDateRaw = pickupDate.value;
    const pickDateParts = pickDateRaw.split('-');
    const pickDate = `${pickDateParts[2]}/${pickDateParts[1]}/${pickDateParts[0]}`;
    const pickTime = pickupTime.value;
    const pickFull = `${pickDate} at ${formatTime(pickTime)}`;

    let dropDate = pickDate;
    let dropTime = formatTime(pickTime);
    let dropFull;

    if (dropoffInput.value.trim()) {
      dropFull = `${pickDate} at ${dropTime}`;
    } else {
      const nextDay = new Date(pickDateRaw);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = `${nextDay.getDate().toString().padStart(2, '0')}/${(nextDay.getMonth() + 1).toString().padStart(2, '0')}/${nextDay.getFullYear()}`;
      dropFull = `${nextDayStr} at ${dropTime}`;
      dropDate = nextDayStr;
    }

    const pickupText  = pickupInput.value;
    const dropoffText = dropoffInput.value.trim() || pickupText;

    document.getElementById('pick-up-date-ph').textContent = pickDate;
    document.getElementById('pick-up-time-ph').textContent = formatTime(pickTime);
    document.getElementById('pickup-location-ph').textContent = pickupText;
    document.getElementById('dropoff-date-ph').textContent = dropDate;
    document.getElementById('dropoff-time-ph').textContent = dropTime;
    document.getElementById('dropoff-location-ph').textContent = dropoffText;

    document.getElementById('pick-up').value = pickFull;
    document.getElementById('drop-off').value = dropFull;
    document.getElementById('pickup-location').value = pickupText;
    document.getElementById('dropoff-location').value = dropoffText;

    document.getElementById('selected-car-ph').textContent = 'Toyota Camry';
    document.getElementById('selected-car').value = 'Toyota Camry';
    document.getElementById('selected-vehicle-image').src = 'assets/img/bmw.jpg';

    modal.style.display = 'flex';
  });

  function formatTime(time24) {
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  }

  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  checkoutForm.addEventListener('submit', e => {
    e.preventDefault();
    toastr.success('Reservation request sent!', 'Success');
    modal.style.display = 'none';
    bookingForm.reset();
  });
});
