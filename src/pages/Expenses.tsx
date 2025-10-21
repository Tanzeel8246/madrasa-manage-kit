import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

type ExpenseCategory = 'salaries' | 'food' | 'utilities' | 'books' | 'furniture' | 'stationery' | 'construction' | 'repairs' | 'events' | 'other';
type PaymentMethod = 'cash' | 'bank' | 'online';

interface ExpenseForm {
  amount: string;
  category: ExpenseCategory;
  payment_method: PaymentMethod;
  description: string;
  date: string;
  section_id?: string;
}

const expenseSchema = z.object({
  amount: z.string().min(1, { message: "Amount is required" }).refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: "Amount must be greater than 0" }),
  category: z.string().min(1, { message: "Category is required" }),
  payment_method: z.string().min(1, { message: "Payment method is required" }),
  description: z.string().trim().min(1, { message: "Description is required" }).max(500, { message: "Description must be less than 500 characters" }),
  date: z.string().min(1, { message: "Date is required" }),
  section_id: z.string().uuid().optional()
});

const Expenses = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState<ExpenseForm>({
    amount: '',
    category: 'other',
    payment_method: 'cash',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Fetch sections
  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch expense transactions
  const { data: expenseTransactions, isLoading } = useQuery({
    queryKey: ['expense_transactions', searchTerm, filterCategory],
    queryFn: async () => {
      let query = supabase
        .from('expense_transactions')
        .select('*, sections(name)')
        .order('date', { ascending: false });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory as ExpenseCategory);
      }

      if (searchTerm) {
        query = query.ilike('description', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Create expense mutation
  const createExpense = useMutation({
    mutationFn: async (data: ExpenseForm) => {
      const { error } = await supabase
        .from('expense_transactions')
        .insert({
          ...data,
          amount: parseFloat(data.amount),
          created_by: user?.id,
          section_id: data.section_id || sections?.[0]?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_transactions'] });
      toast({
        title: 'Success',
        description: 'Expense recorded successfully',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'other',
      payment_method: 'cash',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      expenseSchema.parse(formData);
      createExpense.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: 'Validation Error',
            description: err.message,
            variant: 'destructive',
          });
        });
      }
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      salaries: 'Salaries / تنخواہیں',
      food: 'Food & Hostel / کھانا',
      utilities: 'Utilities / بجلی پانی',
      books: 'Books / کتابیں',
      furniture: 'Furniture / فرنیچر',
      stationery: 'Stationery / اسٹیشنری',
      construction: 'Construction / تعمیر',
      repairs: 'Repairs / مرمت',
      events: 'Events / تقریبات',
      other: 'Other / دیگر',
    };
    return labels[category] || category;
  };

  const totalExpense = expenseTransactions?.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('expense')}</h1>
            <p className="text-muted-foreground">Track all expenses and payments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('addExpense')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (Rs) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salaries">Salaries / تنخواہیں</SelectItem>
                        <SelectItem value="food">Food & Hostel / کھانا</SelectItem>
                        <SelectItem value="utilities">Utilities / بجلی پانی</SelectItem>
                        <SelectItem value="books">Books / کتابیں</SelectItem>
                        <SelectItem value="furniture">Furniture / فرنیچر</SelectItem>
                        <SelectItem value="stationery">Stationery / اسٹیشنری</SelectItem>
                        <SelectItem value="construction">Construction / تعمیر</SelectItem>
                        <SelectItem value="repairs">Repairs / مرمت</SelectItem>
                        <SelectItem value="events">Events / تقریبات</SelectItem>
                        <SelectItem value="other">Other / دیگر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Payment Method *</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) => setFormData({ ...formData, payment_method: value as PaymentMethod })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash / نقد</SelectItem>
                        <SelectItem value="bank">Bank / بینک</SelectItem>
                        <SelectItem value="online">Online / آن لائن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={formData.section_id}
                    onValueChange={(value) => setFormData({ ...formData, section_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections?.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Expense details..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createExpense.isPending}>
                    {createExpense.isPending ? 'Saving...' : 'Save Expense'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">Rs {totalExpense.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenseTransactions?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                Rs {expenseTransactions?.filter(t => new Date(t.date).getMonth() === new Date().getMonth())
                  .reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value)}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="salaries">Salaries</SelectItem>
                  <SelectItem value="food">Food & Hostel</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="repairs">Repairs</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : expenseTransactions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No expense records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenseTransactions?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                        <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                        <TableCell>{transaction.sections?.name || '-'}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          Rs {parseFloat(transaction.amount.toString()).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;