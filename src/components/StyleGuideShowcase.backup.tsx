import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardTitle, 
  ModernCardDescription, 
  ModernCardContent, 
  ModernCardFooter 
} from "@/components/ui/modern-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernInput } from "@/components/ui/modern-input";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernCheckbox } from "@/components/ui/modern-checkbox";
import { ModernBadge } from "@/components/ui/modern-badge";
import { ModernAlertDialog } from "@/components/ui/modern-alert-dialog";
import { ModernTooltip } from "@/components/ui/modern-tooltip";
import { ModernSwitch } from "@/components/ui/modern-switch";
import { ModernAvatar } from "@/components/ui/modern-avatar";
import { ModernProgress } from "@/components/ui/modern-progress";
import { ModernSkeleton } from "@/components/ui/modern-skeleton";
import { ModernTable } from "@/components/ui/modern-table";
import { ModernAccordion } from "@/components/ui/modern-accordion";
import { ModernDialog } from "@/components/ui/modern-dialog";
import { ModernToast } from "@/components/ui/modern-toast";
import { ModernDropdown } from "@/components/ui/modern-dropdown";
import { ModernTabs } from "@/components/ui/modern-tabs";
import { ModernToggle } from "@/components/ui/modern-toggle";
import { ModernRadioGroup } from "@/components/ui/modern-radio-group";
import { ModernCalendar } from "@/components/ui/modern-calendar";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { ModernTimePicker } from "@/components/ui/modern-time-picker";
import { ModernFileUpload } from "@/components/ui/modern-file-upload";
import { ModernRating } from "@/components/ui/modern-rating";
import { ModernPagination } from "@/components/ui/modern-pagination";
import { ModernBreadcrumb } from "@/components/ui/modern-breadcrumb";
import { ModernNavbar } from "@/components/ui/modern-navbar";
import { ModernSidebar } from "@/components/ui/modern-sidebar";
import { ModernFooter } from "@/components/ui/modern-footer";
import { ModernHero } from "@/components/ui/modern-hero";
import { ModernFeature } from "@/components/ui/modern-feature";
import { ModernTestimonial } from "@/components/ui/modern-testimonial";
import { ModernPricing } from "@/components/ui/modern-pricing";
import { ModernFAQ } from "@/components/ui/modern-faq";
import { ModernCTA } from "@/components/ui/modern-cta";
import { ModernStats } from "@/components/ui/modern-stats";
import { ModernTimeline } from "@/components/ui/modern-timeline";
import { ModernGallery } from "@/components/ui/modern-gallery";
import { ModernVideo } from "@/components/ui/modern-video";
import { ModernAudio } from "@/components/ui/modern-audio";
import { ModernChart } from "@/components/ui/modern-chart";
import { ModernMap } from "@/components/ui/modern-map";
import { ModernKanban } from "@/components/ui/modern-kanban";
import { ModernCalendarEvent } from "@/components/ui/modern-calendar-event";
import { ModernEditor } from "@/components/ui/modern-editor";
import { ModernCodeBlock } from "@/components/ui/modern-code-block";
import { ModernMarkdown } from "@/components/ui/modern-markdown";
import { ModernRichText } from "@/components/ui/modern-rich-text";
import { ModernEmoji } from "@/components/ui/modern-emoji";
import { ModernMention } from "@/components/ui/modern-mention";
import { ModernTag } from "@/components/ui/modern-tag";
import { ModernSearch } from "@/components/ui/modern-search";
import { ModernFilter } from "@/components/ui/modern-filter";
import { ModernSort } from "@/components/ui/modern-sort";
import { ModernPagination } from "@/components/ui/modern-pagination";
import { ModernInfiniteScroll } from "@/components/ui/modern-infinite-scroll";
import { ModernVirtualList } from "@/components/ui/modern-virtual-list";
import { ModernDragDrop } from "@/components/ui/modern-drag-drop";
import { ModernResizable } from "@/components/ui/modern-resizable";
import { ModernCollapsible } from "@/components/ui/modern-collapsible";
import { ModernDrawer } from "@/components/ui/modern-drawer";
import { ModernPopover } from "@/components/ui/modern-popover";
import { ModernContextMenu } from "@/components/ui/modern-context-menu";
import { ModernHoverCard } from "@/components/ui/modern-hover-card";
import { ModernScrollArea } from "@/components/ui/modern-scroll-area";
import { ModernSeparator } from "@/components/ui/modern-separator";
import { ModernAspectRatio } from "@/components/ui/modern-aspect-ratio";
import { ModernCommand } from "@/components/ui/modern-command";
import { ModernSheet } from "@/components/ui/modern-sheet";
import { ModernSkeleton } from "@/components/ui/modern-skeleton";
import { ModernToast } from "@/components/ui/modern-toast";
import { ModernTooltip } from "@/components/ui/modern-tooltip";
import { ModernToggle } from "@/components/ui/modern-toggle";
import { ModernToggleGroup } from "@/components/ui/modern-toggle-group";
import { ModernCarousel } from "@/components/ui/modern-carousel";
import { ModernCombobox } from "@/components/ui/modern-combobox";
import { ModernCommand } from "@/components/ui/modern-command";
import { ModernContextMenu } from "@/components/ui/modern-context-menu";
import { ModernDialog } from "@/components/ui/modern-dialog";
import { ModernDropdownMenu } from "@/components/ui/modern-dropdown-menu";
import { ModernHoverCard } from "@/components/ui/modern-hover-card";
import { ModernPopover } from "@/components/ui/modern-popover";
import { ModernResizable } from "@/components/ui/modern-resizable";
import { ModernScrollArea } from "@/components/ui/modern-scroll-area";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernSeparator } from "@/components/ui/modern-separator";
import { ModernSheet } from "@/components/ui/modern-sheet";
import { ModernSkeleton } from "@/components/ui/modern-skeleton";
import { ModernSlider } from "@/components/ui/modern-slider";
import { ModernSwitch } from "@/components/ui/modern-switch";
import { ModernTable } from "@/components/ui/modern-table";
import { ModernTabs } from "@/components/ui/modern-tabs";
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { ModernToast } from "@/components/ui/modern-toast";
import { ModernToggle } from "@/components/ui/modern-toggle";
import { ModernTooltip } from "@/components/ui/modern-tooltip";
import { ModernNavigationMenu } from "@/components/ui/modern-navigation-menu";
import { ModernMenubar } from "@/components/ui/modern-menubar";
import { ModernRadioGroup } from "@/components/ui/modern-radio-group";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernSwitch } from "@/components/ui/modern-switch";
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { ModernTooltip } from "@/components/ui/modern-tooltip";
import { ModernToggle } from "@/components/ui/modern-toggle";
import { ModernToggleGroup } from "@/components/ui/modern-toggle-group";
import { ModernCarousel } from "@/components/ui/modern-carousel";
import { ModernCombobox } from "@/components/ui/modern-combobox";
import { ModernCommand } from "@/components/ui/modern-command";
import { ModernContextMenu } from "@/components/ui/modern-context-menu";
import { ModernDialog } from "@/components/ui/modern-dialog";
import { ModernDropdownMenu } from "@/components/ui/modern-dropdown-menu";
import { ModernHoverCard } from "@/components/ui/modern-hover-card";
import { ModernPopover } from "@/components/ui/modern-popover";
import { ModernResizable } from "@/components/ui/modern-resizable";
import { ModernScrollArea } from "@/components/ui/modern-scroll-area";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernSeparator } from "@/components/ui/modern-separator";
import { ModernSheet } from "@/components/ui/modern-sheet";
import { ModernSkeleton } from "@/components/ui/modern-skeleton";
import { ModernSlider } from "@/components/ui/modern-slider";
import { ModernSwitch } from "@/components/ui/modern-switch";
import { ModernTable } from "@/components/ui/modern-table";
import { ModernTabs } from "@/components/ui/modern-tabs";
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { ModernToast } from "@/components/ui/modern-toast";
import { ModernToggle } from "@/components/ui/modern-toggle";
import { ModernTooltip } from "@/components/ui/modern-tooltip";
import { ModernNavigationMenu } from "@/components/ui/modern-navigation-menu";
import { ModernMenubar } from "@/components/ui/modern-menubar";
import { ModernRadioGroup } from "@/components/ui/modern-radio-group";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernSwitch } from "@/components/ui/modern-switch";
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { ModernTooltip } from "@/components/ui/modern-tooltip";
import { ModernToggle } from "@/components/ui/modern-toggle";
import { ModernToggleGroup } from "@/components/ui/modern-toggle-group";

/**
 * کامپوننت نمایش راهنمای سبک
 * این کامپوننت برای نمایش تمام المان‌های طراحی سیستم به توسعه‌دهندگان استفاده می‌شود
 */
export default function StyleGuideShowcase() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gradient mb-8 text-center">راهنمای سبک نما-۱</h1>
      <p className="text-xl text-center mb-12">
        این راهنما برای استفاده یکپارچه از کامپوننت‌های UI در پروژه نما-۱ تهیه شده است.
      </p>

      <Tabs defaultValue="components" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="components">کامپوننت‌ها</TabsTrigger>
          <TabsTrigger value="colors">رنگ‌ها</TabsTrigger>
          <TabsTrigger value="typography">تایپوگرافی</TabsTrigger>
          <TabsTrigger value="effects">افکت‌ها</TabsTrigger>
          <TabsTrigger value="layouts">چیدمان‌ها</TabsTrigger>
        </TabsList>

        {/* کامپوننت‌ها */}
        <TabsContent value="components" className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">کارت‌ها</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ModernCard variant="glass">
                <ModernCardHeader>
                  <ModernCardTitle>کارت شیشه‌ای</ModernCardTitle>
                  <ModernCardDescription>با افکت گلس‌مورفیسم</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <p>محتوای کارت شیشه‌ای</p>
                </ModernCardContent>
                <ModernCardFooter>
                  <GlassButton>دکمه</GlassButton>
                </ModernCardFooter>
              </ModernCard>

              <ModernCard variant="neomorphism">
                <ModernCardHeader>
                  <ModernCardTitle>کارت نئومورفیسم</ModernCardTitle>
                  <ModernCardDescription>با افکت برجسته</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <p>محتوای کارت نئومورفیسم</p>
                </ModernCardContent>
                <ModernCardFooter>
                  <GlassButton variant="secondary">دکمه</GlassButton>
                </ModernCardFooter>
              </ModernCard>

              <ModernCard variant="gradient">
                <ModernCardHeader>
                  <ModernCardTitle>کارت گرادیانت</ModernCardTitle>
                  <ModernCardDescription>با پس‌زمینه گرادیانت</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <p>محتوای کارت گرادیانت</p>
                </ModernCardContent>
                <ModernCardFooter>
                  <GlassButton variant="gradient">دکمه</GlassButton>
                </ModernCardFooter>
              </ModernCard>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">دکمه‌ها</h2>
            <div className="flex flex-wrap gap-4">
              <GlassButton>دکمه شیشه‌ای</GlassButton>
              <GlassButton variant="secondary">دکمه ثانویه</GlassButton>
              <GlassButton variant="outline">دکمه خط‌دار</GlassButton>
              <GlassButton variant="ghost">دکمه شبح</GlassButton>
              <GlassButton variant="link">دکمه لینک</GlassButton>
              <GlassButton variant="gradient" gradientType="primary">دکمه گرادیانت</GlassButton>
              <GlassButton variant="gradient" gradientType="secondary">گرادیانت ثانویه</GlassButton>
              <GlassButton variant="gradient" gradientType="sunset">گرادیانت غروب</GlassButton>
              <GlassButton variant="gradient" gradientType="ocean">گرادیانت اقیانوس</GlassButton>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">فرم‌ها</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle>المان‌های فرم</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent className="space-y-4">
                  <ModernInput placeholder="نام کاربری" />
                  <ModernSelect 
                    options={[
                      { value: 'option1', label: 'گزینه ۱' },
                      { value: 'option2', label: 'گزینه ۲' },
                      { value: 'option3', label: 'گزینه ۳' },
                    ]} 
                    placeholder="انتخاب کنید" 
                  />
                  <ModernCheckbox label="مرا به خاطر بسپار" />
                  <ModernSwitch label="فعال/غیرفعال" />
                  <ModernRadioGroup 
                    options={[
                      { value: 'option1', label: 'گزینه ۱' },
                      { value: 'option2', label: 'گزینه ۲' },
                    ]}
                  />
                  <div className="w-full py-4">
                    <ModernProgress value={50} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1 text-center">اسلایدر (غیرفعال)</div>
                  </div>
                  <ModernTextarea placeholder="توضیحات..." />
                </ModernCardContent>
              </ModernCard>

              <ModernCard variant="glass">
                <ModernCardHeader>
                  <ModernCardTitle>المان‌های تعاملی</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent className="space-y-4">
                  <ModernBadge>نشان</ModernBadge>
                  <div className="flex gap-2">
                    <ModernBadge variant="primary">اصلی</ModernBadge>
                    <ModernBadge variant="secondary">ثانویه</ModernBadge>
                    <ModernBadge variant="success">موفق</ModernBadge>
                    <ModernBadge variant="warning">هشدار</ModernBadge>
                    <ModernBadge variant="danger">خطر</ModernBadge>
                  </div>
                  <ModernTooltip content="این یک راهنماست">
                    <GlassButton>نمایش راهنما</GlassButton>
                  </ModernTooltip>
                  <ModernProgress value={65} />
                  <div className="flex gap-2">
                    <ModernAvatar src="/avatars/01.png" alt="تصویر کاربر" />
                    <ModernAvatar src="/avatars/02.png" alt="تصویر کاربر" />
                    <ModernAvatar src="/avatars/03.png" alt="تصویر کاربر" />
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
          </section>
        </TabsContent>

        {/* رنگ‌ها */}
        <TabsContent value="colors">
          <section>
            <h2 className="text-2xl font-bold mb-4">پالت رنگ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="primary" color="bg-primary" textColor="text-white" />
              <ColorSwatch name="secondary" color="bg-secondary" textColor="text-white" />
              <ColorSwatch name="accent" color="bg-accent" textColor="text-white" />
              <ColorSwatch name="muted" color="bg-muted" textColor="text-text-primary" />
              <ColorSwatch name="surface" color="bg-surface" textColor="text-text-primary" />
              <ColorSwatch name="background" color="bg-background" textColor="text-text-primary" />
              <ColorSwatch name="text-primary" color="bg-text-primary" textColor="text-white" />
              <ColorSwatch name="text-secondary" color="bg-text-secondary" textColor="text-white" />
              <ColorSwatch name="success" color="bg-success" textColor="text-white" />
              <ColorSwatch name="warning" color="bg-warning" textColor="text-text-primary" />
              <ColorSwatch name="danger" color="bg-danger" textColor="text-white" />
              <ColorSwatch name="info" color="bg-info" textColor="text-white" />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">گرادیانت‌ها</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold">
                گرادیانت اصلی
              </div>
              <div className="h-24 rounded-lg bg-gradient-secondary flex items-center justify-center text-white font-bold">
                گرادیانت ثانویه
              </div>
              <div className="h-24 rounded-lg bg-gradient-sunset flex items-center justify-center text-white font-bold">
                گرادیانت غروب
              </div>
              <div className="h-24 rounded-lg bg-gradient-ocean flex items-center justify-center text-white font-bold">
                گرادیانت اقیانوس
              </div>
              <div className="h-24 rounded-lg bg-gradient-forest flex items-center justify-center text-white font-bold">
                گرادیانت جنگل
              </div>
              <div className="h-24 rounded-lg bg-gradient-cosmic flex items-center justify-center text-white font-bold">
                گرادیانت کیهانی
              </div>
            </div>
          </section>
        </TabsContent>

        {/* تایپوگرافی */}
        <TabsContent value="typography">
          <section>
            <h2 className="text-2xl font-bold mb-4">سربرگ‌ها</h2>
            <div className="space-y-4">
              <div>
                <h1 className="heading-1">عنوان اصلی (H1)</h1>
                <p className="text-sm text-text-secondary">heading-1</p>
              </div>
              <div>
                <h2 className="heading-2">عنوان سطح دو (H2)</h2>
                <p className="text-sm text-text-secondary">heading-2</p>
              </div>
              <div>
                <h3 className="heading-3">عنوان سطح سه (H3)</h3>
                <p className="text-sm text-text-secondary">heading-3</p>
              </div>
              <div>
                <h4 className="heading-4">عنوان سطح چهار (H4)</h4>
                <p className="text-sm text-text-secondary">heading-4</p>
              </div>
              <div>
                <h5 className="heading-5">عنوان سطح پنج (H5)</h5>
                <p className="text-sm text-text-secondary">heading-5</p>
              </div>
              <div>
                <h6 className="heading-6">عنوان سطح شش (H6)</h6>
                <p className="text-sm text-text-secondary">heading-6</p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">متن‌ها</h2>
            <div className="space-y-4">
              <div>
                <p className="body-large">متن بزرگ - لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.</p>
                <p className="text-sm text-text-secondary">body-large</p>
              </div>
              <div>
                <p className="body-regular">متن معمولی - لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.</p>
                <p className="text-sm text-text-secondary">body-regular</p>
              </div>
              <div>
                <p className="body-small">متن کوچک - لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.</p>
                <p className="text-sm text-text-secondary">body-small</p>
              </div>
              <div>
                <p className="caption">متن زیرنویس - لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ.</p>
                <p className="text-sm text-text-secondary">caption</p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">افکت‌های متنی</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-gradient">متن با گرادیانت</h3>
                <p className="text-sm text-text-secondary">text-gradient</p>
              </div>
              <div>
                <h3 className="text-shadow">متن با سایه</h3>
                <p className="text-sm text-text-secondary">text-shadow</p>
              </div>
              <div>
                <h3 className="text-glow">متن با درخشش</h3>
                <p className="text-sm text-text-secondary">text-glow</p>
              </div>
              <div>
                <h3 className="text-outline">متن با خط دور</h3>
                <p className="text-sm text-text-secondary">text-outline</p>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* افکت‌ها */}
        <TabsContent value="effects">
          <section>
            <h2 className="text-2xl font-bold mb-4">افکت‌های بصری</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">افکت شیشه‌ای ساده</h3>
                <p>این یک افکت گلس‌مورفیسم ساده است.</p>
                <p className="text-sm text-text-secondary mt-4">glass</p>
              </div>
              
              <div className="glass-advanced p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">افکت شیشه‌ای پیشرفته</h3>
                <p>این یک افکت گلس‌مورفیسم پیشرفته با جلوه‌های بیشتر است.</p>
                <p className="text-sm text-text-secondary mt-4">glass-advanced</p>
              </div>
              
              <div className="neomorphism p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">افکت نئومورفیسم</h3>
                <p>این یک افکت نئومورفیسم با سایه‌های برجسته است.</p>
                <p className="text-sm text-text-secondary mt-4">neomorphism</p>
              </div>
              
              <div className="neumorphism-inset p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">افکت نئومورفیسم فرورفته</h3>
                <p>این یک افکت نئومورفیسم فرورفته است.</p>
                <p className="text-sm text-text-secondary mt-4">neumorphism-inset</p>
              </div>
              
              <div className="shadow-soft p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold mb-2">سایه نرم</h3>
                <p>این یک افکت سایه نرم و پخش شده است.</p>
                <p className="text-sm text-text-secondary mt-4">shadow-soft</p>
              </div>
              
              <div className="shadow-hard p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold mb-2">سایه سخت</h3>
                <p>این یک افکت سایه واضح و مشخص است.</p>
                <p className="text-sm text-text-secondary mt-4">shadow-hard</p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">انیمیشن‌ها</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="animate-fade-in p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold">محو شدن</h3>
                <p className="text-sm text-text-secondary mt-2">animate-fade-in</p>
              </div>
              
              <div className="animate-slide-in-right p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold">اسلاید از راست</h3>
                <p className="text-sm text-text-secondary mt-2">animate-slide-in-right</p>
              </div>
              
              <div className="animate-slide-in-left p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold">اسلاید از چپ</h3>
                <p className="text-sm text-text-secondary mt-2">animate-slide-in-left</p>
              </div>
              
              <div className="animate-slide-in-up p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold">اسلاید از پایین</h3>
                <p className="text-sm text-text-secondary mt-2">animate-slide-in-up</p>
              </div>
              
              <div className="animate-slide-in-down p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold">اسلاید از بالا</h3>
                <p className="text-sm text-text-secondary mt-2">animate-slide-in-down</p>
              </div>
              
              <div className="animate-scale-in p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold">مقیاس</h3>
                <p className="text-sm text-text-secondary mt-2">animate-scale-in</p>
              </div>
              
              <div className="animate-bounce p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold">پرش</h3>
                <p className="text-sm text-text-secondary mt-2">animate-bounce</p>
              </div>
              
              <div className="animate-pulse p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold">ضربان</h3>
                <p className="text-sm text-text-secondary mt-2">animate-pulse</p>
              </div>
              
              <div className="animate-spin-slow p-6 rounded-lg bg-surface">
                <h3 className="text-xl font-bold">چرخش</h3>
                <p className="text-sm text-text-secondary mt-2">animate-spin-slow</p>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* چیدمان‌ها */}
        <TabsContent value="layouts">
          <section>
            <h2 className="text-2xl font-bold mb-4">چیدمان‌های پایه</h2>
            <div className="space-y-6">
              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle>گرید (Grid)</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                      <div key={item} className="bg-muted p-4 rounded-lg text-center">
                        آیتم {item}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-text-secondary mt-4">grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4</p>
                </ModernCardContent>
              </ModernCard>

              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle>فلکس (Flex)</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="flex flex-wrap gap-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="bg-muted p-4 rounded-lg text-center">
                        آیتم {item}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-text-secondary mt-4">flex flex-wrap gap-4</p>
                </ModernCardContent>
              </ModernCard>

              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle>فاصله‌گذاری (Spacing)</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">آیتم ۱</div>
                    <div className="bg-muted p-4 rounded-lg">آیتم ۲</div>
                    <div className="bg-muted p-4 rounded-lg">آیتم ۳</div>
                  </div>
                  <p className="text-sm text-text-secondary mt-4">space-y-4</p>
                </ModernCardContent>
              </ModernCard>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">چیدمان‌های پیشرفته</h2>
            <div className="space-y-6">
              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle>چیدمان دو ستونه</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-bold">سایدبار</h3>
                      <p>این یک ستون کناری است.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-bold">محتوای اصلی</h3>
                      <p>این بخش محتوای اصلی است که عرض بیشتری دارد.</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mt-4">grid grid-cols-1 md:grid-cols-[30%_70%] gap-4</p>
                </ModernCardContent>
              </ModernCard>

              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle>چیدمان سه ستونه</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-[20%_60%_20%] gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-bold">ستون راست</h3>
                      <p>این یک ستون کناری است.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-bold">محتوای اصلی</h3>
                      <p>این بخش محتوای اصلی است که عرض بیشتری دارد.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-bold">ستون چپ</h3>
                      <p>این یک ستون کناری دیگر است.</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mt-4">grid grid-cols-1 lg:grid-cols-[20%_60%_20%] gap-4</p>
                </ModernCardContent>
              </ModernCard>

              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle>چیدمان هدر، محتوا، فوتر</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="grid grid-rows-[auto_1fr_auto] gap-4 min-h-[400px]">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-bold">هدر</h3>
                      <p>این بخش هدر صفحه است.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-bold">محتوای اصلی</h3>
                      <p>این بخش محتوای اصلی است که ارتفاع متغیر دارد.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-bold">فوتر</h3>
                      <p>این بخش فوتر صفحه است.</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mt-4">grid grid-rows-[auto_1fr_auto] gap-4 min-h-[400px]</p>
                </ModernCardContent>
              </ModernCard>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// کامپوننت نمایش رنگ
function ColorSwatch({ name, color, textColor }) {
  return (
    <div className={`${color} ${textColor} p-4 rounded-lg`}>
      <div className="font-bold">{name}</div>
      <div className="text-sm opacity-80">#{name}</div>
    </div>
  );
}