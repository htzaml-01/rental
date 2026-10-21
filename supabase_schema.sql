-- ==========================================================
-- AutoRent Indonesia - Supabase Database Schema
-- Jalankan skrip ini di SQL Editor pada Dashboard Supabase Anda
-- ==========================================================

-- 1. Buat Tabel cars untuk menyimpan katalog dan stok mobil
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

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Izinkan publik/pengunjung membaca data mobil (Read)
CREATE POLICY "Allow public read cars" 
ON public.cars FOR SELECT 
TO anon, authenticated 
USING (true);

-- 4. Policy: Izinkan admin menambah data mobil (Insert)
CREATE POLICY "Allow insert cars" 
ON public.cars FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 5. Policy: Izinkan update stok & detail mobil (Update)
CREATE POLICY "Allow update cars" 
ON public.cars FOR UPDATE 
TO anon, authenticated 
USING (true);

-- 6. Policy: Izinkan menghapus mobil (Delete)
CREATE POLICY "Allow delete cars" 
ON public.cars FOR DELETE 
TO anon, authenticated 
USING (true);

-- 7. Masukkan Data Bawaan Katalog beserta Stok Awal
INSERT INTO public.cars (id, name, category, price, transmission, capacity, stock, badge, image, description, is_custom)
VALUES
  (
    'default_1', 
    'Mitsubishi Xpander', 
    'mpv', 
    450000, 
    'Matic / Manual', 
    '7 Penumpang', 
    4, 
    'Tersedia', 
    'Asset/Mitsubishi Xpander Cityscape Showcase.png', 
    'Kabin mewah dan senyap, suspensi nyaman untuk perjalanan luar kota maupun keluarga.', 
    false
  ),
  (
    'default_2', 
    'Toyota All New Avanza', 
    'mpv', 
    400000, 
    'Matic CVT', 
    '7 Penumpang', 
    5, 
    'Paling Populer', 
    'Asset/Silver Toyota Avanza Cityscape Showcase.png', 
    'Mobil keluarga andalan dengan efisiensi bahan bakar tinggi dan bagasi luas.', 
    false
  ),
  (
    'default_3', 
    'Suzuki All New Ertiga', 
    'mpv', 
    380000, 
    'Automatic', 
    '7 Penumpang', 
    3, 
    'Tersedia', 
    'Asset/Silver Suzuki Ertiga City Showcase.png', 
    'Kenyamanan ekstra di jok baris kedua serta bantingan suspensi empuk dan stabil.', 
    false
  ),
  (
    'default_4', 
    'Daihatsu All New Xenia', 
    'mpv', 
    370000, 
    'Manual / Matic', 
    '7 Penumpang', 
    3, 
    'Tersedia', 
    'Asset/Silver Daihatsu Xenia Cityscape Showcase.png', 
    'Pilihan ekonomis dengan kapasitas lega, cocok untuk rute dalam maupun luar kota.', 
    false
  ),
  (
    'default_5', 
    'Toyota New Agya', 
    'city', 
    300000, 
    'Matic / Manual', 
    '5 Penumpang', 
    2, 
    'Paling Hemat', 
    'Asset/Silver Toyota Agya Cityscape Showcase.png', 
    'Lincah menyusuri jalanan kota, mudah diparkir, dan konsumsi bensin sangat hemat.', 
    false
  ),
  (
    'default_6', 
    'Daihatsu Sigra', 
    'mpv', 
    320000, 
    'Manual / Matic', 
    '7 Penumpang', 
    4, 
    'Tersedia', 
    'Asset/Silver Toyota Sigra Cityscape Ad.png', 
    'MPV 7-seater lincah dan sangat irit, pas untuk kebutuhan harian.', 
    false
  )
ON CONFLICT (id) DO UPDATE SET
  stock = EXCLUDED.stock,
  price = EXCLUDED.price,
  transmission = EXCLUDED.transmission;
