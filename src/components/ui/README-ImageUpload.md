# سیستم اپلود تصویر مشترک (Shared Image Upload System)

## نمای کلی (Overview)

سیستم اپلود تصویر مشترک یک راه‌حل یکپارچه و قابل استفاده مجدد برای مدیریت اپلود تصاویر در برنامه است. این سیستم شامل چندین کامپوننت و hook است که امکان استفاده آسان در بخش‌های مختلف برنامه را فراهم می‌کند.

## کامپوننت‌ها (Components)

### 1. `useImageUpload` Hook

Hook اصلی برای مدیریت منطق اپلود تصویر.

```typescript
import { useImageUpload } from '@/hooks/use-image-upload';

const { uploadImage, deleteImage, isUploading, isDeleting, progress } = useImageUpload({
  bucket: 'avatars',
  folder: 'users',
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  onSuccess: (url) => console.log('Upload successful:', url),
  onError: (error) => console.error('Upload failed:', error)
});
```

### 2. `ImageUpload` Component

کامپوننت اصلی برای اپلود تصویر با رابط کاربری کامل.

```typescript
import ImageUpload from '@/components/ui/image-upload';

<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  disabled={false}
  size="lg"
  variant="avatar"
  layout="vertical"
  uploadOptions={{
    bucket: 'avatars',
    maxSize: 5 * 1024 * 1024,
  }}
  uploadButtonText="انتخاب تصویر"
  deleteButtonText="حذف تصویر"
/>
```

### 3. `AvatarDisplay` Component

کامپوننت ساده برای نمایش تصویر با fallback.

```typescript
import AvatarDisplay from '@/components/ui/avatar-display';

<AvatarDisplay
  src={imageUrl}
  alt="User Avatar"
  size="md"
  fallback={<User size={24} />}
  onClick={() => console.log('Avatar clicked')}
/>
```

## مثال‌های استفاده (Usage Examples)

### اپلود تصویر مخاطب (Contact Avatar)

```typescript
import ContactAvatarUpload from '@/components/ContactAvatarUpload';

<ContactAvatarUpload
  initialAvatarUrl={contact.avatarUrl}
  onAvatarChange={(url) => updateContact({ avatarUrl: url })}
  disabled={isSubmitting}
/>
```

### اپلود تصویر گروه (Group Image)

```typescript
import GroupImageUpload from '@/components/groups/GroupImageUpload';

<GroupImageUpload
  initialImageUrl={group.imageUrl}
  onImageChange={(url) => updateGroup({ imageUrl: url })}
  groupName={group.name}
/>
```

### اپلود تصویر پروفایل کاربر (User Profile)

```typescript
import UserProfileImageUpload from '@/components/user-management/UserProfileImageUpload';

<UserProfileImageUpload
  initialImageUrl={user.profileImageUrl}
  onImageChange={(url) => updateUser({ profileImageUrl: url })}
  userName={user.name}
  userRole={user.role}
  isCurrentUser={user.id === currentUser.id}
/>
```

## تنظیمات (Configuration Options)

### `ImageUploadOptions`

```typescript
interface ImageUploadOptions {
  bucket: string;                    // نام bucket در Supabase Storage
  folder?: string;                   // فولدر داخل bucket
  maxSize?: number;                  // حداکثر اندازه فایل (bytes)
  allowedTypes?: string[];           // انواع فایل مجاز
  onSuccess?: (url: string) => void; // callback موفقیت
  onError?: (error: Error) => void;  // callback خطا
}
```

### `ImageUpload` Props

```typescript
interface ImageUploadProps {
  value?: string | null;             // URL تصویر فعلی
  onChange: (url: string | null) => void; // callback تغییر
  disabled?: boolean;                // غیرفعال کردن
  className?: string;                // کلاس CSS اضافی
  uploadOptions: ImageUploadOptions; // تنظیمات اپلود
  size?: 'sm' | 'md' | 'lg' | 'xl';  // اندازه
  variant?: 'avatar' | 'card' | 'inline'; // نوع نمایش
  showPreview?: boolean;             // نمایش پیش‌نمایش
  placeholder?: React.ReactNode;     // placeholder سفارشی
  uploadButtonText?: string;         // متن دکمه اپلود
  deleteButtonText?: string;         // متن دکمه حذف
  layout?: 'vertical' | 'horizontal'; // چیدمان
}
```

## ویژگی‌ها (Features)

### ✅ قابلیت‌های اصلی

- **اپلود تصویر** به Supabase Storage
- **حذف تصویر** از storage
- **اعتبارسنجی فایل** (نوع، اندازه)
- **پیش‌نمایش تصویر** با fallback
- **پشتیبانی از drag & drop**
- **نمایش پیشرفت اپلود**
- **مدیریت خطاها** با toast notifications
- **پشتیبانی کامل از RTL**
- **responsive design**

### ✅ مزایای استفاده

- **کد کمتر** - منطق تکراری حذف شده
- **یکپارچگی** - رفتار یکسان در همه جا
- **قابل نگهداری** - تغییرات در یک جا اعمال می‌شود
- **انعطاف‌پذیری** - تنظیمات مختلف برای نیازهای متفاوت
- **دسترسی‌پذیری** - پشتیبانی از screen readers

## استفاده پیشرفته (Advanced Usage)

### استفاده مستقیم از hook

```typescript
const MyCustomUploadComponent = () => {
  const { uploadImage, isUploading, progress } = useImageUpload({
    bucket: 'custom-bucket',
    folder: 'custom-folder',
    maxSize: 10 * 1024 * 1024,
  });

  const handleFileSelect = async (file: File) => {
    const url = await uploadImage(file);
    if (url) {
      // Handle successful upload
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleFileSelect(e.target.files[0])} />
      {isUploading && <progress value={progress} max={100} />}
    </div>
  );
};
```

### ایجاد کامپوننت سفارشی

```typescript
const ProductImageUpload = (props) => (
  <ImageUpload
    {...props}
    uploadOptions={{
      bucket: 'products',
      maxSize: 15 * 1024 * 1024, // 15MB for product images
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    }}
    variant="card"
    size="xl"
    placeholder={
      <div className="text-center">
        <Package size={48} className="mx-auto mb-2" />
        <p>تصویر محصول را اینجا رها کنید</p>
      </div>
    }
  />
);
```

## نکات مهم (Important Notes)

### امنیت (Security)

- همیشه `allowedTypes` را مشخص کنید
- `maxSize` را بر اساس نیاز تنظیم کنید
- از bucket های جداگانه برای انواع مختلف محتوا استفاده کنید

### عملکرد (Performance)

- تصاویر را در اندازه‌های مناسب آپلود کنید
- از `folder` برای سازماندهی فایل‌ها استفاده کنید
- برای تصاویر بزرگ از lazy loading استفاده کنید

### دسترسی‌پذیری (Accessibility)

- همیشه `alt` text برای تصاویر مشخص کنید
- از ARIA labels مناسب استفاده کنید
- keyboard navigation را تست کنید

## عیب‌یابی (Troubleshooting)

### مشکلات رایج

1. **خطای "Bucket not found"**: مطمئن شوید bucket در Supabase Storage وجود دارد
2. **خطای "File too large"**: `maxSize` را افزایش دهید یا فایل را فشرده کنید
3. **خطای "Invalid file type"**: `allowedTypes` را بررسی کنید

### لاگ‌گیری (Logging)

سیستم به طور خودکار خطاها را لاگ می‌کند. برای دیباگ بیشتر:

```typescript
const { uploadImage } = useImageUpload({
  onError: (error) => {
    console.error('Upload error details:', error);
    // Custom error handling
  }
});
```

---

## پشتیبانی (Support)

اگر سوال یا مشکلی دارید، لطفاً در repository اصلی issue ثبت کنید یا با تیم توسعه تماس بگیرید. 🚀
