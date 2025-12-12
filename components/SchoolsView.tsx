'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { School } from '@/lib/types';

export default function SchoolsView() {
  const [schools, setSchools] = useState<School[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    director: '',
    phone: '',
    email: '',
    address: '',
    studentCount: 0,
    teacherCount: 0,
    notes: ''
  });

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = () => {
    setSchools(db.getSchools());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      db.updateSchool(editingId, formData);
    } else {
      const newSchool: School = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date()
      };
      db.addSchool(newSchool);
    }

    resetForm();
    loadSchools();
  };

  const handleEdit = (school: School) => {
    setFormData({
      name: school.name,
      region: school.region,
      director: school.director,
      phone: school.phone,
      email: school.email,
      address: school.address,
      studentCount: school.studentCount,
      teacherCount: school.teacherCount,
      notes: school.notes
    });
    setEditingId(school.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المدرسة؟')) {
      db.deleteSchool(id);
      loadSchools();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      director: '',
      phone: '',
      email: '',
      address: '',
      studentCount: 0,
      teacherCount: 0,
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.director.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">معلومات الابتدائيات</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          إضافة مدرسة
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'تعديل المدرسة' : 'إضافة مدرسة جديدة'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="اسم المدرسة"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <input
              type="text"
              placeholder="اسم المدير"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
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
              placeholder="العنوان"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="عدد التلاميذ"
              value={formData.studentCount}
              onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="عدد المعلمين"
              value={formData.teacherCount}
              onChange={(e) => setFormData({ ...formData, teacherCount: parseInt(e.target.value) })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <textarea
              placeholder="ملاحظات"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="px-4 py-2 border rounded-lg md:col-span-2"
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
            placeholder="البحث عن مدرسة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المدرسة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنطقة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدير</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التلاميذ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المعلمين</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSchools.map((school) => (
              <tr key={school.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{school.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.region}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.director}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.studentCount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.teacherCount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(school)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(school.id)}
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
        {filteredSchools.length === 0 && (
          <div className="text-center py-8 text-gray-500">لا توجد بيانات</div>
        )}
      </div>
    </div>
  );
}
