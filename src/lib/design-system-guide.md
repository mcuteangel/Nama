# راهنمای سیستم طراحی نما-۱

این راهنما برای استفاده یکپارچه از کامپوننت‌های UI در پروژه نما-۱ تهیه شده است. هدف ما ایجاد یک رابط کاربری یکدست، مدرن و زیبا در تمام بخش‌های برنامه است.

## اصول کلی طراحی

1. **سادگی**: طراحی ساده و کاربرپسند
2. **انسجام**: استفاده از المان‌های مشابه در سراسر برنامه
3. **زیبایی**: استفاده از افکت‌های مدرن مانند گلس‌مورفیسم و نئومورفیسم
4. **پاسخگویی**: طراحی متناسب با انواع دستگاه‌ها
5. **دسترسی‌پذیری**: رعایت اصول WCAG 2.1 AA

## کامپوننت‌های اصلی

برای حفظ یکپارچگی طراحی، همیشه از کامپوننت‌های با پیشوند `modern-` استفاده کنید:

### کارت‌ها

```tsx
import { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardTitle, 
  ModernCardDescription, 
  ModernCardContent 
} from "@/components/ui/modern-card";

// نمونه استفاده
<ModernCard variant="glass" hover="lift">
  <ModernCardHeader>
    <ModernCardTitle>عنوان کارت</ModernCardTitle>
    <ModernCardDescription>توضیحات کارت</ModernCardDescription>
  </ModernCardHeader>
  <ModernCardContent>
    محتوای کارت
  </ModernCardContent>
</ModernCard>
```

### دکمه‌ها

```tsx
import { GlassButton } from "@/components/ui/glass-button";
import { GradientButton } from "@/components/ui/modern-button";

// نمونه استفاده
<GlassButton>دکمه شیشه‌ای</GlassButton>
<GradientButton gradientType="primary">دکمه گرادیانت</GradientButton>
```

### فرم‌ها

```tsx
import { ModernInput } from "@/components/ui/modern-input";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernCheckbox } from "@/components/ui/modern-checkbox";

// نمونه استفاده
<ModernInput placeholder="نام کاربری" />
<ModernSelect options={options} placeholder="انتخاب کنید" />
<ModernCheckbox label="مرا به خاطر بسپار" />
```

## افکت‌های بصری پیشرفته

### گلس‌مورفیسم (Glassmorphism) - راهنمای پیشرفته

#### اصول طراحی گلس‌مورفیسم

1. **شفافیت (Blur)**: استفاده از backdrop-filter برای ایجاد افکت مات‌کننده
2. **شفافیت لایه (Opacity)**: شفافیت بین 10% تا 40% برای حفظ خوانایی
3. **سایه‌ها**: سایه‌های ملایم برای ایجاد عمق
4. **حاشیه‌ها**: حاشیه‌های نازک با شفافیت کم برای جداکردن از پس‌زمینه
5. **انیمیشن‌ها**: انتقال‌های نرم برای تعاملات

#### کلاس‌های از پیش تعریف شده

```tsx
// شیشه‌ای پایه
<div className="glass p-6 rounded-xl">
  محتوای شیشه‌ای ساده
</div>

// شیشه‌ای پیشرفته با سایه و حاشیه
<div className="glass-advanced p-6 rounded-2xl shadow-2xl border border-white/10">
  محتوای شیشه‌ای پیشرفته
</div>

// شیشه‌ای رنگی
<div className="glass-primary p-6 rounded-xl">
  شیشه‌ای با رنگ اصلی
</div>

// شیشه‌ای با انیمیشن
<div className="glass-hover p-6 rounded-xl transition-all duration-300 hover:shadow-lg">
  هاور کنید
</div>
```

#### تنظیمات سفارشی

برای تنظیمات پیشرفته‌تر می‌توانید از متغیرهای CSS استفاده کنید:

```css
.custom-glass {
  --glass-opacity: 0.2;
  --glass-blur: 12px;
  --glass-border: 1px solid rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  --glass-bg: rgba(255, 255, 255, var(--glass-opacity));
  
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 1rem;
}
```

#### نکات مهم در پیاده‌سازی

1. **بهینه‌سازی عملکرد**:
   - از `will-change: transform` برای المان‌های متحرک استفاده کنید
   - `backdrop-filter` می‌تواند بر عملکرد تاثیر بگذارد، بنابراین استفاده بهینه داشته باشید

2. **پشتیبانی مرورگرها**:
   - برای مرورگرهای قدیمی از `@supports` استفاده کنید
   - فیلترهای جایگزین برای مرورگرهایی که از backdrop-filter پشتیبانی نمی‌کنند

3. **خوانایی**:
   - تضاد رنگی مناسب بین متن و پس‌زمینه حفظ شود
   - از شفافیت‌های خیلی کم خودداری کنید

### نئومورفیسم (Neumorphism)

برای افکت نئومورفیسم از کلاس‌های زیر استفاده کنید:

```tsx
// نئومورفیسم ساده
<div className="neomorphism p-6 rounded-2xl">
  محتوای نئومورفیسم
</div>

// نئومورفیسم فشرده
<div className="neomorphism-inset p-6 rounded-2xl">
  افکت فرورونده
</div>

// نئومورفیسم رنگی
<div className="neomorphism-primary p-6 rounded-2xl">
  نئومورفیسم رنگی
</div>
```

### ترکیب گلس‌مورفیسم و نئومورفیسم

برای افکت‌های ترکیبی جذاب:

```tsx
// ترکیب گلس و نئو
<div className="glass-neo p-6 rounded-2xl transition-all duration-300 hover:shadow-xl">
  <h3 className="text-xl font-bold mb-2">عنوان ترکیبی</h3>
  <p>ترکیب افکت‌های شیشه‌ای و سه‌بعدی</p>
  <button className="glass-button mt-4 px-4 py-2 rounded-lg">
    دکمه تعاملی
  </button>
</div>
```

### انیمیشن‌های پیشرفته

برای اضافه کردن انیمیشن‌های جذاب:

```tsx
// انیمیشن شناور
<div className="glass p-6 rounded-2xl animate-float">
  کارت شناور
</div>

// انیمیشن درخشش
<button className="glass-button px-6 py-3 rounded-xl animate-pulse">
  دکمه درخشان
</button>
```

### گرادیانت‌های پیشرفته

برای گرادیانت‌های حرفه‌ای‌تر:

```tsx
// گرادیانت خطی
<div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-2xl">
  گرادیانت افقی
</div>

// گرادیانت زاویه‌دار
<div className="bg-gradient-45 from-primary via-secondary to-accent p-6 rounded-2xl">
  گرادیانت ۴۵ درجه
</div>

// گرادیانت شیشه‌ای
<div className="glass-gradient p-6 rounded-2xl">
  ترکیب گرادیانت و افکت شیشه‌ای
</div>

// گرادیانت متحرک
<div className="animate-gradient bg-gradient-to-r from-primary via-secondary to-accent bg-300% p-6 rounded-2xl">
  گرادیانت متحرک
</div>

// متن با گرادیانت
<h2 className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
  متن با گرادیانت
</h2>

## رنگ‌ها

از متغیرهای رنگ تعریف شده در سیستم استفاده کنید:

```tsx
<div className="bg-primary text-white">
  پس‌زمینه رنگ اصلی
</div>

<div className="bg-surface text-text-primary">
  پس‌زمینه سطح با متن اصلی
</div>
```

## تایپوگرافی

برای متن‌ها از کلاس‌های استاندارد استفاده کنید:

```tsx
<h1 className="heading-1">عنوان اصلی</h1>
<h2 className="heading-2">عنوان فرعی</h2>
<p className="body-large">متن بزرگ</p>
<p className="body-regular">متن معمولی</p>
<p className="body-small">متن کوچک</p>
```

## انیمیشن‌ها

برای انیمیشن‌های یکپارچه:

```tsx
<div className="animate-fade-in-up">
  محتوا با انیمیشن ظاهر شدن از پایین
</div>

<div className="animate-scale-in">
  محتوا با انیمیشن مقیاس
</div>
```

## نکات مهم

1. **سازگاری با RTL**: همیشه از کلاس‌های مناسب برای پشتیبانی از راست به چپ استفاده کنید.
2. **پاسخگویی**: از کلاس‌های `sm:`, `md:`, `lg:` و `xl:` برای طراحی پاسخگو استفاده کنید.
3. **دسترسی‌پذیری**: از ویژگی‌های `aria-*` و کامپوننت‌های دسترس‌پذیر استفاده کنید.
4. **تم تیره/روشن**: از متغیرهای CSS برای سازگاری با هر دو تم استفاده کنید.

## نمونه صفحه

```tsx
import React from "react";
import { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardTitle, 
  ModernCardContent 
} from "@/components/ui/modern-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernInput } from "@/components/ui/modern-input";

export default function SamplePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="heading-1 text-gradient mb-6">عنوان صفحه</h1>
      
      <ModernCard variant="glass" className="mb-6">
        <ModernCardHeader>
          <ModernCardTitle>بخش اصلی</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <ModernInput placeholder="جستجو..." className="mb-4" />
          <GlassButton>دکمه اصلی</GlassButton>
        </ModernCardContent>
      </ModernCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModernCard variant="neomorphism">
          <ModernCardHeader>
            <ModernCardTitle>کارت اول</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <p className="body-regular">محتوای کارت اول</p>
          </ModernCardContent>
        </ModernCard>
        
        <ModernCard variant="gradient-sunset">
          <ModernCardHeader>
            <ModernCardTitle>کارت دوم</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <p className="body-regular text-white">محتوای کارت دوم</p>
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  );
}
```

با پیروی از این راهنما، می‌توانید یک رابط کاربری یکدست و مدرن در تمام بخش‌های برنامه نما-۱ ایجاد کنید.