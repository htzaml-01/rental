// AutoRent - Dashboard Admin Logic
// Integrated with Supabase Cloud Database & Stock Management
// Strictly without any emojis or emoticons

document.addEventListener('DOMContentLoaded', () => {
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

  // ========================================================
  // DOM Elements
  // ========================================================
  const statTotalCars = document.getElementById('statTotalCars');
  const statTotalStock = document.getElementById('statTotalStock');
  const statDbMode = document.getElementById('statDbMode');
  const statDbDesc = document.getElementById('statDbDesc');
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

  // ========================================================
  // Render Table & Fleet Stats
  // ========================================================
  async function updateDashboardView() {
    let allCars = [];
    if (window.AutoRentDB && typeof window.AutoRentDB.getAllCars === 'function') {
      try {
        allCars = await window.AutoRentDB.getAllCars();
      } catch (err) {
        console.error('Failed to get cars from AutoRentDB', err);
      }
    }

    if (!allCars || allCars.length === 0) {
      allCars = window.AutoRentDB ? window.AutoRentDB.DEFAULT_FLEET : [];
    }

    // Update Stats Cards
    const totalCount = allCars.length;
    const totalStock = allCars.reduce((acc, car) => acc + (car.stock || 0), 0);

    if (statTotalCars) statTotalCars.textContent = totalCount;
    if (statTotalStock) statTotalStock.textContent = `${totalStock} Unit`;

    const isConnected = window.AutoRentDB && window.AutoRentDB.isConnected();
    if (statDbMode) {
      statDbMode.textContent = isConnected ? 'Supabase Cloud' : 'Lokal Offline';
      statDbMode.style.color = isConnected ? '#10b981' : 'var(--secondary)';
    }
    if (statDbDesc) {
      statDbDesc.textContent = isConnected ? 'Tersinkron ke server cloud' : 'Tersimpan di browser';
    }

    // Filter
    const filteredCars = allCars.filter(car => {
      const matchesCategory = (activeCategoryFilter === 'all' || car.category === activeCategoryFilter);
      const matchesSearch = (car.name.toLowerCase().includes(currentSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    if (!dashCarsTableBody) return;
    dashCarsTableBody.innerHTML = '';

    if (filteredCars.length === 0) {
      dashCarsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">
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

      const stock = (typeof car.stock === 'number') ? car.stock : 3;
      const stockClass = (stock <= 0) ? 'stock-empty' : (stock <= 3 ? 'stock-low' : 'stock-available');
      const stockLabel = (stock <= 0) ? 'Habis' : (stock <= 3 ? 'Menipis' : 'Sedia');

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
          <div class="stock-ctrl-group">
            <button type="button" class="btn-stock-step btn-stock-dec" data-id="${car.id}" data-current="${stock}" data-name="${car.name}" title="Kurangi 1 unit">-</button>
            <span class="stock-pill ${stockClass}">${stock} Unit</span>
            <button type="button" class="btn-stock-step btn-stock-inc" data-id="${car.id}" data-current="${stock}" data-name="${car.name}" title="Tambah 1 unit">+</button>
          </div>
          <span class="stock-badge-sub ${stockClass}">${stockLabel}</span>
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

    // Attach stock step button handlers
    dashCarsTableBody.querySelectorAll('.btn-stock-step').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const current = parseInt(btn.getAttribute('data-current'), 10) || 0;
        const isInc = btn.classList.contains('btn-stock-inc');
        const newStock = isInc ? current + 1 : Math.max(0, current - 1);

        if (window.AutoRentDB) {
          await window.AutoRentDB.updateCarStock(id, newStock);
          showToast(`Stok ${name} berhasil diubah menjadi ${newStock} unit.`, 'success');
          updateDashboardView();
        }
      });
    });

    // Attach delete button handlers
    dashCarsTableBody.querySelectorAll('.btn-delete-car').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idToDelete = btn.getAttribute('data-id');
        if (confirm('Hapus mobil ini dari katalog armada?')) {
          if (window.AutoRentDB) {
            await window.AutoRentDB.deleteCar(idToDelete);
            showToast('Mobil berhasil dihapus dari katalog.', 'success');
            updateDashboardView();
          }
        }
      });
    });
  }

  // Reset all custom cars
  if (btnResetCustomCars) {
    btnResetCustomCars.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin menghapus SEMUA mobil buatan admin? Katalog akan kembali ke unit bawaan.')) {
        localStorage.setItem('autorent_custom_cars', '[]');
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
    dashFormAddCar.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('carName').value.trim();
      const category = document.getElementById('carCategory').value;
      const price = parseInt(document.getElementById('carPrice').value, 10);
      const transmission = document.getElementById('carTransmission').value;
      const capacity = document.getElementById('carCapacity').value;
      const stock = parseInt(document.getElementById('carStock').value, 10) || 3;
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
        stock: stock,
        badge: badge,
        desc: desc,
        image: currentImageData || 'Asset/Silver Toyota Avanza Cityscape Showcase.png',
        createdAt: new Date().toISOString()
      };

      if (window.AutoRentDB) {
        await window.AutoRentDB.addCar(newCar);
      }

      updateDashboardView();
      showToast(`Mobil ${name} dengan stok ${stock} unit berhasil dipublikasikan!`, 'success');

      // Reset Form
      dashFormAddCar.reset();
      currentImageData = 'Asset/Silver Toyota Avanza Cityscape Showcase.png';
      dashImgPreview.src = currentImageData;
      handleImageSourceSwitch();
    });
  }

  // ========================================================
  // Tab Switching (Armada Mobil vs Kontak vs Supabase)
  // ========================================================
  const tabBtns = document.querySelectorAll('.dash-tab-btn');
  const paneArmada = document.getElementById('paneArmada');
  const paneKontak = document.getElementById('paneKontak');
  const paneSupabase = document.getElementById('paneSupabase');

  function switchTab(tabId) {
    tabBtns.forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (paneArmada) paneArmada.style.display = (tabId === 'armada') ? 'block' : 'none';
    if (paneKontak) paneKontak.style.display = (tabId === 'kontak') ? 'block' : 'none';
    if (paneSupabase) paneSupabase.style.display = (tabId === 'supabase') ? 'block' : 'none';

    if (tabId === 'kontak') {
      loadCompanyProfileToForm();
    } else if (tabId === 'supabase') {
      loadSupabaseConfigToForm();
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

  // ========================================================
  // Supabase Database Management (Tab 3)
  // ========================================================
  const sbProjectUrl = document.getElementById('sbProjectUrl');
  const sbAnonKey = document.getElementById('sbAnonKey');
  const dashFormSupabase = document.getElementById('dashFormSupabase');
  const btnTestSupabaseConn = document.getElementById('btnTestSupabaseConn');
  const btnClearSupabaseConn = document.getElementById('btnClearSupabaseConn');
  const btnMigrateToSupabase = document.getElementById('btnMigrateToSupabase');
  const btnCopySql = document.getElementById('btnCopySql');

  const dbConnStatusDot = document.getElementById('dbConnStatusDot');
  const dbConnStatusText = document.getElementById('dbConnStatusText');
  const tabDbStatusPill = document.getElementById('tabDbStatusPill');

  function updateDbConnectionUI() {
    if (!window.AutoRentDB) return;
    const isConn = window.AutoRentDB.isConnected();

    if (isConn) {
      if (dbConnStatusDot) {
        dbConnStatusDot.className = 'status-dot status-dot-online';
      }
      if (dbConnStatusText) {
        dbConnStatusText.textContent = 'Terhubung ke Supabase Cloud';
      }
      if (tabDbStatusPill) {
        tabDbStatusPill.textContent = 'Cloud Aktif';
        tabDbStatusPill.className = 'dash-tab-pill-status status-connected';
      }
    } else {
      if (dbConnStatusDot) {
        dbConnStatusDot.className = 'status-dot status-dot-offline';
      }
      if (dbConnStatusText) {
        dbConnStatusText.textContent = 'Mode Lokal Offline (Belum Terhubung)';
      }
      if (tabDbStatusPill) {
        tabDbStatusPill.textContent = 'Lokal Offline';
        tabDbStatusPill.className = 'dash-tab-pill-status';
      }
    }
  }

  function loadSupabaseConfigToForm() {
    if (!window.AutoRentDB) return;
    const config = window.AutoRentDB.getConfig();
    if (sbProjectUrl) sbProjectUrl.value = config.url;
    if (sbAnonKey) sbAnonKey.value = config.key;
    updateDbConnectionUI();
  }

  if (dashFormSupabase) {
    dashFormSupabase.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = sbProjectUrl.value.trim();
      const key = sbAnonKey.value.trim();

      if (!url || !key) {
        showToast('Project URL dan Anon Key harus diisi.', 'error');
        return;
      }

      window.AutoRentDB.saveConfig(url, key);
      updateDbConnectionUI();

      showToast('Menguji koneksi ke Supabase...', 'success');
      const test = await window.AutoRentDB.testConnection(url, key);
      if (test.success) {
        showToast('Kredensial Supabase tersimpan dan terhubung!', 'success');
      } else {
        showToast(test.message, 'error');
      }
      updateDashboardView();
    });
  }

  if (btnTestSupabaseConn) {
    btnTestSupabaseConn.addEventListener('click', async () => {
      const url = sbProjectUrl.value.trim();
      const key = sbAnonKey.value.trim();

      if (!url || !key) {
        showToast('Masukkan URL dan Anon Key terlebih dahulu.', 'error');
        return;
      }

      showToast('Menghubungkan ke server Supabase...', 'success');
      const res = await window.AutoRentDB.testConnection(url, key);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    });
  }

  if (btnClearSupabaseConn) {
    btnClearSupabaseConn.addEventListener('click', () => {
      if (confirm('Putus koneksi Supabase? Sistem akan kembali menggunakan penyimpanan lokal browser.')) {
        window.AutoRentDB.clearConfig();
        if (sbProjectUrl) sbProjectUrl.value = '';
        if (sbAnonKey) sbAnonKey.value = '';
        updateDbConnectionUI();
        updateDashboardView();
        showToast('Koneksi Supabase diputus. Mode lokal aktif.', 'success');
      }
    });
  }

  if (btnMigrateToSupabase) {
    btnMigrateToSupabase.addEventListener('click', async () => {
      if (!window.AutoRentDB.isConnected()) {
        showToast('Harap hubungkan Supabase terlebih dahulu sebelum migrasi data.', 'error');
        return;
      }

      try {
        btnMigrateToSupabase.disabled = true;
        btnMigrateToSupabase.innerHTML = '<span>Mengunggah data...</span>';
        const count = await window.AutoRentDB.migrateLocalToSupabase();
        showToast(`Sukses mengunggah ${count} unit mobil ke database Supabase!`, 'success');
        updateDashboardView();
      } catch (err) {
        showToast(`Gagal migrasi: ${err.message}`, 'error');
      } finally {
        btnMigrateToSupabase.disabled = false;
        btnMigrateToSupabase.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="svg-icon">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          <span>Sinkronkan Armada Lokal ke Supabase Cloud</span>
        `;
      }
    });
  }

  if (btnCopySql) {
    btnCopySql.addEventListener('click', () => {
      const sqlText = `-- Skrip Tabel cars & RLS AutoRent Indonesia
CREATE TABLE IF NOT EXISTS public.cars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price BIGINT NOT NULL,
  transmission TEXT DEFAULT 'Matic / Manual',
  capacity TEXT DEFAULT '7 Penumpang',
  stock INTEGER DEFAULT 3 CHECK (stock >= 0),
  badge TEXT DEFAULT 'Tersedia',
  image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_custom BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read cars" 
ON public.cars FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow insert cars" 
ON public.cars FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow update cars" 
ON public.cars FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow delete cars" 
ON public.cars FOR DELETE TO anon, authenticated USING (true);`;

      navigator.clipboard.writeText(sqlText).then(() => {
        showToast('Skrip SQL berhasil disalin ke clipboard!', 'success');
      }).catch(() => {
        showToast('Gagal menyalin otomatis, silakan salin dari kotak teks.', 'error');
      });
    });
  }

  // ========================================================
  // Listeners & Initialization
  // ========================================================
  window.addEventListener('storage', (e) => {
    if (e.key === 'autorent_custom_cars' || e.key === 'autorent_fleet_stocks' || e.key === 'autorent_supabase_url') {
      updateDashboardView();
      updateDbConnectionUI();
    } else if (e.key === 'autorent_company_profile') {
      loadCompanyProfileToForm();
    }
  });

  window.addEventListener('autorent:db_change', () => {
    updateDashboardView();
    updateDbConnectionUI();
  });

  // Initial load
  updateDashboardView();
  loadCompanyProfileToForm();
  loadSupabaseConfigToForm();
});
