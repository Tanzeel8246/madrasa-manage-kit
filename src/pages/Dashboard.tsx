import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, Wallet, Plus, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Fetch income transactions
  const { data: incomeData } = useQuery({
    queryKey: ['dashboard-income'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch expense transactions
  const { data: expenseData } = useQuery({
    queryKey: ['dashboard-expense'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate totals
  const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalExpense = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const balance = totalIncome - totalExpense;

  // Get last 6 months data for charts
  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthIncome = incomeData?.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      }).reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      const monthExpense = expenseData?.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      }).reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      months.push({
        name: format(date, 'MMM'),
        income: monthIncome,
        expense: monthExpense,
      });
    }
    return months;
  };

  const monthlyData = getMonthlyData();

  // Get recent transactions (mix of income and expense)
  const recentTransactions = [
    ...(incomeData?.slice(0, 2).map(t => ({
      id: t.id,
      type: 'income' as const,
      category: t.category,
      amount: Number(t.amount),
      donor: t.donor_name,
      description: undefined as string | undefined,
      date: format(new Date(t.date), 'yyyy-MM-dd'),
    })) || []),
    ...(expenseData?.slice(0, 2).map(t => ({
      id: t.id,
      type: 'expense' as const,
      category: t.category,
      amount: Number(t.amount),
      donor: undefined as string | undefined,
      description: t.description,
      date: format(new Date(t.date), 'yyyy-MM-dd'),
    })) || []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title={t('totalIncome')}
            value={`Rs ${totalIncome.toLocaleString()}`}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title={t('totalExpense')}
            value={`Rs ${totalExpense.toLocaleString()}`}
            icon={TrendingDown}
            variant="danger"
          />
          <StatCard
            title={t('balance')}
            value={`Rs ${balance.toLocaleString()}`}
            icon={Wallet}
            variant={balance >= 0 ? "success" : "danger"}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Button 
            size="lg" 
            className="h-auto py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full"
            onClick={() => navigate('/income')}
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('addIncome')}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="h-auto py-4 w-full"
            onClick={() => navigate('/expenses')}
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('addExpense')}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="h-auto py-4 w-full sm:col-span-2 md:col-span-1"
            onClick={() => navigate('/reports')}
          >
            <FileText className="mr-2 h-5 w-5" />
            {t('viewReports')}
          </Button>
        </div>

        {/* Charts */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">{t('monthlyOverview')}</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
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
                  <Bar dataKey="income" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
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
                  <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">{t('recentTransactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${transaction.type === 'income' ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">{transaction.category}</p>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        {transaction.donor || transaction.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0 pl-10 sm:pl-0">
                    <p className={`font-semibold text-sm md:text-base ${transaction.type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'} Rs {transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
