'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { ManagerFollow } from '@/lib/types';

export default function ManagerFollowView() {
  const [follows, setFollows] = useState<ManagerFollow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    managerId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'visit' as 'visit' | 'call' | 'meeting' | 'email',
    subject: '',
    notes: '',
    nextAction: ''
  });

  useEffect(() => {
    loadFollows();
  }, []);

  const loadFollows = () => {
    setFollows(db.getManagerFollows());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      db.updateManagerFollow(editingId, { ...formData, date: new Date(formData.date) });
    } else {
      const newFollow: ManagerFollow = {
        id: Date.now().toString(),
        ...formData,
        date: new Date(formData.date),
        createdAt: new Date()
      };
      db.addManagerFollow(newFollow);
    }

    resetForm();
    loadFollows();
  };

  const handleEdit = (follow: ManagerFollow) => {
    setFormData({
      managerId: follow.managerId,
      date: new Date(follow.date).toISOString().split('T')[0],
      type: follow.type,
      subject: follow.subject,
      notes: follow.notes,
      nextAction: follow.nextAction
    });
    setEditingId(follow.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المتابعة؟')) {
      db.deleteManagerFollow(id);
      loadFollows();
    }
  };

  const resetForm = () => {
    setFormData({
      managerId: '',
      date: new Date().toISOString().split('T')[0],
      type: 'visit',
      subject: '',
      notes: '',
      nextAction: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredFollows = follows.filter(f =>
    f.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.managerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    const styles = {
      visit: 'bg-blue-100 text-blue-800',
      call: 'bg-green-100 text-green-800',
      meeting: 'bg-purple-100 text-purple-800',
      email: 'bg-orange-100 text-orange-800'
    };
    const labels = {
      visit: 'زيارة',
      call: 'مكالمة',
      meeting: 'اجتماع',
      email: 'بريد'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">متابعة المدراء</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          إضافة متابعة
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'تعديل المتابعة' : 'إضافة متابعة جديدة'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="معرف المدير"
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="px-4 py-2 border rounded-lg"
              required
            >
              <option value="visit">زيارة</option>
              <option value="call">مكالمة</option>
              <option value="meeting">اجتماع</option>
              <option value="email">بريد إلكتروني</option>
            </select>
            <input
              type="text"
              placeholder="الموضوع"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <textarea
              placeholder="ملاحظات"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="px-4 py-2 border rounded-lg md:col-span-2"
              rows={3}
              required
            />
            <textarea
              placeholder="الإجراء القادم"
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              className="px-4 py-2 border rounded-lg md:col-span-2"
              rows={2}
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
            placeholder="البحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredFollows.map((follow) => (
          <div key={follow.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getTypeBadge(follow.type)}
                  <span className="text-sm text-gray-500">
                    {new Date(follow.date).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{follow.subject}</h3>
                <p className="text-sm text-gray-600 mt-1">المدير: {follow.managerId}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(follow)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(follow.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">الملاحظات:</span>
                <p className="text-gray-600 mt-1">{follow.notes}</p>
              </div>
              {follow.nextAction && (
                <div>
                  <span className="font-medium text-gray-700">الإجراء القادم:</span>
                  <p className="text-gray-600 mt-1">{follow.nextAction}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredFollows.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">لا توجد متابعات</div>
        )}
      </div>
    </div>
  );
}
