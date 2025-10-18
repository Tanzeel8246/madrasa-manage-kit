import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  appName: { en: 'Madrasa Finance Manager', ur: 'مدرسہ فنانس مینیجر' },
  dashboard: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  income: { en: 'Income', ur: 'آمدنی' },
  expense: { en: 'Expenses', ur: 'اخراجات' },
  reports: { en: 'Reports', ur: 'رپورٹس' },
  stock: { en: 'Stock', ur: 'اسٹاک' },
  cashBank: { en: 'Cash & Bank', ur: 'نقدی اور بینک' },
  loans: { en: 'Loans', ur: 'قرضے' },
  donors: { en: 'Donors', ur: 'عطیہ دہندگان' },
  settings: { en: 'Settings', ur: 'ترتیبات' },
  totalIncome: { en: 'Total Income', ur: 'کل آمدنی' },
  totalExpense: { en: 'Total Expenses', ur: 'کل اخراجات' },
  balance: { en: 'Balance', ur: 'بیلنس' },
  addIncome: { en: 'Add Income', ur: 'آمدنی شامل کریں' },
  addExpense: { en: 'Add Expense', ur: 'اخراجات شامل کریں' },
  viewReports: { en: 'View Reports', ur: 'رپورٹس دیکھیں' },
  recentTransactions: { en: 'Recent Transactions', ur: 'حالیہ لین دین' },
  monthlyOverview: { en: 'Monthly Overview', ur: 'ماہانہ جائزہ' },
  donationType: { en: 'Donation Type', ur: 'عطیہ کی قسم' },
  zakat: { en: 'Zakat', ur: 'زکوٰۃ' },
  sadaqah: { en: 'Sadaqah', ur: 'صدقہ' },
  fitrana: { en: 'Fitrana', ur: 'فطرانہ' },
  qurbani: { en: 'Qurbani Fund', ur: 'قربانی فنڈ' },
  general: { en: 'General Donation', ur: 'عام عطیہ' },
  amount: { en: 'Amount', ur: 'رقم' },
  date: { en: 'Date', ur: 'تاریخ' },
  donorName: { en: 'Donor Name', ur: 'عطیہ دہندہ کا نام' },
  description: { en: 'Description', ur: 'تفصیل' },
  category: { en: 'Category', ur: 'زمرہ' },
  submit: { en: 'Submit', ur: 'جمع کریں' },
  cancel: { en: 'Cancel', ur: 'منسوخ کریں' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ur' : 'en');
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div dir={language === 'ur' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
