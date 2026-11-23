// data.js - قائمة طعام مقصف الفسحة وبيانات الحسابات والفسحة الواحدة

export const APP_CONFIG = {
  title: "مقصف الفُسحة",
  subtitle: "المقصف الذكيللطلاب",
  tagline: "مشروع مخصص وبإشراف الطالبة: زينة اللبدي • اطلب مسبقاً واستلم فطورك في الفسحة دون انتظار في الطوابير!",
  creator: "زينة اللبدي",
  creatorGrade: "الصف الثامن (الشعبة أ)",
  currency: "د.أ",
  // فسحة واحدة فقط الساعة 10:00 صباحاً كما طُلب بدقة
  breaks: [
    {
      id: "break-10am",
      name: "الفسحة المدرسية الكبرى (الساعة 10:00 صباحاً)",
      short: "الفسحة (10:00 ص)",
      hour: 10,
      minute: 0
    }
  ]
};

// الحسابات الافتراضية المبدئية
export const DEFAULT_USERS = {
  zaina: {
    id: "zaina",
    username: "zaina",
    password: "123",
    role: "student",
    name: "زينة اللبدي",
    title: "طالبة في الصف الثامن (أ) • صاحبة فكرة ومصممة المشروع 🌟",
    grade: "الصف الثامن",
    section: "الشعبة أ",
    studentNumber: "2024-8042",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    badgeColor: "bg-pink-100 text-pink-700 border-pink-200",
    isCreator: true
  },
  owner: {
    id: "owner",
    username: "owner",
    password: "123",
    role: "owner",
    name: "إدارة المقصف (المسؤول)",
    title: "مسؤول إعداد وتسليم وجبات الفسحة بالمدرسة",
    grade: "إدارة المدرسة",
    section: "قسم المقصف",
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    isCreator: false
  }
};

export const CATEGORIES = [
  { id: "all", name: "الكل", icon: "✨" },
  { id: "sandwiches", name: "الساندويشات والبيتزا", icon: "🥪" },
  { id: "salads", name: "السلطات والمقبلات", icon: "🥗" },
  { id: "pasta", name: "الباستا والأطباق الساخنة", icon: "🍝" },
  { id: "drinks", name: "العصائر والمشروبات", icon: "🧃" },
  { id: "main", name: "الأطباق الرئيسية", icon: "🍛" },
  { id: "sweets", name: "الحلويات والتسالي", icon: "🧁" }
];

export const MENU_ITEMS = [
  // --- الساندويشات والبيتزا ---
  {
    id: "item-1",
    category: "sandwiches",
    name: "بيتزا بباروني صغير",
    price: 1.25,
    calories: "280 سعرة",
    prepTime: "5-7 دقائق",
    isPopular: true,
    image: "./assets/images/item-1.svg",
    imageDescription: "بيتزا صغيرة مخبوزة بعجينة مقرمشة وجبنة الموزاريلا الذائبة الغنية مع شرائح الببروني الشهية وصلصة الطماطم الإيطالية.",
    ingredients: "عجينة طازجة، جبنة موزاريلا، شرائح ببروني بقري، صلصة طماطم، ريحان",
    available: true
  },
  {
    id: "item-2",
    category: "sandwiches",
    name: "بيتزا خضار صغير",
    price: 1.10,
    calories: "230 سعرة",
    prepTime: "5-7 دقائق",
    isPopular: false,
    image: "./assets/images/item-2.svg",
    imageDescription: "بيتزا صغيرة صحية مغطاة بقطع الفلفل الحلو الملون، الزيتون الأسود، شرائح الفطر، والذرة مع صلصة الطماطم وجبنة خفيفة.",
    ingredients: "فلفل رومي، زيتون أسود، مشروم، طماطم، جبنة موزاريلا خفيفة، أوريجانو",
    available: true
  },
  {
    id: "item-3",
    category: "sandwiches",
    name: "بيتزا باربكيو صغير",
    price: 1.35,
    calories: "295 سعرة",
    prepTime: "6 دقائق",
    isPopular: true,
    image: "./assets/images/item-3.svg",
    imageDescription: "بيتزا صغيرة شهية مغطاة بصلصة الباربكيو المدخنة وقطع الدجاج المشوي مع البصل الأحمر وجبنة الموزاريلا المذابة.",
    ingredients: "دجاج مشوي، صوص باربكيو مدخن، جبنة موزاريلا، بصل أحمر مقرمش",
    available: true
  },
  {
    id: "item-4",
    category: "sandwiches",
    name: "ساندويش لبنة وتيركي",
    price: 0.90,
    calories: "210 سعرة",
    prepTime: "3 دقائق",
    isPopular: true,
    image: "./assets/images/item-4.svg",
    imageDescription: "شطيرة خبز فرنسي طازج محشوة باللبنة البلدية الكريمية وشرائح صدر الديك الرومي (تيركي) المدخن مع أوراق النعناع الطازجة والخيار.",
    ingredients: "خبز باغيت طازج، لبنة بلدية، شرائح تيركي مدخن، خيار، نعناع، زيت زيتون",
    available: true
  },
  {
    id: "item-5",
    category: "sandwiches",
    name: "ساندويش خضار",
    price: 0.75,
    calories: "170 سعرة",
    prepTime: "3 دقائق",
    isPopular: false,
    image: "./assets/images/item-5.svg",
    imageDescription: "ساندويش صحي ومقرمش بطبقات من الخس الطازج، شرائح الطماطم، الخيار، الفلفل الحلو، ولمسة من الحمص أو الجبن النباتي.",
    ingredients: "خبز بالحبوب الكاملة، خس، طماطم، خيار، شرائح جزر، صوص طحينة خفيف",
    available: true
  },
  {
    id: "item-6",
    category: "sandwiches",
    name: "ساندويش جبنة",
    price: 0.65,
    calories: "220 سعرة",
    prepTime: "2 دقيقة",
    isPopular: false,
    image: "./assets/images/item-6.svg",
    imageDescription: "توست محمص دافئ محشو بطبقات غنية من جبنة الشيدر الصفراء والجبنة البيضاء الذائبة بطريقة مقرمشة ولذيذة.",
    ingredients: "توست بريوش محمص، جبنة شيدر ذهبية، جبنة قشقوان بيضاء، مسحة زبدة خفيفة",
    available: true
  },
  {
    id: "item-7",
    category: "sandwiches",
    name: "ساندويش تيركي وجبنة",
    price: 1.00,
    calories: "260 سعرة",
    prepTime: "3 دقائق",
    isPopular: true,
    image: "./assets/images/item-7.svg",
    imageDescription: "ساندويش شهي يجمع بين شرائح التيركي المدخن وجبنة الشيدر الذائبة في خبز التوست أو الصامولي مع أوراق الخس المقرمشة.",
    ingredients: "صدر ديك رومي مدخن، جبنة شيدر، خس طازج، مخلل خيار خفيف، مسحة مايونيز",
    available: true
  },

  // --- السلطات والمقبلات ---
  {
    id: "item-8",
    category: "salads",
    name: "سيزر",
    price: 1.20,
    calories: "190 سعرة",
    prepTime: "3 دقائق",
    isPopular: true,
    image: "./assets/images/item-8.svg",
    imageDescription: "سلطة سيزر الكلاسيكية بخس روماني طازج ومقرمش، مكعبات الخبز المحمص المتبلة، جبنة البارميزان وصوص السيزر الكريمي المنعش.",
    ingredients: "خس روماني، كروتونز محمص بالأعشاب، جبن بارميزان، صوص سيزر خفيف",
    available: true
  },
  {
    id: "item-9",
    category: "salads",
    name: "سلطة عربية",
    price: 0.85,
    calories: "120 سعرة",
    prepTime: "3 دقائق",
    isPopular: false,
    image: "./assets/images/item-9.svg",
    imageDescription: "سلطة عربية طازجة ملونة من مكعبات الخيار والطماطم الناضجة، بقدونس مفروم، نعناع أخضر، مع تتبيلة زيت الزيتون وعصير الليمون الصافي.",
    ingredients: "طماطم، خيار بلدي، بقدونس، نعناع، زيت زيتون بكر، عصير ليمون، رشة سماق",
    available: true
  },
  {
    id: "item-10",
    category: "salads",
    name: "يلنجي",
    price: 1.30,
    calories: "210 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-10.svg",
    imageDescription: "ورق عنب محشو بالأرز والخضار المتبلة بصلصة دبس الرمان الفاخرة وزيت الزيتون والليمون، مقبلات باردة وحامضة محبوبة جداً.",
    ingredients: "ورق عنب طري، أرز حبة قصيرة، طماطم، بقدونس، دبس رمان، زيت زيتون، ليمون",
    available: true
  },
  {
    id: "item-11",
    category: "salads",
    name: "سوشي",
    price: 1.50,
    calories: "180 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-11.svg",
    imageDescription: "قطع سوشي مدرسية صحية خفيفة (ماكي رولز) محشوة بالأرز المتبل، أصابع الخيار والجزر وقطع الدجاج أو الأفوكادو ملفوفة بأعشاب النوري البحرية.",
    ingredients: "أرز سوشي، أعشاب نوري، جزر مقرمش، خيار، سمسم محمص، صويا صوص خفيف",
    available: true
  },

  // --- الباستا والأطباق الساخنة ---
  {
    id: "item-12",
    category: "pasta",
    name: "معكرونة تقليدية بالصلصة الحمراء",
    price: 1.25,
    calories: "320 سعرة",
    prepTime: "4 دقائق",
    isPopular: true,
    image: "./assets/images/item-12.svg",
    imageDescription: "طبق مكرونة بيني إيطالية ساخنة مغمورة بصلصة الطماطم الغنية بالأعشاب والريحان مع رشة جبن البارميزان اللذيذة.",
    ingredients: "مكرونة بيني، صلصة مارينارا طماطم طبيعية، ثوم، ريحان، جبن بارميزان",
    available: true
  },
  {
    id: "item-13",
    category: "pasta",
    name: "فوتتشيني",
    price: 1.60,
    calories: "390 سعرة",
    prepTime: "5 دقائق",
    isPopular: true,
    image: "./assets/images/item-13.svg",
    imageDescription: "مكرونة فوتتشيني عريضة بصلصة الألفريدو البيضاء الكريمية الفاخرة مع شرائح المشروم وجبنة البارميزان الدافئة.",
    ingredients: "مكرونة فوتتشيني، كريمة طهي خفيفة، فطر طازج، زبدة، ثوم مهروس، جبنة بارميزان",
    available: true
  },
  {
    id: "item-14",
    category: "pasta",
    name: "ماك اند تشيز",
    price: 1.40,
    calories: "380 سعرة",
    prepTime: "4 دقائق",
    isPopular: true,
    image: "./assets/images/item-14.svg",
    imageDescription: "مكرونة حلزونية قصيرة غارقة في مزيج كريمي وذهبي من جبنة الشيدر الذائبة وصلصة الجبن الدافئة ذات المذاق الفائق.",
    ingredients: "مكرونة كوع، جبنة شيدر إنجليزية معتقة، جبنة موزاريلا، حليب، زبدة",
    available: true
  },
  {
    id: "item-15",
    category: "pasta",
    name: "بطاطا مهروسة",
    price: 0.90,
    calories: "190 سعرة",
    prepTime: "3 دقائق",
    isPopular: false,
    image: "./assets/images/item-15.svg",
    imageDescription: "وعاء بطاطا مهروسة بقوام حريري ناعم ومخفوق بالزبدة الطبيعية والحليب الدافئ مع لمسة خفيفة من مرق الأعشاب.",
    ingredients: "بطاطس طازجة مسلوقة، زبدة طبيعية، حليب قليل الدسم، رشة فلفل أبيض وملح ناعم",
    available: true
  },

  // --- العصائر والمشروبات ---
  {
    id: "item-16",
    category: "drinks",
    name: "حليب وفراولة",
    price: 0.50,
    calories: "140 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-16.svg",
    imageDescription: "علبة حليب طازج بنكهة الفراولة الطبيعية الوردية الغنية بالكالسيوم والفيتامينات المفيدة لصحة الطلاب.",
    ingredients: "حليب طازج مبستر، خلاصة الفراولة الطبيعية، فيتامين د وكالسيوم",
    available: true
  },
  {
    id: "item-17",
    category: "drinks",
    name: "حليب وموز",
    price: 0.50,
    calories: "150 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: false,
    image: "./assets/images/item-17.svg",
    imageDescription: "مشروب حليب مغذٍ بنكهة الموز اللذيذة يمنح الطالب طاقة طبيعية ونشاطاً طوال اليوم المدرسي.",
    ingredients: "حليب طازج، هريس الموز الطبيعي، كالسيوم، مغنيسيوم",
    available: true
  },
  {
    id: "item-18",
    category: "drinks",
    name: "عصير فواكه مشكلة",
    price: 0.60,
    calories: "110 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-18.svg",
    imageDescription: "كوكتيل عصير فواكه طبيعي مثلج يمزج بين عصائر البرتقال، المانجو، التفاح والأناناس لطعم منعش ومنشط.",
    ingredients: "عصائر طبيعية مركزة: برتقال، مانجو، تفاح، جوافة",
    available: true
  },
  {
    id: "item-19",
    category: "drinks",
    name: "عصير برتقال",
    price: 0.60,
    calories: "95 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-19.svg",
    imageDescription: "كوب عصير برتقال طبيعي معصور وطازج بلونه البرتقالي المشرق وغني بفيتامين ج المعزز للمناعة.",
    ingredients: "برتقال طبيعي 100% طازج بدون سكر مضاف",
    available: true
  },
  {
    id: "item-20",
    category: "drinks",
    name: "عصير تفاح",
    price: 0.60,
    calories: "100 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: false,
    image: "./assets/images/item-20.svg",
    imageDescription: "عصير تفاح نقي بلون ذهبي صافٍ ونكهة سكرية طبيعية منعشة ومحبوبة في أوقات الفسحة.",
    ingredients: "عصير تفاح نقي 100%، فيتامين ج",
    available: true
  },
  {
    id: "item-21",
    category: "drinks",
    name: "شنينه",
    price: 0.40,
    calories: "90 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-21.svg",
    imageDescription: "عبوة لبن شنينة بلدي بارد ومنعش ذو حموضة متوازنة ورشة ملح خفيفة تروي العطش وتنعش المعدة.",
    ingredients: "لبن مخيض طبيعي، ماء نقي، ملح خفيف، بكتيريا حمض اللاكتيك المفيدة",
    available: true
  },
  {
    id: "item-22",
    category: "drinks",
    name: "شنينه فراولة",
    price: 0.50,
    calories: "115 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: false,
    image: "./assets/images/item-22.svg",
    imageDescription: "ابتكار عصري يجمع بين لبن الشنينة المنعش ونكهة الفراولة الحلوة لتجربة لذيذة وفريدة.",
    ingredients: "لبن شنينة، نكهة فراولة طبيعية، ملح خفيف متوازن",
    available: true
  },
  {
    id: "item-23",
    category: "drinks",
    name: "ماء صغير",
    price: 0.25,
    calories: "0 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-23.svg",
    imageDescription: "عبوة مياه معدنية نقية صغيرة الحجم سعة 330 مل باردة ومناسبة لحملها في اليد أو الحقيبة.",
    ingredients: "مياه آبار طبيعية مصفاة ومعقمة بالأوزون",
    available: true
  },

  // --- الأطباق الرئيسية ---
  {
    id: "item-24",
    category: "main",
    name: "طبق اليوم من الارز",
    price: 2.00,
    calories: "450 سعرة",
    prepTime: "5 دقائق",
    isPopular: true,
    image: "./assets/images/item-24.svg",
    imageDescription: "طبق يومي مدرسي متكامل يحتوي على أرز بسمتي فاخر مطهو بالبهارات العطرية الهادئة مع قطع الدجاج المحمر الشهية وصلصة المرق الدافئة.",
    ingredients: "أرز بسمتي، صدر دجاج متبل، خضار مشكلة، مرق دجاج طازج، مكسرات خفيفة محمصة",
    available: true
  },

  // --- الحلويات والتسالي ---
  {
    id: "item-25",
    category: "sweets",
    name: "براوني",
    price: 0.75,
    calories: "240 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-25.svg",
    imageDescription: "مربع براوني غني بالشوكولاتة الفاخرة الداكنة بطبقة علوية مقرمشة وقلب فدج طري وداكن يذوب في الفم.",
    ingredients: "شوكولاتة داكنة، كاكاو هولندي، زبدة، بيض، دقيق، حبيبات شوكولاتة",
    available: true
  },
  {
    id: "item-26",
    category: "sweets",
    name: "كوكيز",
    price: 0.60,
    calories: "210 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-26.svg",
    imageDescription: "حبة كوكيز كلاسيكية ذهبية مقرمشة الحواف وطرية القلب محشوة بقطع شوكولاتة الحليب الذائبة الشهية.",
    ingredients: "دقيق أبيض، سكر بني، حبيبات شوكولاتة بالحليب، زبدة، فانيليا",
    available: true
  },
  {
    id: "item-27",
    category: "sweets",
    name: "ليزي كيك",
    price: 0.70,
    calories: "220 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: true,
    image: "./assets/images/item-27.svg",
    imageDescription: "قطعة ليزي كيك كلاسيكية مكونة من بسكويت الشاي المقرمش الممزوج بصلصة الشوكولاتة الغنية والمثلجة بطريقة منزلية شهية.",
    ingredients: "بسكويت شاي سادة، كاكاو، حليب مكثف محلى، زبدة، رشة جوز هند للتزيين",
    available: true
  },
  {
    id: "item-28",
    category: "sweets",
    name: "كب كيك",
    price: 0.50,
    calories: "190 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: false,
    image: "./assets/images/item-28.svg",
    imageDescription: "حبة كب كيك إسفنجية هشة ولطيفة مزينة بطبقة كريمة الفانيليا الوردية وحبيبات سكر ملونة تشبه ألوان قوس قزح.",
    ingredients: "كيك فانيليا إسفنجي، كريمة زبدة الفانيليا، سكاكر ملونة",
    available: true
  },
  {
    id: "item-29",
    category: "sweets",
    name: "كورن فليكس بار",
    price: 0.45,
    calories: "160 سعرة",
    prepTime: "جاهز فوراً",
    isPopular: false,
    image: "./assets/images/item-29.svg",
    imageDescription: "لوح سناك مقرمش مصنوع من رقائق الذرة الذهبية المحمصة الممزوجة بالعسل الطبيعي مع قاعدة شوكولاتة خفيفة.",
    ingredients: "رقائق كورن فليكس محمصة، عسل نحل، زبدة، شوكولاتة حليب خفيفة",
    available: true
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-101",
    studentId: "zaina",
    studentName: "زينة اللبدي",
    grade: "الصف الثامن (أ)",
    breakId: "break-10am",
    breakName: "الفسحة المدرسية (10:00 صباحاً)",
    orderTime: "08:45 صباحاً",
    status: "ready",
    items: [
      { id: "item-1", name: "بيتزا بباروني صغير", price: 1.25, quantity: 1 },
      { id: "item-16", name: "حليب وفراولة", price: 0.50, quantity: 1 }
    ],
    totalPrice: 1.75,
    notes: "تسخين البيتزا جيداً لو سمحتوا"
  },
  {
    id: "ORD-102",
    studentId: "sara",
    studentName: "سارة خالد",
    grade: "الصف الثامن (ب)",
    breakId: "break-10am",
    breakName: "الفسحة المدرسية (10:00 صباحاً)",
    orderTime: "09:10 صباحاً",
    status: "approved",
    items: [
      { id: "item-4", name: "ساندويش لبنة وتيركي", price: 0.90, quantity: 1 },
      { id: "item-19", name: "عصير برتقال", price: 0.60, quantity: 1 },
      { id: "item-26", name: "كوكيز", price: 0.60, quantity: 1 }
    ],
    totalPrice: 2.10,
    notes: "بدون مخلل بالساندويش"
  },
  {
    id: "ORD-103",
    studentId: "omar",
    studentName: "عمر يوسف",
    grade: "الصف الثامن (ج)",
    breakId: "break-10am",
    breakName: "الفسحة المدرسية (10:00 صباحاً)",
    orderTime: "09:25 صباحاً",
    status: "pending",
    items: [
      { id: "item-24", name: "طبق اليوم من الارز", price: 2.00, quantity: 1 },
      { id: "item-21", name: "شنينه", price: 0.40, quantity: 1 }
    ],
    totalPrice: 2.40,
    notes: "مع ملعقة إضافية وشطة خفيفة"
  }
];
