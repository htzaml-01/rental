// AutoRent Indonesia - Supabase Database Client & Stock Manager
// Strictly without any emojis or emoticons

(function() {
  'use strict';

  const STORAGE_KEYS = {
    URL: 'autorent_supabase_url',
    KEY: 'autorent_supabase_key',
    CARS: 'autorent_custom_cars',
    STOCKS: 'autorent_fleet_stocks'
  };

  // Default fleet in the catalog with initial stock values
  const DEFAULT_FLEET = [
    {
      id: 'default_1',
      name: 'Mitsubishi Xpander',
      category: 'mpv',
      price: 450000,
      transmission: 'Matic / Manual',
      capacity: '7 Penumpang',
      stock: 4,
      badge: 'Tersedia',
      image: 'Asset/Mitsubishi Xpander Cityscape Showcase.png',
      desc: 'Kabin mewah dan senyap, suspensi nyaman untuk perjalanan luar kota maupun keluarga.',
      isCustom: false
    },
    {
      id: 'default_2',
      name: 'Toyota All New Avanza',
      category: 'mpv',
      price: 400000,
      transmission: 'Matic CVT',
      capacity: '7 Penumpang',
      stock: 5,
      badge: 'Paling Populer',
      image: 'Asset/Silver Toyota Avanza Cityscape Showcase.png',
      desc: 'Mobil keluarga andalan dengan efisiensi bahan bakar tinggi dan bagasi luas.',
      isCustom: false
    },
    {
      id: 'default_3',
      name: 'Suzuki All New Ertiga',
      category: 'mpv',
      price: 380000,
      transmission: 'Automatic',
      capacity: '7 Penumpang',
      stock: 3,
      badge: 'Tersedia',
      image: 'Asset/Silver Suzuki Ertiga City Showcase.png',
      desc: 'Kenyamanan ekstra di jok baris kedua serta bantingan suspensi empuk dan stabil.',
      isCustom: false
    },
    {
      id: 'default_4',
      name: 'Daihatsu All New Xenia',
      category: 'mpv',
      price: 370000,
      transmission: 'Manual / Matic',
      capacity: '7 Penumpang',
      stock: 3,
      badge: 'Tersedia',
      image: 'Asset/Silver Daihatsu Xenia Cityscape Showcase.png',
      desc: 'Pilihan ekonomis dengan kapasitas lega, cocok untuk rute dalam maupun luar kota.',
      isCustom: false
    },
    {
      id: 'default_5',
      name: 'Toyota New Agya',
      category: 'city',
      price: 300000,
      transmission: 'Matic / Manual',
      capacity: '5 Penumpang',
      stock: 2,
      badge: 'Paling Hemat',
      image: 'Asset/Silver Toyota Agya Cityscape Showcase.png',
      desc: 'Lincah menyusuri jalanan kota, mudah diparkir, dan konsumsi bensin sangat hemat.',
      isCustom: false
    },
    {
      id: 'default_6',
      name: 'Daihatsu Sigra',
      category: 'mpv',
      price: 320000,
      transmission: 'Manual / Matic',
      capacity: '7 Penumpang',
      stock: 4,
      badge: 'Tersedia',
      image: 'Asset/Silver Toyota Sigra Cityscape Ad.png',
      desc: 'MPV 7-seater lincah dan sangat irit, pas untuk kebutuhan harian.',
      isCustom: false
    }
  ];

  // Helper: Read stored stock overrides
  function getLocalStockOverrides() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STOCKS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLocalStockOverrides(stocks) {
    try {
      localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(stocks));
    } catch (e) {
      console.error('Error saving local stock overrides', e);
    }
  }

  // Helper: Read custom cars from localStorage
  function getLocalCustomCars() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalCustomCars(cars) {
    try {
      localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
    } catch (e) {
      console.error('Error saving local custom cars', e);
    }
  }

  const DEFAULT_SUPABASE = {
    URL: 'https://gxjlmpqptkcdtwktrwms.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4amxtcHFwdGtjZHR3a3Ryd21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1NjQ2MDEsImV4cCI6MjEwODE0MDYwMX0.k6Q950aYcwcHYtWuN6h1RE7rRxJzFZOLA07oqsWyr8Q'
  };

  // Get active Supabase configuration
  function getConfig() {
    return {
      url: (localStorage.getItem(STORAGE_KEYS.URL) || DEFAULT_SUPABASE.URL).trim(),
      key: (localStorage.getItem(STORAGE_KEYS.KEY) || DEFAULT_SUPABASE.KEY).trim()
    };
  }

  // Initialize Supabase Client if credentials exist
  let clientInstance = null;
  function getSupabaseClient() {
    if (clientInstance) return clientInstance;
    const config = getConfig();
    if (window.supabase && config.url && config.key) {
      try {
        clientInstance = window.supabase.createClient(config.url, config.key);
      } catch (err) {
        console.error('Failed to create Supabase client', err);
        clientInstance = null;
      }
    }
    return clientInstance;
  }

  function isConnected() {
    const config = getConfig();
    return Boolean(config.url && config.key && window.supabase);
  }

  // Test connection to Supabase
  async function testConnection(url, key) {
    if (!window.supabase) {
      return {
        success: false,
        message: 'Library Supabase JS belum termuat. Periksa koneksi internet.'
      };
    }

    try {
      const testClient = window.supabase.createClient(url.trim(), key.trim());
      const { data, error } = await testClient.from('cars').select('id, name, stock').limit(5);

      if (error) {
        if (error.code === 'PGRST205' || String(error.message).includes('Could not find the table')) {
          return {
            success: false,
            needsTable: true,
            message: 'Koneksi ke Supabase Project berhasil! Namun tabel "cars" belum dibuat di database. Harap salin skrip SQL dan jalankan di SQL Editor Supabase.'
          };
        }
        return {
          success: false,
          message: `Koneksi gagal: ${error.message}. Pastikan tabel "cars" sudah dibuat menggunakan file supabase_schema.sql.`
        };
      }

      return {
        success: true,
        message: `Koneksi Supabase berhasil! Terbaca ${data ? data.length : 0} mobil dari cloud.`,
        data: data
      };
    } catch (err) {
      return {
        success: false,
        message: `Terjadi kesalahan saat menghubungkan: ${err.message}`
      };
    }
  }

  // Save config
  function saveConfig(url, key) {
    localStorage.setItem(STORAGE_KEYS.URL, url.trim());
    localStorage.setItem(STORAGE_KEYS.KEY, key.trim());
    clientInstance = null; // Reset instance
    getSupabaseClient();
    window.dispatchEvent(new Event('autorent:db_change'));
  }

  // Clear config (revert to offline / local mode)
  function clearConfig() {
    localStorage.removeItem(STORAGE_KEYS.URL);
    localStorage.removeItem(STORAGE_KEYS.KEY);
    clientInstance = null;
    window.dispatchEvent(new Event('autorent:db_change'));
  }

  // Get all cars (Cloud first, graceful fallback to local)
  async function getAllCars() {
    const client = getSupabaseClient();
    const stockOverrides = getLocalStockOverrides();

    if (client) {
      try {
        const { data, error } = await client
          .from('cars')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          // Normalize Supabase records
          return data.map(item => ({
            id: String(item.id),
            name: item.name,
            category: item.category,
            price: Number(item.price),
            transmission: item.transmission || 'Matic / Manual',
            capacity: item.capacity || '7 Penumpang',
            stock: (typeof item.stock === 'number') ? item.stock : 3,
            badge: item.badge || 'Tersedia',
            image: item.image || 'Asset/Silver Toyota Avanza Cityscape Showcase.png',
            desc: item.description || '',
            isCustom: Boolean(item.is_custom)
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage', err);
      }
    }

    // Local / Offline fallback
    const customCars = getLocalCustomCars().map(c => ({
      ...c,
      stock: (typeof c.stock === 'number') ? c.stock : 3,
      isCustom: true
    }));

    const baseCars = DEFAULT_FLEET.map(c => {
      const stock = (stockOverrides[c.id] !== undefined) ? stockOverrides[c.id] : c.stock;
      return { ...c, stock: stock };
    });

    return [...customCars, ...baseCars];
  }

  // Add a new car
  async function addCar(car) {
    const client = getSupabaseClient();

    // 1. Add locally
    const customCars = getLocalCustomCars();
    customCars.unshift(car);
    saveLocalCustomCars(customCars);

    // 2. Add to Supabase if connected
    if (client) {
      try {
        const payload = {
          id: car.id,
          name: car.name,
          category: car.category,
          price: car.price,
          transmission: car.transmission,
          capacity: car.capacity,
          stock: car.stock,
          badge: car.badge,
          image: car.image,
          description: car.desc || '',
          is_custom: true
        };

        const { error } = await client.from('cars').insert([payload]);
        if (error) {
          console.error('Supabase insert error', error);
        }
      } catch (err) {
        console.error('Supabase insert exception', err);
      }
    }

    window.dispatchEvent(new Event('autorent:db_change'));
    return car;
  }

  // Delete a car
  async function deleteCar(id) {
    const client = getSupabaseClient();

    // 1. Delete locally
    let customCars = getLocalCustomCars();
    customCars = customCars.filter(c => c.id !== id);
    saveLocalCustomCars(customCars);

    // 2. Delete in Supabase if connected
    if (client) {
      try {
        const { error } = await client.from('cars').delete().eq('id', id);
        if (error) {
          console.error('Supabase delete error', error);
        }
      } catch (err) {
        console.error('Supabase delete exception', err);
      }
    }

    window.dispatchEvent(new Event('autorent:db_change'));
    return true;
  }

  // Update car stock
  async function updateCarStock(id, newStock) {
    const stockVal = Math.max(0, parseInt(newStock, 10) || 0);
    const client = getSupabaseClient();

    // 1. Update locally
    const customCars = getLocalCustomCars();
    let foundInCustom = false;
    for (let c of customCars) {
      if (c.id === id) {
        c.stock = stockVal;
        foundInCustom = true;
        break;
      }
    }

    if (foundInCustom) {
      saveLocalCustomCars(customCars);
    } else {
      // Default car stock override
      const overrides = getLocalStockOverrides();
      overrides[id] = stockVal;
      saveLocalStockOverrides(overrides);
    }

    // 2. Update in Supabase if connected
    if (client) {
      try {
        const { error } = await client
          .from('cars')
          .update({ stock: stockVal })
          .eq('id', id);

        if (error) {
          console.error('Supabase stock update error', error);
        }
      } catch (err) {
        console.error('Supabase stock update exception', err);
      }
    }

    window.dispatchEvent(new Event('autorent:db_change'));
    return stockVal;
  }

  // Migrate local fleet to Supabase table
  async function migrateLocalToSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase belum terhubung. Harap simpan URL dan Anon Key terlebih dahulu.');
    }

    const allCars = await getAllCars();
    const rows = allCars.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      price: c.price,
      transmission: c.transmission,
      capacity: c.capacity,
      stock: c.stock,
      badge: c.badge,
      image: c.image,
      description: c.desc || '',
      is_custom: Boolean(c.isCustom)
    }));

    const { data, error } = await client
      .from('cars')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      throw new Error(error.message);
    }

    window.dispatchEvent(new Event('autorent:db_change'));
    return rows.length;
  }

  // Public API
  window.AutoRentDB = {
    DEFAULT_FLEET,
    STORAGE_KEYS,
    getConfig,
    saveConfig,
    clearConfig,
    isConnected,
    testConnection,
    getAllCars,
    addCar,
    deleteCar,
    updateCarStock,
    migrateLocalToSupabase
  };
})();
