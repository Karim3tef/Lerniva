export const APP_NAME = 'لرنيفا';
export const APP_DESCRIPTION = 'منصة تعلم STEM بالعربية';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lerniva.com';

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

export const COURSE_LEVELS = [
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
];

export const COURSE_LANGUAGES = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'الإنجليزية' },
  { value: 'ar-en', label: 'عربي - إنجليزي' },
];

export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  PENDING: 'pending',
};

export const CATEGORIES = [
  { id: 'programming', label: 'البرمجة', icon: '💻', color: 'bg-blue-50 text-blue-700', count: 128 },
  { id: 'math', label: 'الرياضيات', icon: '📐', color: 'bg-purple-50 text-purple-700', count: 95 },
  { id: 'physics', label: 'الفيزياء', icon: '⚛️', color: 'bg-indigo-50 text-indigo-700', count: 74 },
  { id: 'chemistry', label: 'الكيمياء', icon: '🧪', color: 'bg-green-50 text-green-700', count: 61 },
  { id: 'biology', label: 'الأحياء', icon: '🧬', color: 'bg-emerald-50 text-emerald-700', count: 83 },
  { id: 'engineering', label: 'الهندسة', icon: '⚙️', color: 'bg-orange-50 text-orange-700', count: 102 },
  { id: 'ai', label: 'الذكاء الاصطناعي', icon: '🤖', color: 'bg-pink-50 text-pink-700', count: 67 },
  { id: 'data-science', label: 'علم البيانات', icon: '📊', color: 'bg-cyan-50 text-cyan-700', count: 89 },
];

export const NAVIGATION = [
  { href: '/', label: 'الرئيسية' },
  { href: '/courses', label: 'الدورات' },
  { href: '/about', label: 'عن المنصة' },
];

export const STUDENT_NAVIGATION = [
  { href: '/student/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
  { href: '/student/my-courses', label: 'دوراتي', icon: 'BookOpen' },
  { href: '/student/certificates', label: 'شهاداتي', icon: 'Award' },
];

export const TEACHER_NAVIGATION = [
  { href: '/teacher/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
  { href: '/teacher/courses', label: 'دوراتي', icon: 'BookOpen' },
  { href: '/teacher/create-course', label: 'إضافة دورة', icon: 'PlusCircle' },
  { href: '/teacher/analytics', label: 'التحليلات', icon: 'BarChart2' },
  { href: '/teacher/withdrawals', label: 'السحب', icon: 'DollarSign' },
];

export const ADMIN_NAVIGATION = [
  { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
  { href: '/admin/users', label: 'المستخدمون', icon: 'Users' },
  { href: '/admin/courses', label: 'الدورات', icon: 'BookOpen' },
  { href: '/admin/refunds', label: 'المبالغ المستردة', icon: 'RefreshCw' },
  { href: '/admin/withdrawals', label: 'طلبات السحب', icon: 'DollarSign' },
];

export const STATS = [
  { label: 'طالب مسجل', value: '12,500+' },
  { label: 'دورة متاحة', value: '700+' },
  { label: 'معلم متخصص', value: '150+' },
  { label: 'ساعة تعليمية', value: '8,000+' },
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'سجّل حسابك',
    description: 'أنشئ حسابك مجاناً في دقيقتين واستكشف آلاف الدورات التعليمية.',
    icon: 'UserPlus',
  },
  {
    step: '02',
    title: 'اختر دورتك',
    description: 'تصفح مئات الدورات في مجالات STEM واختر ما يناسب مستواك واهتماماتك.',
    icon: 'Search',
  },
  {
    step: '03',
    title: 'تعلم وتطور',
    description: 'شاهد المحاضرات، حل التمارين، وتفاعل مع المعلم والزملاء في بيئة تفاعلية.',
    icon: 'PlayCircle',
  },
  {
    step: '04',
    title: 'احصل على شهادتك',
    description: 'بعد إتمام الدورة بنجاح، احصل على شهادة معتمدة تُعزز سيرتك الذاتية.',
    icon: 'Award',
  },
];

export const TESTIMONIALS = [
  {
    name: 'أحمد محمد السيد',
    role: 'مهندس برمجيات',
    text: 'منصة لرنيفا غيّرت مساري المهني تماماً. تعلمت البرمجة من الصفر وحصلت على وظيفتي الأولى خلال 6 أشهر.',
    rating: 5,
    avatar: 'أ',
    course: 'دورة تطوير الويب الشاملة',
  },
  {
    name: 'سارة عبدالله الحربي',
    role: 'طالبة دكتوراه',
    text: 'المحتوى العلمي عالي الجودة والشرح باللغة العربية جعل الفهم أعمق بكثير. أنصح كل طالب علوم بالانضمام.',
    rating: 5,
    avatar: 'س',
    course: 'دورة الفيزياء المتقدمة',
  },
  {
    name: 'خالد عمر الزهراني',
    role: 'مدرس رياضيات',
    text: 'كمعلم، المنصة أعطتني فرصة الوصول إلى آلاف الطلاب ومشاركة خبرتي. الدعم الفني ممتاز والنظام احترافي.',
    rating: 5,
    avatar: 'خ',
    course: 'دورة حساب التفاضل والتكامل',
  },
];

export const FOOTER_LINKS = {
  platform: {
    title: 'المنصة',
    links: [
      { href: '/courses', label: 'الدورات' },
      { href: '/about', label: 'عن لرنيفا' },
      { href: '/teachers', label: 'كن معلماً' },
      { href: '/pricing', label: 'الأسعار' },
    ],
  },
  support: {
    title: 'الدعم',
    links: [
      { href: '/help', label: 'مركز المساعدة' },
      { href: '/contact', label: 'تواصل معنا' },
      { href: '/faq', label: 'الأسئلة الشائعة' },
      { href: '/feedback', label: 'اقتراحاتك' },
    ],
  },
  legal: {
    title: 'قانوني',
    links: [
      { href: '/privacy', label: 'سياسة الخصوصية' },
      { href: '/terms', label: 'شروط الاستخدام' },
      { href: '/refund', label: 'سياسة الاسترداد' },
      { href: '/cookies', label: 'سياسة الكوكيز' },
    ],
  },
};

export const MOCK_COURSES = [
  {
    id: '1',
    title: 'دورة Python للمبتدئين - من الصفر إلى الاحتراف',
    description: 'تعلم لغة البرمجة Python خطوة بخطوة مع تطبيقات عملية في تحليل البيانات والذكاء الاصطناعي',
    category: 'programming',
    level: 'beginner',
    price: 199,
    thumbnail_url: null,
    avg_rating: 4.8,
    enrollment_count: 2340,
    lessons_count: 48,
    duration_minutes: 1440,
    created_at: '2024-01-15T10:00:00Z',
    status: 'published',
    profiles: { full_name: 'د. أحمد الشمري', avatar_url: null },
  },
  {
    id: '2',
    title: 'الرياضيات المتقدمة - حساب التفاضل والتكامل',
    description: 'شرح شامل لمبادئ التفاضل والتكامل مع أمثلة تطبيقية في الهندسة والفيزياء',
    category: 'math',
    level: 'intermediate',
    price: 249,
    thumbnail_url: null,
    avg_rating: 4.9,
    enrollment_count: 1870,
    lessons_count: 62,
    duration_minutes: 2160,
    created_at: '2024-01-20T10:00:00Z',
    status: 'published',
    profiles: { full_name: 'أ. سارة الزهراني', avatar_url: null },
  },
  {
    id: '3',
    title: 'الذكاء الاصطناعي وتعلم الآلة - دورة شاملة',
    description: 'من الأساسيات إلى النماذج المتقدمة، تعلم AI/ML بأسلوب عملي ومبسط',
    category: 'ai',
    level: 'intermediate',
    price: 349,
    thumbnail_url: null,
    avg_rating: 4.7,
    enrollment_count: 3100,
    lessons_count: 75,
    duration_minutes: 2880,
    created_at: '2024-02-01T10:00:00Z',
    status: 'published',
    profiles: { full_name: 'م. خالد العمري', avatar_url: null },
  },
  {
    id: '4',
    title: 'الفيزياء الكمية للمهندسين',
    description: 'مقدمة شاملة في مبادئ الفيزياء الكمية مع تطبيقاتها في الإلكترونيات الحديثة',
    category: 'physics',
    level: 'advanced',
    price: 299,
    thumbnail_url: null,
    avg_rating: 4.6,
    enrollment_count: 980,
    lessons_count: 55,
    duration_minutes: 1980,
    created_at: '2024-02-10T10:00:00Z',
    status: 'published',
    profiles: { full_name: 'د. فاطمة الحربي', avatar_url: null },
  },
  {
    id: '5',
    title: 'علم البيانات وتحليلها باستخدام R',
    description: 'تعلم تحليل البيانات والإحصاء التطبيقي باستخدام لغة R مع مشاريع حقيقية',
    category: 'data-science',
    level: 'intermediate',
    price: 0,
    thumbnail_url: null,
    avg_rating: 4.5,
    enrollment_count: 4200,
    lessons_count: 40,
    duration_minutes: 1200,
    created_at: '2024-02-15T10:00:00Z',
    status: 'published',
    profiles: { full_name: 'أ. محمد القحطاني', avatar_url: null },
  },
  {
    id: '6',
    title: 'هندسة الميكاترونيكس والروبوتات',
    description: 'تصميم وبرمجة أنظمة الروبوتات والميكاترونيكس من المفاهيم الأساسية إلى المشاريع المتكاملة',
    category: 'engineering',
    level: 'advanced',
    price: 399,
    thumbnail_url: null,
    avg_rating: 4.8,
    enrollment_count: 1250,
    lessons_count: 85,
    duration_minutes: 3600,
    created_at: '2024-03-01T10:00:00Z',
    status: 'published',
    profiles: { full_name: 'م. عمر السلمي', avatar_url: null },
  },
];
