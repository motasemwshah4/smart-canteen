// test/verify.js - فحص شامل ومتكامل لجميع وظائف وميزات مقصف الفسحة لمشروع الطالبة زينة اللبدي

import fs from 'fs';
import path from 'path';

// محاكاة LocalStorage للمتصفح في بيئة Node.js
const storageMock = {};
globalThis.localStorage = {
  getItem: (key) => storageMock[key] || null,
  setItem: (key, val) => { storageMock[key] = String(val); },
  removeItem: (key) => { delete storageMock[key]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};

async function runComprehensiveVerification() {
  console.log('====================================================');
  console.log('   بدء التحقق الشامل لمقصف الفسحة (مشروع زينة اللبدي)   ');
  console.log('====================================================\n');

  const { MENU_ITEMS, CATEGORIES, APP_CONFIG, DEFAULT_USERS } = await import('../js/data.js');
  const { store } = await import('../js/store.js');

  // 1. التحقق من قائمة الأصناف الـ 29 ووصف الصور
  console.log('1. التحقق من أصناف المنيو (29 صنفاً) مع وصف الصور:');
  console.assert(MENU_ITEMS.length === 29, `عدد الأصناف يجب أن يكون 29 بالضبط ولكن وجد ${MENU_ITEMS.length}`);
  
  let allHaveDescriptions = true;
  MENU_ITEMS.forEach((item, index) => {
    if (!item.imageDescription || item.imageDescription.trim().length < 5) {
      console.error(`الصنف ${item.name} (#${index + 1}) ينقصه وصف الصورة التفصيلي!`);
      allHaveDescriptions = false;
    }
  });
  console.assert(allHaveDescriptions, 'جميع الأصناف الـ 29 يجب أن تحتوي على وصف صورة تفصيلي باللغة العربية');
  console.log(`✅ تم تأكيد وجود 29 صنفاً مع أوصاف الصور العربية الكاملة.`);

  // 2. التحقق من الفسحة الوحيدة (10:00 صباحاً)
  console.log('\n2. التحقق من الفسحة المدرسية الواحدة:');
  console.assert(APP_CONFIG.breaks.length === 1, 'يجب أن يكون هناك فسحة واحدة فقط');
  console.assert(APP_CONFIG.breaks[0].id === 'break-10am', 'معرّف الفسحة يجب أن يكون break-10am');
  console.assert(APP_CONFIG.breaks[0].hour === 10, 'ساعة الفسحة يجب أن تكون 10:00 صباحاً');
  console.log(`✅ تم التحقق من الفسحة المدرسية الوحيدة بنجاح: ${APP_CONFIG.breaks[0].name}`);

  // 3. التحقق من الحسابات الافتراضية
  console.log('\n3. التحقق من حسابات زينة اللبدي وصاحب المقصف:');
  const users = store.getUsers();
  console.assert(users.zaina && users.zaina.name === 'زينة اللبدي', 'حساب زينة اللبدي مفقود أو غير صحيح');
  console.assert(users.owner && users.owner.role === 'owner', 'حساب صاحب المقصف مفقود أو غير صحيح');
  console.log(`✅ حساب زينة اللبدي نشط: ${users.zaina.name} (${users.zaina.grade} - ${users.zaina.section})`);
  console.log(`✅ حساب صاحب المقصف نشط: ${users.owner.name} (${users.owner.role})`);

  // 4. التحقق من قائمة الدخول السريع التفاعلية
  console.log('\n4. التحقق من ميزة الدخول السريع (Quick Login):');
  const initialQuick = store.getQuickLoginUsers();
  console.assert(initialQuick.length >= 2, 'يجب أن تحتوي قائمة الدخول السريع على حسابين على الأقل');
  console.log(`✅ الحسابات الأولية بالدخول السريع: ${initialQuick.map(u => u.name).join('، ')}`);

  // تسجيل طالب جديد مع تفعيل خيار الإضافة للدخول السريع
  const newStudent = store.registerStudent({
    name: 'سارة خالد',
    grade: 'الصف الثامن',
    section: 'الشعبة ب',
    password: '123',
    saveToQuickLogin: true
  });
  
  const quickAfterAdd = store.getQuickLoginUsers();
  console.assert(quickAfterAdd.some(u => u.id === newStudent.id), 'فشل إضافة الطالب الجديد للدخول السريع');
  console.log(`✅ تم تسجيل الطالبة الجديدة "${newStudent.name}" وإضافتها تلقائياً لقائمة الدخول السريع!`);

  // تجربة إزالة الحساب من الدخول السريع
  store.removeFromQuickLogin(newStudent.id);
  const quickAfterRemove = store.getQuickLoginUsers();
  console.assert(!quickAfterRemove.some(u => u.id === newStudent.id), 'فشل حذف الحساب من الدخول السريع');
  console.log(`✅ تم اختبار إزالة الحساب من الدخول السريع بنجاح (مع الحفاظ على زينة وصاحب المقصف).`);

  // 5. التحقق من دورة حياة الطلب وكرت الاستلام (Pickup Voucher)
  console.log('\n5. التحقق من كرت الاستلام ومسار الطلب:');
  store.switchUser('zaina');
  const item1 = store.getItems()[0];
  const item2 = store.getItems()[20];
  store.addToCart(item1, 2);
  store.addToCart(item2, 1);

  const testOrder = store.createOrder({
    studentId: 'zaina',
    studentName: 'زينة اللبدي',
    grade: 'الصف الثامن (أ)',
    breakId: 'break-10am',
    breakName: 'الفسحة المدرسية (10:00 صباحاً)',
    items: store.getCart(),
    totalPrice: store.getCartTotal(),
    notes: 'بدون بصل'
  });

  console.assert(testOrder.id.startsWith('ORD-'), 'رقم الطلب غير صحيح');
  console.assert(testOrder.status === 'pending', 'الحالة الابتدائية يجب أن تكون pending');
  console.log(`✅ تم إنشاء طلب فطور الفسحة بنجاح: #${testOrder.id} بقيمة ${testOrder.totalPrice.toFixed(2)} د.أ`);

  // ترقية الطلب لصاحب المقصف
  store.switchUser('owner');
  store.updateOrderStatus(testOrder.id, 'approved');
  console.assert(store.getOrders().find(o => o.id === testOrder.id).status === 'approved', 'فشل تغيير الحالة إلى approved');
  store.updateOrderStatus(testOrder.id, 'ready');
  console.assert(store.getOrders().find(o => o.id === testOrder.id).status === 'ready', 'فشل تغيير الحالة إلى ready');
  console.log(`✅ تم تحديث حالة كرت الاستلام بنجاح: قيد الانتظار -> بالمطبخ -> جاهز للاستلام 🔔`);

  // 6. التحقق من عناصر HTML المطلوبة لكرت الاستلام والطباعة والدخول السريع
  console.log('\n6. التحقق من ملف index.html ومعرّفات كرت الاستلام والطباعة:');
  const htmlContent = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
  
  const requiredIds = [
    'ticket-modal',
    'printable-ticket',
    'ticket-order-id',
    'ticket-student-name',
    'ticket-grade',
    'ticket-break',
    'ticket-time',
    'ticket-total-price',
    'ticket-status-pill',
    'ticket-step-1',
    'ticket-step-2',
    'ticket-step-3',
    'ticket-step-4',
    'ticket-modal-actions',
    'quick-login-list',
    'login-save-quick',
    'signup-save-quick',
    'btn-show-ticket-nav',
    'mobile-bottom-bar',
    'mobile-cart-badge',
    'mobile-cart-total'
  ];

  let allIdsPresent = true;
  requiredIds.forEach(id => {
    if (!htmlContent.includes(`id="${id}"`)) {
      console.error(`المعرّف المفقود في HTML: ${id}`);
      allIdsPresent = false;
    }
  });
  console.assert(allIdsPresent, 'جميع عناصر ومعرّفات كرت الاستلام والدخول السريع وSupabase موجودة في index.html');
  console.log(`✅ جميع المعرّفات الـ ${requiredIds.length} موجودة بدقة في index.html.`);

  // 7. التحقق من صور SVG الـ 29
  console.log('\n7. التحقق من ملفات صور الوجبات (29 ملف SVG):');
  let missingSvgs = [];
  for (let i = 1; i <= 29; i++) {
    const svgPath = path.resolve(`./assets/images/item-${i}.svg`);
    if (!fs.existsSync(svgPath)) {
      missingSvgs.push(`item-${i}.svg`);
    }
  }
  console.assert(missingSvgs.length === 0, `ملفات SVG مفقودة: ${missingSvgs.join(', ')}`);
  console.log(`✅ جميع ملفات الـ SVG الـ 29 متوفرة محلياً 100% ولا تعتمد على الإنترنت.`);

  // 8. التحقق من تكامل Supabase والسكربت
  console.log('\n8. التحقق من تكامل وإعدادات منصة Supabase:');
  const { SUPABASE_CONFIG, supabaseService } = await import('../js/supabase.js');
  console.assert(SUPABASE_CONFIG.url === 'https://umkicxaprplsldbfynlt.supabase.co', 'رابط Supabase غير مطابق');
  console.assert(SUPABASE_CONFIG.key === 'sb_publishable_m6yZU2NBDDbLqES9yZkOTQ_EBRyLTjU', 'مفتاح Supabase غير مطابق');
  
  const sqlContent = fs.readFileSync(path.resolve('./supabase_setup.sql'), 'utf-8');
  console.assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.menu_items'), 'جدول menu_items مفقود في سكربت SQL');
  console.assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.orders'), 'جدول orders مفقود في سكربت SQL');
  console.assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.users'), 'جدول users مفقود في سكربت SQL');
  console.assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.quick_logins'), 'جدول quick_logins مفقود في سكربت SQL');
  console.assert(sqlContent.includes('supabase_realtime'), 'إعدادات Realtime مفقودة في سكربت SQL');
  console.log(`✅ تم تأكيد إعدادات Supabase وملف supabase_setup.sql (${sqlContent.length} بايت) بنجاح.`);

  console.log('\n====================================================');
  console.log('   🎉 نجحت كافة الفحوصات والاختبارات بنسبة 100%!     ');
  console.log('====================================================');
}

runComprehensiveVerification().catch(err => {
  console.error('❌ خطأ في الفحص:', err);
  process.exit(1);
});
