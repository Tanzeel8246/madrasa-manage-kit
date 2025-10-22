import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--accent))', 'hsl(var(--secondary))'];
const ITEMS_PER_PAGE = 20;

const Reports = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [period, setPeriod] = useState('month');
  const [selectedSection, setSelectedSection] = useState('all');
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch user profile for madrasa name
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('madrasa_name, full_name')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

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
        .lte('date', format(end, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

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
        .lte('date', format(end, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

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

  // Pagination logic
  const totalPages = Math.ceil(Math.max((incomeData?.length || 0), (expenseData?.length || 0)) / ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header - Hidden in print */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
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

        {/* Filters - Hidden in print */}
        <Card className="no-print">
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

        {/* Summary Cards - Hidden in print */}
        <div className="grid gap-4 md:grid-cols-3 no-print">
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

        {/* Charts - Hidden in print */}
        <div className="grid gap-4 md:grid-cols-2 no-print">
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
        </div>

        {/* Printable Report Section */}
        <div id="report-section" ref={reportRef} className="bg-white p-8 text-foreground">
          {/* Report Header */}
          <div className="text-center mb-8 border-b-2 border-primary pb-4">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {profile?.madrasa_name || 'Madrasa Financial Management'}
            </h1>
            <div className="urdu-text text-2xl font-semibold mb-2">
              مدرسہ کا نام: {profile?.madrasa_name || 'مدرسہ'}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {t('language') === 'en' ? 'Income & Expense Report' : 'آمدن و خرچ رپورٹ'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {t('language') === 'en' ? 'Period: ' : 'مدت: '}
              {format(start, 'dd MMM yyyy')} - {format(end, 'dd MMM yyyy')}
            </p>
          </div>

          {/* Detailed Transaction Tables */}
          {Array.from({ length: totalPages || 1 }).map((_, pageIndex) => {
            const pageIncomeData = incomeData?.slice(
              pageIndex * ITEMS_PER_PAGE,
              (pageIndex + 1) * ITEMS_PER_PAGE
            ) || [];
            const pageExpenseData = expenseData?.slice(
              pageIndex * ITEMS_PER_PAGE,
              (pageIndex + 1) * ITEMS_PER_PAGE
            ) || [];

            const pageIncomeTotal = pageIncomeData.reduce((sum, item) => sum + Number(item.amount), 0);
            const pageExpenseTotal = pageExpenseData.reduce((sum, item) => sum + Number(item.amount), 0);

            const previousIncomeTotal = incomeData?.slice(0, pageIndex * ITEMS_PER_PAGE)
              .reduce((sum, item) => sum + Number(item.amount), 0) || 0;
            const previousExpenseTotal = expenseData?.slice(0, pageIndex * ITEMS_PER_PAGE)
              .reduce((sum, item) => sum + Number(item.amount), 0) || 0;

            return (
              <div key={pageIndex} className="mb-12 page-break">
                {pageIndex > 0 && (
                  <div className="mb-4 p-4 bg-secondary/20 rounded">
                    <h3 className="font-semibold mb-2">
                      {t('language') === 'en' ? 'Carried Forward from Previous Page' : 'پچھلے صفحے سے آگے لایا گیا'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Income: Rs {previousIncomeTotal.toLocaleString()}</div>
                      <div>Expense: Rs {previousExpenseTotal.toLocaleString()}</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Income Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-600">
                      {t('language') === 'en' ? 'Income Transactions' : 'آمدنی کی تفصیل'}
                    </h3>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-green-50">
                          <th className="border border-border p-2 text-left">Date</th>
                          <th className="border border-border p-2 text-left">Category</th>
                          <th className="border border-border p-2 text-right">Amount (Rs)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageIncomeData.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-secondary/10'}>
                            <td className="border border-border p-2">{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                            <td className="border border-border p-2">{item.category}</td>
                            <td className="border border-border p-2 text-right font-semibold">{Number(item.amount).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-green-100 font-bold">
                          <td colSpan={2} className="border border-border p-2">Page Total:</td>
                          <td className="border border-border p-2 text-right">Rs {pageIncomeTotal.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Expense Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-destructive">
                      {t('language') === 'en' ? 'Expense Transactions' : 'اخراجات کی تفصیل'}
                    </h3>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-red-50">
                          <th className="border border-border p-2 text-left">Date</th>
                          <th className="border border-border p-2 text-left">Category</th>
                          <th className="border border-border p-2 text-right">Amount (Rs)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageExpenseData.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-secondary/10'}>
                            <td className="border border-border p-2">{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                            <td className="border border-border p-2">{item.category}</td>
                            <td className="border border-border p-2 text-right font-semibold">{Number(item.amount).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-red-100 font-bold">
                          <td colSpan={2} className="border border-border p-2">Page Total:</td>
                          <td className="border border-border p-2 text-right">Rs {pageExpenseTotal.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Page footer with running totals */}
                <div className="mt-4 p-4 bg-secondary/30 rounded">
                  <div className="grid grid-cols-3 gap-4 text-center font-semibold">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Income (Up to Page {pageIndex + 1})</div>
                      <div className="text-lg text-green-600">Rs {(previousIncomeTotal + pageIncomeTotal).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Expense (Up to Page {pageIndex + 1})</div>
                      <div className="text-lg text-destructive">Rs {(previousExpenseTotal + pageExpenseTotal).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Running Balance</div>
                      <div className={`text-lg ${(previousIncomeTotal + pageIncomeTotal - previousExpenseTotal - pageExpenseTotal) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        Rs {((previousIncomeTotal + pageIncomeTotal) - (previousExpenseTotal + pageExpenseTotal)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Final Summary */}
          <div className="mt-8 p-6 bg-primary/10 rounded-lg border-2 border-primary">
            <h3 className="text-xl font-bold text-center mb-4">
              {t('language') === 'en' ? 'Final Summary' : 'حتمی خلاصہ'}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Income</div>
                <div className="text-2xl font-bold text-green-600">Rs {totalIncome.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Expense</div>
                <div className="text-2xl font-bold text-destructive">Rs {totalExpense.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Final Balance</div>
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  Rs {balance.toLocaleString()}
                </div>
                <div className="text-xs mt-1">
                  {balance >= 0 
                    ? (t('language') === 'en' ? 'Surplus' : 'بچت')
                    : (t('language') === 'en' ? 'Deficit' : 'خسارہ')
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Report Footer */}
          <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            <p>Generated on: {format(new Date(), 'dd MMMM yyyy, hh:mm a')}</p>
            <p className="urdu-text mt-1">یہ رپورٹ خودکار طریقے سے تیار کی گئی ہے</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;