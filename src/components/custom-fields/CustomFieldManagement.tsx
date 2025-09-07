import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Sparkles, ArrowLeft, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { useToast } from "@/hooks/use-toast";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";
import useAppSettings from '@/hooks/use-app-settings';
import CustomFieldForm from "./CustomFieldForm";
import { CustomFieldList } from "./CustomFieldList";
import { CustomFieldFilters } from "./CustomFieldFilters";
import { useCustomFields } from "@/hooks/use-custom-fields";
import { useCustomFieldFilters } from "@/hooks/use-custom-field-filters";

type TabType = 'overview' | 'manage';

const CustomFieldManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldTemplate | null>(null);

  const { settings, updateSettings } = useAppSettings();

  // Determine if we're in RTL mode based on the current language setting
  const isRTL = useMemo(() => settings.language === 'fa', [settings.language]);

  // Determine theme based on settings or system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update theme when settings change
  React.useEffect(() => {
    if (settings.theme === 'dark') {
      setIsDarkMode(true);
    } else if (settings.theme === 'light') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, [settings.theme]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    updateSettings({ theme: newTheme });
  };

  // Use custom hooks
  const { customFields, isLoading, isDeleting, deleteCustomField, handleSuccess } = useCustomFields();
  const { searchTerm, setSearchTerm, filterType, setFilterType, filteredFields } = useCustomFieldFilters(customFields);

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    handleSuccess();
    toast({
      title: t('custom_field_template.create_success'),
      description: t('custom_field_template.create_success_description')
    });
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingField(null);
    handleSuccess();
    toast({
      title: t('custom_field_template.update_success'),
      description: t('custom_field_template.update_success_description')
    });
  };

  const handleEditClick = (field: CustomFieldTemplate) => {
    setEditingField(field);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    await deleteCustomField(id);
  };

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'نمای کلی',
      icon: Sparkles,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'مشاهده و مدیریت فیلدهای سفارشی',
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      id: 'manage' as TabType,
      label: 'مدیریت پیشرفته',
      icon: Plus,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'ابزارهای پیشرفته مدیریت فیلدها',
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} transition-all duration-700 p-3 sm:p-4 md:p-6 lg:p-8`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <GlassButton
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ArrowLeft size={20} />
            </GlassButton>
            <div>
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t('custom_field_management.title')}
              </motion.h1>
              <motion.p
                className="text-gray-600 dark:text-gray-400 mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {t('custom_field_management.description')}
              </motion.p>
            </div>
          </div>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <GlassButton
              onClick={handleThemeToggle}
              variant="ghost"
              size="sm"
              className="p-2"
              title={isDarkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </GlassButton>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ModernTabs defaultValue="overview" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <ModernTabsList
              className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6 sm:mb-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20"
              glassEffect="default"
              hoverEffect="lift"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <ModernTabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.gradient} data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm`}
                    hoverEffect="scale"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={14} className={isRTL ? 'rotate-180' : ''} />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </ModernTabsTrigger>
                );
              })}
            </ModernTabsList>

            {/* Active Tab Indicator */}
            {activeTabData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className={`w-8 h-8 ${activeTabData.bgColor} rounded-lg flex items-center justify-center`}>
                  <activeTabData.icon size={16} className={activeTabData.color} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {activeTabData.label}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeTabData.description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <ModernTabsContent value={activeTab} className="space-y-6 sm:space-y-8">
                <ModernCard variant="glass" hover="lift" className="backdrop-blur-2xl border border-white/30 shadow-2xl">
                  <ModernCardContent className="p-4 sm:p-6 md:p-8">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="animate-in fade-in duration-700"
                    >
                      {activeTab === 'overview' ? (
                        <div className="space-y-8">
                          {/* Filters */}
                          <CustomFieldFilters
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            filterType={filterType}
                            onFilterChange={setFilterType}
                          />

                          {/* Add Button */}
                          <div className="flex justify-center">
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                              <DialogTrigger asChild>
                                <GlassButton
                                  variant="glass"
                                  className="flex items-center gap-4 px-8 py-5 text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 rounded-2xl"
                                >
                                  <Plus size={28} className="animate-pulse" />
                                  {t('custom_field_management.add_field')}
                                  <Sparkles className="w-5 h-5 animate-pulse" />
                                </GlassButton>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px] p-0 border-none bg-transparent shadow-none">
                                <DialogHeader className="sr-only">
                                  <DialogTitle>{t('custom_field_template.add_title')}</DialogTitle>
                                </DialogHeader>
                                <CustomFieldForm
                                  onSuccess={handleAddSuccess}
                                  onCancel={() => setIsAddDialogOpen(false)}
                                />
                              </DialogContent>
                            </Dialog>
                          </div>

                          {/* Fields List */}
                          <CustomFieldList
                            fields={filteredFields}
                            isLoading={isLoading}
                            isDeleting={isDeleting}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            onAddNew={() => setIsAddDialogOpen(true)}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Palette className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                              مدیریت پیشرفته
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                              ابزارهای پیشرفته مدیریت فیلدهای سفارشی به زودی اضافه خواهد شد
                            </p>
                            <GlassButton
                              variant="glass"
                              onClick={() => setActiveTab('overview')}
                              className="px-6 py-3"
                            >
                              بازگشت به نمای کلی
                            </GlassButton>
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  </ModernCardContent>
                </ModernCard>
              </ModernTabsContent>
            </AnimatePresence>
          </ModernTabs>
        </motion.div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] p-0 border-none bg-transparent shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>{t('custom_field_template.edit_title')}</DialogTitle>
            </DialogHeader>
            {editingField && (
              <CustomFieldForm
                initialData={editingField}
                onSuccess={handleEditSuccess}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingField(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomFieldManagement;