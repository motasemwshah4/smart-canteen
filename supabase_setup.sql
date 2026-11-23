-- ============================================================
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
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-1', 'بيتزا بباروني صغير', 'sandwiches', 1.25, '280 سعرة', '5-7 دقائق', './assets/images/item-1.svg', 'بيتزا صغيرة مخبوزة بعجينة مقرمشة وجبنة الموزاريلا الذائبة الغنية مع شرائح الببروني الشهية وصلصة الطماطم الإيطالية.', 'عجينة طازجة، جبنة موزاريلا، شرائح ببروني بقري، صلصة طماطم، ريحان', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-2', 'بيتزا خضار صغير', 'sandwiches', 1.1, '230 سعرة', '5-7 دقائق', './assets/images/item-2.svg', 'بيتزا صغيرة صحية مغطاة بقطع الفلفل الحلو الملون، الزيتون الأسود، شرائح الفطر، والذرة مع صلصة الطماطم وجبنة خفيفة.', 'فلفل رومي، زيتون أسود، مشروم، طماطم، جبنة موزاريلا خفيفة، أوريجانو', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-3', 'بيتزا باربكيو صغير', 'sandwiches', 1.35, '295 سعرة', '6 دقائق', './assets/images/item-3.svg', 'بيتزا صغيرة شهية مغطاة بصلصة الباربكيو المدخنة وقطع الدجاج المشوي مع البصل الأحمر وجبنة الموزاريلا المذابة.', 'دجاج مشوي، صوص باربكيو مدخن، جبنة موزاريلا، بصل أحمر مقرمش', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-4', 'ساندويش لبنة وتيركي', 'sandwiches', 0.9, '210 سعرة', '3 دقائق', './assets/images/item-4.svg', 'شطيرة خبز فرنسي طازج محشوة باللبنة البلدية الكريمية وشرائح صدر الديك الرومي (تيركي) المدخن مع أوراق النعناع الطازجة والخيار.', 'خبز باغيت طازج، لبنة بلدية، شرائح تيركي مدخن، خيار، نعناع، زيت زيتون', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-5', 'ساندويش خضار', 'sandwiches', 0.75, '170 سعرة', '3 دقائق', './assets/images/item-5.svg', 'ساندويش صحي ومقرمش بطبقات من الخس الطازج، شرائح الطماطم، الخيار، الفلفل الحلو، ولمسة من الحمص أو الجبن النباتي.', 'خبز بالحبوب الكاملة، خس، طماطم، خيار، شرائح جزر، صوص طحينة خفيف', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-6', 'ساندويش جبنة', 'sandwiches', 0.65, '220 سعرة', '2 دقيقة', './assets/images/item-6.svg', 'توست محمص دافئ محشو بطبقات غنية من جبنة الشيدر الصفراء والجبنة البيضاء الذائبة بطريقة مقرمشة ولذيذة.', 'توست بريوش محمص، جبنة شيدر ذهبية، جبنة قشقوان بيضاء، مسحة زبدة خفيفة', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-7', 'ساندويش تيركي وجبنة', 'sandwiches', 1, '260 سعرة', '3 دقائق', './assets/images/item-7.svg', 'ساندويش شهي يجمع بين شرائح التيركي المدخن وجبنة الشيدر الذائبة في خبز التوست أو الصامولي مع أوراق الخس المقرمشة.', 'صدر ديك رومي مدخن، جبنة شيدر، خس طازج، مخلل خيار خفيف، مسحة مايونيز', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-8', 'سيزر', 'salads', 1.2, '190 سعرة', '3 دقائق', './assets/images/item-8.svg', 'سلطة سيزر الكلاسيكية بخس روماني طازج ومقرمش، مكعبات الخبز المحمص المتبلة، جبنة البارميزان وصوص السيزر الكريمي المنعش.', 'خس روماني، كروتونز محمص بالأعشاب، جبن بارميزان، صوص سيزر خفيف', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-9', 'سلطة عربية', 'salads', 0.85, '120 سعرة', '3 دقائق', './assets/images/item-9.svg', 'سلطة عربية طازجة ملونة من مكعبات الخيار والطماطم الناضجة، بقدونس مفروم، نعناع أخضر، مع تتبيلة زيت الزيتون وعصير الليمون الصافي.', 'طماطم، خيار بلدي، بقدونس، نعناع، زيت زيتون بكر، عصير ليمون، رشة سماق', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-10', 'يلنجي', 'salads', 1.3, '210 سعرة', 'جاهز فوراً', './assets/images/item-10.svg', 'ورق عنب محشو بالأرز والخضار المتبلة بصلصة دبس الرمان الفاخرة وزيت الزيتون والليمون، مقبلات باردة وحامضة محبوبة جداً.', 'ورق عنب طري، أرز حبة قصيرة، طماطم، بقدونس، دبس رمان، زيت زيتون، ليمون', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-11', 'سوشي', 'salads', 1.5, '180 سعرة', 'جاهز فوراً', './assets/images/item-11.svg', 'قطع سوشي مدرسية صحية خفيفة (ماكي رولز) محشوة بالأرز المتبل، أصابع الخيار والجزر وقطع الدجاج أو الأفوكادو ملفوفة بأعشاب النوري البحرية.', 'أرز سوشي، أعشاب نوري، جزر مقرمش، خيار، سمسم محمص، صويا صوص خفيف', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-12', 'معكرونة تقليدية بالصلصة الحمراء', 'pasta', 1.25, '320 سعرة', '4 دقائق', './assets/images/item-12.svg', 'طبق مكرونة بيني إيطالية ساخنة مغمورة بصلصة الطماطم الغنية بالأعشاب والريحان مع رشة جبن البارميزان اللذيذة.', 'مكرونة بيني، صلصة مارينارا طماطم طبيعية، ثوم، ريحان، جبن بارميزان', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-13', 'فوتتشيني', 'pasta', 1.6, '390 سعرة', '5 دقائق', './assets/images/item-13.svg', 'مكرونة فوتتشيني عريضة بصلصة الألفريدو البيضاء الكريمية الفاخرة مع شرائح المشروم وجبنة البارميزان الدافئة.', 'مكرونة فوتتشيني، كريمة طهي خفيفة، فطر طازج، زبدة، ثوم مهروس، جبنة بارميزان', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-14', 'ماك اند تشيز', 'pasta', 1.4, '380 سعرة', '4 دقائق', './assets/images/item-14.svg', 'مكرونة حلزونية قصيرة غارقة في مزيج كريمي وذهبي من جبنة الشيدر الذائبة وصلصة الجبن الدافئة ذات المذاق الفائق.', 'مكرونة كوع، جبنة شيدر إنجليزية معتقة، جبنة موزاريلا، حليب، زبدة', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-15', 'بطاطا مهروسة', 'pasta', 0.9, '190 سعرة', '3 دقائق', './assets/images/item-15.svg', 'وعاء بطاطا مهروسة بقوام حريري ناعم ومخفوق بالزبدة الطبيعية والحليب الدافئ مع لمسة خفيفة من مرق الأعشاب.', 'بطاطس طازجة مسلوقة، زبدة طبيعية، حليب قليل الدسم، رشة فلفل أبيض وملح ناعم', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-16', 'حليب وفراولة', 'drinks', 0.5, '140 سعرة', 'جاهز فوراً', './assets/images/item-16.svg', 'علبة حليب طازج بنكهة الفراولة الطبيعية الوردية الغنية بالكالسيوم والفيتامينات المفيدة لصحة الطلاب.', 'حليب طازج مبستر، خلاصة الفراولة الطبيعية، فيتامين د وكالسيوم', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-17', 'حليب وموز', 'drinks', 0.5, '150 سعرة', 'جاهز فوراً', './assets/images/item-17.svg', 'مشروب حليب مغذٍ بنكهة الموز اللذيذة يمنح الطالب طاقة طبيعية ونشاطاً طوال اليوم المدرسي.', 'حليب طازج، هريس الموز الطبيعي، كالسيوم، مغنيسيوم', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-18', 'عصير فواكه مشكلة', 'drinks', 0.6, '110 سعرة', 'جاهز فوراً', './assets/images/item-18.svg', 'كوكتيل عصير فواكه طبيعي مثلج يمزج بين عصائر البرتقال، المانجو، التفاح والأناناس لطعم منعش ومنشط.', 'عصائر طبيعية مركزة: برتقال، مانجو، تفاح، جوافة', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-19', 'عصير برتقال', 'drinks', 0.6, '95 سعرة', 'جاهز فوراً', './assets/images/item-19.svg', 'كوب عصير برتقال طبيعي معصور وطازج بلونه البرتقالي المشرق وغني بفيتامين ج المعزز للمناعة.', 'برتقال طبيعي 100% طازج بدون سكر مضاف', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-20', 'عصير تفاح', 'drinks', 0.6, '100 سعرة', 'جاهز فوراً', './assets/images/item-20.svg', 'عصير تفاح نقي بلون ذهبي صافٍ ونكهة سكرية طبيعية منعشة ومحبوبة في أوقات الفسحة.', 'عصير تفاح نقي 100%، فيتامين ج', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-21', 'شنينه', 'drinks', 0.4, '90 سعرة', 'جاهز فوراً', './assets/images/item-21.svg', 'عبوة لبن شنينة بلدي بارد ومنعش ذو حموضة متوازنة ورشة ملح خفيفة تروي العطش وتنعش المعدة.', 'لبن مخيض طبيعي، ماء نقي، ملح خفيف، بكتيريا حمض اللاكتيك المفيدة', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-22', 'شنينه فراولة', 'drinks', 0.5, '115 سعرة', 'جاهز فوراً', './assets/images/item-22.svg', 'ابتكار عصري يجمع بين لبن الشنينة المنعش ونكهة الفراولة الحلوة لتجربة لذيذة وفريدة.', 'لبن شنينة، نكهة فراولة طبيعية، ملح خفيف متوازن', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-23', 'ماء صغير', 'drinks', 0.25, '0 سعرة', 'جاهز فوراً', './assets/images/item-23.svg', 'عبوة مياه معدنية نقية صغيرة الحجم سعة 330 مل باردة ومناسبة لحملها في اليد أو الحقيبة.', 'مياه آبار طبيعية مصفاة ومعقمة بالأوزون', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-24', 'طبق اليوم من الارز', 'main', 2, '450 سعرة', '5 دقائق', './assets/images/item-24.svg', 'طبق يومي مدرسي متكامل يحتوي على أرز بسمتي فاخر مطهو بالبهارات العطرية الهادئة مع قطع الدجاج المحمر الشهية وصلصة المرق الدافئة.', 'أرز بسمتي، صدر دجاج متبل، خضار مشكلة، مرق دجاج طازج، مكسرات خفيفة محمصة', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-25', 'براوني', 'sweets', 0.75, '240 سعرة', 'جاهز فوراً', './assets/images/item-25.svg', 'مربع براوني غني بالشوكولاتة الفاخرة الداكنة بطبقة علوية مقرمشة وقلب فدج طري وداكن يذوب في الفم.', 'شوكولاتة داكنة، كاكاو هولندي، زبدة، بيض، دقيق، حبيبات شوكولاتة', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-26', 'كوكيز', 'sweets', 0.6, '210 سعرة', 'جاهز فوراً', './assets/images/item-26.svg', 'حبة كوكيز كلاسيكية ذهبية مقرمشة الحواف وطرية القلب محشوة بقطع شوكولاتة الحليب الذائبة الشهية.', 'دقيق أبيض، سكر بني، حبيبات شوكولاتة بالحليب، زبدة، فانيليا', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-27', 'ليزي كيك', 'sweets', 0.7, '220 سعرة', 'جاهز فوراً', './assets/images/item-27.svg', 'قطعة ليزي كيك كلاسيكية مكونة من بسكويت الشاي المقرمش الممزوج بصلصة الشوكولاتة الغنية والمثلجة بطريقة منزلية شهية.', 'بسكويت شاي سادة، كاكاو، حليب مكثف محلى، زبدة، رشة جوز هند للتزيين', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-28', 'كب كيك', 'sweets', 0.5, '190 سعرة', 'جاهز فوراً', './assets/images/item-28.svg', 'حبة كب كيك إسفنجية هشة ولطيفة مزينة بطبقة كريمة الفانيليا الوردية وحبيبات سكر ملونة تشبه ألوان قوس قزح.', 'كيك فانيليا إسفنجي، كريمة زبدة الفانيليا، سكاكر ملونة', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
INSERT INTO public.menu_items (id, name, category, price, calories, prep_time, image, image_description, ingredients, available, is_popular)
VALUES ('item-29', 'كورن فليكس بار', 'sweets', 0.45, '160 سعرة', 'جاهز فوراً', './assets/images/item-29.svg', 'لوح سناك مقرمش مصنوع من رقائق الذرة الذهبية المحمصة الممزوجة بالعسل الطبيعي مع قاعدة شوكولاتة خفيفة.', 'رقائق كورن فليكس محمصة، عسل نحل، زبدة، شوكولاتة حليب خفيفة', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  image_description = EXCLUDED.image_description,
  ingredients = EXCLUDED.ingredients;
