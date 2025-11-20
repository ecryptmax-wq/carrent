const map = L.map('map').setView([37.0902, -95.7129], 4); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
}).addTo(map);

const locations = [
  { name: 'California Branch', coords: [34.0522, -118.2437] }, // Los Angeles
  { name: 'New York Branch', coords: [40.7128, -74.0060] },    // New York City
  { name: 'Florida Branch', coords: [25.7617, -80.1918] }      // Miami
];

locations.forEach(loc => {
  L.marker(loc.coords)
    .addTo(map)
    .bindPopup(`<strong>${loc.name}</strong>`)
    .openPopup();
});

locations.forEach(loc => {
  const marker = L.marker(loc.coords).addTo(map).bindPopup(`<strong>${loc.name}</strong>`);
  marker.on('click', () => {
    map.flyTo(loc.coords, 10, { duration: 1.5 });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const pickupInput = document.getElementById('pickupLocation');
  const suggestions = document.getElementById('suggestions');

  let debounceTimer;

  pickupInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = pickupInput.value.trim();

    if (query.length < 3) {
      suggestions.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=us&limit=5`)
        .then(res => res.json())
        .then(data => {
          suggestions.innerHTML = '';
          data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.display_name;
            li.addEventListener('click', () => {
              pickupInput.value = item.display_name;
              suggestions.innerHTML = '';
              
              if (window.map && item.lat && item.lon) {
                map.flyTo([item.lat, item.lon], 13, { duration: 1.5 });
                L.marker([item.lat, item.lon]).addTo(map)
                  .bindPopup(`<strong>${item.display_name}</strong>`)
                  .openPopup();
              }
            });
            suggestions.appendChild(li);
          });
        })
        .catch(err => console.error(err));
    }, 400);
  });

  document.addEventListener('click', (e) => {
    if (!pickupInput.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.innerHTML = '';
    }
  });
});

    window.addEventListener('scroll', function() {
      const navbar = document.getElementById('navbar');
      if(window.scrollY > 50) {
        navbar.classList.add('sticky');
      } else {
        navbar.classList.remove('sticky');
      }
    });

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });

    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        navLinks.classList.remove('active');
      });
    });

    const faders = document.querySelectorAll('.fade-section');
    const appearOptions = {
      threshold: 0.1,
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target.classList.add('active');
          appearOnScroll.unobserve(entry.target);
        }
      });
    }, appearOptions);

    faders.forEach(fader => {
      appearOnScroll.observe(fader);
    });

    document.getElementById('contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      toastr.success('Message sent successfully!', 'Success');
      this.reset();
    });

    const carModelSelect = document.getElementById('car_model');
    const selectedCarImg = document.getElementById('selected-vehicle-image');
    const selectedCarText = document.getElementById('selected-car-ph');
    const selectedCarHidden = document.getElementById('selected-car');

    carModelSelect.addEventListener('change', () => {
      const selectedOption = carModelSelect.selectedOptions[0];
      if (selectedOption) {
        const imgSrc = selectedOption.dataset.img;
        const carName = selectedOption.value;

        selectedCarImg.src = imgSrc;
        selectedCarText.textContent = carName;
        selectedCarHidden.value = carName;
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      const bookingForm = document.getElementById('bookingForm');
      const modal = document.getElementById('checkoutModal');
      const closeBtn = modal.querySelector('.close');
      const checkoutForm = document.getElementById('checkout-form');
      const dateInput = document.getElementById('pick-up-Date');
      const carSelect = document.getElementById('car_model');

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      dateInput.min = `${yyyy}-${mm}-${dd}`;

      bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const pickupLocation = document.getElementById('pickupLocation').value.trim();
        const pickupDate = dateInput.value;
        const pickupTime = document.getElementById('pickupTime').value;
        const selectedOption = carSelect.selectedOptions[0];

        if (!pickupLocation || !pickupDate || !pickupTime || !selectedOption.value) {
          toastr.error('Please fill all required fields!', 'Error');
          return;
        }

        populateModal(); 
        modal.classList.add('active');
      });

      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
      window.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('active');
      });

      checkoutForm.addEventListener('submit', e => {
        e.preventDefault();
        toastr.success('Booking confirmed! We will contact you soon.', 'Success');
        modal.classList.remove('active');
        bookingForm.reset();

        dateInput.min = `${yyyy}-${mm}-${dd}`;
      });

      carSelect.addEventListener('change', e => {
        const selected = e.target.selectedOptions[0];
        const imgSrc = selected.dataset.img || 'assets/img/placeholder.jpg';
        document.getElementById('selected-vehicle-image').src = imgSrc;
      });

      function populateModal() {
        const pickupLocation = document.getElementById('pickupLocation').value;
        const dropoffLocationInput = document.getElementById('dropoffLocation');
        const dropoffLocation = dropoffLocationInput ? dropoffLocationInput.value || pickupLocation : pickupLocation;
        const pickupDate = dateInput.value;
        const pickupTime = document.getElementById('pickupTime').value;
        const selectedOption = carSelect.selectedOptions[0];
        const carName = selectedOption.value;
        const carImage = selectedOption.dataset.img || 'assets/img/placeholder.jpg';

        const formattedDate = formatDate(pickupDate);
        const formattedTime = formatTime(pickupTime);

        const nextDay = new Date(pickupDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const dropoffDate = formatDate(nextDay.toISOString().split('T')[0]);

        updateText('pickup-location-ph', pickupLocation);
        updateText('dropoff-location-ph', dropoffLocation);
        updateText('pick-up-date-ph', formattedDate);
        updateText('pick-up-time-ph', formattedTime);
        updateText('dropoff-date-ph', dropoffDate);
        updateText('dropoff-time-ph', formattedTime);
        updateText('selected-car-ph', carName);

        document.getElementById('selected-vehicle-image').src = carImage;

        setHiddenValue('pickup-location', pickupLocation);
        setHiddenValue('dropoff-location', dropoffLocation);
        setHiddenValue('selected-car', carName);
      }

      function formatTime(time24) {
        if (!time24) return '';
        const [h, m] = time24.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
      }

      function formatDate(dateStr) {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
      }

      function updateText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value || '-';
      }

      function setHiddenValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
      }
    });

  document.getElementById("openModalBtn")?.addEventListener("click", () => {
    document.getElementById("bookingModal").classList.add("active");
  });
  document.getElementById("closeModal")?.addEventListener("click", () => {
    document.getElementById("bookingModal").classList.remove("active");
  });