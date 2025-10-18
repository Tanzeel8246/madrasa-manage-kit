import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, Wallet, Plus, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const monthlyData = [
  { name: 'Jan', income: 450000, expense: 280000 },
  { name: 'Feb', income: 520000, expense: 310000 },
  { name: 'Mar', income: 480000, expense: 295000 },
  { name: 'Apr', income: 580000, expense: 330000 },
  { name: 'May', income: 620000, expense: 340000 },
  { name: 'Jun', income: 550000, expense: 315000 },
];

const recentTransactions = [
  { id: 1, type: 'income', category: 'Zakat', amount: 50000, donor: 'Ahmad Ali', date: '2024-10-15' },
  { id: 2, type: 'expense', category: 'Salaries', amount: 85000, description: 'Teachers Salary', date: '2024-10-14' },
  { id: 3, type: 'income', category: 'Sadaqah', amount: 25000, donor: 'Fatima Sheikh', date: '2024-10-13' },
  { id: 4, type: 'expense', category: 'Utilities', amount: 12000, description: 'Electricity Bill', date: '2024-10-12' },
];

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title={t('totalIncome')}
            value="Rs 3,200,000"
            icon={TrendingUp}
            trend="+12.5%"
            variant="success"
          />
          <StatCard
            title={t('totalExpense')}
            value="Rs 1,870,000"
            icon={TrendingDown}
            trend="+8.2%"
            variant="danger"
          />
          <StatCard
            title={t('balance')}
            value="Rs 1,330,000"
            icon={Wallet}
            trend="+18.7%"
            variant="default"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button size="lg" className="h-auto py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Plus className="mr-2 h-5 w-5" />
            {t('addIncome')}
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-4">
            <Plus className="mr-2 h-5 w-5" />
            {t('addExpense')}
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-4">
            <FileText className="mr-2 h-5 w-5" />
            {t('viewReports')}
          </Button>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>{t('monthlyOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
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
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
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
            <CardTitle>{t('recentTransactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.donor || transaction.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'} Rs {transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
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
