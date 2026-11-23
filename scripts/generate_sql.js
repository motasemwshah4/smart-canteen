// scripts/generate_sql.js - توليد سكربت SQL لإنشاء جداول Supabase وتعبئتها بالبيانات الأصلية
import fs from 'fs';
import { MENU_ITEMS, DEFAULT_USERS, INITIAL_ORDERS } from '../js/data.js';

let sql = `-- ============================================================
-- سكربت إعداد قاعدة بيانات مقصف الفُسحة - مشروع الطالبة زينة اللبدي
-- منصة Supabase
-- ============================================================

-- 1. جدول قائمة الطعام والأصناف (29 صنفاً)
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    calories TEXT,
    prep_time TEXT,
    image TEXT,
    image_description TEXT,
    ingredients TEXT,
    available BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول طلبات الطلاب لفسحة 10:00 صباحاً
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    grade TEXT,
    break_id TEXT DEFAULT 'break-10am',
    break_name TEXT DEFAULT 'الفسحة المدرسية (10:00 صباحاً)',
    order_time TEXT,
    items JSONB NOT NULL,
    total_price NUMERIC NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول حسابات الطلاب وإدارة المقصف
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    grade TEXT,
    section TEXT,
    password TEXT DEFAULT '123',
    title TEXT,
    avatar TEXT,
    badge_color TEXT,
    is_creator BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول معرّفات الدخول السريع
CREATE TABLE IF NOT EXISTS public.quick_logins (
    user_id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل سياسات الأمان (Row Level Security) مع إتاحة الوصول للقراءة والكتابة
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon public access to menu_items" ON public.menu_items;
CREATE POLICY "Anon public access to menu_items" ON public.menu_items FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon public access to orders" ON public.orders;
CREATE POLICY "Anon public access to orders" ON public.orders FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon public access to users" ON public.users;
CREATE POLICY "Anon public access to users" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE public.quick_logins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon public access to quick_logins" ON public.quick_logins;
CREATE POLICY "Anon public access to quick_logins" ON public.quick_logins FOR ALL TO anon USING (true) WITH CHECK (true);

-- تفعيل التحديث اللحظي المباشر (Realtime)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quick_logins;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- 5. إدراج الحسابات الافتراضية (زينة اللبدي وصاحب المقصف)
INSERT INTO public.users (id, username, name, role, grade, section, password, title, is_creator)
VALUES 
  ('zaina', 'zaina', 'زينة اللبدي', 'student', 'الصف الثامن', 'الشعبة أ', '123', 'طالبة في الصف الثامن (أ) • صاحبة فكرة ومصممة المشروع 🌟', true),
  ('owner', 'owner', 'إدارة المقصف (المسؤول)', 'owner', 'إدارة المدرسة', 'قسم المقصف', '123', 'مسؤول إعداد وتسليم وجبات الفسحة بالمدرسة', false)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  role = EXCLUDED.role, 
  grade = EXCLUDED.grade, 
  section = EXCLUDED.section;

-- 6. إدراج حسابات الدخول السريع الأولية
INSERT INTO public.quick_logins (user_id)
VALUES ('zaina'), ('owner')
ON CONFLICT (user_id) DO NOTHING;

-- 7. إدراج كافة أصناف قائمة المقصف (29 صنفاً مع أوصاف الصور الدقيقة)
`;

MENU_ITEMS.forEach(item => {
  const esc = (s) => (s ? s.replace(/'/g, "''") : '');
  sql += `INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('${item.id}', '${esc(item.name)}', '${item.category}', ${item.price}, '${esc(item.calories)}', '${esc(item.prepTime)}', '${item.image}', '${esc(item.imageDescription)}', '${esc(item.ingredients)}', ${item.available !== false}, ${!!item.isPopular})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
`;
});

fs.writeFileSync('supabase_setup.sql', sql);
console.log('Successfully generated supabase_setup.sql with 29 items, users, and realtime configuration.');
