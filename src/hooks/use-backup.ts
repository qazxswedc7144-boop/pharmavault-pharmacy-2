import { api } from '@/lib/api-client';
import { toast } from 'sonner';
export function useBackup() {
  const exportData = async () => {
    const id = toast.loading('جاري تحضير النسخة الاحتياطية...');
    try {
      const endpoints = [
        'products', 'customers', 'suppliers', 'categories', 
        'accounts', 'expenses', 'transactions', 'purchases'
      ];
      const results: Record<string, any> = {};
      for (const endpoint of endpoints) {
        const response = await api<{ items: any[] }>(`/api/${endpoint}`);
        results[endpoint] = response.items;
      }
      const backup = {
        metadata: {
          version: '2.5.0',
          timestamp: new Date().toISOString(),
          appName: 'PharmaVault'
        },
        data: results
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pharmavault_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('تم تحميل النسخة الاحتياطية بنجاح', { id });
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('فشل في إنشاء النسخة الاحتياطية', { id });
    }
  };
  const restoreData = async (file: File) => {
    const id = toast.loading('جاري استعادة البيانات...');
    try {
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
      const backup = JSON.parse(fileContent);
      if (backup.metadata?.appName !== 'PharmaVault') {
        throw new Error('ملف غير صالح');
      }
      const data = backup.data;
      const endpoints = Object.keys(data);
      for (const endpoint of endpoints) {
        const items = data[endpoint];
        if (Array.isArray(items)) {
          for (const item of items) {
            await api(`/api/${endpoint}`, {
              method: 'POST',
              body: JSON.stringify(item)
            });
          }
        }
      }
      toast.success('تمت استعادة كافة البيانات بنجاح. يرجى تحديث الصفحة.', { id });
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('فشل في استعادة البيانات من الملف المحدد', { id });
    }
  };
  return { exportData, restoreData };
}