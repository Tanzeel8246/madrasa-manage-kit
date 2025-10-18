import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, BarChart3, FileText, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: TrendingUp,
      title: { en: "Income Management", ur: "آمدنی کا انتظام" },
      description: { en: "Track donations, Zakat, Sadaqah, and all income sources", ur: "عطیات، زکوٰۃ، صدقہ اور تمام آمدنی کا ریکارڈ رکھیں" }
    },
    {
      icon: BarChart3,
      title: { en: "Expense Tracking", ur: "اخراجات کی نگرانی" },
      description: { en: "Manage salaries, bills, and all madrasa expenses", ur: "تنخواہیں، بل اور تمام مدرسہ اخراجات کا انتظام" }
    },
    {
      icon: FileText,
      title: { en: "Smart Reports", ur: "سمارٹ رپورٹس" },
      description: { en: "Generate detailed reports with charts and insights", ur: "تفصیلی رپورٹس، چارٹس اور تجزیہ تیار کریں" }
    },
    {
      icon: Shield,
      title: { en: "Secure & Reliable", ur: "محفوظ اور قابل اعتماد" },
      description: { en: "Your data is encrypted and safely stored", ur: "آپ کا ڈیٹا محفوظ اور خفیہ کیا گیا ہے" }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-[var(--shadow-islamic)]">
              <span className="text-primary-foreground font-bold text-xl">م</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {t('appName')}
            </h1>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mb-4">
            <div className="px-4 py-2 rounded-full bg-background">
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('language') === 'en' ? '✨ Complete Islamic Financial Management' : '✨ مکمل اسلامی مالیاتی انتظام'}
              </span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
              {t('language') === 'en' ? 'Manage Your Madrasa' : 'اپنے مدرسے کا انتظام کریں'}
            </span>
            <br />
            <span className="text-foreground">
              {t('language') === 'en' ? 'Finances with Ease' : 'آسانی سے'}
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('language') === 'en' 
              ? 'Track income, expenses, donations, and generate detailed reports. Built specifically for Islamic educational institutions.'
              : 'آمدنی، اخراجات، عطیات کو ٹریک کریں اور تفصیلی رپورٹس بنائیں۔ خاص طور پر اسلامی تعلیمی اداروں کے لیے بنایا گیا۔'
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg h-14 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-[var(--shadow-islamic)]"
              onClick={() => navigate('/dashboard')}
            >
              {t('language') === 'en' ? 'Get Started' : 'شروع کریں'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-14 px-8"
            >
              {t('language') === 'en' ? 'Learn More' : 'مزید جانیں'}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-card border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-islamic)] transition-shadow"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t('language') === 'en' ? feature.title.en : feature.title.ur}
              </h3>
              <p className="text-muted-foreground">
                {t('language') === 'en' ? feature.description.en : feature.description.ur}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-12 text-center shadow-[var(--shadow-islamic)]">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {t('language') === 'en' 
              ? 'Ready to Transform Your Madrasa Management?' 
              : 'اپنے مدرسے کے انتظام کو بہتر بنانے کے لیے تیار ہیں؟'
            }
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8">
            {t('language') === 'en'
              ? 'Join hundreds of madrasas already using our platform'
              : 'ہمارے پلیٹ فارم استعمال کرنے والے سینکڑوں مدارس میں شامل ہوں'
            }
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="text-lg h-14 px-8"
            onClick={() => navigate('/dashboard')}
          >
            {t('language') === 'en' ? 'Start Free Trial' : 'مفت آزمائش شروع کریں'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
