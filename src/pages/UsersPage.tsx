import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Shield, Mail, Phone, Trash2, Edit2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import type { User } from '@shared/types';
import { toast } from 'sonner';
export function UsersPage() {
  const queryClient = useQueryClient();
  const { data: usersData, isLoading } = useQuery<{ items: User[] }>({
    queryKey: ['users'],
    queryFn: () => api<{ items: User[] }>('/api/users')
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('تم حذف الموظف بنجاح');
    }
  });
  const users = usersData?.items ?? [];
  return (
    <AppLayout container>
      <div className="space-y-8 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">إدارة طاقم الصيدلية</h1>
            <p className="text-muted-foreground mt-2 text-lg">التحكم في صلاحيات الوصول وإدارة حسابات الصيادلة والمساعدين.</p>
          </div>
          <Button className="gap-2 h-12 px-8 bg-pharmav-primary font-bold shadow-neon-blue rounded-xl flex-row-reverse">
            <UserPlus className="size-5" /> إضافة موظف جديد
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">مدراء النظام</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold font-display">{users.filter(u => u.role === 'admin').length}</div></CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">صيادلة</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold font-display">{users.filter(u => u.role === 'pharmacist').length}</div></CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2 text-right">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">إجمالي الطاقم</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold font-display">{users.length}</div></CardContent>
          </Card>
        </div>
        <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-5 px-6">الموظف</TableHead>
                <TableHead className="text-right">الدور الوظيفي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left px-8">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="py-8"><div className="h-10 bg-muted animate-pulse rounded-xl" /></TableCell></TableRow>
                ))
              ) : users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/10 transition-colors group">
                  <TableCell className="font-bold py-6 px-6">
                    <div className="flex items-center gap-4 justify-end">
                      <div className="text-right">
                        <div className="text-base">{user.name}</div>
                        <div className="text-xs text-muted-foreground">معرف: {user.id.slice(0, 8)}</div>
                      </div>
                      <div className="size-10 rounded-xl bg-pharmav-primary/10 text-pharmav-primary flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      {user.role === 'admin' ? (
                        <Badge className="bg-pharmav-primary text-white gap-1 flex-row-reverse">
                          <ShieldCheck className="size-3" /> مدير نظام
                        </Badge>
                      ) : user.role === 'pharmacist' ? (
                        <Badge variant="secondary" className="gap-1 flex-row-reverse">
                          <Shield className="size-3" /> صيدلي
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 flex-row-reverse">
                          <ShieldAlert className="size-3" /> مشاهد
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none font-bold">نشط</Badge>
                  </TableCell>
                  <TableCell className="text-left px-8">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-pharmav-primary">
                        <Edit2 className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full text-muted-foreground hover:text-red-500"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) deleteMutation.mutate(user.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="bg-pharmav-primary/5 p-8 rounded-[2.5rem] border border-pharmav-primary/10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 justify-end">
            <ShieldCheck className="size-5 text-pharmav-primary" /> مصفوفة الصلاحيات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 bg-white dark:bg-black/20 rounded-2xl border text-right">
              <div className="font-bold mb-2">مدير النظام</div>
              <ul className="text-muted-foreground space-y-1">
                <li>• صلاحية كاملة على التقارير</li>
                <li>• إدارة الموظفين والاشتراك</li>
                <li>• التحكم في المخزون والأسعار</li>
              </ul>
            </div>
            <div className="p-4 bg-white dark:bg-black/20 rounded-2xl border text-right">
              <div className="font-bold mb-2">الصيدلي</div>
              <ul className="text-muted-foreground space-y-1">
                <li>• معالجة المبيعات والمرتجعات</li>
                <li>• إضافة المنتجات وتعديلها</li>
                <li>• عرض التنبيهات وإدارة الرفوف</li>
              </ul>
            </div>
            <div className="p-4 bg-white dark:bg-black/20 rounded-2xl border text-right">
              <div className="font-bold mb-2">المشاهد</div>
              <ul className="text-muted-foreground space-y-1">
                <li>• عرض التقارير والمخزون فقط</li>
                <li>• لا يمكنه إجراء مبيعات</li>
                <li>• لا يمكنه تعديل الحسابات</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}