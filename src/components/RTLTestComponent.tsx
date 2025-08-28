import React, { useState, useEffect } from 'react';
import { ModernSwitch } from '@/components/ui/modern-switch';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernTabs } from '@/components/ui/modern-navigation';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import '../rtl-test-styles.css';

const RTLTestComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [switchValue, setSwitchValue] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [traditionalSelectValue, setTraditionalSelectValue] = useState('');
  const [isRTL, setIsRTL] = useState(document.documentElement.dir === 'rtl');

  // Custom tabs implementation for the test
  const CustomTabs = () => {
    const [activeTab, setActiveTab] = useState('tab1');
    
    const getContent = () => {
      const tab = tabs.find(t => t.id === activeTab);
      return tab?.content || null;
    };
    
    return (
      <div className="rtl-custom-tabs">
        <div className="tabs-header" style={{ 
          display: 'flex', 
          padding: '4px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '8px',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                margin: '2px',
                borderRadius: '6px',
                backgroundColor: activeTab === tab.id ? 'black' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'black',
                border: 'none',
                cursor: 'pointer',
                minWidth: '75px',
                textAlign: 'center'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tabs-content" style={{ 
          padding: '16px', 
          backgroundColor: '#f9f9f9', 
          marginTop: '8px', 
          borderRadius: '8px',
          textAlign: isRTL ? 'right' : 'left',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          {getContent()}
        </div>
      </div>
    );
  };

  // Monitor RTL changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsRTL(document.documentElement.dir === 'rtl');
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    });
    
    return () => observer.disconnect();
  }, []);

  const tabs = [
    { id: 'tab1', label: t('common.tab1', 'Tab 1'), content: <div>{t('common.content1', 'Content 1')}</div> },
    { id: 'tab2', label: t('common.tab2', 'Tab 2'), content: <div>{t('common.content2', 'Content 2')}</div> },
    { id: 'tab3', label: t('common.tab3', 'Tab 3'), content: <div>{t('common.content3', 'Content 3')}</div> },
  ];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = i18n.dir();
    console.log('Language changed to:', lang, 'Direction:', i18n.dir());
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4 flex-wrap">
        <button 
          onClick={() => handleLanguageChange('en')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          English (LTR)
        </button>
        <button 
          onClick={() => handleLanguageChange('fa')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Persian (RTL)
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">{t('common.rtl_test', 'RTL Test Component')}</h2>
        
        {/* Debug Info */}
        <div className="p-4 bg-yellow-100 rounded-lg">
          <p><strong>Current Language:</strong> {i18n.language}</p>
          <p><strong>Direction:</strong> {i18n.dir()}</p>
          <p><strong>Document Direction:</strong> {document.documentElement.dir}</p>
          <p><strong>Is RTL Detected:</strong> {isRTL ? 'Yes' : 'No'}</p>
        </div>

        {/* Switch Test */}
        <div className="flex items-center gap-4">
          <label>{t('common.test_switch', 'Test Switch')}:</label>
          <ModernSwitch 
            checked={switchValue}
            onCheckedChange={setSwitchValue}
          />
          <span>{switchValue ? t('common.on', 'On') : t('common.off', 'Off')}</span>
        </div>

        {/* Modern Select Test */}
        <div className="space-y-2">
          <label className="block">{t('common.test_modern_select', 'Test Modern Select')}:</label>
          <ModernSelect value={selectValue} onValueChange={setSelectValue}>
            <ModernSelectTrigger>
              <ModernSelectValue placeholder={t('common.select_placeholder', 'Select an option')} />
            </ModernSelectTrigger>
            <ModernSelectContent>
              <ModernSelectItem value="option1">{t('common.option1', 'Option 1')}</ModernSelectItem>
              <ModernSelectItem value="option2">{t('common.option2', 'Option 2')}</ModernSelectItem>
              <ModernSelectItem value="option3">{t('common.option3', 'Option 3')}</ModernSelectItem>
            </ModernSelectContent>
          </ModernSelect>
        </div>

        {/* Traditional Select Test */}
        <div className="space-y-2">
          <label className="block">{t('common.test_traditional_select', 'Test Traditional Select')}:</label>
          <Select value={traditionalSelectValue} onValueChange={setTraditionalSelectValue}>
            <SelectTrigger>
              <SelectValue placeholder={t('common.select_placeholder', 'Select an option')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">{t('common.option1', 'Option 1')}</SelectItem>
              <SelectItem value="option2">{t('common.option2', 'Option 2')}</SelectItem>
              <SelectItem value="option3">{t('common.option3', 'Option 3')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Modern Input Test */}
        <div className="space-y-2">
          <label className="block">{t('common.test_modern_input', 'Test Modern Input')}:</label>
          <ModernInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('common.input_placeholder', 'Enter text here')}
          />
        </div>

        {/* Traditional Textarea Test */}
        <div className="space-y-2">
          <label className="block">{t('common.test_traditional_textarea', 'Test Traditional Textarea')}:</label>
          <Textarea
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder={t('common.textarea_placeholder', 'Enter text here')}
            className="min-h-[100px]"
          />
        </div>

        {/* Tabs Test - Original ModernTabs */}
        <div className="space-y-2">
          <label className="block">{t('common.test_tabs', 'Test with ModernTabs')}:</label>
          <div style={{ maxWidth: '400px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <ModernTabs tabs={tabs} variant="pills" />
          </div>
        </div>

        {/* Custom Tabs Test */}
        <div className="space-y-2">
          <label className="block">{t('common.test_custom_tabs', 'Test with Custom Tabs')}:</label>
          <div style={{ maxWidth: '400px', overflow: 'hidden' }}>
            <CustomTabs />
          </div>
        </div>

        {/* Additional RTL Test - Text Alignment */}
        <div className="space-y-2">
          <label className="block">{t('common.test_text_alignment', 'Test Text Alignment')}:</label>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="mb-2">{t('common.sample_text', 'This is a sample text to test alignment.')}</p>
            <p className="text-right">{t('common.right_aligned', 'This should be right-aligned in RTL.')}</p>
            <p className="text-left">{t('common.left_aligned', 'This should be left-aligned in LTR.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RTLTestComponent;