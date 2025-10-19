# نما-۱ - سیستم مدیریت مخاطبین هوشمند با قدرت هوش مصنوعی

## 🌐 نسخه‌های موجود

- 🇺🇸 [English README](README.md) - نسخه انگلیسی
- 🇮🇷 [فارسی README](README-fa.md) - نسخه فارسی

[![Build Status](https://github.com/mcuteangel/Nama/workflows/CI/badge.svg)](https://github.com/mcuteangel/Nama/actions)
[![Coverage Status](https://coveralls.io/repos/github/mcuteangel/Nama/badge.svg?branch=main)](https://coveralls.io/github/mcuteangel/Nama?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📱 نمای کلی

نما-۱ یک اپلیکیشن مدرن و هوشمند برای مدیریت مخاطبین است که با قدرت هوش مصنوعی، نحوه سازماندهی و تعامل شما با شبکه‌های شخصی و حرفه‌ای‌تان را متحول می‌کند. این اپلیکیشن با React، TypeScript و Supabase ساخته شده و سازماندهی هوشمند مخاطبین، استخراج داده‌های مبتنی بر هوش مصنوعی و دسترسی بی‌درنگ چندپلتفرمه را ارائه می‌دهد.

### ✨ ویژگی‌های کلیدی

- 🤖 **استخراج هوشمند مخاطبین**: استخراج خودکار اطلاعات ساختاریافته مخاطبین از متن‌های غیرساختاریافته با استفاده از هوش مصنوعی تولیدی گوگل (Gemini)
- 📱 **چندپلتفرمه**: پشتیبانی از وب و موبایل از طریق Capacitor
- 🌐 **بین‌المللی‌سازی**: پشتیبانی کامل از زبان‌های انگلیسی و فارسی با طراحی راست به چپ
- 🎨 **رابط کاربری مدرن**: ساخته شده با shadcn/ui، Radix UI و Tailwind CSS
- 🔐 **احراز هویت امن**: Supabase Auth با امنیت سطح ردیف (RLS)
- 📊 **تجزیه و تحلیل و آمار**: بینش‌ها و روندهای جامع مخاطبین
- 🎯 **فیلدهای سفارشی**: سازماندهی انعطاف‌پذیر مخاطبین با فیلدهای تعریف‌شده توسط کاربر
- 👥 **مدیریت گروه**: سازماندهی مخاطبین در گروه‌های قابل سفارشی‌سازی
- 👤 **مدیریت کاربران پیشرفته**: سیستم مدیریت کاربران با ساختار ماژولار جدید
- 🏗️ **معماری دامنه**: مدل‌های دامنه و منطق تجاری ساختارمند
- 📊 **مدیریت داده‌ها**: مدیریت متمرکز داده‌ها و تنظیمات
- 🔧 **پیکربندی ثابت**: مدیریت متمرکز ثابت‌ها و تنظیمات برنامه
- 🌙 **تم تیره/روشن**: تشخیص خودکار تم با امکان تغییر دستی
- ♿ **دسترسی‌پذیری**: سازگار با WCAG 2.1 AA با ناوبری صفحه‌کلید

## 🏗️ پشته فناوری

### بخش جلویی (Frontend)

- **فریمورک**: React 18.3.1 با TypeScript 5.5.3
- **ابزار ساخت**: Vite 6.3.4 با کامپایلر SWC
- **کامپوننت‌های رابط کاربری**: shadcn/ui + Radix UI primitives
- **استایل‌دهی**: Tailwind CSS 3.4.11
- **مدیریت وضعیت**: TanStack React Query 5.56.2
- **فرم‌ها**: React Hook Form 7.53.0 + Zod 3.23.8
- **مسیریابی**: React Router DOM 6.26.2
- **موبایل**: Capacitor 7.4.2

### بخش عقبی (Backend)

- **BaaS**: Supabase 2.55.0 (PostgreSQL + Auth + Edge Functions)
- **هوش مصنوعی**: Google Generative AI 0.24.1
- **احراز هویت**: Supabase Auth با RLS
- **پایگاه داده**: PostgreSQL با امنیت سطح ردیف

### توسعه

- **تست**: Vitest 3.2.4 + Testing Library + Cypress
- **بررسی کد**: ESLint 9.9.0 + TypeScript ESLint
- **عملکرد**: تجزیه و تحلیل بسته + نظارت بر عملکرد
- **دسترسی‌پذیری**: تست axe-core

## 🚀 شروع سریع

### پیش‌نیازها

- Node.js 18+ (توصیه شده: 20+)
- pnpm (توصیه شده) یا npm
- Git

### نصب

1. **کلون کردن مخزن**

   ```bash
   git clone https://github.com/mcuteangel/Nama.git
   cd nama-1
   ```

2. **نصب وابستگی‌ها**

   ```bash
   pnpm install
   # یا
   npm install
   ```

3. **تنظیم محیط**

   فایل `.env.local` را در دایرکتوری اصلی ایجاد کنید:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_google_ai_api_key
   ```

4. **تنظیم پایگاه داده**

   اجرای migrations مربوط به Supabase:

   ```bash
   npx supabase migration up
   ```

5. **شروع سرور توسعه**

   ```bash
   pnpm dev
   # یا
   npm run dev
   ```

   اپلیکیشن در آدرس `http://localhost:8000` در دسترس خواهد بود

## 📱 توسعه موبایل

### Android

1. **نصب Android Studio** و تنظیم Android SDK
2. **ساخت اپ وب**:

   ```bash
   pnpm build
   ```

3. **اضافه کردن پلتفرم Android**:

   ```bash
   npx cap add android
   ```

4. **همگام‌سازی و باز کردن در Android Studio**:

   ```bash
   npx cap sync android
   npx cap open android
   ```

### iOS

1. **نصب Xcode** (فقط macOS)
2. **ساخت اپ وب**:

   ```bash
   pnpm build
   ```

3. **اضافه کردن پلتفرم iOS**:

   ```bash
   npx cap add ios
   ```

4. **همگام‌سازی و باز کردن در Xcode**:

   ```bash
   npx cap sync ios
   npx cap open ios
   ```

## 🧪 تست

### تست‌های واحد

```bash
# اجرای تست‌های واحد
pnpm test

# اجرای تست‌ها در حالت watch
pnpm test:watch

# اجرای تست‌ها با پوشش
pnpm test:coverage
```

### تست‌های یکپارچگی

```bash
# اجرای تست‌های یکپارچگی
pnpm test:integration
```

### تست‌های End-to-End

```bash
# نصب Cypress (در صورت عدم نصب)
pnpm add -D cypress

# باز کردن Cypress Test Runner
npx cypress open

# اجرای تست‌های E2E در حالت headless
npx cypress run
```

### تست‌های دسترسی‌پذیری

```bash
# اجرای تست‌های دسترسی‌پذیری
pnpm test:a11y
```

## 🏁 ساخت و استقرار

### ساخت تولید

```bash
# ساخت برای تولید
pnpm build

# پیش‌نمایش ساخت تولید
pnpm preview
```

### تجزیه و تحلیل بسته

```bash
# تجزیه و تحلیل اندازه بسته
pnpm analyze

# تولید گزارش بسته
pnpm analyze:bundle
```

### نظارت بر عملکرد

```bash
# اجرای تست‌های عملکرد
pnpm test:performance

# نظارت بر اندازه بسته
pnpm test:bundle
```

## 🔧 پیکربندی

### متغیرهای محیط

| متغیر | توضیح | ضروری |
|-------|-------|-------|
| `VITE_SUPABASE_URL` | URL پروژه Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | کلید ناشناس Supabase | ✅ |
| `VITE_GEMINI_API_KEY` | کلید API هوش مصنوعی گوگل | ✅ |
| `VITE_ENVIRONMENT` | محیط (development/production) | ❌ |

### تنظیم Supabase

1. ایجاد پروژه جدید Supabase
2. اجرای migrations ارائه شده در `supabase/migrations/`
3. تنظیم Edge Functions در `supabase/functions/`
4. پیکربندی خط‌مشی‌های RLS برای امنیت

### پیکربندی هوش مصنوعی

1. دریافت کلید API هوش مصنوعی گوگل از [Google AI Studio](https://aistudio.google.com/)
2. اضافه کردن کلید به متغیرهای محیط
3. پیکربندی تنظیمات هوش مصنوعی در صفحه تنظیمات اپ

## 📚 معماری

### ساختار پروژه

```
src/
├── components/          # کامپوننت‌های قابل استفاده مجدد رابط کاربری
│   ├── ui/             # کامپوننت‌های shadcn/ui
│   ├── contact-form/   # کامپوننت‌های فرم مخاطبین
│   ├── common/         # کامپوننت‌های مشترک
│   ├── auth/           # کامپوننت‌های احراز هویت
│   ├── ai/             # کامپوننت‌های مرتبط با هوش مصنوعی
│   └── __tests__/      # تست‌های کامپوننت
├── features/           # ماژول‌های مبتنی بر ویژگی
│   ├── user-management/ # ویژگی مدیریت کاربران
│   └── contact-management/ # ویژگی مدیریت مخاطبین
├── hooks/              # هوک‌های سفارشی React
├── pages/              # کامپوننت‌های صفحه
├── services/           # سرویس‌های API
├── types/              # تعاریف نوع TypeScript
├── utils/              # توابع کمکی
├── integrations/       # یکپارچگی‌های شخص ثالث
├── lib/                # پیکربندی و کمک‌کننده‌ها
├── constants/          # ثابت‌های برنامه
├── data/               # داده‌های ثابت و پیکربندی‌ها
├── domain/             # مدل‌های دامنه و منطق تجاری
└── locales/            # فایل‌های بین‌المللی‌سازی

supabase/
├── functions/          # Edge Functions
└── migrations/         # Migration های پایگاه داده

cypress/
├── e2e/               # تست‌های End-to-end
├── fixtures/          # داده‌های تست
└── support/           # ابزارهای تست
```

### الگوهای معماری کلیدی

- **معماری مبتنی بر کامپوننت**: کامپوننت‌های مدولار و قابل استفاده مجدد رابط کاربری
- **الگوی لایه سرویس**: جداسازی منطق تجاری از ارائه
- **مدیریت وضعیت مبتنی بر هوک**: هوک‌های سفارشی برای کپسوله‌سازی منطق
- **بارگذاری تنبل**: بهینه‌سازی عملکرد با تقسیم کد
- **مرزهای خطا**: مدیریت خطا و بازیابی شایسته

## 🤝 مشارکت

ما از مشارکت استقبال می‌کنیم! لطفاً [راهنمای مشارکت](CONTRIBUTING.md) ما را برای جزئیات ببینید.

### گردش کار توسعه

1. Fork کردن مخزن
2. ایجاد شاخه ویژگی (`git checkout -b feature/amazing-feature`)
3. انجام تغییرات
4. اضافه کردن تست برای تغییرات
5. اجرای مجموعه تست (`pnpm test`)
6. Commit کردن تغییرات (`git commit -m 'Add amazing feature'`)
7. Push کردن به شاخه (`git push origin feature/amazing-feature`)
8. باز کردن Pull Request

### سبک کد

- پیروی از الگوهای موجود TypeScript و React
- استفاده از نام‌های معنادار برای کامپوننت‌ها و متغیرها
- نوشتن تست برای ویژگی‌های جدید
- پیروی از بهترین شیوه‌های دسترسی‌پذیری
- اطمینان از پشتیبانی بین‌المللی‌سازی

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است - فایل [LICENSE](LICENSE) را برای جزئیات ببینید.

## 🆘 پشتیبانی

- 📧 ایمیل: <support@nama-app.com>
- 💬 Discord: [به جامعه ما بپیوندید](https://discord.gg/nama-app)
- 📚 مستندات: [docs.nama-app.com](https://docs.nama-app.com)
- 🐛 مسائل: [GitHub Issues](https://github.com/mcuteangel/Nama/issues)

## 🙏 تقدیر و تشکر

- [Supabase](https://supabase.com/) برای پلتفرم فوق‌العاده BaaS
- [Google AI](https://ai.google.dev/) برای قابلیت‌های هوش مصنوعی تولیدی
- [shadcn/ui](https://ui.shadcn.com/) برای کامپوننت‌های زیبای رابط کاربری
- [Radix UI](https://www.radix-ui.com/) برای primitives قابل دسترس
- [Tailwind CSS](https://tailwindcss.com/) برای استایل‌دهی utility-first

## 📈 نقشه راه

- [ ] ویژگی‌های همکاری بلادرنگ
- [ ] بینش‌های پیشرفته مخاطبین مبتنی بر هوش مصنوعی
- [ ] یکپارچگی با سیستم‌های CRM محبوب
- [ ] استخراج مخاطبین از صدا
- [ ] بهبود واردات/صادرات گروهی
- [ ] جستجو و فیلترینگ پیشرفته
- [ ] اشتراک‌گذاری و همکاری در مخاطبین

---

**ساخته شده با ❤️ توسط تیم نما**
