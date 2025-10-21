import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--accent))', 'hsl(var(--secondary))'];

const Reports = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('month');
  const [selectedSection, setSelectedSection] = useState('all');

  // Fetch sections
  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate date range based on period
  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'last3months':
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange();

  // Fetch income transactions
  const { data: incomeData } = useQuery({
    queryKey: ['income-reports', period, selectedSection],
    queryFn: async () => {
      let query = supabase
        .from('income_transactions')
        .select('*, sections(name)')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (selectedSection !== 'all') {
        query = query.eq('section_id', selectedSection);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch expense transactions
  const { data: expenseData } = useQuery({
    queryKey: ['expense-reports', period, selectedSection],
    queryFn: async () => {
      let query = supabase
        .from('expense_transactions')
        .select('*, sections(name)')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (selectedSection !== 'all') {
        query = query.eq('section_id', selectedSection);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Calculate totals
  const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalExpense = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const balance = totalIncome - totalExpense;

  // Prepare category-wise data
  const incomeByCategoryData = incomeData?.reduce((acc: any[], item) => {
    const existing = acc.find(i => i.name === item.category);
    if (existing) {
      existing.value += Number(item.amount);
    } else {
      acc.push({ name: item.category, value: Number(item.amount) });
    }
    return acc;
  }, []) || [];

  const expenseByCategoryData = expenseData?.reduce((acc: any[], item) => {
    const existing = acc.find(i => i.name === item.category);
    if (existing) {
      existing.value += Number(item.amount);
    } else {
      acc.push({ name: item.category, value: Number(item.amount) });
    }
    return acc;
  }, []) || [];

  // Compare income vs expense
  const comparisonData = [
    { name: t('income'), value: totalIncome },
    { name: t('expense'), value: totalExpense },
  ];

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('reports')}</h1>
            <p className="text-muted-foreground">
              {t('language') === 'en' 
                ? 'View detailed financial reports and analytics'
                : 'تفصیلی مالی رپورٹس اور تجزیات دیکھیں'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('language') === 'en' ? 'Export PDF' : 'PDF ڈاؤن لوڈ'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Calendar className="inline mr-2 h-4 w-4" />
                  {t('language') === 'en' ? 'Period' : 'مدت'}
                </label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">
                      {t('language') === 'en' ? 'This Month' : 'اس مہینے'}
                    </SelectItem>
                    <SelectItem value="last3months">
                      {t('language') === 'en' ? 'Last 3 Months' : 'پچھلے 3 مہینے'}
                    </SelectItem>
                    <SelectItem value="year">
                      {t('language') === 'en' ? 'This Year' : 'اس سال'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  <FileText className="inline mr-2 h-4 w-4" />
                  {t('language') === 'en' ? 'Section' : 'سیکشن'}
                </label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('language') === 'en' ? 'All Sections' : 'تمام سیکشنز'}
                    </SelectItem>
                    {sections?.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalIncome')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rs {totalIncome.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {incomeData?.length || 0} {t('language') === 'en' ? 'transactions' : 'لین دین'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalExpense')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                Rs {totalExpense.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {expenseData?.length || 0} {t('language') === 'en' ? 'transactions' : 'لین دین'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('balance')}</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                Rs {balance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {balance >= 0 
                  ? (t('language') === 'en' ? 'Surplus' : 'بچت')
                  : (t('language') === 'en' ? 'Deficit' : 'خسارہ')
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Income vs Expense Comparison */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>
                {t('language') === 'en' ? 'Income vs Expense' : 'آمدنی بمقابلہ اخراجات'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Income by Category */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>
                {t('language') === 'en' ? 'Income by Category' : 'قسم کے لحاظ سے آمدنی'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {incomeByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense by Category */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>
                {t('language') === 'en' ? 'Expense by Category' : 'قسم کے لحاظ سے اخراجات'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="hsl(var(--destructive))"
                    dataKey="value"
                  >
                    {expenseByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown Table */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>
                {t('language') === 'en' ? 'Category Breakdown' : 'قسم کی تفصیل'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-600">
                    {t('language') === 'en' ? 'Income Categories' : 'آمدنی کی اقسام'}
                  </h4>
                  {incomeByCategoryData.map((cat, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                      <span className="text-sm">{cat.name}</span>
                      <span className="font-semibold text-sm">Rs {cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-destructive">
                    {t('language') === 'en' ? 'Expense Categories' : 'اخراجات کی اقسام'}
                  </h4>
                  {expenseByCategoryData.map((cat, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                      <span className="text-sm">{cat.name}</span>
                      <span className="font-semibold text-sm">Rs {cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
