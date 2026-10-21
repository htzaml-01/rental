// AutoRent - Interactive Functions
// Strictly without any emojis or emoticons

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle & Navigation Active State
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item[data-section]');
  const desktopNavLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Scrollspy to automatically highlight active tab (desktop & bottom-nav)
  function handleScrollSpy() {
    const scrollPos = window.scrollY + 180;

    sections.forEach(sec => {
      const secTop = sec.offsetTop;
      const secHeight = sec.offsetHeight;
      const secId = sec.getAttribute('id');

      if (scrollPos >= secTop && scrollPos < secTop + secHeight) {
        bottomNavItems.forEach(item => {
          if (item.getAttribute('data-section') === secId) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });

        desktopNavLinks.forEach(link => {
          if (link.getAttribute('href') === `#${secId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScrollSpy, { passive: true });

  // Smooth scroll and active state on bottom-nav tap
  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      bottomNavItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // 2. Set Default Date Input to Today
  const today = new Date().toISOString().split('T')[0];
  const pickupDateInput = document.getElementById('pickupDate');
  const bookingStartDate = document.getElementById('bookingStartDate');

  if (pickupDateInput) pickupDateInput.value = today;
  if (bookingStartDate) bookingStartDate.value = today;

  // 3. Category Filter Logic
  const filterPills = document.querySelectorAll('#fleetFilterPills .pill');

  function applyFilter(category) {
    const allCarCards = document.querySelectorAll('.car-card');
    allCarCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || cardCat === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filterValue = pill.getAttribute('data-filter');
      applyFilter(filterValue);
    });
  });

  // 4. Quick Search Bar Action
  const btnFilterSubmit = document.getElementById('btnFilterSubmit');
  const carCategorySelect = document.getElementById('carCategory');

  if (btnFilterSubmit && carCategorySelect) {
    btnFilterSubmit.addEventListener('click', () => {
      const selectedCategory = carCategorySelect.value;
      
      // Update pills
      filterPills.forEach(pill => {
        if (pill.getAttribute('data-filter') === selectedCategory) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });

      applyFilter(selectedCategory);

      // Smooth scroll to fleet section
      const armadaSection = document.getElementById('armada');
      if (armadaSection) {
        armadaSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 5. Toast Notification System
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3500);
  }

  // 6. Booking Modal Logic & WhatsApp Autotext
  const bookingModal = document.getElementById('bookingModal');
  const modalClose = document.getElementById('modalClose');
  const modalBookingForm = document.getElementById('modalBookingForm');
  const bookingCarName = document.getElementById('bookingCarName');
  const bookingService = document.getElementById('bookingService');
  const bookingTransmission = document.getElementById('bookingTransmission');
  const bookingDays = document.getElementById('bookingDays');
  const modalTotalPrice = document.getElementById('modalTotalPrice');

  let currentCarPrice = 350000;

  function parsePrice(priceStr) {
    if (typeof priceStr === 'number') return priceStr;
    return parseInt(String(priceStr).replace(/\./g, ''), 10) || 350000;
  }

  function formatIDR(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  function recalculateTotal() {
    const days = parseInt(bookingDays.value, 10) || 1;
    const isWithDriver = bookingService.value === 'Dengan Sopir';
    const driverFee = isWithDriver ? 150000 : 0;
    const total = (currentCarPrice + driverFee) * days;
    modalTotalPrice.textContent = formatIDR(total);
  }

  // Bind Open Booking Modal to all current & future cards
  function bindBookingButtons() {
    document.querySelectorAll('.btn-book').forEach(btn => {
      // Remove old clone listener to prevent duplicate events
      btn.onclick = null;
      btn.onclick = (e) => {
        const carName = btn.getAttribute('data-car') || 'Mobil Rental';
        const rawPrice = btn.getAttribute('data-price') || '350.000';
        const carTransmission = btn.getAttribute('data-transmission') || '';
        currentCarPrice = parsePrice(rawPrice);

        bookingCarName.value = carName;

        // Auto-select transmission if car specifically requires it
        if (bookingTransmission) {
          if (carTransmission.toLowerCase().includes('matic') && !carTransmission.toLowerCase().includes('manual')) {
            bookingTransmission.value = 'Matic (Automatic)';
          } else if (carTransmission.toLowerCase().includes('manual') && !carTransmission.toLowerCase().includes('matic')) {
            bookingTransmission.value = 'Manual';
          }
        }

        // Sync duration and service from quick search if available
        const rentalDurationSelect = document.getElementById('rentalDuration');
        const rentalTypeSelect = document.getElementById('rentalType');
        const pickupDateTop = document.getElementById('pickupDate');

        if (rentalDurationSelect && bookingDays) {
          bookingDays.value = rentalDurationSelect.value;
        }
        if (rentalTypeSelect && bookingService) {
          bookingService.value = (rentalTypeSelect.value === 'dengan-sopir') ? 'Dengan Sopir' : 'Lepas Kunci';
        }
        if (pickupDateTop && bookingStartDate && pickupDateTop.value) {
          bookingStartDate.value = pickupDateTop.value;
        }

        const carStock = btn.getAttribute('data-stock') || '3';
        const modalStockText = document.getElementById('modalStockText');
        const modalStockDot = document.getElementById('modalStockDot');

        if (modalStockText) {
          const numStock = parseInt(carStock, 10);
          if (numStock <= 2) {
            modalStockText.innerHTML = `Sisa Stok: <strong style="color: #d97706;">${numStock} Unit Tersedia (Segera Pesan!)</strong>`;
            if (modalStockDot) modalStockDot.className = 'stock-indicator-dot dot-low';
          } else {
            modalStockText.innerHTML = `Sisa Stok: <strong>${numStock} Unit Tersedia</strong>`;
            if (modalStockDot) modalStockDot.className = 'stock-indicator-dot';
          }
        }

        recalculateTotal();

        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      };
    });
  }

  bindBookingButtons();

  // Close Booking Modal
  function closeBookingModal() {
    if (bookingModal) {
      bookingModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeBookingModal);
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeBookingModal();
      }
    });
  }

  // Re-calculate price on changes
  if (bookingService) bookingService.addEventListener('change', recalculateTotal);
  if (bookingDays) bookingDays.addEventListener('change', recalculateTotal);

  // Form Submit to WhatsApp with Autotext (including Transmission & Stock Inquiry)
  if (modalBookingForm) {
    modalBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const car = bookingCarName.value;
      const transmission = bookingTransmission ? bookingTransmission.value : 'Matic / Manual';
      const name = document.getElementById('bookingUserName').value.trim();
      const phone = document.getElementById('bookingUserPhone').value.trim();
      const service = bookingService.value;
      const days = bookingDays.value;
      const startDate = bookingStartDate.value;
      const notes = document.getElementById('bookingNotes').value.trim();
      const estimatedCost = modalTotalPrice.textContent;

      // Construct plain text WhatsApp message with auto-text details (strictly NO emojis)
      let message = `Halo AutoRent, saya ingin sewa mobil ${car} (${transmission}) selama ${days} hari.\n\n`;
      message += `Detail Reservasi:\n`;
      message += `- Mobil yang Dipilih: ${car}\n`;
      message += `- Pilihan Transmisi: ${transmission}\n`;
      message += `- Durasi Sewa: ${days} Hari\n`;
      message += `- Pilihan Layanan: ${service}\n`;
      message += `- Tanggal Mulai: ${startDate}\n`;
      message += `- Estimasi Biaya: ${estimatedCost}\n`;
      message += `- Nama Pemesan: ${name}\n`;
      message += `- Nomor Telepon/WA: ${phone}\n`;
      if (notes) {
        message += `- Lokasi Antar / Catatan: ${notes}\n`;
      }
      message += `\nApakah unit ${car} (${transmission}) masih ada stok untuk jadwal tersebut? Mohon konfirmasinya. Terima kasih.`;

      const profile = getCompanyProfile();
      const targetWA = profile.phoneWA || '6281376385456';
      const waUrl = `https://wa.me/${targetWA}?text=${encodeURIComponent(message)}`;

      window.open(waUrl, '_blank');
      closeBookingModal();
    });
  }

  // ========================================================
  // 7. Render All Fleet Cars & Stock from Supabase / LocalStorage
  // ========================================================
  async function renderAllFleetCars() {
    const carGrid = document.getElementById('carGrid');
    if (!carGrid) return;

    let cars = [];
    if (window.AutoRentDB && typeof window.AutoRentDB.getAllCars === 'function') {
      try {
        cars = await window.AutoRentDB.getAllCars();
      } catch (err) {
        console.error('Failed to get cars from AutoRentDB', err);
      }
    }

    if (!cars || cars.length === 0) {
      cars = window.AutoRentDB ? window.AutoRentDB.DEFAULT_FLEET : [];
    }

    carGrid.innerHTML = '';

    cars.forEach(car => {
      const formattedPrice = Number(car.price).toLocaleString('id-ID');
      const categoryLabel = (car.category === 'city') ? 'City Car Kompak' : 
                            (car.category === 'suv') ? 'SUV & Premium' : 'MPV Keluarga';
      const stock = (typeof car.stock === 'number') ? car.stock : 3;

      let stockBadgeHtml = '';
      let bookBtnHtml = '';

      if (stock <= 0) {
        stockBadgeHtml = `
          <span class="car-stock-badge stock-empty" title="Unit ini sedang tidak tersedia">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            Stok Habis
          </span>
        `;
        bookBtnHtml = `<button class="btn btn-disabled btn-sm" disabled title="Unit ini sedang habis">Stok Habis</button>`;
      } else if (stock <= 3) {
        stockBadgeHtml = `
          <span class="car-stock-badge stock-low" title="Sisa sedikit, segera lakukan reservasi">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Sisa ${stock} Unit!
          </span>
        `;
        bookBtnHtml = `<button class="btn btn-primary btn-sm btn-book" data-car="${car.name}" data-price="${formattedPrice}" data-transmission="${car.transmission || ''}" data-stock="${stock}">Pesan Unit</button>`;
      } else {
        stockBadgeHtml = `
          <span class="car-stock-badge stock-available" title="Unit siap dipesan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Tersedia ${stock} Unit
          </span>
        `;
        bookBtnHtml = `<button class="btn btn-primary btn-sm btn-book" data-car="${car.name}" data-price="${formattedPrice}" data-transmission="${car.transmission || ''}" data-stock="${stock}">Pesan Unit</button>`;
      }

      const card = document.createElement('article');
      card.className = `car-card ${car.isCustom ? 'car-card-custom' : ''}`;
      card.setAttribute('data-category', car.category);
      card.setAttribute('data-car-id', car.id);

      card.innerHTML = `
        <div class="car-thumb">
          <img src="${car.image}" alt="${car.name}" loading="lazy" onerror="this.src='Asset/Silver Toyota Avanza Cityscape Showcase.png'">
          ${stockBadgeHtml}
          <span class="badge-status">${car.badge || 'Tersedia'}</span>
        </div>
        <div class="car-details">
          <div class="car-category-label">${categoryLabel}</div>
          <h3 class="car-name">${car.name}</h3>
          <p class="car-caption">${car.desc || 'Unit terawat, bersih, mesin prima siap jalan.'}</p>
          
          <div class="car-specs">
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
              <span>${car.capacity || '7 Penumpang'}</span>
            </div>
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
              <span>${car.transmission || 'Matic / Manual'}</span>
            </div>
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
              <span>Bensin Irit</span>
            </div>
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>AC Dingin</span>
            </div>
          </div>

          <div class="car-footer">
            <div class="car-price">
              <span class="price-val">Rp ${formattedPrice}</span>
              <span class="price-unit">/ 24 jam</span>
            </div>
            ${bookBtnHtml}
          </div>
        </div>
      `;

      carGrid.appendChild(card);
    });

    bindBookingButtons();

    const activePill = document.querySelector('#fleetFilterPills .pill.active');
    if (activePill) {
      applyFilter(activePill.getAttribute('data-filter'));
    }
  }

  // ========================================================
  // 8. Company Profile & Dynamic Contact Info
  // ========================================================
  const PROFILE_KEY = 'autorent_company_profile';

  const DEFAULT_PROFILE = {
    phoneDisplay: '0813-7638-5456',
    phoneWA: '6281376385456',
    email: 'reservasi@autorent.co.id',
    address: 'Jl. Gatot Subroto No. 88, Jakarta Selatan',
    operatingHours: 'Buka Setiap Hari 07.00 - 22.00 WIB',
    brandName: 'AutoRent Indonesia'
  };

  function getCompanyProfile() {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch (err) {
      console.error('Error reading company profile', err);
      return DEFAULT_PROFILE;
    }
  }

  function applyCompanyProfile() {
    const profile = getCompanyProfile();

    const phoneEl = document.getElementById('contactPhoneDisplay');
    const emailEl = document.getElementById('contactEmailDisplay');
    const addressEl = document.getElementById('contactAddressDisplay');
    const hoursEl = document.getElementById('contactHoursDisplay');

    if (phoneEl) phoneEl.textContent = profile.phoneDisplay;
    if (emailEl) {
      emailEl.textContent = profile.email;
      emailEl.setAttribute('href', `mailto:${profile.email}`);
    }
    if (addressEl) addressEl.textContent = profile.address;
    if (hoursEl) hoursEl.textContent = profile.operatingHours;

    // Dynamically update all WhatsApp links on the page
    document.querySelectorAll('.btn-wa-link').forEach(link => {
      const currentHref = link.getAttribute('href') || '';
      const textMatch = currentHref.match(/[?&]text=([^&]+)/);
      const textParam = textMatch ? textMatch[1] : encodeURIComponent('Halo AutoRent, saya ingin sewa mobil');
      link.setAttribute('href', `https://wa.me/${profile.phoneWA}?text=${textParam}`);
    });
  }

  // Initial runs
  renderAllFleetCars();
  applyCompanyProfile();

  // Listen to cross-tab storage changes and custom database events
  window.addEventListener('storage', (e) => {
    if (e.key === 'autorent_custom_cars' || e.key === 'autorent_fleet_stocks' || e.key === 'autorent_supabase_url') {
      renderAllFleetCars();
    } else if (e.key === 'autorent_company_profile') {
      applyCompanyProfile();
    }
  });

  window.addEventListener('autorent:db_change', () => {
    renderAllFleetCars();
  });
});
