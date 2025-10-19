import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, UserPlus, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface DonorForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  cnic: string;
  is_regular: boolean;
  notes: string;
}

const Donors = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<DonorForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    cnic: '',
    is_regular: false,
    notes: '',
  });

  // Fetch donors
  const { data: donors, isLoading } = useQuery({
    queryKey: ['donors', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Create donor mutation
  const createDonor = useMutation({
    mutationFn: async (data: DonorForm) => {
      const { error } = await supabase.from('donors').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      toast({
        title: 'Success',
        description: 'Donor added successfully',
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
      name: '',
      email: '',
      phone: '',
      address: '',
      cnic: '',
      is_regular: false,
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDonor.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('donors')}</h1>
            <p className="text-muted-foreground">Manage donor information</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Donor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Donor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ahmad Ali"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="donor@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnic">CNIC</Label>
                    <Input
                      id="cnic"
                      value={formData.cnic}
                      onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                      placeholder="12345-1234567-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_regular"
                    checked={formData.is_regular}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_regular: checked as boolean })}
                  />
                  <Label htmlFor="is_regular" className="cursor-pointer">
                    Regular Donor
                  </Label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDonor.isPending}>
                    {createDonor.isPending ? 'Saving...' : 'Save Donor'}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{donors?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Regular Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {donors?.filter(d => d.is_regular).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {donors?.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Donors Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Added On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : donors?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No donors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    donors?.map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell className="font-medium">{donor.name}</TableCell>
                        <TableCell>
                          {donor.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {donor.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {donor.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {donor.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{donor.cnic || '-'}</TableCell>
                        <TableCell>
                          {donor.is_regular && (
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              Regular
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(donor.created_at), 'dd MMM yyyy')}
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

export default Donors;