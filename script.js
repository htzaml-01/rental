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

  // Form Submit to WhatsApp with Autotext (including Transmission)
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
      message += `\nApakah unit ${car} (${transmission}) masih tersedia untuk jadwal tersebut? Mohon konfirmasinya. Terima kasih.`;

      const targetWA = '6281376385456';
      const waUrl = `https://wa.me/${targetWA}?text=${encodeURIComponent(message)}`;

      window.open(waUrl, '_blank');
      closeBookingModal();
    });
  }

  // ========================================================
  // 7. Admin Panel - Kelola & Tambah Mobil
  // ========================================================
  const STORAGE_KEY = 'autorent_custom_cars';

  function getCustomCars() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to parse custom cars from localStorage', err);
      return [];
    }
  }

  function saveCustomCars(cars) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
    } catch (err) {
      console.error('Failed to save custom cars to localStorage', err);
    }
  }

  // Admin Modal Elements
  const adminModal = document.getElementById('adminModal');
  const btnAdminOpen = document.getElementById('btnAdminOpen');
  const btnFooterAdmin = document.getElementById('btnFooterAdmin');
  const adminModalClose = document.getElementById('adminModalClose');
  const tabBtnAddCar = document.getElementById('tabBtnAddCar');
  const tabBtnManageCar = document.getElementById('tabBtnManageCar');
  const tabAddCar = document.getElementById('tabAddCar');
  const tabManageCar = document.getElementById('tabManageCar');
  const customCarCount = document.getElementById('customCarCount');
  const formAddCar = document.getElementById('formAddCar');
  const adminCarsList = document.getElementById('adminCarsList');
  const btnClearAllCustomCars = document.getElementById('btnClearAllCustomCars');

  // Image source radio buttons & boxes
  const imgSrcUpload = document.getElementById('imgSrcUpload');
  const imgSrcPreset = document.getElementById('imgSrcPreset');
  const imgSrcUrl = document.getElementById('imgSrcUrl');
  const boxImgUpload = document.getElementById('boxImgUpload');
  const boxImgPreset = document.getElementById('boxImgPreset');
  const boxImgUrl = document.getElementById('boxImgUrl');
  const adminCarFile = document.getElementById('adminCarFile');
  const adminCarPreset = document.getElementById('adminCarPreset');
  const adminCarUrl = document.getElementById('adminCarUrl');
  const adminImgPreview = document.getElementById('adminImgPreview');

  let currentImageDataUrl = 'Asset/Silver Toyota Avanza Cityscape Showcase.png';

  // Toggle image source
  function handleImageSourceChange() {
    if (imgSrcUpload && imgSrcUpload.checked) {
      boxImgUpload.style.display = 'block';
      boxImgPreset.style.display = 'none';
      boxImgUrl.style.display = 'none';
    } else if (imgSrcPreset && imgSrcPreset.checked) {
      boxImgUpload.style.display = 'none';
      boxImgPreset.style.display = 'block';
      boxImgUrl.style.display = 'none';
      currentImageDataUrl = adminCarPreset.value;
      adminImgPreview.src = currentImageDataUrl;
    } else if (imgSrcUrl && imgSrcUrl.checked) {
      boxImgUpload.style.display = 'none';
      boxImgPreset.style.display = 'none';
      boxImgUrl.style.display = 'block';
      if (adminCarUrl.value) {
        currentImageDataUrl = adminCarUrl.value;
        adminImgPreview.src = currentImageDataUrl;
      }
    }
  }

  if (imgSrcUpload) imgSrcUpload.addEventListener('change', handleImageSourceChange);
  if (imgSrcPreset) imgSrcPreset.addEventListener('change', handleImageSourceChange);
  if (imgSrcUrl) imgSrcUrl.addEventListener('change', handleImageSourceChange);

  if (adminCarPreset) {
    adminCarPreset.addEventListener('change', () => {
      currentImageDataUrl = adminCarPreset.value;
      adminImgPreview.src = currentImageDataUrl;
    });
  }

  if (adminCarUrl) {
    adminCarUrl.addEventListener('input', () => {
      if (adminCarUrl.value.trim()) {
        currentImageDataUrl = adminCarUrl.value.trim();
        adminImgPreview.src = currentImageDataUrl;
      }
    });
  }

  if (adminCarFile) {
    adminCarFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          currentImageDataUrl = event.target.result;
          adminImgPreview.src = currentImageDataUrl;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Open & Close Admin Modal
  function openAdminModal() {
    if (adminModal) {
      adminModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateManageTabList();
    }
  }

  function closeAdminModal() {
    if (adminModal) {
      adminModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (btnAdminOpen) btnAdminOpen.addEventListener('click', openAdminModal);
  if (btnFooterAdmin) btnFooterAdmin.addEventListener('click', openAdminModal);
  if (adminModalClose) adminModalClose.addEventListener('click', closeAdminModal);

  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        closeAdminModal();
      }
    });
  }

  // Tab Switching
  if (tabBtnAddCar && tabBtnManageCar) {
    tabBtnAddCar.addEventListener('click', () => {
      tabBtnAddCar.classList.add('active');
      tabBtnManageCar.classList.remove('active');
      tabAddCar.style.display = 'block';
      tabManageCar.style.display = 'none';
    });

    tabBtnManageCar.addEventListener('click', () => {
      tabBtnManageCar.classList.add('active');
      tabBtnAddCar.classList.remove('active');
      tabAddCar.style.display = 'none';
      tabManageCar.style.display = 'block';
      updateManageTabList();
    });
  }

  // Render Custom Cars to DOM
  function renderAllCustomCars() {
    const customCars = getCustomCars();
    if (customCarCount) customCarCount.textContent = customCars.length;

    // Remove any previously rendered custom cars to avoid duplication
    document.querySelectorAll('.car-card-custom').forEach(el => el.remove());

    const carGrid = document.getElementById('carGrid');
    if (!carGrid) return;

    customCars.forEach(car => {
      const formattedPrice = Number(car.price).toLocaleString('id-ID');
      const categoryLabel = (car.category === 'city') ? 'City Car Kompak' : 
                            (car.category === 'suv') ? 'SUV & Premium' : 'MPV Keluarga';

      const card = document.createElement('article');
      card.className = 'car-card car-card-custom';
      card.setAttribute('data-category', car.category);
      card.setAttribute('data-car-id', car.id);

      card.innerHTML = `
        <div class="car-thumb">
          <img src="${car.image}" alt="${car.name}" loading="lazy">
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
            <button class="btn btn-primary btn-sm btn-book" data-car="${car.name}" data-price="${formattedPrice}" data-transmission="${car.transmission || ''}">Pesan Unit</button>
          </div>
        </div>
      `;

      carGrid.appendChild(card);
    });

    // Re-bind booking buttons & apply current active filter
    bindBookingButtons();

    const activePill = document.querySelector('#fleetFilterPills .pill.active');
    if (activePill) {
      applyFilter(activePill.getAttribute('data-filter'));
    }
  }

  // Update Manage Tab List in Admin Modal
  function updateManageTabList() {
    const customCars = getCustomCars();
    if (customCarCount) customCarCount.textContent = customCars.length;
    if (!adminCarsList) return;

    adminCarsList.innerHTML = '';

    if (customCars.length === 0) {
      adminCarsList.innerHTML = `
        <div class="admin-empty-state">
          Belum ada mobil tambahan yang dibuat. Silakan gunakan tab <strong>Tambah Mobil Baru</strong> di atas untuk menambahkan mobil ke katalog.
        </div>
      `;
      return;
    }

    customCars.forEach(car => {
      const item = document.createElement('div');
      item.className = 'admin-car-item';

      const formattedPrice = Number(car.price).toLocaleString('id-ID');

      item.innerHTML = `
        <div class="admin-car-item-info">
          <img src="${car.image}" alt="${car.name}" class="admin-car-thumb">
          <div class="admin-car-details">
            <strong>${car.name}</strong>
            <span>Rp ${formattedPrice} / hari &bull; ${car.transmission} &bull; ${car.category.toUpperCase()}</span>
          </div>
        </div>
        <button type="button" class="btn-delete-car" data-delete-id="${car.id}">Hapus</button>
      `;

      adminCarsList.appendChild(item);
    });

    // Attach delete handlers
    adminCarsList.querySelectorAll('.btn-delete-car').forEach(btn => {
      btn.addEventListener('click', () => {
        const idToDelete = btn.getAttribute('data-delete-id');
        deleteCustomCar(idToDelete);
      });
    });
  }

  // Delete single custom car
  function deleteCustomCar(id) {
    let customCars = getCustomCars();
    const carToDelete = customCars.find(c => c.id === id);
    const carName = carToDelete ? carToDelete.name : 'Mobil';

    customCars = customCars.filter(c => c.id !== id);
    saveCustomCars(customCars);

    renderAllCustomCars();
    updateManageTabList();

    showToast(`${carName} berhasil dihapus dari katalog.`, 'success');
  }

  // Clear all custom cars
  if (btnClearAllCustomCars) {
    btnClearAllCustomCars.addEventListener('click', () => {
      const customCars = getCustomCars();
      if (customCars.length === 0) {
        showToast('Tidak ada mobil tambahan untuk dihapus.', 'error');
        return;
      }

      if (confirm('Yakin ingin menghapus semua mobil tambahan dari katalog?')) {
        saveCustomCars([]);
        renderAllCustomCars();
        updateManageTabList();
        showToast('Semua mobil tambahan berhasil dibersihkan.', 'success');
      }
    });
  }

  // Form Add Car Submit
  if (formAddCar) {
    formAddCar.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('adminCarName').value.trim();
      const category = document.getElementById('adminCarCategory').value;
      const price = parseInt(document.getElementById('adminCarPrice').value, 10);
      const transmission = document.getElementById('adminCarTransmission').value;
      const capacity = document.getElementById('adminCarCapacity').value;
      const badge = document.getElementById('adminCarBadge').value;
      const desc = document.getElementById('adminCarDesc').value.trim();

      if (!name || isNaN(price) || price <= 0) {
        showToast('Harap isi nama dan harga mobil dengan benar.', 'error');
        return;
      }

      const newCar = {
        id: 'car_' + Date.now(),
        name: name,
        category: category,
        price: price,
        transmission: transmission,
        capacity: capacity,
        badge: badge,
        desc: desc,
        image: currentImageDataUrl || 'Asset/Silver Toyota Avanza Cityscape Showcase.png',
        createdAt: new Date().toISOString()
      };

      const customCars = getCustomCars();
      customCars.unshift(newCar);
      saveCustomCars(customCars);

      renderAllCustomCars();
      updateManageTabList();

      showToast(`Mobil ${name} berhasil ditambahkan ke katalog!`, 'success');

      // Reset form
      formAddCar.reset();
      currentImageDataUrl = 'Asset/Silver Toyota Avanza Cityscape Showcase.png';
      adminImgPreview.src = currentImageDataUrl;
      handleImageSourceChange();

      // Scroll to Armada section so user can see it right away
      closeAdminModal();
      const armadaSection = document.getElementById('armada');
      if (armadaSection) {
        armadaSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Initial render of custom cars on page load
  renderAllCustomCars();
});
