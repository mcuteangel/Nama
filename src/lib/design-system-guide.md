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

## افکت‌های بصری

### گلس‌مورفیسم (شیشه‌ای)

برای افکت شیشه‌ای از کلاس `glass` یا `glass-advanced` استفاده کنید:

```tsx
<div className="glass p-4">
  محتوای شیشه‌ای
</div>

<div className="glass-advanced p-4">
  محتوای شیشه‌ای پیشرفته
</div>
```

### نئومورفیسم (سه‌بعدی نرم)

برای افکت نئومورفیسم از کلاس `neomorphism` استفاده کنید:

```tsx
<div className="neomorphism p-4">
  محتوای نئومورفیسم
</div>
```

### گرادیانت‌ها

برای استفاده از گرادیانت‌ها:

```tsx
<div className="bg-gradient-primary p-4">
  محتوا با پس‌زمینه گرادیانت اصلی
</div>

<h2 className="text-gradient">
  متن با گرادیانت
</h2>
```

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