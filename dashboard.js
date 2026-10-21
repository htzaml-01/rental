// AutoRent - Dashboard Admin Logic
// Strictly without any emojis or emoticons

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'autorent_custom_cars';

  // Default fleet in the catalog
  const DEFAULT_FLEET = [
    {
      id: 'default_1',
      name: 'Mitsubishi Xpander',
      category: 'mpv',
      price: 450000,
      transmission: 'Matic / Manual',
      capacity: '7 Penumpang',
      badge: 'Tersedia',
      image: 'Asset/Mitsubishi Xpander Cityscape Showcase.png',
      isCustom: false
    },
    {
      id: 'default_2',
      name: 'Toyota All New Avanza',
      category: 'mpv',
      price: 400000,
      transmission: 'Matic CVT',
      capacity: '7 Penumpang',
      badge: 'Paling Populer',
      image: 'Asset/Silver Toyota Avanza Cityscape Showcase.png',
      isCustom: false
    },
    {
      id: 'default_3',
      name: 'Suzuki All New Ertiga',
      category: 'mpv',
      price: 380000,
      transmission: 'Automatic',
      capacity: '7 Penumpang',
      badge: 'Tersedia',
      image: 'Asset/Silver Suzuki Ertiga City Showcase.png',
      isCustom: false
    },
    {
      id: 'default_4',
      name: 'Daihatsu All New Xenia',
      category: 'mpv',
      price: 370000,
      transmission: 'Manual / Matic',
      capacity: '7 Penumpang',
      badge: 'Tersedia',
      image: 'Asset/Silver Daihatsu Xenia Cityscape Showcase.png',
      isCustom: false
    },
    {
      id: 'default_5',
      name: 'Toyota New Agya',
      category: 'city',
      price: 300000,
      transmission: 'Matic / Manual',
      capacity: '5 Penumpang',
      badge: 'Paling Hemat',
      image: 'Asset/Silver Toyota Agya Cityscape Showcase.png',
      isCustom: false
    },
    {
      id: 'default_6',
      name: 'Daihatsu Sigra',
      category: 'mpv',
      price: 320000,
      transmission: 'Manual / Matic',
      capacity: '7 Penumpang',
      badge: 'Tersedia',
      image: 'Asset/Silver Toyota Sigra Cityscape Ad.png',
      isCustom: false
    }
  ];

  // Helper functions for localStorage
  function getCustomCars() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error reading localStorage', err);
      return [];
    }
  }

  function saveCustomCars(cars) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
    } catch (err) {
      console.error('Error writing localStorage', err);
    }
  }

  // Toast Notification System
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

  // Elements
  const statTotalCars = document.getElementById('statTotalCars');
  const statCustomCars = document.getElementById('statCustomCars');
  const dashCarsTableBody = document.getElementById('dashCarsTableBody');
  const dashSearchFilter = document.getElementById('dashSearchFilter');
  const dashFilterChips = document.querySelectorAll('#dashFilterCategory .dash-chip');
  const btnResetCustomCars = document.getElementById('btnResetCustomCars');
  const dashFormAddCar = document.getElementById('dashFormAddCar');

  // Image source elements
  const dashImgSrcUpload = document.getElementById('dashImgSrcUpload');
  const dashImgSrcPreset = document.getElementById('dashImgSrcPreset');
  const dashImgSrcUrl = document.getElementById('dashImgSrcUrl');
  const dashBoxUpload = document.getElementById('dashBoxUpload');
  const dashBoxPreset = document.getElementById('dashBoxPreset');
  const dashBoxUrl = document.getElementById('dashBoxUrl');
  const dashCarFileInput = document.getElementById('dashCarFileInput');
  const dashCarPresetSelect = document.getElementById('dashCarPresetSelect');
  const dashCarUrlInput = document.getElementById('dashCarUrlInput');
  const dashImgPreview = document.getElementById('dashImgPreview');
  const previewDimensions = document.getElementById('previewDimensions');

  let currentImageData = 'Asset/Silver Toyota Avanza Cityscape Showcase.png';
  let activeCategoryFilter = 'all';
  let currentSearchQuery = '';

  // Handle Image Source Switching
  function handleImageSourceSwitch() {
    if (dashImgSrcUpload && dashImgSrcUpload.checked) {
      dashBoxUpload.style.display = 'block';
      dashBoxPreset.style.display = 'none';
      dashBoxUrl.style.display = 'none';
    } else if (dashImgSrcPreset && dashImgSrcPreset.checked) {
      dashBoxUpload.style.display = 'none';
      dashBoxPreset.style.display = 'block';
      dashBoxUrl.style.display = 'none';
      currentImageData = dashCarPresetSelect.value;
      dashImgPreview.src = currentImageData;
    } else if (dashImgSrcUrl && dashImgSrcUrl.checked) {
      dashBoxUpload.style.display = 'none';
      dashBoxPreset.style.display = 'none';
      dashBoxUrl.style.display = 'block';
      if (dashCarUrlInput.value.trim()) {
        currentImageData = dashCarUrlInput.value.trim();
        dashImgPreview.src = currentImageData;
      }
    }
  }

  if (dashImgSrcUpload) dashImgSrcUpload.addEventListener('change', handleImageSourceSwitch);
  if (dashImgSrcPreset) dashImgSrcPreset.addEventListener('change', handleImageSourceSwitch);
  if (dashImgSrcUrl) dashImgSrcUrl.addEventListener('change', handleImageSourceSwitch);

  if (dashCarPresetSelect) {
    dashCarPresetSelect.addEventListener('change', () => {
      currentImageData = dashCarPresetSelect.value;
      dashImgPreview.src = currentImageData;
    });
  }

  if (dashCarUrlInput) {
    dashCarUrlInput.addEventListener('input', () => {
      const val = dashCarUrlInput.value.trim();
      if (val) {
        currentImageData = val;
        dashImgPreview.src = currentImageData;
      }
    });
  }

  if (dashCarFileInput) {
    dashCarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          currentImageData = event.target.result;
          dashImgPreview.src = currentImageData;
          if (previewDimensions) {
            previewDimensions.textContent = `${(file.size / 1024).toFixed(1)} KB`;
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Render Table & Stats
  function updateDashboardView() {
    const customCars = getCustomCars();

    // Update Stats
    const totalCount = DEFAULT_FLEET.length + customCars.length;
    if (statTotalCars) statTotalCars.textContent = totalCount;
    if (statCustomCars) statCustomCars.textContent = customCars.length;

    // Combine lists: custom cars first, then default cars
    const allCars = [...customCars.map(c => ({ ...c, isCustom: true })), ...DEFAULT_FLEET];

    // Filter
    const filteredCars = allCars.filter(car => {
      const matchesCategory = (activeCategoryFilter === 'all' || car.category === activeCategoryFilter);
      const matchesSearch = (car.name.toLowerCase().includes(currentSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    dashCarsTableBody.innerHTML = '';

    if (filteredCars.length === 0) {
      dashCarsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 36px; color: var(--text-muted);">
            Tidak ditemukan mobil dengan kriteria pencarian tersebut.
          </td>
        </tr>
      `;
      return;
    }

    filteredCars.forEach(car => {
      const tr = document.createElement('tr');

      const formattedPrice = Number(car.price).toLocaleString('id-ID');
      const catLabel = (car.category === 'city') ? 'City Car' : 
                       (car.category === 'suv') ? 'SUV & Premium' : 'MPV';

      const typeBadge = car.isCustom 
        ? `<span class="badge-tag badge-tag-custom">Custom Admin</span>`
        : `<span class="badge-tag badge-tag-default">Bawaan Pabrik</span>`;

      const actionBtn = car.isCustom
        ? `<button type="button" class="btn-delete-car" data-id="${car.id}">Hapus</button>`
        : `<span style="color: #94a3b8; font-size: 0.8rem;">Terkunci</span>`;

      tr.innerHTML = `
        <td>
          <img src="${car.image}" alt="${car.name}" class="table-car-thumb" onerror="this.src='Asset/Silver Toyota Avanza Cityscape Showcase.png'">
        </td>
        <td>
          <span class="table-car-name">${car.name}</span>
          <span class="table-car-cat">${catLabel} &bull; ${car.capacity || '7 Penumpang'}</span>
        </td>
        <td>
          <span style="font-weight: 600; color: #475569;">${car.transmission || 'Matic / Manual'}</span>
        </td>
        <td>
          <span class="table-price-val">Rp ${formattedPrice}</span>
          <span style="font-size: 0.75rem; color: #94a3b8;">/ 24 jam</span>
        </td>
        <td>
          <span class="badge-status-pill">${car.badge || 'Tersedia'}</span>
        </td>
        <td>
          ${typeBadge}
        </td>
        <td>
          ${actionBtn}
        </td>
      `;

      dashCarsTableBody.appendChild(tr);
    });

    // Attach delete button handlers
    dashCarsTableBody.querySelectorAll('.btn-delete-car').forEach(btn => {
      btn.addEventListener('click', () => {
        const idToDelete = btn.getAttribute('data-id');
        deleteCar(idToDelete);
      });
    });
  }

  // Delete a custom car
  function deleteCar(id) {
    let customCars = getCustomCars();
    const carToDelete = customCars.find(c => c.id === id);
    const carName = carToDelete ? carToDelete.name : 'Mobil';

    customCars = customCars.filter(c => c.id !== id);
    saveCustomCars(customCars);

    updateDashboardView();
    showToast(`Mobil ${carName} berhasil dihapus dari katalog!`, 'success');
  }

  // Reset all custom cars
  if (btnResetCustomCars) {
    btnResetCustomCars.addEventListener('click', () => {
      const customCars = getCustomCars();
      if (customCars.length === 0) {
        showToast('Tidak ada mobil custom buatan admin untuk dihapus.', 'error');
        return;
      }

      if (confirm('Apakah Anda yakin ingin menghapus SEMUA mobil buatan admin? Katalog akan kembali ke unit bawaan.')) {
        saveCustomCars([]);
        updateDashboardView();
        showToast('Semua mobil custom berhasil dibersihkan!', 'success');
      }
    });
  }

  // Search Filter Input
  if (dashSearchFilter) {
    dashSearchFilter.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      updateDashboardView();
    });
  }

  // Category Filter Chips
  dashFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dashFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategoryFilter = chip.getAttribute('data-filter');
      updateDashboardView();
    });
  });

  // Form Submit: Tambah Mobil Baru
  if (dashFormAddCar) {
    dashFormAddCar.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('carName').value.trim();
      const category = document.getElementById('carCategory').value;
      const price = parseInt(document.getElementById('carPrice').value, 10);
      const transmission = document.getElementById('carTransmission').value;
      const capacity = document.getElementById('carCapacity').value;
      const badge = document.getElementById('carBadge').value;
      const desc = document.getElementById('carDesc').value.trim();

      if (!name || isNaN(price) || price <= 0) {
        showToast('Harap lengkapi nama dan harga mobil dengan benar.', 'error');
        return;
      }

      const newCar = {
        id: 'custom_' + Date.now(),
        name: name,
        category: category,
        price: price,
        transmission: transmission,
        capacity: capacity,
        badge: badge,
        desc: desc,
        image: currentImageData || 'Asset/Silver Toyota Avanza Cityscape Showcase.png',
        createdAt: new Date().toISOString()
      };

      const customCars = getCustomCars();
      customCars.unshift(newCar);
      saveCustomCars(customCars);

      updateDashboardView();
      showToast(`Mobil ${name} berhasil ditambahkan dan langsung aktif di katalog website!`, 'success');

      // Reset Form
      dashFormAddCar.reset();
      currentImageData = 'Asset/Silver Toyota Avanza Cityscape Showcase.png';
      dashImgPreview.src = currentImageData;
      handleImageSourceSwitch();
    });
  }

  // ========================================================
  // Tab Switching (Armada Mobil vs Pengaturan Kontak)
  // ========================================================
  const tabBtns = document.querySelectorAll('.dash-tab-btn');
  const paneArmada = document.getElementById('paneArmada');
  const paneKontak = document.getElementById('paneKontak');

  function switchTab(tabId) {
    tabBtns.forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (tabId === 'armada') {
      if (paneArmada) paneArmada.style.display = 'block';
      if (paneKontak) paneKontak.style.display = 'none';
    } else if (tabId === 'kontak') {
      if (paneArmada) paneArmada.style.display = 'none';
      if (paneKontak) paneKontak.style.display = 'block';
      loadCompanyProfileToForm();
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // ========================================================
  // Company Profile & WhatsApp Admin Management
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

  function saveCompanyProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.error('Error saving company profile', err);
    }
  }

  function normalizeWhatsAppNumber(raw) {
    if (!raw) return '6281376385456';
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.slice(1);
    } else if (digits.startsWith('8')) {
      digits = '62' + digits;
    }
    return digits;
  }

  // Profile Form Elements
  const dashFormProfile = document.getElementById('dashFormProfile');
  const profilePhoneWA = document.getElementById('profilePhoneWA');
  const profilePhoneDisplay = document.getElementById('profilePhoneDisplay');
  const profileAddress = document.getElementById('profileAddress');
  const profileEmail = document.getElementById('profileEmail');
  const profileHours = document.getElementById('profileHours');
  const profileBrandName = document.getElementById('profileBrandName');
  const btnResetProfileToDefault = document.getElementById('btnResetProfileToDefault');

  // Preview Elements
  const previewWaLinkCode = document.getElementById('previewWaLinkCode');
  const livePreviewPhone = document.getElementById('livePreviewPhone');
  const livePreviewPhoneWA = document.getElementById('livePreviewPhoneWA');
  const livePreviewAddress = document.getElementById('livePreviewAddress');
  const livePreviewHours = document.getElementById('livePreviewHours');
  const livePreviewEmail = document.getElementById('livePreviewEmail');
  const btnTestWA = document.getElementById('btnTestWA');

  function updateLiveContactPreview(profile) {
    const normWA = normalizeWhatsAppNumber(profile.phoneWA);
    const waLink = `https://wa.me/${normWA}`;

    if (previewWaLinkCode) previewWaLinkCode.textContent = waLink;
    if (livePreviewPhone) livePreviewPhone.textContent = profile.phoneDisplay || profile.phoneWA;
    if (livePreviewPhoneWA) livePreviewPhoneWA.textContent = `Target Link: wa.me/${normWA}`;
    if (livePreviewAddress) livePreviewAddress.textContent = profile.address;
    if (livePreviewHours) livePreviewHours.textContent = profile.operatingHours;
    if (livePreviewEmail) livePreviewEmail.textContent = profile.email;

    if (btnTestWA) {
      btnTestWA.href = `https://wa.me/${normWA}?text=${encodeURIComponent('Halo Admin AutoRent, ini tes pesan dari dashboard')}`;
    }
  }

  function loadCompanyProfileToForm() {
    const profile = getCompanyProfile();
    if (profilePhoneWA) profilePhoneWA.value = profile.phoneWA;
    if (profilePhoneDisplay) profilePhoneDisplay.value = profile.phoneDisplay;
    if (profileAddress) profileAddress.value = profile.address;
    if (profileEmail) profileEmail.value = profile.email;
    if (profileHours) profileHours.value = profile.operatingHours;
    if (profileBrandName) profileBrandName.value = profile.brandName;

    updateLiveContactPreview(profile);
  }

  // Realtime Preview on Typing
  if (profilePhoneWA) {
    profilePhoneWA.addEventListener('input', () => {
      const rawVal = profilePhoneWA.value.trim();
      const normWA = normalizeWhatsAppNumber(rawVal);
      if (previewWaLinkCode) previewWaLinkCode.textContent = `https://wa.me/${normWA}`;
      if (livePreviewPhoneWA) livePreviewPhoneWA.textContent = `Target Link: wa.me/${normWA}`;
      if (btnTestWA) {
        btnTestWA.href = `https://wa.me/${normWA}?text=${encodeURIComponent('Halo Admin AutoRent, ini tes pesan dari dashboard')}`;
      }
      if (profilePhoneDisplay && (!profilePhoneDisplay.value || profilePhoneDisplay.dataset.autofilled === 'true')) {
        profilePhoneDisplay.value = rawVal;
        profilePhoneDisplay.dataset.autofilled = 'true';
        if (livePreviewPhone) livePreviewPhone.textContent = rawVal;
      }
    });
  }

  if (profilePhoneDisplay) {
    profilePhoneDisplay.addEventListener('input', () => {
      profilePhoneDisplay.dataset.autofilled = 'false';
      if (livePreviewPhone) livePreviewPhone.textContent = profilePhoneDisplay.value.trim();
    });
  }

  if (profileAddress) {
    profileAddress.addEventListener('input', () => {
      if (livePreviewAddress) livePreviewAddress.textContent = profileAddress.value.trim();
    });
  }

  if (profileEmail) {
    profileEmail.addEventListener('input', () => {
      if (livePreviewEmail) livePreviewEmail.textContent = profileEmail.value.trim();
    });
  }

  if (profileHours) {
    profileHours.addEventListener('input', () => {
      if (livePreviewHours) livePreviewHours.textContent = profileHours.value.trim();
    });
  }

  // Submit Profile Form
  if (dashFormProfile) {
    dashFormProfile.addEventListener('submit', (e) => {
      e.preventDefault();

      const rawPhone = profilePhoneWA.value.trim();
      const normWA = normalizeWhatsAppNumber(rawPhone);
      let displayPhone = profilePhoneDisplay.value.trim();
      if (!displayPhone) displayPhone = rawPhone;

      const newProfile = {
        phoneWA: normWA,
        phoneDisplay: displayPhone,
        address: profileAddress.value.trim(),
        email: profileEmail.value.trim(),
        operatingHours: profileHours.value.trim(),
        brandName: profileBrandName.value.trim() || 'AutoRent Indonesia'
      };

      saveCompanyProfile(newProfile);
      updateLiveContactPreview(newProfile);
      showToast('Pengaturan nomor WhatsApp, alamat, dan email berhasil disimpan!', 'success');
    });
  }

  // Reset Profile to Default
  if (btnResetProfileToDefault) {
    btnResetProfileToDefault.addEventListener('click', () => {
      if (confirm('Kembalikan semua kontak, nomor WhatsApp, email, dan alamat ke data default?')) {
        saveCompanyProfile(DEFAULT_PROFILE);
        loadCompanyProfileToForm();
        showToast('Kontak berhasil dikembalikan ke data bawaan.', 'success');
      }
    });
  }

  // Listen to Storage events (cross-tab synchronization)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      updateDashboardView();
    } else if (e.key === PROFILE_KEY) {
      loadCompanyProfileToForm();
    }
  });

  // Initial load
  updateDashboardView();
  loadCompanyProfileToForm();
});

