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

type IncomeCategory = 'zakat' | 'sadaqah' | 'fitrana' | 'qurbani' | 'donation' | 'other';
type PaymentMethod = 'cash' | 'bank' | 'online';

interface IncomeForm {
  amount: string;
  category: IncomeCategory;
  payment_method: PaymentMethod;
  donor_name: string;
  date: string;
  description: string;
  section_id?: string;
}

const incomeSchema = z.object({
  amount: z.string().min(1, { message: "Amount is required" }).refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: "Amount must be greater than 0" }),
  category: z.string().min(1, { message: "Category is required" }),
  payment_method: z.string().min(1, { message: "Payment method is required" }),
  donor_name: z.string().trim().max(100, { message: "Donor name must be less than 100 characters" }).optional(),
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().trim().max(500, { message: "Description must be less than 500 characters" }).optional(),
  section_id: z.string().uuid().optional()
});

const Income = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState<IncomeForm>({
    amount: '',
    category: 'donation',
    payment_method: 'cash',
    donor_name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
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

  // Fetch income transactions
  const { data: incomeTransactions, isLoading } = useQuery({
    queryKey: ['income_transactions', searchTerm, filterCategory],
    queryFn: async () => {
      let query = supabase
        .from('income_transactions')
        .select('*, sections(name)')
        .order('date', { ascending: false });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory as IncomeCategory);
      }

      if (searchTerm) {
        query = query.ilike('donor_name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Create income mutation
  const createIncome = useMutation({
    mutationFn: async (data: IncomeForm) => {
      const { error } = await supabase
        .from('income_transactions')
        .insert({
          ...data,
          amount: parseFloat(data.amount),
          created_by: user?.id,
          section_id: data.section_id || sections?.[0]?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income_transactions'] });
      toast({
        title: 'Success',
        description: 'Income recorded successfully',
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
      category: 'donation',
      payment_method: 'cash',
      donor_name: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      incomeSchema.parse(formData);
      createIncome.mutate(formData);
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
      zakat: 'Zakat / زکوٰۃ',
      sadaqah: 'Sadaqah / صدقہ',
      fitrana: 'Fitrana / فطرانہ',
      qurbani: 'Qurbani / قربانی',
      donation: 'Donation / عطیہ',
      other: 'Other / دیگر',
    };
    return labels[category] || category;
  };

  const totalIncome = incomeTransactions?.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t('income')}</h1>
            <p className="text-sm text-muted-foreground">Manage all income and donations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                {t('addIncome')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      onValueChange={(value) => setFormData({ ...formData, category: value as IncomeCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zakat">Zakat / زکوٰۃ</SelectItem>
                        <SelectItem value="sadaqah">Sadaqah / صدقہ</SelectItem>
                        <SelectItem value="fitrana">Fitrana / فطرانہ</SelectItem>
                        <SelectItem value="qurbani">Qurbani / قربانی</SelectItem>
                        <SelectItem value="donation">Donation / عطیہ</SelectItem>
                        <SelectItem value="other">Other / دیگر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="donor_name">Donor Name</Label>
                  <Input
                    id="donor_name"
                    value={formData.donor_name}
                    onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                    placeholder="Enter donor name"
                  />
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createIncome.isPending}>
                    {createIncome.isPending ? 'Saving...' : 'Save Income'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Rs {totalIncome.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incomeTransactions?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rs {incomeTransactions?.filter(t => new Date(t.date).getMonth() === new Date().getMonth())
                  .reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by donor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="zakat">Zakat</SelectItem>
                    <SelectItem value="sadaqah">Sadaqah</SelectItem>
                    <SelectItem value="fitrana">Fitrana</SelectItem>
                    <SelectItem value="qurbani">Qurbani</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2 flex-shrink-0">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Income Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Donor</TableHead>
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
                  ) : incomeTransactions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No income records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomeTransactions?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                        <TableCell>{transaction.donor_name || '-'}</TableCell>
                        <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                        <TableCell>{transaction.sections?.name || '-'}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
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

export default Income;