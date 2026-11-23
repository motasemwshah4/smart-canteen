// scripts/generate_images.js - إنشاء رسومات SVG ملونة وعالية الدقة لكافة أصناف المقصف
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('assets/images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// دالة مساعدة لبناء ملفات SVG جميلة ومحسّنة
function createFoodSVG({
  id,
  name,
  categoryName,
  bgColor1,
  bgColor2,
  accentColor,
  icon,
  detailsHtml
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor1}" />
      <stop offset="100%" stop-color="${bgColor2}" />
    </linearGradient>
    <linearGradient id="plate-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#f1f5f9" stop-opacity="0.95" />
    </linearGradient>
    <filter id="shadow-${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.18" />
    </filter>
    <filter id="glow-${id}">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- خلفية التدرج النابضة بالحياة -->
  <rect width="600" height="400" fill="url(#bg-${id})" />

  <!-- زخرفة دائرية خلفية ناعمة -->
  <circle cx="300" cy="180" r="160" fill="#ffffff" fill-opacity="0.08" />
  <circle cx="300" cy="180" r="120" fill="#ffffff" fill-opacity="0.08" />

  <!-- الصحن أو القاعدة الفنية للوجبة -->
  <ellipse cx="300" cy="225" rx="170" ry="85" fill="#000000" fill-opacity="0.12" />
  <ellipse cx="300" cy="215" rx="160" ry="78" fill="url(#plate-${id})" filter="url(#shadow-${id})" stroke="#e2e8f0" stroke-width="3" />
  <ellipse cx="300" cy="215" rx="135" ry="62" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.7" />

  <!-- عناصر الوجبة المركزية والرسومات المتجهة -->
  <g id="food-art" transform="translate(0, -10)">
    ${detailsHtml}
  </g>

  <!-- أيقونة تعبيرية طافية مع تأثير الظل -->
  <g transform="translate(480, 50)" filter="url(#shadow-${id})">
    <circle cx="0" cy="0" r="32" fill="#ffffff" />
    <text x="0" y="11" font-size="30" text-anchor="middle">${icon}</text>
  </g>

  <!-- شارة التصنيف العلوية -->
  <g transform="translate(40, 45)">
    <rect x="0" y="0" width="140" height="34" rx="17" fill="#000000" fill-opacity="0.3" backdrop-filter="blur(4px)" />
    <text x="70" y="22" fill="#ffffff" font-family="'Cairo', sans-serif" font-size="14" font-weight="bold" text-anchor="middle">
      ${categoryName}
    </text>
  </g>

  <!-- شريط اسم الصنف في الأسفل مع تباين عالي وقراءة واضحة -->
  <g transform="translate(0, 330)">
    <rect width="600" height="70" fill="#0f172a" fill-opacity="0.85" />
    <text x="300" y="44" fill="#ffffff" font-family="'Cairo', 'Tajawal', sans-serif" font-size="22" font-weight="900" text-anchor="middle">
      ${name}
    </text>
  </g>
</svg>`;
}

// تفاصيل كل صنف من الأصناف الـ 29
const items = [
  // --- الساندويشات والبيتزا ---
  {
    id: "item-1",
    name: "بيتزا بباروني صغير",
    categoryName: "الساندويشات والبيتزا",
    bgColor1: "#ea580c",
    bgColor2: "#9a3412",
    icon: "🍕",
    detailsHtml: `
      <!-- قرص البيتزا الذهبي المخبوز -->
      <ellipse cx="300" cy="200" rx="110" ry="55" fill="#d97706" stroke="#b45309" stroke-width="6" />
      <ellipse cx="300" cy="200" rx="98" ry="48" fill="#f59e0b" />
      <!-- صلصة الطماطم وجبنة الموزاريلا الذائبة -->
      <ellipse cx="300" cy="200" rx="90" ry="42" fill="#dc2626" />
      <ellipse cx="300" cy="200" rx="84" ry="38" fill="#fef08a" opacity="0.9" />
      <!-- شرائح الببروني الشهية -->
      <circle cx="260" cy="190" r="16" fill="#b91c1c" stroke="#991b1b" stroke-width="2" />
      <circle cx="262" cy="192" r="3" fill="#7f1d1d" />
      <circle cx="340" cy="195" r="18" fill="#b91c1c" stroke="#991b1b" stroke-width="2" />
      <circle cx="338" cy="193" r="3" fill="#7f1d1d" />
      <circle cx="300" cy="210" r="17" fill="#b91c1c" stroke="#991b1b" stroke-width="2" />
      <circle cx="298" cy="212" r="3" fill="#7f1d1d" />
      <circle cx="295" cy="180" r="14" fill="#b91c1c" stroke="#991b1b" stroke-width="2" />
      <!-- رشة أعشاب خضراء طازجة -->
      <circle cx="240" cy="205" r="3" fill="#15803d" />
      <circle cx="320" cy="180" r="3" fill="#15803d" />
      <circle cx="360" cy="205" r="3" fill="#15803d" />
      <!-- أوراق ريحان خضراء -->
      <path d="M280,185 Q288,175 292,185 Q288,190 280,185 Z" fill="#22c55e" />
      <path d="M325,205 Q333,198 335,208 Q330,212 325,205 Z" fill="#22c55e" />
    `
  },
  {
    id: "item-2",
    name: "بيتزا خضار صغير",
    categoryName: "الساندويشات والبيتزا",
    bgColor1: "#16a34a",
    bgColor2: "#15803d",
    icon: "🥦",
    detailsHtml: `
      <ellipse cx="300" cy="200" rx="110" ry="55" fill="#d97706" stroke="#b45309" stroke-width="6" />
      <ellipse cx="300" cy="200" rx="98" ry="48" fill="#fef08a" />
      <!-- قطع خضار منوعة: فلفل حلو، فطر، زيتون أسود -->
      <rect x="250" y="185" width="14" height="6" rx="3" fill="#22c55e" transform="rotate(25 257 188)" />
      <rect x="330" y="190" width="16" height="6" rx="3" fill="#ef4444" transform="rotate(-30 338 193)" />
      <rect x="280" y="210" width="14" height="6" rx="3" fill="#eab308" transform="rotate(15 287 213)" />
      <!-- شرائح فطر طازجة -->
      <path d="M310,180 Q320,170 330,180 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" />
      <rect x="317" y="180" width="6" height="8" fill="#cbd5e1" />
      <!-- زيتون أسود مقطع -->
      <circle cx="270" cy="205" r="9" fill="#1e293b" />
      <circle cx="270" cy="205" r="4" fill="#fef08a" />
      <circle cx="315" cy="215" r="9" fill="#1e293b" />
      <circle cx="315" cy="215" r="4" fill="#fef08a" />
      <circle cx="345" cy="180" r="8" fill="#1e293b" />
      <circle cx="345" cy="180" r="3.5" fill="#fef08a" />
    `
  },
  {
    id: "item-3",
    name: "بيتزا باربكيو صغير",
    categoryName: "الساندويشات والبيتزا",
    bgColor1: "#b45309",
    bgColor2: "#78350f",
    icon: "🍗",
    detailsHtml: `
      <ellipse cx="300" cy="200" rx="110" ry="55" fill="#d97706" stroke="#b45309" stroke-width="6" />
      <ellipse cx="300" cy="200" rx="98" ry="48" fill="#fef08a" />
      <!-- خطوط صوص الباربكيو المدخن الداكن -->
      <path d="M220,195 Q260,220 300,190 T380,205" fill="none" stroke="#7f1d1d" stroke-width="6" stroke-linecap="round" />
      <path d="M240,180 Q280,210 320,185 T370,195" fill="none" stroke="#7f1d1d" stroke-width="5" stroke-linecap="round" />
      <!-- قطع الدجاج المشوي -->
      <rect x="250" y="195" width="20" height="14" rx="4" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
      <rect x="310" y="185" width="22" height="15" rx="4" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
      <rect x="335" y="205" width="18" height="12" rx="4" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
      <rect x="280" y="215" width="20" height="13" rx="4" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
      <!-- حلقات بصل أحمر مقرمش -->
      <circle cx="275" cy="185" r="14" fill="none" stroke="#a855f7" stroke-width="3" />
      <circle cx="340" cy="195" r="12" fill="none" stroke="#a855f7" stroke-width="3" />
    `
  },
  {
    id: "item-4",
    name: "ساندويش لبنة وتيركي",
    categoryName: "الساندويشات والبيتزا",
    bgColor1: "#0284c7",
    bgColor2: "#0369a1",
    icon: "🥖",
    detailsHtml: `
      <!-- خبز باغيت فرنسي محمص -->
      <path d="M200,200 Q300,165 400,200 L395,225 Q300,245 205,225 Z" fill="#d97706" stroke="#b45309" stroke-width="4" />
      <!-- طبقة اللبنة البيضاء الكريمية -->
      <path d="M210,205 Q300,180 390,205 L385,218 Q300,230 215,218 Z" fill="#f8fafc" />
      <!-- شرائح تيركي مدخن وردية -->
      <path d="M220,200 Q250,185 280,205" fill="none" stroke="#f472b6" stroke-width="8" stroke-linecap="round" />
      <path d="M300,202 Q340,188 380,204" fill="none" stroke="#f472b6" stroke-width="8" stroke-linecap="round" />
      <!-- شرائح خيار خضراء ونعناع طازج -->
      <circle cx="245" cy="205" r="10" fill="#22c55e" stroke="#16a34a" stroke-width="2" />
      <circle cx="295" cy="208" r="11" fill="#22c55e" stroke="#16a34a" stroke-width="2" />
      <circle cx="345" cy="206" r="10" fill="#22c55e" stroke="#16a34a" stroke-width="2" />
      <!-- أوراق نعناع -->
      <path d="M265,190 Q275,180 280,192 Q272,198 265,190 Z" fill="#15803d" />
      <path d="M320,192 Q330,182 335,194 Q327,200 320,192 Z" fill="#15803d" />
    `
  },
  {
    id: "item-5",
    name: "ساندويش خضار",
    categoryName: "الساندويشات والبيتزا",
    bgColor1: "#059669",
    bgColor2: "#047857",
    icon: "🥪",
    detailsHtml: `
      <!-- توست بالحبوب الكاملة -->
      <polygon points="210,230 300,165 390,230" fill="#b45309" stroke="#78350f" stroke-width="4" />
      <polygon points="215,225 300,172 385,225" fill="#fde68a" />
      <!-- طبقات الخس المقرمش المتموج -->
      <path d="M220,220 Q240,205 260,222 T300,208 T340,222 T380,215" fill="none" stroke="#22c55e" stroke-width="9" stroke-linecap="round" />
      <!-- شرائح طماطم حمراء ناضجة -->
      <ellipse cx="260" cy="210" rx="18" ry="9" fill="#ef4444" />
      <ellipse cx="330" cy="212" rx="18" ry="9" fill="#ef4444" />
      <!-- خيار وجزر -->
      <ellipse cx="295" cy="205" rx="14" ry="7" fill="#4ade80" />
      <rect x="245" y="215" width="14" height="4" rx="2" fill="#f97316" />
      <rect x="315" y="217" width="16" height="4" rx="2" fill="#f97316" />
      <!-- التوست العلوي المائل -->
      <polygon points="210,215 300,150 390,215" fill="#d97706" opacity="0.85" />
    `
  },
  {
    id: "item-6",
    name: "ساندويش جبنة",
    categoryName: "الساندويشات والبيتزا",
    bgColor1: "#d97706",
    bgColor2: "#b45309",
    icon: "🧀",
    detailsHtml: `
      <!-- توست محمص ذهبي مقرمش -->
      <rect x="220" y="170" width="160" height="70" rx="16" fill="#b45309" stroke="#78350f" stroke-width="4" transform="rotate(-5 300 205)" />
      <rect x="225" y="175" width="150" height="60" rx="12" fill="#fde047" transform="rotate(-5 300 205)" />
      <!-- خطوط الشواء المحمصة الجذابة -->
      <line x1="245" y1="180" x2="285" y2="230" stroke="#78350f" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      <line x1="285" y1="175" x2="325" y2="225" stroke="#78350f" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      <line x1="325" y1="170" x2="365" y2="220" stroke="#78350f" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      <!-- قطرات الجبنة الذائبة الغنية التي تسيل من الأطراف -->
      <path d="M230,225 Q235,245 240,225" fill="#f59e0b" />
      <path d="M275,230 Q280,255 290,230" fill="#f59e0b" />
      <path d="M330,228 Q335,250 345,225" fill="#f59e0b" />
    `
  },
  {
    id: "item-7",
    name: "ساندويش تيركي وجبنة",
    categoryName: "الساندويشات والبيتزا",
    bgColor1: "#c026d3",
    bgColor2: "#9333ea",
    icon: "🥪",
    detailsHtml: `
      <path d="M210,195 Q300,165 390,195 L385,225 Q300,245 215,225 Z" fill="#d97706" stroke="#b45309" stroke-width="4" />
      <!-- شرائح الجبن الأصفر الذائب -->
      <path d="M220,205 Q300,185 380,205" fill="none" stroke="#fbbf24" stroke-width="10" stroke-linecap="round" />
      <!-- شرائح التيركي المدخن -->
      <path d="M225,215 Q300,195 375,215" fill="none" stroke="#f472b6" stroke-width="9" stroke-linecap="round" />
      <!-- خس مقرمش -->
      <circle cx="250" cy="208" r="8" fill="#22c55e" />
      <circle cx="290" cy="206" r="9" fill="#22c55e" />
      <circle cx="340" cy="209" r="8" fill="#22c55e" />
      <!-- حبات سمسم على الوجه -->
      <ellipse cx="260" cy="185" rx="3" ry="1.5" fill="#fef08a" transform="rotate(20 260 185)" />
      <ellipse cx="300" cy="180" rx="3" ry="1.5" fill="#fef08a" transform="rotate(-15 300 180)" />
      <ellipse cx="340" cy="185" rx="3" ry="1.5" fill="#fef08a" transform="rotate(30 340 185)" />
    `
  },

  // --- السلطات والمقبلات ---
  {
    id: "item-8",
    name: "سيزر",
    categoryName: "السلطات والمقبلات",
    bgColor1: "#10b981",
    bgColor2: "#047857",
    icon: "🥗",
    detailsHtml: `
      <!-- زبدية السلطة الشفافة -->
      <ellipse cx="300" cy="210" rx="100" ry="45" fill="#22c55e" opacity="0.9" />
      <!-- أوراق الخس الروماني الطازجة -->
      <circle cx="250" cy="190" r="22" fill="#4ade80" />
      <circle cx="300" cy="185" r="25" fill="#22c55e" />
      <circle cx="345" cy="192" r="22" fill="#86efac" />
      <circle cx="280" cy="205" r="20" fill="#16a34a" />
      <circle cx="320" cy="205" r="20" fill="#4ade80" />
      <!-- مكعبات الخبز المحمص المتبل (كروتونز) -->
      <rect x="250" y="180" width="14" height="14" rx="3" fill="#d97706" stroke="#b45309" stroke-width="1.5" />
      <rect x="310" y="175" width="15" height="15" rx="3" fill="#d97706" stroke="#b45309" stroke-width="1.5" />
      <rect x="285" y="200" width="13" height="13" rx="3" fill="#d97706" stroke="#b45309" stroke-width="1.5" />
      <rect x="340" y="195" width="13" height="13" rx="3" fill="#d97706" stroke="#b45309" stroke-width="1.5" />
      <!-- شرائح جبنة البارميزان الرقيقة البيضاء -->
      <polygon points="270,195 285,190 280,200" fill="#f8fafc" />
      <polygon points="325,190 340,185 332,198" fill="#f8fafc" />
      <polygon points="295,185 310,180 305,192" fill="#f8fafc" />
    `
  },
  {
    id: "item-9",
    name: "سلطة عربية",
    categoryName: "السلطات والمقبلات",
    bgColor1: "#15803d",
    bgColor2: "#166534",
    icon: "🥒",
    detailsHtml: `
      <!-- وعاء سلطة خشبية دافئة -->
      <ellipse cx="300" cy="210" rx="95" ry="40" fill="#15803d" />
      <!-- مكعبات طماطم حمراء ناضجة -->
      <rect x="240" y="190" width="14" height="12" rx="3" fill="#ef4444" stroke="#b91c1c" stroke-width="1" />
      <rect x="310" y="185" width="15" height="13" rx="3" fill="#ef4444" stroke="#b91c1c" stroke-width="1" />
      <rect x="275" y="205" width="14" height="12" rx="3" fill="#ef4444" stroke="#b91c1c" stroke-width="1" />
      <rect x="345" y="200" width="14" height="12" rx="3" fill="#ef4444" stroke="#b91c1c" stroke-width="1" />
      <!-- مكعبات خيار بلدي أخضر -->
      <rect x="260" y="185" width="13" height="13" rx="3" fill="#4ade80" stroke="#16a34a" stroke-width="1" />
      <rect x="290" y="195" width="14" height="14" rx="3" fill="#4ade80" stroke="#16a34a" stroke-width="1" />
      <rect x="330" y="190" width="13" height="13" rx="3" fill="#4ade80" stroke="#16a34a" stroke-width="1" />
      <!-- بقدونس مفروم ناعم ونعناع -->
      <circle cx="280" cy="180" r="3" fill="#14532d" />
      <circle cx="320" cy="205" r="3" fill="#14532d" />
      <circle cx="255" cy="208" r="3" fill="#14532d" />
      <!-- شريحة ليمون صفراء على حافة الصحن -->
      <path d="M220,185 A20,20 0 0,0 240,205 Z" fill="#facc15" stroke="#eab308" stroke-width="2" />
    `
  },
  {
    id: "item-10",
    name: "يلنجي",
    categoryName: "السلطات والمقبلات",
    bgColor1: "#4d7c0f",
    bgColor2: "#365314",
    icon: "🫒",
    detailsHtml: `
      <!-- حبات ورق العنب اليلنجي الأنيقة الملفوفة -->
      <rect x="230" y="180" width="55" height="22" rx="10" fill="#3f6212" stroke="#1a2e05" stroke-width="2" transform="rotate(-15 255 190)" />
      <rect x="290" y="175" width="60" height="24" rx="11" fill="#365314" stroke="#1a2e05" stroke-width="2" transform="rotate(5 320 185)" />
      <rect x="260" y="205" width="58" height="22" rx="10" fill="#4d7c0f" stroke="#1a2e05" stroke-width="2" transform="rotate(-5 290 215)" />
      <rect x="325" y="200" width="55" height="22" rx="10" fill="#3f6212" stroke="#1a2e05" stroke-width="2" transform="rotate(15 350 210)" />
      <!-- لمعة زيت الزيتون الصافي -->
      <ellipse cx="255" cy="185" rx="12" ry="4" fill="#ffffff" opacity="0.3" transform="rotate(-15 255 185)" />
      <ellipse cx="320" cy="182" rx="14" ry="4" fill="#ffffff" opacity="0.3" transform="rotate(5 320 182)" />
      <!-- حبات رمان ياقوتية زاهية -->
      <circle cx="240" cy="215" r="4" fill="#991b1b" />
      <circle cx="280" cy="170" r="4.5" fill="#991b1b" />
      <circle cx="360" cy="190" r="4" fill="#991b1b" />
      <circle cx="310" cy="225" r="4" fill="#991b1b" />
      <!-- شريحة ليمون حامض -->
      <circle cx="365" cy="175" r="14" fill="#facc15" stroke="#eab308" stroke-width="2" />
    `
  },
  {
    id: "item-11",
    name: "سوشي",
    categoryName: "السلطات والمقبلات",
    bgColor1: "#0f766e",
    bgColor2: "#115e59",
    icon: "🍱",
    detailsHtml: `
      <!-- رول سوشي 1 -->
      <ellipse cx="240" cy="200" rx="30" ry="24" fill="#1e293b" />
      <ellipse cx="240" cy="200" rx="24" ry="18" fill="#f8fafc" />
      <circle cx="236" cy="198" r="7" fill="#f97316" />
      <circle cx="245" cy="202" r="5" fill="#22c55e" />
      <!-- رول سوشي 2 -->
      <ellipse cx="300" cy="190" rx="32" ry="25" fill="#1e293b" />
      <ellipse cx="300" cy="190" rx="25" ry="19" fill="#f8fafc" />
      <circle cx="295" cy="188" r="8" fill="#ef4444" />
      <circle cx="306" cy="192" r="6" fill="#eab308" />
      <!-- رول سوشي 3 -->
      <ellipse cx="360" cy="200" rx="30" ry="24" fill="#1e293b" />
      <ellipse cx="360" cy="200" rx="24" ry="18" fill="#f8fafc" />
      <circle cx="355" cy="198" r="7" fill="#f97316" />
      <circle cx="365" cy="202" r="5" fill="#22c55e" />
      <!-- طبق صويا صوص صغير بجانب السوشي -->
      <ellipse cx="300" cy="235" rx="30" ry="12" fill="#451a03" stroke="#e2e8f0" stroke-width="2" />
    `
  },

  // --- الباستا والأطباق الساخنة ---
  {
    id: "item-12",
    name: "معكرونة تقليدية بالصلصة الحمراء",
    categoryName: "الباستا والأطباق الساخنة",
    bgColor1: "#dc2626",
    bgColor2: "#991b1b",
    icon: "🍝",
    detailsHtml: `
      <!-- زبدية باستا عميقة -->
      <ellipse cx="300" cy="210" rx="90" ry="45" fill="#b91c1c" />
      <!-- خيوط سباغيتي / بيني بالصلصة الغنية -->
      <path d="M230,205 Q270,170 310,210 T370,195" fill="none" stroke="#ef4444" stroke-width="12" stroke-linecap="round" />
      <path d="M240,190 Q290,165 330,195 T360,215" fill="none" stroke="#dc2626" stroke-width="10" stroke-linecap="round" />
      <path d="M250,215 Q290,185 340,210" fill="none" stroke="#f87171" stroke-width="8" stroke-linecap="round" />
      <!-- جبنة بارميزان مبروشة -->
      <circle cx="280" cy="185" r="2" fill="#ffffff" />
      <circle cx="310" cy="190" r="2.5" fill="#ffffff" />
      <circle cx="295" cy="200" r="2" fill="#ffffff" />
      <circle cx="330" cy="200" r="2" fill="#ffffff" />
      <circle cx="270" cy="205" r="2" fill="#ffffff" />
      <!-- غصن ريحان إيطالي أخضر -->
      <path d="M295,175 Q305,160 315,175 Q305,182 295,175 Z" fill="#22c55e" />
    `
  },
  {
    id: "item-13",
    name: "فوتتشيني",
    categoryName: "الباستا والأطباق الساخنة",
    bgColor1: "#d97706",
    bgColor2: "#92400e",
    icon: "🧀",
    detailsHtml: `
      <ellipse cx="300" cy="210" rx="95" ry="46" fill="#fef3c7" />
      <!-- أشرطة الفوتتشيني العريضة بالكريمة البيضاء الفاخرة -->
      <path d="M225,200 Q265,165 315,205 T375,190" fill="none" stroke="#fffbeb" stroke-width="16" stroke-linecap="round" />
      <path d="M240,215 Q285,180 345,210" fill="none" stroke="#fef08a" stroke-width="14" stroke-linecap="round" />
      <path d="M235,185 Q295,160 355,185" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" />
      <!-- شرائح فطر طازجة برونزية -->
      <path d="M270,185 Q280,175 290,185 Z" fill="#78350f" opacity="0.8" />
      <rect x="278" y="185" width="5" height="7" fill="#78350f" opacity="0.8" />
      <path d="M320,195 Q330,185 340,195 Z" fill="#78350f" opacity="0.8" />
      <rect x="328" y="195" width="5" height="7" fill="#78350f" opacity="0.8" />
      <!-- رشة فلفل أسود وبقدونس مجفف -->
      <circle cx="260" cy="195" r="1.5" fill="#1e293b" />
      <circle cx="300" cy="180" r="1.5" fill="#1e293b" />
      <circle cx="340" cy="205" r="1.5" fill="#1e293b" />
      <circle cx="290" cy="210" r="2" fill="#15803d" />
      <circle cx="330" cy="180" r="2" fill="#15803d" />
    `
  },
  {
    id: "item-14",
    name: "ماك اند تشيز",
    categoryName: "الباستا والأطباق الساخنة",
    bgColor1: "#f59e0b",
    bgColor2: "#b45309",
    icon: "🫕",
    detailsHtml: `
      <!-- زبدية ماك اند تشيز ذهبية غنية -->
      <ellipse cx="300" cy="210" rx="90" ry="45" fill="#d97706" />
      <!-- مكرونة كوع حلزونية غارقة بالجبن -->
      <path d="M240,190 Q255,175 270,190" fill="none" stroke="#fbbf24" stroke-width="12" stroke-linecap="round" />
      <path d="M280,180 Q295,165 310,180" fill="none" stroke="#f59e0b" stroke-width="12" stroke-linecap="round" />
      <path d="M320,185 Q335,170 350,185" fill="none" stroke="#fbbf24" stroke-width="12" stroke-linecap="round" />
      <path d="M255,210 Q270,195 285,210" fill="none" stroke="#f59e0b" stroke-width="12" stroke-linecap="round" />
      <path d="M295,215 Q310,200 325,215" fill="none" stroke="#fbbf24" stroke-width="12" stroke-linecap="round" />
      <path d="M335,210 Q350,195 365,210" fill="none" stroke="#f59e0b" stroke-width="12" stroke-linecap="round" />
      <!-- لمعة الجبنة الكريمية المذابة -->
      <ellipse cx="300" cy="195" rx="70" ry="25" fill="#fef08a" opacity="0.4" />
    `
  },
  {
    id: "item-15",
    name: "بطاطا مهروسة",
    categoryName: "الباستا والأطباق الساخنة",
    bgColor1: "#eab308",
    bgColor2: "#a16207",
    icon: "🥔",
    detailsHtml: `
      <!-- زبدية بطاطا مهروسة حريرية القوام -->
      <ellipse cx="300" cy="215" rx="85" ry="42" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
      <path d="M230,210 Q300,165 370,210 Z" fill="#fef9c3" />
      <!-- فوهة زبدة ذائبة ذهبية تسيل في المنتصف -->
      <ellipse cx="300" cy="195" rx="26" ry="14" fill="#eab308" />
      <rect x="290" y="185" width="20" height="12" rx="3" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
      <!-- رشة أعشاب خضراء ناعمة -->
      <circle cx="270" cy="195" r="2" fill="#15803d" />
      <circle cx="325" cy="190" r="2" fill="#15803d" />
      <circle cx="295" cy="210" r="2" fill="#15803d" />
      <circle cx="335" cy="205" r="2" fill="#15803d" />
    `
  },

  // --- العصائر والمشروبات ---
  {
    id: "item-16",
    name: "حليب وفراولة",
    categoryName: "العصائر والمشروبات",
    bgColor1: "#ec4899",
    bgColor2: "#be185d",
    icon: "🍓",
    detailsHtml: `
      <!-- علبة حليب وردية كرتونية لطيفة -->
      <polygon points="260,160 300,135 340,160 340,245 260,245" fill="#fbcfe8" stroke="#db2777" stroke-width="3" />
      <polygon points="260,160 300,135 340,160" fill="#f472b6" />
      <text x="300" y="195" fill="#be185d" font-family="'Cairo', sans-serif" font-size="14" font-weight="900" text-anchor="middle">حليب</text>
      <!-- حبة فراولة حمراء مرسومة على العلبة -->
      <path d="M290,210 Q300,200 310,210 Q300,230 290,210 Z" fill="#e11d48" />
      <path d="M295,205 Q300,200 305,205 Z" fill="#22c55e" />
      <!-- مصاصة شرب مخططة -->
      <line x1="330" y1="140" x2="355" y2="105" stroke="#ec4899" stroke-width="6" stroke-linecap="round" />
      <line x1="330" y1="140" x2="355" y2="105" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-dasharray="6 6" />
    `
  },
  {
    id: "item-17",
    name: "حليب وموز",
    categoryName: "العصائر والمشروبات",
    bgColor1: "#eab308",
    bgColor2: "#ca8a04",
    icon: "🍌",
    detailsHtml: `
      <polygon points="260,160 300,135 340,160 340,245 260,245" fill="#fef08a" stroke="#eab308" stroke-width="3" />
      <polygon points="260,160 300,135 340,160" fill="#fde047" />
      <text x="300" y="195" fill="#854d0e" font-family="'Cairo', sans-serif" font-size="14" font-weight="900" text-anchor="middle">موز</text>
      <!-- رسمة موزة صفراء لطيفة -->
      <path d="M285,210 Q300,225 315,212 Q300,232 285,210 Z" fill="#ca8a04" />
      <!-- مصاصة شرب مخططة -->
      <line x1="330" y1="140" x2="355" y2="105" stroke="#eab308" stroke-width="6" stroke-linecap="round" />
      <line x1="330" y1="140" x2="355" y2="105" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-dasharray="6 6" />
    `
  },
  {
    id: "item-18",
    name: "عصير فواكه مشكلة",
    categoryName: "العصائر والمشروبات",
    bgColor1: "#ea580c",
    bgColor2: "#c2410c",
    icon: "🍹",
    detailsHtml: `
      <!-- كأس كوكتيل فواكه استوائي أنيق -->
      <path d="M260,140 L275,225 Q300,240 325,225 L340,140 Z" fill="#fb923c" stroke="#ea580c" stroke-width="3" />
      <!-- طبقات ألوان العصير الطبيعي -->
      <path d="M265,195 L275,225 Q300,240 325,225 L335,195 Z" fill="#dc2626" />
      <path d="M262,165 L265,195 L335,195 L338,165 Z" fill="#f59e0b" />
      <!-- مكعبات ثلج طافية ومصاصة -->
      <rect x="280" y="145" width="16" height="16" rx="3" fill="#ffffff" opacity="0.6" />
      <rect x="305" y="150" width="14" height="14" rx="3" fill="#ffffff" opacity="0.6" />
      <!-- شريحة برتقال على حافة الكأس -->
      <circle cx="260" cy="140" r="16" fill="#f97316" stroke="#ea580c" stroke-width="2" />
      <!-- مصاصة زاهية مائلة -->
      <line x1="315" y1="190" x2="350" y2="100" stroke="#06b6d4" stroke-width="5" stroke-linecap="round" />
    `
  },
  {
    id: "item-19",
    name: "عصير برتقال",
    categoryName: "العصائر والمشروبات",
    bgColor1: "#f97316",
    bgColor2: "#c2410c",
    icon: "🍊",
    detailsHtml: `
      <path d="M265,140 L275,225 Q300,240 325,225 L335,140 Z" fill="#f97316" stroke="#ea580c" stroke-width="3" />
      <ellipse cx="300" cy="140" rx="35" ry="10" fill="#fb923c" />
      <!-- شريحة برتقال ذهبية طازجة كاملة بجانب الكأس -->
      <circle cx="240" cy="210" r="28" fill="#ea580c" stroke="#c2410c" stroke-width="3" />
      <circle cx="240" cy="210" r="22" fill="#fb923c" />
      <!-- خطوط فصوص البرتقال -->
      <line x1="240" y1="190" x2="240" y2="230" stroke="#ea580c" stroke-width="2" />
      <line x1="220" y1="210" x2="260" y2="210" stroke="#ea580c" stroke-width="2" />
      <!-- مصاصة خضراء منعشة -->
      <line x1="310" y1="180" x2="335" y2="105" stroke="#22c55e" stroke-width="5" stroke-linecap="round" />
    `
  },
  {
    id: "item-20",
    name: "عصير تفاح",
    categoryName: "العصائر والمشروبات",
    bgColor1: "#eab308",
    bgColor2: "#854d0e",
    icon: "🍏",
    detailsHtml: `
      <path d="M265,140 L275,225 Q300,240 325,225 L335,140 Z" fill="#fde047" stroke="#eab308" stroke-width="3" />
      <ellipse cx="300" cy="140" rx="35" ry="10" fill="#fef08a" />
      <!-- تفاحة حمراء طازجة بورقة خضراء بجانب الكأس -->
      <circle cx="240" cy="215" r="24" fill="#dc2626" stroke="#991b1b" stroke-width="2" />
      <path d="M240,191 Q245,180 250,186" fill="none" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
      <path d="M246,183 Q254,175 258,184 Q252,188 246,183 Z" fill="#22c55e" />
      <!-- مصاصة شرب ذهبية -->
      <line x1="310" y1="180" x2="335" y2="105" stroke="#eab308" stroke-width="5" stroke-linecap="round" />
    `
  },
  {
    id: "item-21",
    name: "شنينه",
    categoryName: "العصائر والمشروبات",
    bgColor1: "#0284c7",
    bgColor2: "#0369a1",
    icon: "🥛",
    detailsHtml: `
      <!-- زجاجة لبن شنينة بلدي مثلج أبيض ناصع -->
      <rect x="270" y="150" width="60" height="95" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3" />
      <rect x="282" y="135" width="36" height="16" rx="4" fill="#0284c7" />
      <!-- بطاقة تعريف الشنينة الزرقاء -->
      <rect x="270" y="180" width="60" height="35" fill="#0284c7" opacity="0.9" />
      <text x="300" y="202" fill="#ffffff" font-family="'Cairo', sans-serif" font-size="13" font-weight="900" text-anchor="middle">شنينه</text>
      <!-- قطرات ندى باردة منعشة على الزجاجة -->
      <ellipse cx="280" cy="165" rx="2" ry="4" fill="#38bdf8" />
      <ellipse cx="320" cy="170" rx="2" ry="4" fill="#38bdf8" />
      <ellipse cx="285" cy="230" rx="2" ry="4" fill="#38bdf8" />
      <!-- ورقة نعناع خضراء منعشة -->
      <path d="M335,190 Q350,180 355,195 Q345,202 335,190 Z" fill="#22c55e" />
    `
  },
  {
    id: "item-22",
    name: "شنينه فراولة",
    categoryName: "العصائر والمشروبات",
    bgColor1: "#db2777",
    bgColor2: "#9d174d",
    icon: "🍓",
    detailsHtml: `
      <!-- عبوة شنينة بالفراولة وردية زاهية ومبتكرة -->
      <rect x="270" y="150" width="60" height="95" rx="14" fill="#fce7f3" stroke="#f472b6" stroke-width="3" />
      <rect x="282" y="135" width="36" height="16" rx="4" fill="#db2777" />
      <rect x="270" y="180" width="60" height="35" fill="#db2777" opacity="0.9" />
      <text x="300" y="202" fill="#ffffff" font-family="'Cairo', sans-serif" font-size="11" font-weight="900" text-anchor="middle">شنينه فراولة</text>
      <!-- حبة فراولة بجانب العبوة -->
      <circle cx="240" cy="220" r="14" fill="#e11d48" />
      <path d="M235,206 Q240,200 245,206 Z" fill="#22c55e" />
    `
  },
  {
    id: "item-23",
    name: "ماء صغير",
    categoryName: "العصائر والمشروبات",
    bgColor1: "#06b6d4",
    bgColor2: "#0891b2",
    icon: "💧",
    detailsHtml: `
      <!-- زجاجة مياه معدنية نقية صغيرة 330 مل -->
      <rect x="275" y="145" width="50" height="100" rx="12" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2.5" />
      <rect x="285" y="130" width="30" height="16" rx="4" fill="#0284c7" />
      <!-- بطاقة زرقاء على الزجاجة -->
      <rect x="275" y="180" width="50" height="30" fill="#0284c7" opacity="0.8" />
      <text x="300" y="200" fill="#ffffff" font-family="'Cairo', sans-serif" font-size="12" font-weight="900" text-anchor="middle">ماء نقي</text>
      <!-- موجات ولمعان الماء الصافي -->
      <path d="M280,165 Q290,160 300,165 T320,165" fill="none" stroke="#38bdf8" stroke-width="2" />
      <path d="M280,225 Q290,220 300,225 T320,225" fill="none" stroke="#38bdf8" stroke-width="2" />
      <circle cx="240" cy="205" r="16" fill="#38bdf8" opacity="0.3" />
      <text x="240" y="211" font-size="18" text-anchor="middle">💧</text>
    `
  },

  // --- الأطباق الرئيسية ---
  {
    id: "item-24",
    name: "طبق اليوم من الارز",
    categoryName: "الأطباق الرئيسية",
    bgColor1: "#d97706",
    bgColor2: "#78350f",
    icon: "🍛",
    detailsHtml: `
      <!-- صحن الأرز البسمتي الذهبي الفاخر -->
      <ellipse cx="300" cy="210" rx="95" ry="45" fill="#fef08a" stroke="#d97706" stroke-width="2" />
      <!-- كومة أرز مفلفل بالبهارات الهادئة -->
      <ellipse cx="300" cy="195" rx="80" ry="32" fill="#fde047" />
      <!-- قطع صدر دجاج محمر شهية -->
      <rect x="260" y="180" width="35" height="20" rx="6" fill="#b45309" stroke="#78350f" stroke-width="2" />
      <rect x="305" y="175" width="40" height="22" rx="6" fill="#b45309" stroke="#78350f" stroke-width="2" />
      <!-- مكسرات ولوز محمص محمر وبقدونس -->
      <ellipse cx="250" cy="195" rx="5" ry="2.5" fill="#fef3c7" transform="rotate(30 250 195)" />
      <ellipse cx="340" cy="195" rx="5" ry="2.5" fill="#fef3c7" transform="rotate(-20 340 195)" />
      <circle cx="280" cy="195" r="2.5" fill="#15803d" />
      <circle cx="320" cy="190" r="2.5" fill="#15803d" />
      <!-- خطوط بخار ساخن صاعد -->
      <path d="M280,160 Q275,145 285,135" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
      <path d="M305,155 Q300,140 310,130" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
      <path d="M330,160 Q325,145 335,135" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
    `
  },

  // --- الحلويات والتسالي ---
  {
    id: "item-25",
    name: "براوني",
    categoryName: "الحلويات والتسالي",
    bgColor1: "#713f12",
    bgColor2: "#3f1a04",
    icon: "🍫",
    detailsHtml: `
      <!-- مربع براوني شوكولاتة داكنة غنية -->
      <polygon points="220,195 300,160 380,195 300,230" fill="#451a03" stroke="#291002" stroke-width="3" />
      <polygon points="220,195 300,230 300,245 220,210" fill="#291002" />
      <polygon points="380,195 300,230 300,245 380,210" fill="#1c0b02" />
      <!-- تشققات سطح البراوني المقرمشة اللذيذة -->
      <line x1="260" y1="185" x2="290" y2="200" stroke="#713f12" stroke-width="2" />
      <line x1="310" y1="190" x2="340" y2="185" stroke="#713f12" stroke-width="2" />
      <line x1="285" y1="205" x2="320" y2="210" stroke="#713f12" stroke-width="2" />
      <!-- قطع شوكولاتة ذائبة داكنة -->
      <rect x="275" y="185" width="12" height="8" rx="2" fill="#1c0b02" />
      <rect x="315" y="195" width="10" height="7" rx="2" fill="#1c0b02" />
    `
  },
  {
    id: "item-26",
    name: "كوكيز",
    categoryName: "الحلويات والتسالي",
    bgColor1: "#d97706",
    bgColor2: "#78350f",
    icon: "🍪",
    detailsHtml: `
      <!-- حبة كوكيز دائرية ذهبية مقرمشة الحواف -->
      <circle cx="300" cy="200" r="55" fill="#f59e0b" stroke="#b45309" stroke-width="4" />
      <circle cx="300" cy="200" r="48" fill="#fbbf24" />
      <!-- حبيبات شوكولاتة بلجيكية داكنة بارزة -->
      <circle cx="275" cy="185" r="8" fill="#451a03" />
      <circle cx="320" cy="180" r="9" fill="#451a03" />
      <circle cx="330" cy="215" r="8.5" fill="#451a03" />
      <circle cx="285" cy="220" r="9" fill="#451a03" />
      <circle cx="300" cy="200" r="8" fill="#451a03" />
      <circle cx="260" cy="205" r="6" fill="#451a03" />
    `
  },
  {
    id: "item-27",
    name: "ليزي كيك",
    categoryName: "الحلويات والتسالي",
    bgColor1: "#581c87",
    bgColor2: "#3b0764",
    icon: "🍰",
    detailsHtml: `
      <!-- شريحة ليزي كيك كلاسيكية مثلجة -->
      <polygon points="230,225 300,165 370,225" fill="#3b0764" stroke="#1c0b02" stroke-width="3" />
      <!-- قطع بسكويت الشاي المقرمش الموزعة بالكاكاو (موزاييك كيك) -->
      <rect x="255" y="200" width="14" height="10" rx="2" fill="#fde68a" stroke="#ca8a04" stroke-width="1" transform="rotate(15 262 205)" />
      <rect x="290" y="185" width="16" height="11" rx="2" fill="#fde68a" stroke="#ca8a04" stroke-width="1" transform="rotate(-20 298 190)" />
      <rect x="325" y="205" width="15" height="10" rx="2" fill="#fde68a" stroke="#ca8a04" stroke-width="1" transform="rotate(25 332 210)" />
      <rect x="285" y="210" width="14" height="9" rx="2" fill="#fde68a" stroke="#ca8a04" stroke-width="1" transform="rotate(-10 292 214)" />
      <!-- رشة جوز هند أبيض خفيف -->
      <circle cx="270" cy="190" r="2" fill="#ffffff" />
      <circle cx="315" cy="195" r="2" fill="#ffffff" />
      <circle cx="300" cy="205" r="2" fill="#ffffff" />
    `
  },
  {
    id: "item-28",
    name: "كب كيك",
    categoryName: "الحلويات والتسالي",
    bgColor1: "#db2777",
    bgColor2: "#9d174d",
    icon: "🧁",
    detailsHtml: `
      <!-- قاعدة الكب كيك الكرتونية المخططة -->
      <polygon points="260,200 270,245 330,245 340,200" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
      <line x1="280" y1="200" x2="285" y2="245" stroke="#ca8a04" stroke-width="1.5" />
      <line x1="300" y1="200" x2="300" y2="245" stroke="#ca8a04" stroke-width="1.5" />
      <line x1="320" y1="200" x2="315" y2="245" stroke="#ca8a04" stroke-width="1.5" />
      <!-- دوامة كريمة الفراولة الوردية الهشة -->
      <ellipse cx="300" cy="195" rx="50" ry="25" fill="#f472b6" />
      <ellipse cx="300" cy="175" rx="38" ry="20" fill="#f472b6" />
      <ellipse cx="300" cy="155" rx="24" ry="14" fill="#fb7185" />
      <!-- حبة كرز ياقوتية على القمة وحبيبات ملونة -->
      <circle cx="300" cy="140" r="10" fill="#dc2626" />
      <circle cx="280" cy="180" r="2.5" fill="#38bdf8" />
      <circle cx="320" cy="185" r="2.5" fill="#facc15" />
      <circle cx="300" cy="170" r="2.5" fill="#4ade80" />
      <circle cx="310" cy="160" r="2" fill="#a855f7" />
    `
  },
  {
    id: "item-29",
    name: "كورن فليكس بار",
    categoryName: "الحلويات والتسالي",
    bgColor1: "#ca8a04",
    bgColor2: "#854d0e",
    icon: "🥣",
    detailsHtml: `
      <!-- لوح سناك مقرمش من رقائق الذرة والعسل -->
      <rect x="220" y="180" width="160" height="50" rx="8" fill="#eab308" stroke="#ca8a04" stroke-width="3" transform="rotate(-5 300 205)" />
      <!-- قاعدة شوكولاتة الحليب -->
      <rect x="220" y="215" width="160" height="15" rx="4" fill="#78350f" transform="rotate(-5 300 205)" />
      <!-- رقائق ذرة ذهبية محمصة مقرمشة بارزة -->
      <ellipse cx="250" cy="195" rx="9" ry="5" fill="#fef08a" transform="rotate(25 250 195)" />
      <ellipse cx="280" cy="190" rx="10" ry="6" fill="#fde047" transform="rotate(-15 280 190)" />
      <ellipse cx="315" cy="195" rx="9" ry="5" fill="#fef08a" transform="rotate(35 315 195)" />
      <ellipse cx="345" cy="192" rx="10" ry="6" fill="#fde047" transform="rotate(-10 345 192)" />
      <!-- خيوط عسل طبيعي لامع -->
      <path d="M235,185 Q265,195 295,185 T355,190" fill="none" stroke="#f59e0b" stroke-width="3" />
    `
  }
];

// إنشاء كافة الملفات
let count = 0;
items.forEach((item) => {
  const svgContent = createFoodSVG(item);
  const filePath = path.join(outDir, `${item.id}.svg`);
  fs.writeFileSync(filePath, svgContent, 'utf8');
  count++;
});

console.log(`✅ تم إنشاء ${count} صورة توضيحية SVG بنجاح في مجلد assets/images/!`);
