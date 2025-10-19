import React, { useEffect } from 'react';
import { FaRegWindowMaximize } from 'react-icons/fa';
import { APP_TEXTS } from '../constants/appTexts';

const TitleBarIcon: React.FC = () => {
  useEffect(() => {
    // تغییر فاوآیکون صفحه
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon) {
      // ایجاد یک کانواس برای ساخت آیکون
      const canvas = document.createElement('canvas');
      const faviconSize = APP_TEXTS.STYLES.FAVICON_SIZE;
      canvas.width = faviconSize;
      canvas.height = faviconSize;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // گرادینت پس‌زمینه
        const gradient = ctx.createLinearGradient(0, 0, faviconSize, faviconSize);
        gradient.addColorStop(0, APP_TEXTS.COLORS.PRIMARY);
        gradient.addColorStop(1, APP_TEXTS.COLORS.PRIMARY_DARK);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, faviconSize, faviconSize);

        // تنظیمات متن
        ctx.fillStyle = APP_TEXTS.COLORS.WHITE;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // تنظیمات سایه و فونت
        ctx.shadowColor = APP_TEXTS.COLORS.SHADOW;
        ctx.shadowBlur = 2;
        ctx.font = `${APP_TEXTS.STYLES.FONT_WEIGHT_BOLD} 12px ${APP_TEXTS.FONTS.FALLBACK}`;
        ctx.fillText(APP_TEXTS.APP_NAME, 16, 16);

        // تبدیل کانواس به فایل آیکون
        const faviconUrl = canvas.toDataURL('image/x-icon');
        favicon.href = faviconUrl;

        // ذخیره در حافظه مرورگر برای استفاده بعدی
        localStorage.setItem('customFavicon', faviconUrl);
      }
    }
  }, []);

  // نمایش آیکون در نوار عنوان
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: APP_TEXTS.COLORS.PRIMARY,
      fontWeight: APP_TEXTS.STYLES.FONT_WEIGHT_BOLD,
      fontSize: '16px'
    }}>
      <FaRegWindowMaximize style={{ fontSize: '18px' }} />
      <span>{APP_TEXTS.APP_NAME}</span>
    </div>
  );
};

export default TitleBarIcon;
