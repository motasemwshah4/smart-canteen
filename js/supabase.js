// js/supabase.js - عميل ومنسق الربط السحابي مع منصة Supabase لمقصف الفسحة

export const SUPABASE_CONFIG = {
  url: 'https://umkicxaprplsldbfynlt.supabase.co',
  key: 'sb_publishable_m6yZU2NBDDbLqES9yZkOTQ_EBRyLTjU'
};

class SupabaseService {
  constructor() {
    this.url = SUPABASE_CONFIG.url;
    this.key = SUPABASE_CONFIG.key;
    this.client = null;
    this.realtimeChannel = null;
    this.status = {
      connected: false,
      tablesReady: false,
      lastCheck: null,
      error: null
    };

    this.initClient();
  }

  // تهيئة عميل Supabase الرسمي إذا كان السكربت متاحاً
  initClient() {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      try {
        this.client = window.supabase.createClient(this.url, this.key);
      } catch (e) {
        console.warn('Supabase JS Client initialization warning:', e);
      }
    }
  }

  // رأس الطلبات المشتركة لـ PostgREST API
  getHeaders(extra = {}) {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      ...extra
    };
  }

  // فحص حالة الاتصال وتوفر الجداول في قاعدة بيانات Supabase
  async checkConnection() {
    try {
      const res = await fetch(`${this.url}/rest/v1/menu_items?select=id&limit=1`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (res.ok) {
        this.status = {
          connected: true,
          tablesReady: true,
          lastCheck: Date.now(),
          error: null
        };
        return this.status;
      }

      const data = await res.json().catch(() => ({}));
      // رمز الخطأ PGRST205 يعني أن المشروع متصل بنجاح لكن الجداول لم تنشأ بعد
      if (data.code === 'PGRST205') {
        this.status = {
          connected: true,
          tablesReady: false,
          lastCheck: Date.now(),
          error: 'الجداول لم يتم إنشاؤها بعد في Supabase'
        };
        return this.status;
      }

      this.status = {
        connected: false,
        tablesReady: false,
        lastCheck: Date.now(),
        error: data.message || `HTTP ${res.status}`
      };
      return this.status;
    } catch (err) {
      this.status = {
        connected: false,
        tablesReady: false,
        lastCheck: Date.now(),
        error: err.message
      };
      return this.status;
    }
  }

  // ============================================================
  // عمليات قائمة الطعام والأصناف (Menu Items)
  // ============================================================
  async getMenuItems() {
    try {
      const res = await fetch(`${this.url}/rest/v1/menu_items?select=*&order=id.asc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) return null;
      const data = await res.json();
      
      // مطابقة أسماء الحقول مع كود التطبيق
      return data.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        price: parseFloat(d.price) || 0,
        calories: d.calories,
        prepTime: d.prep_time,
        image: d.image,
        imageDescription: d.image_description,
        ingredients: d.ingredients,
        available: d.available !== false,
        isPopular: !!d.is_popular
      }));
    } catch (e) {
      console.warn('Supabase getMenuItems error:', e);
      return null;
    }
  }

  async saveMenuItem(item) {
    try {
      const payload = {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        calories: item.calories,
        prep_time: item.prepTime,
        image: item.image,
        image_description: item.imageDescription,
        ingredients: item.ingredients,
        available: item.available !== false,
        is_popular: !!item.isPopular
      };

      const res = await fetch(`${this.url}/rest/v1/menu_items`, {
        method: 'POST',
        headers: this.getHeaders({
          'Prefer': 'resolution=merge-duplicates,return=representation'
        }),
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase saveMenuItem error:', e);
      return false;
    }
  }

  async updateItemFields(itemId, fields) {
    try {
      const payload = {};
      if (fields.name !== undefined) payload.name = fields.name;
      if (fields.price !== undefined) payload.price = fields.price;
      if (fields.prepTime !== undefined) payload.prep_time = fields.prepTime;
      if (fields.available !== undefined) payload.available = fields.available;
      if (fields.ingredients !== undefined) payload.ingredients = fields.ingredients;

      const res = await fetch(`${this.url}/rest/v1/menu_items?id=eq.${itemId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase updateItemFields error:', e);
      return false;
    }
  }

  async deleteMenuItem(itemId) {
    try {
      const res = await fetch(`${this.url}/rest/v1/menu_items?id=eq.${itemId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase deleteMenuItem error:', e);
      return false;
    }
  }

  // ============================================================
  // عمليات الطلبات (Orders)
  // ============================================================
  async getOrders() {
    try {
      const res = await fetch(`${this.url}/rest/v1/orders?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) return null;
      const data = await res.json();

      return data.map((d) => ({
        id: d.id,
        studentId: d.student_id,
        studentName: d.student_name,
        grade: d.grade,
        breakId: d.break_id || 'break-10am',
        breakName: d.break_name || 'الفسحة المدرسية (10:00 صباحاً)',
        orderTime: d.order_time,
        items: typeof d.items === 'string' ? JSON.parse(d.items) : (d.items || []),
        totalPrice: parseFloat(d.total_price) || 0,
        notes: d.notes || '',
        status: d.status || 'pending',
        createdAt: new Date(d.created_at).getTime()
      }));
    } catch (e) {
      console.warn('Supabase getOrders error:', e);
      return null;
    }
  }

  async createOrder(order) {
    try {
      const payload = {
        id: order.id,
        student_id: order.studentId || 'zaina',
        student_name: order.studentName || 'طالب/ـة',
        grade: order.grade || 'الصف الثامن (أ)',
        break_id: order.breakId || 'break-10am',
        break_name: order.breakName || 'الفسحة المدرسية (10:00 صباحاً)',
        order_time: order.orderTime,
        items: order.items,
        total_price: order.totalPrice,
        notes: order.notes || '',
        status: order.status || 'pending'
      };

      const res = await fetch(`${this.url}/rest/v1/orders`, {
        method: 'POST',
        headers: this.getHeaders({
          'Prefer': 'return=representation'
        }),
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase createOrder error:', e);
      return false;
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`${this.url}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase updateOrderStatus error:', e);
      return false;
    }
  }

  // ============================================================
  // عمليات المستخدمين والحسابات (Users)
  // ============================================================
  async getUsers() {
    try {
      const res = await fetch(`${this.url}/rest/v1/users?select=*`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) return null;
      const data = await res.json();

      const usersObj = {};
      data.forEach((u) => {
        usersObj[u.id] = {
          id: u.id,
          username: u.username,
          name: u.name,
          role: u.role,
          grade: u.grade,
          section: u.section,
          password: u.password,
          title: u.title,
          avatar: u.avatar,
          badgeColor: u.badge_color,
          isCreator: !!u.is_creator
        };
      });
      return usersObj;
    } catch (e) {
      console.warn('Supabase getUsers error:', e);
      return null;
    }
  }

  async saveUser(user) {
    try {
      const payload = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role || 'student',
        grade: user.grade,
        section: user.section,
        password: user.password || '123',
        title: user.title,
        avatar: user.avatar,
        badge_color: user.badgeColor,
        is_creator: !!user.isCreator
      };

      const res = await fetch(`${this.url}/rest/v1/users`, {
        method: 'POST',
        headers: this.getHeaders({
          'Prefer': 'resolution=merge-duplicates,return=representation'
        }),
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase saveUser error:', e);
      return false;
    }
  }

  // ============================================================
  // عمليات الدخول السريع (Quick Logins)
  // ============================================================
  async getQuickLoginIds() {
    try {
      const res = await fetch(`${this.url}/rest/v1/quick_logins?select=user_id`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.map((d) => d.user_id);
    } catch (e) {
      console.warn('Supabase getQuickLoginIds error:', e);
      return null;
    }
  }

  async addQuickLoginId(userId) {
    try {
      const res = await fetch(`${this.url}/rest/v1/quick_logins`, {
        method: 'POST',
        headers: this.getHeaders({
          'Prefer': 'resolution=merge-duplicates'
        }),
        body: JSON.stringify({ user_id: userId })
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase addQuickLoginId error:', e);
      return false;
    }
  }

  async removeQuickLoginId(userId) {
    try {
      const res = await fetch(`${this.url}/rest/v1/quick_logins?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase removeQuickLoginId error:', e);
      return false;
    }
  }

  // ============================================================
  // التحديث اللحظي المباشر عبر WebSocket (Supabase Realtime)
  // ============================================================
  initRealtime({ onOrderUpdate, onItemUpdate }) {
    if (!this.client && typeof window !== 'undefined' && window.supabase) {
      this.initClient();
    }
    if (!this.client) return;

    try {
      if (this.realtimeChannel) {
        this.realtimeChannel.unsubscribe();
      }

      this.realtimeChannel = this.client
        .channel('kanteen_realtime_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (onOrderUpdate) onOrderUpdate(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menu_items' },
          (payload) => {
            if (onItemUpdate) onItemUpdate(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('⚡ Supabase Realtime connected successfully!');
          }
        });
    } catch (e) {
      console.warn('Supabase Realtime subscription error:', e);
    }
  }
}

export const supabaseService = new SupabaseService();
