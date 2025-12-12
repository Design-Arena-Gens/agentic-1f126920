'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { Manager } from '@/lib/types';

export default function ManagersView() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    phone: '',
    email: '',
    region: '',
    notes: ''
  });

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = () => {
    setManagers(db.getManagers());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      db.updateManager(editingId, formData);
    } else {
      const newManager: Manager = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date()
      };
      db.addManager(newManager);
    }

    resetForm();
    loadManagers();
  };

  const handleEdit = (manager: Manager) => {
    setFormData({
      name: manager.name,
      school: manager.school,
      phone: manager.phone,
      email: manager.email,
      region: manager.region,
      notes: manager.notes
    });
    setEditingId(manager.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المدير؟')) {
      db.deleteManager(id);
      loadManagers();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      school: '',
      phone: '',
      email: '',
      region: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredManagers = managers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">معلومات المديرين</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          إضافة مدير
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'تعديل المدير' : 'إضافة مدير جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="الاسم"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="المدرسة"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="tel"
              placeholder="الهاتف"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="المنطقة"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <textarea
              placeholder="ملاحظات"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              rows={3}
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                {editingId ? 'تحديث' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن مدير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدرسة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنطقة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredManagers.map((manager) => (
              <tr key={manager.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{manager.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{manager.school}</td>
                <td className="px-6 py-4 whitespace-nowrap">{manager.region}</td>
                <td className="px-6 py-4 whitespace-nowrap">{manager.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{manager.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(manager)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(manager.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredManagers.length === 0 && (
          <div className="text-center py-8 text-gray-500">لا توجد بيانات</div>
        )}
      </div>
    </div>
  );
}
