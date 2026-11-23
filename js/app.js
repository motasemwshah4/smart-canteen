// app.js - المحرك البرمجي الرئيسي لمقصف الفسحة ومشروع الطالبة زينة اللبدي

import { APP_CONFIG, DEFAULT_USERS, CATEGORIES, MENU_ITEMS } from './data.js';
import { store } from './store.js';
import { sounds } from './sound.js';

class KanteenApp {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.selectedModalItem = null;
    this.modalQty = 1;
    this.currentOwnerTab = 'orders';
    this.activeTicketOrder = null;

    // فلاتر المخزون
    this.invSearchQuery = '';
    this.invCatFilter = 'all';
    this.invStatusFilter = 'all';

    this.init();
  }

  init() {
    // ربط الحساب الحالي بالمتجر
    store.subscribe((state) => this.onStoreChange(state));

    // إتاحة الكائنات عالمياً للنافذة
    window.app = this;
    window.store = store;

    // تهيئة التصنيفات
    this.renderCategories();

    // تشغيل مؤقت العد التنازلي التفاعلي للفسحة (10:00 ص)
    this.startCountdownTimer();

    // العرض الأولي
    this.onStoreChange(store.getState());

    // تهيئة أيقونات Lucide
    this.refreshIcons();
  }

  refreshIcons() {
    setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 60);
  }

  // مستمع التغييرات في المتجر (محلي أو عبر التبويبات)
  onStoreChange(state) {
    this.updateUserUI(state.currentUser);
    this.updateCartBadge(state.cart);
    this.renderMenu(state.items);
    this.renderCart(state.cart);
    this.renderOwnerStats(state.orders);
    this.renderOwnerOrders();
    this.renderOwnerInventory(state.items);
    this.updateStudentOrdersUI(state.orders);
    this.checkReadyOrdersNotification(state.orders);
    this.renderQuickLoginList(state.quickLoginUsers);
    this.refreshIcons();
  }

  // معالج أخطاء الصور لضمان عدم ظهور أي صورة مكسورة
  handleImageError(imgEl, itemId) {
    imgEl.onerror = null;
    imgEl.src = `./assets/images/${itemId || 'item-1'}.svg`;
  }

  // --- مؤقت العد التنازلي للفسحة المدرسية (الساعة 10:00 صباحاً) ---
  startCountdownTimer() {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(10, 0, 0, 0); // فسحة 10:00 ص

      // إذا تجاوزت الساعة 10:30 صباحاً، نحسب لفسحة الغد
      if (now > new Date(new Date().setHours(10, 30, 0, 0))) {
        target.setDate(target.getDate() + 1);
      }

      let diff = target - now;
      let isDuringBreak = false;

      // إذا كنا في وقت الفسحة تماماً (10:00 - 10:30 ص)
      if (diff <= 0 && diff > -30 * 60 * 1000) {
        isDuringBreak = true;
      }

      const headerEl = document.getElementById('header-countdown');
      const heroEl = document.getElementById('hero-countdown');

      if (isDuringBreak) {
        const text = '🔔 الفسحة بدأت الآن! توجه للمقصف';
        if (headerEl) headerEl.textContent = text;
        if (heroEl) heroEl.textContent = text;
        return;
      }

      if (diff < 0) diff += 24 * 60 * 60 * 1000;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      if (headerEl) headerEl.textContent = formatted;
      if (heroEl) heroEl.textContent = `${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية ⏳`;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // إشعار عائم لطيف (Toast Notification)
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    toast.className = `p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-bold text-white transition-all transform duration-300 translate-y-4 opacity-0 pointer-events-auto ${
      isSuccess ? 'bg-slate-900 border border-emerald-500/50' : 'bg-red-700'
    }`;
    
    toast.innerHTML = `
      <span class="text-base">${isSuccess ? '✅' : '⚠️'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- نظام الحسابات وتسجيل الدخول والتسجيل (Authentication) ---
  openAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.switchAuthTab('signin');
    this.renderQuickLoginList();
    this.refreshIcons();
  }

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  switchAuthTab(tabName) {
    const btnSignin = document.getElementById('auth-tab-btn-signin');
    const btnSignup = document.getElementById('auth-tab-btn-signup');
    const viewSignin = document.getElementById('auth-view-signin');
    const viewSignup = document.getElementById('auth-view-signup');

    if (tabName === 'signin') {
      btnSignin.className = 'py-2 rounded-lg bg-white text-emerald-800 shadow-xs transition-all';
      btnSignup.className = 'py-2 rounded-lg text-slate-600 hover:text-slate-900 transition-all';
      viewSignin.classList.remove('hidden');
      viewSignup.classList.add('hidden');
      this.renderQuickLoginList();
    } else {
      btnSignup.className = 'py-2 rounded-lg bg-white text-emerald-800 shadow-xs transition-all';
      btnSignin.className = 'py-2 rounded-lg text-slate-600 hover:text-slate-900 transition-all';
      viewSignup.classList.remove('hidden');
      viewSignin.classList.add('hidden');
    }
    this.refreshIcons();
  }

  // عرض قائمة الدخول السريع التفاعلية بنقرة واحدة
  renderQuickLoginList(quickUsers = null) {
    const container = document.getElementById('quick-login-list');
    if (!container) return;

    const users = quickUsers || store.getQuickLoginUsers();
    const currentUser = store.getCurrentUser();

    if (!users || users.length === 0) {
      container.innerHTML = `
        <div class="p-3 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          لا توجد حسابات مضافة في الدخول السريع حالياً.
        </div>
      `;
      return;
    }

    container.innerHTML = users.map((u) => {
      const isCurrent = currentUser && currentUser.id === u.id;
      const isOwner = u.role === 'owner';
      const isZaina = u.id === 'zaina';
      const isProtected = isOwner || isZaina;

      let badgeDesc = '';
      let avatarContent = '👤';
      let avatarClass = 'bg-teal-100 text-teal-800 border-teal-200';

      if (isOwner) {
        avatarContent = '👨‍🍳';
        avatarClass = 'bg-amber-100 text-amber-900 border-amber-300';
        badgeDesc = 'إدارة المطبخ والطلبات والمخزون';
      } else if (isZaina) {
        avatarContent = '⭐';
        avatarClass = 'bg-emerald-600 text-white shadow-xs';
        badgeDesc = 'صاحبة الفكرة والمشروع (8 - أ)';
      } else {
        avatarContent = (u.name || 'ط')[0];
        badgeDesc = `${u.grade || 'طالب'} (${u.section || 'أ'})`;
      }

      return `
        <div 
          onclick="app.quickLogin('${u.id}')"
          class="group relative flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
            isCurrent 
              ? 'bg-emerald-50/90 border-emerald-400 shadow-xs ring-1 ring-emerald-300' 
              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-300 shadow-xs'
          }"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border ${avatarClass}">
              ${avatarContent}
            </div>
            <div class="min-w-0 text-right">
              <div class="flex items-center gap-1.5">
                <h5 class="font-black text-slate-900 text-xs truncate">${u.name}</h5>
                ${isCurrent ? '<span class="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">حسابك الحالي</span>' : ''}
              </div>
              <p class="text-[10px] text-slate-500 font-medium truncate">${badgeDesc}</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 group-hover:bg-emerald-600 group-hover:text-white px-2.5 py-1 rounded-xl transition-all">
              دخول ⚡
            </span>
            ${!isProtected ? `
              <button 
                type="button"
                onclick="event.stopPropagation(); app.removeFromQuickLogin('${u.id}')" 
                class="w-6 h-6 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                title="إزالة هذا الحساب من الدخول السريع"
              >
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    this.refreshIcons();
  }

  removeFromQuickLogin(userId) {
    store.removeFromQuickLogin(userId);
    this.showToast('تمت إزالة الحساب من قائمة الدخول السريع.');
  }

  quickLogin(userId) {
    const user = store.switchUser(userId);
    this.closeAuthModal();
    if (user) {
      if (user.role === 'owner') {
        this.showToast('مرحباً بك يا مسؤول المقصف! تم فتح لوحة المطبخ والمخزون.');
      } else {
        this.showToast(`أهلاً وسهلاً بكِ يا ${user.name}! يوم دراسي سعيد ☀️`);
      }
      if (window.confetti) {
        window.confetti({ particleCount: 50, spread: 50, origin: { y: 0.2 } });
      }
    }
  }

  handleManualLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const saveToQuick = document.getElementById('login-save-quick')?.checked ?? true;

    try {
      const user = store.login(username, password, saveToQuick);
      this.closeAuthModal();
      this.showToast(`تم تسجيل الدخول بنجاح! مرحباً ${user.name}.`);
      if (user.role === 'student' && window.confetti) {
        window.confetti({ particleCount: 50, spread: 50, origin: { y: 0.3 } });
      }
    } catch (err) {
      alert(err.message);
    }
  }

  handleStudentSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const grade = document.getElementById('signup-grade').value;
    const section = document.getElementById('signup-section').value;
    const password = document.getElementById('signup-password').value;
    const saveToQuick = document.getElementById('signup-save-quick')?.checked ?? true;

    try {
      const newUser = store.registerStudent({
        name,
        grade,
        section,
        password,
        saveToQuickLogin: saveToQuick
      });

      this.closeAuthModal();
      this.showToast(`أهلاً بك يا ${newUser.name}! تم إنشاء حسابك الدراسي وإضافته للدخول السريع ✨`);
      
      if (window.confetti) {
        window.confetti({ particleCount: 90, spread: 70, origin: { y: 0.4 } });
      }
    } catch (err) {
      alert(err.message);
    }
  }

  updateUserUI(user) {
    const isOwner = user.role === 'owner';
    const studentSection = document.getElementById('student-section');
    const ownerSection = document.getElementById('owner-section');
    const ownerNavBtn = document.getElementById('btn-owner-dashboard-nav');
    const userDisplayName = document.getElementById('user-display-name');
    const navUserName = document.getElementById('nav-user-name');
    const navUserAvatar = document.getElementById('nav-user-avatar');

    if (isOwner) {
      studentSection.classList.add('hidden');
      ownerSection.classList.remove('hidden');
      ownerNavBtn.classList.remove('hidden');
      if (navUserAvatar) navUserAvatar.textContent = '👨‍🍳';
    } else {
      studentSection.classList.remove('hidden');
      ownerSection.classList.add('hidden');
      ownerNavBtn.classList.add('hidden');
      if (navUserAvatar) navUserAvatar.textContent = (user.name || 'ز')[0];
    }

    if (navUserName) navUserName.textContent = user.name;
    if (userDisplayName) {
      userDisplayName.textContent = `${user.name} (${user.grade} - ${user.section})`;
    }
  }

  showSection(sectionName) {
    if (sectionName === 'owner-dashboard') {
      store.switchUser('owner');
    } else {
      const currentUser = store.getCurrentUser();
      if (currentUser.role === 'owner') {
        store.switchUser('zaina'); // العودة لزينة اللبدي
      }
    }
  }

  // --- التصنيفات وقائمة الطعام ---
  renderCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    container.innerHTML = CATEGORIES.map((cat) => {
      const isActive = cat.id === this.currentCategory;
      const activeClass = isActive
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-black scale-105'
        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 font-bold';

      return `
        <button 
          onclick="app.selectCategory('${cat.id}')" 
          class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${activeClass}"
        >
          <span class="text-base">${cat.icon}</span>
          <span>${cat.name}</span>
        </button>
      `;
    }).join('');
  }

  selectCategory(catId) {
    this.currentCategory = catId;
    this.renderCategories();
    this.renderMenu(store.getItems());
  }

  handleSearch(val) {
    this.searchQuery = (val || '').trim().toLowerCase();
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      if (this.searchQuery) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
    this.renderMenu(store.getItems());
  }

  clearSearch() {
    this.searchQuery = '';
    const input = document.getElementById('search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.classList.add('hidden');
    this.currentCategory = 'all';
    this.renderCategories();
    this.renderMenu(store.getItems());
  }

  renderMenu(items) {
    const grid = document.getElementById('menu-grid');
    const noResults = document.getElementById('no-results');
    const itemsCountBadge = document.getElementById('items-count-badge');
    if (!grid) return;

    let filtered = items.filter((item) => {
      const matchesCat = this.currentCategory === 'all' || item.category === this.currentCategory;
      const matchesSearch = !this.searchQuery || 
        item.name.toLowerCase().includes(this.searchQuery) || 
        item.imageDescription.toLowerCase().includes(this.searchQuery) ||
        (item.ingredients && item.ingredients.toLowerCase().includes(this.searchQuery));
      return matchesCat && matchesSearch;
    });

    if (itemsCountBadge) {
      const availableCount = filtered.filter(i => i.available !== false).length;
      itemsCountBadge.textContent = `${availableCount} صنفاً متوفراً لفسحة 10:00 ص`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      noResults.classList.remove('hidden');
      return;
    }

    noResults.classList.add('hidden');

    grid.innerHTML = filtered.map((item) => {
      const isAvailable = item.available !== false;
      const categoryObj = CATEGORIES.find((c) => c.id === item.category);
      const catName = categoryObj ? categoryObj.name : 'أخرى';
      const imgSrc = item.image || `./assets/images/${item.id}.svg`;

      return `
        <div class="card-hover bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between group">
          
          <div>
            <!-- صورة الوجبة وشاراتها -->
            <div class="relative h-48 w-full overflow-hidden bg-slate-100 cursor-pointer" onclick="app.openItemModal('${item.id}')">
              <img 
                src="${imgSrc}" 
                alt="${item.name}" 
                loading="lazy"
                onerror="app.handleImageError(this, '${item.id}')"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!isAvailable ? 'grayscale opacity-60' : ''}"
              >
              
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span class="text-white text-xs font-bold flex items-center gap-1">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  <span>اضغط لعرض التفاصيل ووصف الوجبة</span>
                </span>
              </div>

              <div class="absolute top-3 right-3 flex flex-wrap gap-1">
                <span class="bg-white/95 backdrop-blur-md text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  ${catName}
                </span>
                ${item.isPopular ? `
                  <span class="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <span>⭐</span> شائع بالفسحة
                  </span>
                ` : ''}
              </div>

              ${!isAvailable ? `
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
                  <span class="bg-red-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xl transform -rotate-3 border border-white/30 text-center">
                    ❌ نفد مؤقتاً في المقصف
                  </span>
                </div>
              ` : ''}
            </div>

            <!-- معلومات الصنف -->
            <div class="p-5 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-black text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                  ${item.name}
                </h4>
                <div class="text-left shrink-0">
                  <span class="text-lg font-black text-emerald-700 font-mono">${item.price.toFixed(2)}</span>
                  <span class="text-[11px] font-bold text-slate-500">${APP_CONFIG.currency}</span>
                </div>
              </div>

              <!-- صندوق وصف الصورة الإلزامي والواضح في البطاقة -->
              <div class="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5 text-xs text-amber-900/90 leading-relaxed font-medium">
                <div class="flex items-center gap-1 text-[11px] font-bold text-amber-800 mb-0.5">
                  <span>📸</span>
                  <span>وصف الصورة:</span>
                </div>
                <p class="line-clamp-2 hover:line-clamp-none transition-all">${item.imageDescription}</p>
              </div>

              <!-- تفاصيل السعرات والمكونات السريعة وموعد الفسحة -->
              <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span class="flex items-center gap-1">
                  <span>🔥</span> ${item.calories}
                </span>
                <span class="flex items-center gap-1 text-emerald-700 font-bold">
                  <span>⏰</span> جاهز بفسحة 10:00 ص
                </span>
              </div>
            </div>
          </div>

          <!-- زر الإضافة إلى السلة -->
          <div class="p-4 pt-0">
            ${isAvailable ? `
              <button 
                onclick="app.quickAddToCart('${item.id}')" 
                class="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-emerald-200 hover:border-transparent group-btn"
              >
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>أضف لفطور الفسحة (10:00 ص)</span>
              </button>
            ` : `
              <button disabled class="w-full py-2.5 px-4 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs cursor-not-allowed">
                غير متوفر بالمقصف الآن
              </button>
            `}
          </div>

        </div>
      `;
    }).join('');

    this.refreshIcons();
  }

  // --- نافذة تفاصيل الصنف المخصصة ---
  openItemModal(itemId) {
    const item = store.getItems().find((i) => i.id === itemId);
    if (!item) return;

    this.selectedModalItem = item;
    this.modalQty = 1;

    const modalImg = document.getElementById('modal-item-img');
    modalImg.src = item.image || `./assets/images/${item.id}.svg`;
    modalImg.alt = item.name;
    modalImg.onerror = () => this.handleImageError(modalImg, item.id);

    document.getElementById('modal-item-name').textContent = item.name;
    document.getElementById('modal-item-calories').textContent = `🔥 ${item.calories} • وقت التحضير: ${item.prepTime}`;
    document.getElementById('modal-item-price').textContent = `${item.price.toFixed(2)} ${APP_CONFIG.currency}`;
    document.getElementById('modal-item-img-desc').textContent = item.imageDescription;
    document.getElementById('modal-item-ingredients').textContent = item.ingredients || 'مكونات مدرسية طازجة ومختارة بعناية وفق معايير وزارة التربية والتعليم.';
    document.getElementById('modal-item-prep').textContent = item.prepTime;
    document.getElementById('modal-qty').textContent = '1';

    const catObj = CATEGORIES.find((c) => c.id === item.category);
    document.getElementById('modal-item-category').textContent = catObj ? catObj.name : 'مقصفنا';

    const addBtn = document.getElementById('modal-add-btn');
    if (item.available === false) {
      addBtn.disabled = true;
      addBtn.className = 'flex-grow py-3 px-6 bg-slate-300 text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed';
      addBtn.innerHTML = '<span>غير متوفر حالياً بالمقصف</span>';
    } else {
      addBtn.disabled = false;
      addBtn.className = 'flex-grow py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2';
      addBtn.innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i><span>إضافة إلى سلة الفسحة</span>';
    }

    const modal = document.getElementById('item-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.refreshIcons();
  }

  closeItemModal() {
    const modal = document.getElementById('item-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    this.selectedModalItem = null;
  }

  changeModalQty(delta) {
    this.modalQty = Math.max(1, this.modalQty + delta);
    document.getElementById('modal-qty').textContent = this.modalQty;
  }

  confirmModalAdd() {
    if (this.selectedModalItem && this.selectedModalItem.available !== false) {
      store.addToCart(this.selectedModalItem, this.modalQty);
      this.showToast(`تمت إضافة ${this.modalQty} × ${this.selectedModalItem.name} إلى السلة!`);
      this.closeItemModal();
    }
  }

  quickAddToCart(itemId) {
    const item = store.getItems().find((i) => i.id === itemId);
    if (item && item.available !== false) {
      store.addToCart(item, 1);
      this.showToast(`تمت إضافة ${item.name} إلى السلة 🥪`);
    }
  }

  // --- إدارة وتحديث سلة الطلبات ---
  toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal.classList.contains('hidden')) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      
      const currentUser = store.getCurrentUser();
      const nameInput = document.getElementById('order-student-name');
      const gradeInput = document.getElementById('order-student-grade');
      if (nameInput) nameInput.value = currentUser.name || 'زينة اللبدي';
      if (gradeInput) gradeInput.value = `${currentUser.grade || 'الصف الثامن'} (${currentUser.section || 'الشعبة أ'})`;

      this.renderCart(store.getCart());
    } else {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.refreshIcons();
  }

  updateCartQty(itemId, delta) {
    store.updateCartQty(itemId, delta);
  }

  removeFromCart(itemId) {
    store.removeFromCart(itemId);
    this.showToast('تم حذف الصنف من السلة');
  }

  updateCartBadge(cart) {
    const count = store.getCartCount();
    const total = store.getCartTotal();

    const badge = document.getElementById('cart-badge');
    const navTotal = document.getElementById('cart-nav-total');
    const mobileBadge = document.getElementById('mobile-cart-badge');
    const mobileTotal = document.getElementById('mobile-cart-total');
    const mobileBar = document.getElementById('mobile-bottom-bar');

    if (badge) badge.textContent = count;
    if (navTotal) navTotal.textContent = `${total.toFixed(2)} ${APP_CONFIG.currency}`;
    if (mobileBadge) mobileBadge.textContent = count;
    if (mobileTotal) mobileTotal.textContent = `${total.toFixed(2)} ${APP_CONFIG.currency}`;

    if (mobileBar) {
      if (count > 0) {
        mobileBar.classList.remove('hidden');
        mobileBar.classList.add('flex');
      } else {
        mobileBar.classList.add('hidden');
        mobileBar.classList.remove('flex');
      }
    }
  }

  renderCart(cart) {
    const container = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const formSection = document.getElementById('checkout-form-section');
    const cartFooter = document.getElementById('cart-footer');
    const totalPriceEl = document.getElementById('cart-total-price');

    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      formSection.classList.add('hidden');
      cartFooter.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    formSection.classList.remove('hidden');
    cartFooter.classList.remove('hidden');

    container.innerHTML = cart.map((item) => `
      <div class="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <div class="flex items-center gap-3">
          <img 
            src="${item.image || `./assets/images/${item.id}.svg`}" 
            alt="${item.name}" 
            onerror="app.handleImageError(this, '${item.id}')"
            class="w-12 h-12 rounded-xl object-cover shrink-0"
          >
          <div>
            <h5 class="font-bold text-slate-800 text-xs sm:text-sm">${item.name}</h5>
            <span class="text-xs text-emerald-700 font-bold">${item.price.toFixed(2)} ${APP_CONFIG.currency}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center border border-slate-200 bg-white rounded-lg p-0.5">
            <button onclick="app.updateCartQty('${item.id}', -1)" class="w-6 h-6 rounded flex items-center justify-center text-xs font-black text-slate-600 hover:bg-slate-100">-</button>
            <span class="w-6 text-center text-xs font-black">${item.quantity}</span>
            <button onclick="app.updateCartQty('${item.id}', 1)" class="w-6 h-6 rounded flex items-center justify-center text-xs font-black text-slate-600 hover:bg-slate-100">+</button>
          </div>
          <button onclick="app.removeFromCart('${item.id}')" class="text-red-400 hover:text-red-600 p-1">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `).join('');

    const total = store.getCartTotal();
    if (totalPriceEl) {
      totalPriceEl.textContent = `${total.toFixed(2)} ${APP_CONFIG.currency}`;
    }

    this.refreshIcons();
  }

  // --- تقديم الطلب واستلام كرت الاستلام لموعد الفسحة 10:00 ص ---
  submitOrder() {
    const cart = store.getCart();
    if (cart.length === 0) return;

    const currentUser = store.getCurrentUser();
    const studentName = document.getElementById('order-student-name').value.trim() || currentUser.name || 'زينة اللبدي';
    const grade = document.getElementById('order-student-grade').value.trim() || `${currentUser.grade} (${currentUser.section})`;
    const breakName = 'الفسحة المدرسية (10:00 صباحاً)';
    const notes = document.getElementById('order-notes').value.trim();

    const orderData = {
      studentId: currentUser.id || 'zaina',
      studentName: studentName,
      grade: grade,
      breakId: 'break-10am',
      breakName: breakName,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      })),
      totalPrice: store.getCartTotal(),
      notes: notes
    };

    const newOrder = store.createOrder(orderData);

    // إغلاق نافذة السلة
    this.toggleCartModal();

    // إطلاق تأثير الاحتفال (Confetti)
    if (window.confetti) {
      window.confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    this.showToast(`تم تأكيد طلبك لفسحة العاشرة صباحاً برقم #${newOrder.id}! 🎫`);

    // فتح كرت الاستلام الرقمي فوراً
    this.openTicketModal(newOrder);
  }

  // --- كرت الاستلام الرقمي (Pickup Voucher) ---
  openTicketModal(order) {
    if (!order) return;
    this.activeTicketOrder = order;

    const elId = document.getElementById('ticket-order-id');
    const elName = document.getElementById('ticket-student-name');
    const elGrade = document.getElementById('ticket-grade');
    const elBreak = document.getElementById('ticket-break');
    const elTime = document.getElementById('ticket-time');
    const elPrice = document.getElementById('ticket-total-price');

    if (elId) elId.textContent = `#${order.id}`;
    if (elName) elName.textContent = order.studentName || 'طالب/ـة';
    if (elGrade) elGrade.textContent = order.grade || 'الصف الثامن (أ)';
    if (elBreak) elBreak.textContent = order.breakName || 'الفسحة المدرسية (10:00 صباحاً)';
    if (elTime) elTime.textContent = order.orderTime || 'الآن';
    if (elPrice) elPrice.textContent = `${(order.totalPrice || 0).toFixed(2)} ${APP_CONFIG.currency}`;

    const statusPill = document.getElementById('ticket-status-pill');
    if (statusPill) {
      this.renderTicketStatus(order.status, statusPill);
    }

    this.updateTicketProgress(order.status);

    const itemsList = document.getElementById('ticket-items-list');
    if (itemsList && order.items) {
      itemsList.innerHTML = order.items.map((i) => `
        <div class="flex justify-between items-center py-0.5">
          <span class="font-medium">${i.name} × ${i.quantity}</span>
          <span class="font-bold font-mono">${((i.price || 0) * i.quantity).toFixed(2)} ${APP_CONFIG.currency}</span>
        </div>
      `).join('');
    }

    const modal = document.getElementById('ticket-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    this.refreshIcons();
  }

  // تحديث مسار المراحل الأربعة في كرت الاستلام بصرياً وحركياً
  updateTicketProgress(status) {
    const steps = [
      { id: 'ticket-step-1', num: 1 },
      { id: 'ticket-step-2', num: 2 },
      { id: 'ticket-step-3', num: 3 },
      { id: 'ticket-step-4', num: 4 }
    ];

    let currentLevel = 1;
    if (status === 'pending') currentLevel = 1;
    else if (status === 'approved') currentLevel = 2;
    else if (status === 'ready') currentLevel = 3;
    else if (status === 'delivered') currentLevel = 4;
    else if (status === 'cancelled') currentLevel = 0;

    steps.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const circle = el.querySelector('div');
      if (!circle) return;

      if (currentLevel === 0) {
        // ملغي
        circle.className = 'w-6 h-6 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1 text-xs font-black';
        circle.textContent = '✕';
        el.className = 'p-1 rounded-lg text-red-600 font-bold';
      } else if (s.num < currentLevel) {
        // مرحلة منجزة مسبقاً
        circle.className = 'w-6 h-6 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 text-xs font-black shadow-xs';
        circle.textContent = '✓';
        el.className = 'p-1 rounded-lg text-emerald-800 font-black';
      } else if (s.num === currentLevel) {
        // المرحلة الحالية النشطة مع أنيميشن نبض
        const isReady = status === 'ready';
        circle.className = `w-6 h-6 mx-auto rounded-full ${isReady ? 'bg-emerald-500 animate-bounce ring-2 ring-emerald-300' : 'bg-amber-500'} text-white flex items-center justify-center mb-1 text-xs font-black shadow-sm`;
        circle.textContent = s.num;
        el.className = `p-1 rounded-lg ${isReady ? 'text-emerald-700 font-black' : 'text-amber-800 font-black'}`;
      } else {
        // مرحلة قادمة لم تبدأ بعد
        circle.className = 'w-6 h-6 mx-auto rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-1 text-xs font-black';
        circle.textContent = s.num;
        el.className = 'p-1 rounded-lg text-slate-400 font-medium';
      }
    });
  }

  // طباعة كرت الاستلام بصورة نقية عبر طابعة المتصفح
  printTicket() {
    if (sounds && sounds.playTicketPrint) {
      sounds.playTicketPrint();
    }
    this.showToast('جاري تجهيز وطباعة كرت الاستلام لمقصف الفسحة 🖨️');
    setTimeout(() => {
      window.print();
    }, 250);
  }

  // عرض آخر كرت استلام للطالب مباشرة من شريط التنقل
  showMyLatestTicket() {
    const currentUser = store.getCurrentUser();
    const orders = store.getOrders().filter((o) => o.studentId === currentUser.id || o.studentName.includes(currentUser.name));
    if (orders.length > 0) {
      this.openTicketModal(orders[0]);
    } else {
      this.showToast('ليس لديك أي طلب حالي! أضف وجباتك إلى السلة وأكد طلبك للحصول على كرت الاستلام 🎫');
      this.toggleCartModal();
    }
  }

  renderTicketStatus(status, pillElement) {
    if (status === 'pending') {
      pillElement.className = 'p-3 rounded-2xl text-center text-xs font-black bg-amber-100 text-amber-800 border border-amber-200';
      pillElement.innerHTML = `
        <div class="flex items-center justify-center gap-2">
          <span class="animate-spin">⏳</span>
          <span>طلبك مسجّل وبانتظار موافقة مسؤول المقصف</span>
        </div>
      `;
    } else if (status === 'approved') {
      pillElement.className = 'p-3 rounded-2xl text-center text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200';
      pillElement.innerHTML = `
        <div class="flex items-center justify-center gap-2">
          <span>👨‍🍳</span>
          <span>تمت الموافقة! جاري تحضير وتجهيز وجبتك لفسحة 10:00 ص</span>
        </div>
      `;
    } else if (status === 'ready') {
      pillElement.className = 'p-3 rounded-2xl text-center text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 ready-pulse';
      pillElement.innerHTML = `
        <div class="flex items-center justify-center gap-2">
          <span>🔔</span>
          <span>وجبتك جاهزة الآن وساخنة على نافذة المقصف! تفضل بالاستلام</span>
        </div>
      `;
    } else if (status === 'delivered') {
      pillElement.className = 'p-3 rounded-2xl text-center text-xs font-black bg-slate-100 text-slate-700 border border-slate-200';
      pillElement.innerHTML = `
        <div class="flex items-center justify-center gap-2">
          <span>✅</span>
          <span>تم استلام الوجبة بنجاح • صحتين وعافية!</span>
        </div>
      `;
    } else if (status === 'cancelled') {
      pillElement.className = 'p-3 rounded-2xl text-center text-xs font-black bg-red-100 text-red-800 border border-red-200';
      pillElement.innerHTML = `
        <div class="flex items-center justify-center gap-2">
          <span>❌</span>
          <span>تم إلغاء الطلب من المقصف لعدم توفر بعض الأصناف</span>
        </div>
      `;
    }
  }

  closeTicketModal() {
    const modal = document.getElementById('ticket-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    this.activeTicketOrder = null;
  }

  // --- قائمة طلبات الطالب (My Orders Modal) ---
  showOrdersModal() {
    const modal = document.getElementById('orders-list-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.renderStudentOrdersModal();
    this.refreshIcons();
  }

  closeOrdersModal() {
    const modal = document.getElementById('orders-list-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  updateStudentOrdersUI(orders) {
    const currentUser = store.getCurrentUser();
    const userOrders = orders.filter((o) => o.studentId === currentUser.id || o.studentName.includes(currentUser.name));
    const countBadge = document.getElementById('my-orders-count');
    if (countBadge) countBadge.textContent = userOrders.length;
  }

  renderStudentOrdersModal() {
    const container = document.getElementById('student-orders-container');
    if (!container) return;

    const currentUser = store.getCurrentUser();
    const orders = store.getOrders().filter((o) => o.studentId === currentUser.id || o.studentName.includes(currentUser.name));

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10">
          <div class="text-4xl mb-2">📋</div>
          <h4 class="font-bold text-slate-700 text-sm">ليس لديك أي طلبات سابقة حتى الآن</h4>
          <p class="text-xs text-slate-400 mt-1">اطلب ساندويش أو عصير من القائمة وسجل طلباتك سيظهر هنا.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map((o) => {
      let statusBadge = '';
      if (o.status === 'pending') statusBadge = '<span class="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">⏳ قيد المراجعة</span>';
      else if (o.status === 'approved') statusBadge = '<span class="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">👨‍🍳 جاري التحضير</span>';
      else if (o.status === 'ready') statusBadge = '<span class="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full animate-bounce">🔔 جاهز للاستلام!</span>';
      else if (o.status === 'delivered') statusBadge = '<span class="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full">✅ تم التسليم</span>';
      else if (o.status === 'cancelled') statusBadge = '<span class="bg-red-100 text-red-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full">❌ ملغي</span>';

      return `
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-black text-slate-900 font-mono text-sm">#${o.id}</span>
            ${statusBadge}
          </div>
          
          <div class="text-xs text-slate-600 space-y-1">
            <p><strong>الموعد:</strong> ${o.breakName}</p>
            <p><strong>الوجبات:</strong> ${o.items.map((i) => `${i.name} (×${i.quantity})`).join('، ')}</p>
            ${o.notes ? `<p class="text-amber-700"><strong>ملاحظاتك:</strong> ${o.notes}</p>` : ''}
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
            <span class="font-bold text-emerald-700 font-mono text-sm">${o.totalPrice.toFixed(2)} ${APP_CONFIG.currency}</span>
            <button onclick="app.viewSpecificTicket('${o.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm">
              <i data-lucide="ticket" class="w-3.5 h-3.5"></i>
              <span>عرض كرت الاستلام</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.refreshIcons();
  }

  viewSpecificTicket(orderId) {
    const order = store.getOrders().find((o) => o.id === orderId);
    if (order) {
      this.closeOrdersModal();
      this.openTicketModal(order);
    }
  }

  // التنبيه العائم عندما يكون الطلب جاهزاً
  checkReadyOrdersNotification(orders) {
    const currentUser = store.getCurrentUser();
    const readyOrder = orders.find((o) => (o.studentId === currentUser.id || o.studentName.includes(currentUser.name)) && o.status === 'ready');
    const banner = document.getElementById('ready-alert-banner');
    const indicator = document.getElementById('ready-orders-indicator');

    if (readyOrder && currentUser.role === 'student') {
      if (banner) banner.classList.remove('hidden');
      if (indicator) indicator.classList.remove('hidden');
    } else {
      if (banner) banner.classList.add('hidden');
      if (indicator) indicator.classList.add('hidden');
    }
  }

  openLatestReadyTicket() {
    const currentUser = store.getCurrentUser();
    const readyOrder = store.getOrders().find((o) => (o.studentId === currentUser.id || o.studentName.includes(currentUser.name)) && o.status === 'ready');
    if (readyOrder) {
      this.openTicketModal(readyOrder);
    }
  }

  // --- لوحة تحكم صاحب المقصف (Owner Dashboard) ---
  renderOwnerStats(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const preparingOrders = orders.filter((o) => o.status === 'approved').length;
    const readyOrders = orders.filter((o) => o.status === 'ready').length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const elTotal = document.getElementById('stat-total-orders');
    const elPending = document.getElementById('stat-pending-orders');
    const elPrep = document.getElementById('stat-preparing-orders');
    const elReady = document.getElementById('stat-ready-orders');
    const elRev = document.getElementById('stat-total-revenue');
    const navPendingBadge = document.getElementById('nav-pending-badge');

    if (elTotal) elTotal.textContent = totalOrders;
    if (elPending) elPending.textContent = pendingOrders;
    if (elPrep) elPrep.textContent = preparingOrders;
    if (elReady) elReady.textContent = readyOrders;
    if (elRev) elRev.textContent = `${totalRevenue.toFixed(2)} ${APP_CONFIG.currency}`;
    if (navPendingBadge) navPendingBadge.textContent = pendingOrders;
  }

  switchOwnerTab(tabName) {
    this.currentOwnerTab = tabName;
    const btnOrders = document.getElementById('owner-tab-orders');
    const btnInv = document.getElementById('owner-tab-inventory');
    const viewOrders = document.getElementById('owner-orders-view');
    const viewInv = document.getElementById('owner-inventory-view');
    const filters = document.getElementById('owner-filters');

    if (tabName === 'orders') {
      btnOrders.className = 'px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-sm transition-all flex items-center gap-2';
      btnInv.className = 'px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2';
      viewOrders.classList.remove('hidden');
      viewInv.classList.add('hidden');
      if (filters) filters.classList.remove('hidden');
    } else {
      btnInv.className = 'px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-sm transition-all flex items-center gap-2';
      btnOrders.className = 'px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2';
      viewInv.classList.remove('hidden');
      viewOrders.classList.add('hidden');
      if (filters) filters.classList.add('hidden');
    }
    this.refreshIcons();
  }

  renderOwnerOrders() {
    const list = document.getElementById('owner-orders-list');
    const noOrders = document.getElementById('owner-no-orders');
    if (!list) return;

    const statusFilter = document.getElementById('owner-status-filter')?.value || 'all';
    let orders = store.getOrders();

    if (statusFilter !== 'all') {
      orders = orders.filter((o) => o.status === statusFilter);
    }

    if (orders.length === 0) {
      list.innerHTML = '';
      if (noOrders) noOrders.classList.remove('hidden');
      return;
    }

    if (noOrders) noOrders.classList.add('hidden');

    list.innerHTML = orders.map((order) => {
      let statusStyle = '';
      let statusName = '';

      if (order.status === 'pending') {
        statusStyle = 'bg-amber-100 text-amber-800 border-amber-200';
        statusName = '⏳ بانتظار الموافقة';
      } else if (order.status === 'approved') {
        statusStyle = 'bg-indigo-100 text-indigo-800 border-indigo-200';
        statusName = '👨‍🍳 قيد التحضير بالمطبخ';
      } else if (order.status === 'ready') {
        statusStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
        statusName = '🔔 جاهز للاستلام على النافذة';
      } else if (order.status === 'delivered') {
        statusStyle = 'bg-slate-100 text-slate-600 border-slate-200';
        statusName = '✅ تم التسليم للطالب';
      } else if (order.status === 'cancelled') {
        statusStyle = 'bg-red-100 text-red-600 border-red-200';
        statusName = '❌ طلب ملغي';
      }

      return `
        <div class="p-5 rounded-2xl border ${order.status === 'ready' ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-200 bg-white'} shadow-sm space-y-4">
          
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div class="flex items-center gap-3">
              <span class="font-mono text-base font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                #${order.id}
              </span>
              <div>
                <h4 class="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>${order.studentName}</span>
                  <span class="text-xs font-normal text-slate-500">(${order.grade})</span>
                </h4>
                <p class="text-xs text-amber-800 font-bold mt-0.5">
                  🕒 الفسحة المدرسية (10:00 ص) • وقت تقديم الطلب: ${order.orderTime}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-xl text-xs font-bold border ${statusStyle}">
                ${statusName}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span class="font-bold text-slate-400 block mb-1">الوجبات المطلوبة:</span>
              <ul class="space-y-1 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                ${order.items.map((i) => `
                  <li class="flex justify-between">
                    <span class="font-medium">• ${i.name} × ${i.quantity}</span>
                    <span class="font-mono font-bold">${(i.price * i.quantity).toFixed(2)} ${APP_CONFIG.currency}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="space-y-2">
              ${order.notes ? `
                <div class="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                  <strong class="block text-amber-800 mb-0.5">⚠️ ملاحظات الطالبة/الحساسية:</strong>
                  <span>${order.notes}</span>
                </div>
              ` : `
                <div class="bg-slate-50 p-3 rounded-xl text-slate-400 border border-slate-100">
                  لا توجد ملاحظات خاصة.
                </div>
              `}

              <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span class="font-bold text-slate-600">المجموع الواجب تحصيله:</span>
                <span class="text-base font-black text-emerald-700 font-mono">${order.totalPrice.toFixed(2)} ${APP_CONFIG.currency}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
            ${order.status === 'pending' ? `
              <button onclick="app.updateOrderStatus('${order.id}', 'approved')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                <span>قبول وبدء التحضير للفسحة</span>
              </button>
            ` : ''}

            ${order.status === 'approved' ? `
              <button onclick="app.updateOrderStatus('${order.id}', 'ready')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20">
                <i data-lucide="bell" class="w-3.5 h-3.5"></i>
                <span>إشعار الطالب: الطلب جاهز على النافذة 🔔</span>
              </button>
            ` : ''}

            ${order.status === 'ready' ? `
              <button onclick="app.updateOrderStatus('${order.id}', 'delivered')" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
                <span>تأكيد التسليم للطالب ✅</span>
              </button>
            ` : ''}

            ${order.status !== 'cancelled' && order.status !== 'delivered' ? `
              <button onclick="app.updateOrderStatus('${order.id}', 'cancelled')" class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all">
                إلغاء الطلب
              </button>
            ` : ''}

            <button onclick="app.viewSpecificTicket('${order.id}')" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>كرت الاستلام</span>
            </button>
          </div>

        </div>
      `;
    }).join('');

    this.refreshIcons();
  }

  updateOrderStatus(orderId, status) {
    store.updateOrderStatus(orderId, status);
    if (status === 'approved') this.showToast('تم قبول الطلب وبدء التحضير لفسحة 10:00 ص 👨‍🍳');
    if (status === 'ready') this.showToast('تم إشعار الطالب: الوجبة جاهزة للاستلام على النافذة 🔔');
    if (status === 'delivered') this.showToast('تم تأكيد تسليم الوجبة بنجاح ✅');
  }

  // --- إدارة المخزون وتوفر الأصناف (صاحب المقصف) ---
  handleInventoryFilter() {
    this.invSearchQuery = (document.getElementById('inv-search-input')?.value || '').trim().toLowerCase();
    this.invCatFilter = document.getElementById('inv-cat-filter')?.value || 'all';
    this.invStatusFilter = document.getElementById('inv-status-filter')?.value || 'all';
    this.renderOwnerInventory(store.getItems());
  }

  renderOwnerInventory(items) {
    const table = document.getElementById('owner-inventory-table');
    const noResults = document.getElementById('inv-no-results');
    const totalCountEl = document.getElementById('inv-total-count');
    const availCountEl = document.getElementById('inv-available-count');
    const outCountEl = document.getElementById('inv-out-count');

    if (!table) return;

    const totalCount = items.length;
    const availableCount = items.filter(i => i.available !== false).length;
    const outCount = totalCount - availableCount;

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (availCountEl) availCountEl.textContent = availableCount;
    if (outCountEl) outCountEl.textContent = outCount;

    let filtered = items.filter((item) => {
      const matchesSearch = !this.invSearchQuery || item.name.toLowerCase().includes(this.invSearchQuery);
      const matchesCat = this.invCatFilter === 'all' || item.category === this.invCatFilter;
      const isAvail = item.available !== false;
      const matchesStatus = this.invStatusFilter === 'all' || 
        (this.invStatusFilter === 'available' && isAvail) ||
        (this.invStatusFilter === 'out_of_stock' && !isAvail);

      return matchesSearch && matchesCat && matchesStatus;
    });

    if (filtered.length === 0) {
      table.innerHTML = '';
      if (noResults) noResults.classList.remove('hidden');
      return;
    }

    if (noResults) noResults.classList.add('hidden');

    table.innerHTML = filtered.map((item) => {
      const isAvailable = item.available !== false;
      const imgSrc = item.image || `./assets/images/${item.id}.svg`;

      return `
        <div class="p-4 bg-white rounded-2xl border ${isAvailable ? 'border-slate-200' : 'border-red-200 bg-red-50/15'} shadow-xs flex flex-col justify-between gap-3">
          
          <div class="flex items-start gap-3">
            <img 
              src="${imgSrc}" 
              alt="${item.name}" 
              onerror="app.handleImageError(this, '${item.id}')"
              class="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 ${!isAvailable ? 'grayscale opacity-70' : ''}"
            >
            <div class="flex-grow min-w-0">
              <div class="flex items-center justify-between gap-1">
                <h5 class="text-sm font-black text-slate-900 truncate">${item.name}</h5>
                <span class="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  ${item.price.toFixed(2)} ${APP_CONFIG.currency}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">⏱️ ${item.prepTime} • 🔥 ${item.calories}</p>
              
              <div class="mt-2 flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}"></span>
                <span class="text-xs font-bold ${isAvailable ? 'text-emerald-700' : 'text-red-700'}">
                  ${isAvailable ? 'متوفر للطلب بفسحة 10:00 ص' : 'نفد مؤقتاً (مخفي عن الطلاب)'}
                </span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button 
              onclick="app.toggleItemAvailability('${item.id}')" 
              class="flex-grow py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs ${
                isAvailable 
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300' 
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20'
              }"
            >
              <i data-lucide="${isAvailable ? 'toggle-right' : 'toggle-left'}" class="w-4 h-4"></i>
              <span>${isAvailable ? 'متوفر (انقر للتعطيل)' : 'نفد (انقر للإتاحة)'}</span>
            </button>

            <button 
              onclick="app.openEditModal('${item.id}')" 
              class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              title="تعديل السعر والبيانات"
            >
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>

            <button 
              onclick="app.deleteItem('${item.id}')" 
              class="p-2 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-xl text-xs transition-all"
              title="حذف الصنف"
            >
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>

        </div>
      `;
    }).join('');

    this.refreshIcons();
  }

  toggleItemAvailability(itemId) {
    const updated = store.toggleItemAvailability(itemId);
    if (updated) {
      if (updated.available) {
        this.showToast(`✅ أصبح الصنف "${updated.name}" متوفراً بالمقصف لفسحة 10:00 ص.`);
      } else {
        this.showToast(`❌ تم تعطيل الصنف "${updated.name}" كـ "نفد مؤقتاً" لحين إعادة تزويده.`);
      }
    }
  }

  openEditModal(itemId) {
    const item = store.getItems().find((i) => i.id === itemId);
    if (!item) return;

    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('edit-item-name').value = item.name;
    document.getElementById('edit-item-price').value = item.price.toFixed(2);
    document.getElementById('edit-item-prep').value = item.prepTime;
    document.getElementById('edit-item-available').value = String(item.available !== false);
    document.getElementById('edit-item-ingredients').value = item.ingredients || '';

    const modal = document.getElementById('edit-item-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.refreshIcons();
  }

  closeEditModal() {
    const modal = document.getElementById('edit-item-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  saveEditItem() {
    const itemId = document.getElementById('edit-item-id').value;
    const name = document.getElementById('edit-item-name').value.trim();
    const price = parseFloat(document.getElementById('edit-item-price').value) || 0.50;
    const prepTime = document.getElementById('edit-item-prep').value.trim() || '3 دقائق';
    const isAvail = document.getElementById('edit-item-available').value === 'true';
    const ingredients = document.getElementById('edit-item-ingredients').value.trim();

    store.updateItem(itemId, {
      name: name,
      price: price,
      prepTime: prepTime,
      available: isAvail,
      ingredients: ingredients
    });

    this.closeEditModal();
    this.showToast(`تم حفظ وتحديث بيانات صنف "${name}" وتحديث السعر إلى ${price.toFixed(2)} د.أ بنجاح!`);
  }

  deleteItem(itemId) {
    const item = store.getItems().find((i) => i.id === itemId);
    const itemName = item ? item.name : 'الصنف';
    if (confirm(`هل أنت متأكد من حذف "${itemName}" نهائياً من قائمة المقصف؟`)) {
      store.deleteItem(itemId);
      this.showToast(`تم حذف "${itemName}" من المقصف.`);
    }
  }

  openAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.refreshIcons();
  }

  closeAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  submitNewItem() {
    const name = document.getElementById('add-item-name').value.trim();
    if (!name) {
      alert('يرجى كتابة اسم الوجبة أو الصنف.');
      return;
    }

    const category = document.getElementById('add-item-category').value;
    const price = parseFloat(document.getElementById('add-item-price').value) || 0.75;
    const calories = document.getElementById('add-item-calories').value.trim() || '200 سعرة';
    const prepTime = document.getElementById('add-item-prep').value.trim() || '3 دقائق';
    const desc = document.getElementById('add-item-desc').value.trim() || 'وجبة مدرسية طازجة ومغذية ومحضرة في مقصف المدرسة.';
    const ingredients = document.getElementById('add-item-ingredients').value.trim() || 'مكونات طبيعية طازجة';

    store.addItem({
      name: name,
      category: category,
      price: price,
      calories: calories,
      prepTime: prepTime,
      imageDescription: desc,
      ingredients: ingredients,
      available: true
    });

    this.closeAddItemModal();
    document.getElementById('add-item-name').value = '';
    document.getElementById('add-item-desc').value = '';
    this.showToast(`تمت إضافة "${name}" إلى قائمة طعام مقصف الفسحة بنجاح! 🎉`);
  }

  resetInventoryDefaults() {
    if (confirm('هل ترغب في استعادة القائمة الأصلية المكونة من الـ 29 صنفاً وإعادة ضبط كافة الأصناف كمتوفرة؟')) {
      store.resetItemsToDefault();
      this.showToast('تمت استعادة القائمة الأصلية بنجاح!');
    }
  }

  seedNewTestOrder() {
    const items = store.getItems();
    const randomItem1 = items[0] || MENU_ITEMS[0];
    const randomItem2 = items[15] || MENU_ITEMS[15];

    const randomId = Math.floor(100 + Math.random() * 900);
    const orderData = {
      id: `ORD-${randomId}`,
      studentId: 'zaina',
      studentName: 'زينة اللبدي',
      grade: 'الصف الثامن (أ)',
      breakId: 'break-10am',
      breakName: 'الفسحة المدرسية (10:00 صباحاً)',
      orderTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      items: [
        { id: randomItem1.id, name: randomItem1.name, price: randomItem1.price, quantity: 1 },
        { id: randomItem2.id, name: randomItem2.name, price: randomItem2.price, quantity: 1 }
      ],
      totalPrice: randomItem1.price + randomItem2.price,
      notes: 'طلب تجريبي جديد للاختبار والمراجعة'
    };

    store.createOrder(orderData);
    sounds.playNewOrderAlert();
    this.showToast(`وصل طلب تجريبي جديد لفسحة 10:00 ص برقم #${orderData.id}!`);
  }

  resetData() {
    if (confirm('هل ترغب في إعادة ضبط كافة البيانات والطلبات والحسابات إلى الحالة الافتراضية؟')) {
      store.resetAllData();
      this.showToast('تمت إعادة ضبط بيانات مقصف الفسحة إلى الحالة الافتراضية.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new KanteenApp();
});
