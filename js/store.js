// store.js - إدارة الحالة المتزامنة محلياً وسحابياً مع Supabase لمقصف الفسحة

import { DEFAULT_USERS, MENU_ITEMS, INITIAL_ORDERS } from './data.js';
import { sounds } from './sound.js';
import { supabaseService } from './supabase.js';

const KEY_ACTIVE_USER_ID = 'kanteen_active_user_id_v4';
const KEY_USERS_LIST = 'kanteen_registered_users_v4';
const KEY_QUICK_LOGIN_IDS = 'kanteen_quick_login_ids_v4';
const KEY_ORDERS = 'kanteen_orders_v4';
const KEY_CART = 'kanteen_cart_v4';
const KEY_ITEMS = 'kanteen_menu_items_v4';

class Store {
  constructor() {
    this.listeners = new Set();
    this.initData();
    this.setupStorageListener();
    // مزامنة Supabase بشكل غير متزامن - لا تعيق العرض الأولي
    setTimeout(() => this.syncWithSupabase(), 1500);
  }

  initData() {
    // 1. تهيئة قائمة المستخدمين المسجلين (زينة + صاحب المقصف افتراضياً)
    let users = this.getUsers();
    if (!users || Object.keys(users).length === 0) {
      localStorage.setItem(KEY_USERS_LIST, JSON.stringify(DEFAULT_USERS));
    }

    // 2. تهيئة معرّفات الدخول السريع (زينة + صاحب المقصف افتراضياً)
    if (!localStorage.getItem(KEY_QUICK_LOGIN_IDS)) {
      localStorage.setItem(KEY_QUICK_LOGIN_IDS, JSON.stringify(['zaina', 'owner']));
    }

    // 3. تعيين الحساب النشط افتراضياً إلى حساب زينة اللبدي
    if (!localStorage.getItem(KEY_ACTIVE_USER_ID)) {
      localStorage.setItem(KEY_ACTIVE_USER_ID, 'zaina');
    }

    // 4. تهيئة الطلبات الأولية
    if (!localStorage.getItem(KEY_ORDERS)) {
      localStorage.setItem(KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
    }

    // 5. تهيئة السلة
    if (!localStorage.getItem(KEY_CART)) {
      localStorage.setItem(KEY_CART, JSON.stringify([]));
    }

    // 6. تهيئة قائمة الأصناف والتأكد من استخدام مسارات SVG المحلية
    const savedItemsStr = localStorage.getItem(KEY_ITEMS);
    if (!savedItemsStr) {
      localStorage.setItem(KEY_ITEMS, JSON.stringify(MENU_ITEMS));
    } else {
      try {
        const saved = JSON.parse(savedItemsStr);
        let needsUpdate = false;
        const updated = saved.map((item) => {
          const fresh = MENU_ITEMS.find((m) => m.id === item.id);
          if (fresh && (!item.image || item.image.includes('unsplash.com'))) {
            needsUpdate = true;
            return { ...item, image: fresh.image };
          }
          return item;
        });
        if (needsUpdate) {
          localStorage.setItem(KEY_ITEMS, JSON.stringify(updated));
        }
      } catch {
        localStorage.setItem(KEY_ITEMS, JSON.stringify(MENU_ITEMS));
      }
    }
  }

  // المزامنة الهجينة الذكية مع Supabase
  async syncWithSupabase() {
    try {
      const status = await supabaseService.checkConnection();
      this.notify();

      if (!status.connected || !status.tablesReady) {
        return status;
      }

      // 1. مزامنة قائمة الأصناف (Menu Items)
      const remoteItems = await supabaseService.getMenuItems();
      if (remoteItems && remoteItems.length > 0) {
        localStorage.setItem(KEY_ITEMS, JSON.stringify(remoteItems));
      } else if (remoteItems && remoteItems.length === 0) {
        // إذا كان الجدول منشأ ولكنه فارغ، نغذي Supabase بالـ 29 صنفاً
        for (const item of MENU_ITEMS) {
          await supabaseService.saveMenuItem(item);
        }
      }

      // 2. مزامنة الطلبات (Orders)
      const remoteOrders = await supabaseService.getOrders();
      if (remoteOrders && remoteOrders.length > 0) {
        const localOrders = this.getOrders();
        const map = new Map();
        localOrders.forEach((o) => map.set(o.id, o));
        remoteOrders.forEach((o) => map.set(o.id, o));
        const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        localStorage.setItem(KEY_ORDERS, JSON.stringify(merged));
      }

      // 3. مزامنة المستخدمين (Users)
      const remoteUsers = await supabaseService.getUsers();
      if (remoteUsers && Object.keys(remoteUsers).length > 0) {
        const localUsers = this.getUsers();
        const mergedUsers = { ...localUsers, ...remoteUsers };
        localStorage.setItem(KEY_USERS_LIST, JSON.stringify(mergedUsers));
      }

      // 4. مزامنة الدخول السريع (Quick Logins)
      const remoteQuickIds = await supabaseService.getQuickLoginIds();
      if (remoteQuickIds && remoteQuickIds.length > 0) {
        const localIds = this.getQuickLoginIds();
        const mergedIds = Array.from(new Set([...localIds, ...remoteQuickIds]));
        localStorage.setItem(KEY_QUICK_LOGIN_IDS, JSON.stringify(mergedIds));
      }

      // 5. تفعيل الاستماع اللحظي التفاعلي (Supabase Realtime WebSockets)
      supabaseService.initRealtime({
        onOrderUpdate: (payload) => this.handleRemoteOrderChange(payload),
        onItemUpdate: (payload) => this.handleRemoteItemChange(payload)
      });

      this.notify();
      return status;
    } catch (err) {
      console.warn('Supabase sync error:', err);
    }
  }

  handleRemoteOrderChange(payload) {
    const orders = this.getOrders();
    const currentUser = this.getCurrentUser();

    if (payload.eventType === 'INSERT' && payload.new) {
      const newOrder = {
        id: payload.new.id,
        studentId: payload.new.student_id,
        studentName: payload.new.student_name,
        grade: payload.new.grade,
        breakId: payload.new.break_id || 'break-10am',
        breakName: payload.new.break_name || 'الفسحة المدرسية (10:00 صباحاً)',
        orderTime: payload.new.order_time,
        items: typeof payload.new.items === 'string' ? JSON.parse(payload.new.items) : (payload.new.items || []),
        totalPrice: parseFloat(payload.new.total_price) || 0,
        notes: payload.new.notes || '',
        status: payload.new.status || 'pending',
        createdAt: new Date(payload.new.created_at).getTime()
      };

      if (!orders.some((o) => o.id === newOrder.id)) {
        orders.unshift(newOrder);
        localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
        if (currentUser.role === 'owner') {
          sounds.playNewOrderAlert();
        }
        this.notify();
      }
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      const order = orders.find((o) => o.id === payload.new.id);
      if (order) {
        const oldStatus = order.status;
        order.status = payload.new.status;
        localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));

        if (order.status === 'ready' && oldStatus !== 'ready') {
          if (currentUser.role === 'student' && (currentUser.id === order.studentId || order.studentName.includes(currentUser.name))) {
            sounds.playOrderReady();
          }
        }
        this.notify();
      }
    }
  }

  handleRemoteItemChange(payload) {
    if ((payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') && payload.new) {
      const items = this.getItems();
      const idx = items.findIndex((i) => i.id === payload.new.id);
      const mapped = {
        id: payload.new.id,
        name: payload.new.name,
        category: payload.new.category,
        price: parseFloat(payload.new.price) || 0,
        calories: payload.new.calories,
        prepTime: payload.new.prep_time,
        image: payload.new.image,
        imageDescription: payload.new.image_description,
        ingredients: payload.new.ingredients,
        available: payload.new.available !== false,
        isPopular: !!payload.new.is_popular
      };

      if (idx !== -1) {
        items[idx] = mapped;
      } else {
        items.unshift(mapped);
      }
      localStorage.setItem(KEY_ITEMS, JSON.stringify(items));
      this.notify();
    }
  }

  setupStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if ([KEY_ACTIVE_USER_ID, KEY_USERS_LIST, KEY_QUICK_LOGIN_IDS, KEY_ORDERS, KEY_CART, KEY_ITEMS].includes(e.key)) {
          this.notify();
        }
      });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (err) {
        console.error('Store listener error:', err);
      }
    });
  }

  getState() {
    return {
      currentUser: this.getCurrentUser(),
      users: this.getUsers(),
      quickLoginUsers: this.getQuickLoginUsers(),
      cart: this.getCart(),
      orders: this.getOrders(),
      items: this.getItems(),
      supabase: supabaseService.status
    };
  }

  // --- نظام الحسابات وتسجيل الدخول والدخول السريع ---
  getUsers() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY_USERS_LIST));
      return data && Object.keys(data).length > 0 ? data : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  getCurrentUser() {
    const users = this.getUsers();
    const activeId = localStorage.getItem(KEY_ACTIVE_USER_ID) || 'zaina';
    return users[activeId] || users.zaina || DEFAULT_USERS.zaina;
  }

  switchUser(userId) {
    const users = this.getUsers();
    if (users[userId]) {
      localStorage.setItem(KEY_ACTIVE_USER_ID, userId);
      this.notify();
      return users[userId];
    }
    return null;
  }

  // إدارة قائمة الحسابات في "الدخول السريع"
  getQuickLoginIds() {
    try {
      const list = JSON.parse(localStorage.getItem(KEY_QUICK_LOGIN_IDS));
      return Array.isArray(list) ? list : ['zaina', 'owner'];
    } catch {
      return ['zaina', 'owner'];
    }
  }

  getQuickLoginUsers() {
    const ids = this.getQuickLoginIds();
    const users = this.getUsers();
    return ids.map((id) => users[id]).filter(Boolean);
  }

  addToQuickLogin(userId) {
    const ids = this.getQuickLoginIds();
    if (!ids.includes(userId)) {
      ids.push(userId);
      localStorage.setItem(KEY_QUICK_LOGIN_IDS, JSON.stringify(ids));
      this.notify();
      supabaseService.addQuickLoginId(userId);
    }
  }

  removeFromQuickLogin(userId) {
    let ids = this.getQuickLoginIds();
    if (userId === 'zaina' || userId === 'owner') return;
    ids = ids.filter((id) => id !== userId);
    localStorage.setItem(KEY_QUICK_LOGIN_IDS, JSON.stringify(ids));
    this.notify();
    supabaseService.removeQuickLoginId(userId);
  }

  isUserInQuickLogin(userId) {
    return this.getQuickLoginIds().includes(userId);
  }

  // تسجيل طالب جديد
  registerStudent({ name, username, password, grade, section, studentNumber, saveToQuickLogin = true }) {
    const users = this.getUsers();
    const cleanUsername = (username || name).trim().toLowerCase().replace(/\s+/g, '_');
    const userId = `std_${Date.now()}`;

    // فحص عدم التكرار
    const exists = Object.values(users).find(
      (u) => u.username === cleanUsername || (u.name.trim() === name.trim() && u.grade === grade && u.section === section)
    );

    if (exists) {
      throw new Error('يوجد حساب مسجل مسبقاً بنفس الاسم أو اسم المستخدم!');
    }

    const newUser = {
      id: userId,
      username: cleanUsername,
      password: password || '123',
      role: 'student',
      name: name.trim(),
      title: `طالب في ${grade} (${section})`,
      grade: grade || 'الصف الثامن',
      section: section || 'الشعبة أ',
      studentNumber: studentNumber || `2024-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      isCreator: false,
      createdAt: Date.now()
    };

    users[userId] = newUser;
    localStorage.setItem(KEY_USERS_LIST, JSON.stringify(users));
    localStorage.setItem(KEY_ACTIVE_USER_ID, userId);

    if (saveToQuickLogin) {
      this.addToQuickLogin(userId);
    }

    this.notify();
    supabaseService.saveUser(newUser);

    return newUser;
  }

  // التحقق من تسجيل الدخول
  login(usernameOrName, password, saveToQuickLogin = false) {
    const users = this.getUsers();
    const query = (usernameOrName || '').trim().toLowerCase();
    const pwd = (password || '').trim();

    const userEntry = Object.entries(users).find(([id, u]) => {
      const matchName = u.name.trim().toLowerCase() === query;
      const matchUsername = (u.username || '').toLowerCase() === query;
      const matchId = id.toLowerCase() === query;
      return matchName || matchUsername || matchId;
    });

    if (!userEntry) {
      throw new Error('لم يتم العثور على هذا الحساب، يرجى التأكد من الاسم أو إنشاء حساب طالب جديد.');
    }

    const [userId, userObj] = userEntry;

    if (userObj.password && userObj.password !== pwd) {
      throw new Error('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
    }

    localStorage.setItem(KEY_ACTIVE_USER_ID, userId);

    if (saveToQuickLogin) {
      this.addToQuickLogin(userId);
    }

    this.notify();
    return userObj;
  }

  // --- إدارة السلة ---
  getCart() {
    try {
      return JSON.parse(localStorage.getItem(KEY_CART)) || [];
    } catch {
      return [];
    }
  }

  setCart(cart) {
    localStorage.setItem(KEY_CART, JSON.stringify(cart));
    this.notify();
  }

  addToCart(item, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        imageDescription: item.imageDescription,
        category: item.category,
        quantity: quantity
      });
    }
    this.setCart(cart);
    sounds.playAddToCart();
  }

  updateCartQty(itemId, delta) {
    let cart = this.getCart();
    const item = cart.find((c) => c.id === itemId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter((c) => c.id !== itemId);
      }
      this.setCart(cart);
    }
  }

  removeFromCart(itemId) {
    let cart = this.getCart();
    cart = cart.filter((c) => c.id !== itemId);
    this.setCart(cart);
  }

  clearCart() {
    this.setCart([]);
  }

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // --- إدارة قائمة الطعام وتوفر الأصناف والمخزون ---
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(KEY_ITEMS)) || MENU_ITEMS;
    } catch {
      return MENU_ITEMS;
    }
  }

  setItems(items) {
    localStorage.setItem(KEY_ITEMS, JSON.stringify(items));
    this.notify();
  }

  toggleItemAvailability(itemId) {
    const items = this.getItems().map((item) => {
      if (item.id === itemId) {
        return { ...item, available: item.available === false ? true : false };
      }
      return item;
    });
    this.setItems(items);
    const updated = items.find((i) => i.id === itemId);
    if (updated) {
      supabaseService.updateItemFields(itemId, { available: updated.available });
    }
    return updated;
  }

  updateItem(itemId, fields) {
    const items = this.getItems().map((item) => {
      if (item.id === itemId) {
        return { ...item, ...fields };
      }
      return item;
    });
    this.setItems(items);
    supabaseService.updateItemFields(itemId, fields);
  }

  addItem(newItem) {
    const items = this.getItems();
    const id = `item-${Date.now()}`;
    const item = {
      id,
      available: true,
      image: './assets/images/item-1.svg',
      ...newItem
    };
    items.unshift(item);
    this.setItems(items);
    supabaseService.saveMenuItem(item);
    return item;
  }

  deleteItem(itemId) {
    let items = this.getItems();
    items = items.filter((i) => i.id !== itemId);
    this.setItems(items);
    supabaseService.deleteMenuItem(itemId);
  }

  resetItemsToDefault() {
    localStorage.setItem(KEY_ITEMS, JSON.stringify(MENU_ITEMS));
    this.notify();
    // إعادة تعيين الأصناف في Supabase
    for (const item of MENU_ITEMS) {
      supabaseService.saveMenuItem(item);
    }
  }

  // --- إدارة الطلبات ---
  getOrders() {
    try {
      return JSON.parse(localStorage.getItem(KEY_ORDERS)) || [];
    } catch {
      return [];
    }
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newOrder = {
      id: `ORD-${randomNum}`,
      orderTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      createdAt: Date.now(),
      ...orderData
    };

    orders.unshift(newOrder);
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
    this.clearCart();
    sounds.playOrderPlaced();
    this.notify();

    // حفظ في Supabase
    supabaseService.createOrder(newOrder);

    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = newStatus;
      localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));

      if (newStatus === 'ready') {
        sounds.playOrderReady();
      } else if (newStatus === 'approved') {
        sounds.playOrderPlaced();
      }

      this.notify();
      supabaseService.updateOrderStatus(orderId, newStatus);
    }
  }

  deleteOrder(orderId) {
    let orders = this.getOrders();
    orders = orders.filter((o) => o.id !== orderId);
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
    this.notify();
  }

  resetAllData() {
    localStorage.removeItem(KEY_ACTIVE_USER_ID);
    localStorage.removeItem(KEY_USERS_LIST);
    localStorage.removeItem(KEY_QUICK_LOGIN_IDS);
    localStorage.removeItem(KEY_ORDERS);
    localStorage.removeItem(KEY_CART);
    localStorage.removeItem(KEY_ITEMS);
    this.initData();
    this.notify();
  }
}

export const store = new Store();
