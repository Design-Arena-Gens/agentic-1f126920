'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { SendTable } from '@/lib/types';

export default function SendTablesView() {
  const [tables, setTables] = useState<SendTable[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'circular' as 'circular' | 'report' | 'request',
    recipients: '',
    sendDate: new Date().toISOString().split('T')[0],
    deadline: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'sent' | 'completed',
    notes: ''
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = () => {
    setTables(db.getSendTables());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipientsArray = formData.recipients.split(',').map(r => r.trim());

    if (editingId) {
      db.updateSendTable(editingId, {
        ...formData,
        recipients: recipientsArray,
        sendDate: new Date(formData.sendDate),
        deadline: new Date(formData.deadline)
      });
    } else {
      const newTable: SendTable = {
        id: Date.now().toString(),
        ...formData,
        recipients: recipientsArray,
        sendDate: new Date(formData.sendDate),
        deadline: new Date(formData.deadline),
        createdAt: new Date()
      };
      db.addSendTable(newTable);
    }

    resetForm();
    loadTables();
  };

  const handleEdit = (table: SendTable) => {
    setFormData({
      title: table.title,
      type: table.type,
      recipients: table.recipients.join(', '),
      sendDate: new Date(table.sendDate).toISOString().split('T')[0],
      deadline: new Date(table.deadline).toISOString().split('T')[0],
      status: table.status,
      notes: table.notes
    });
    setEditingId(table.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الجدول؟')) {
      db.deleteSendTable(id);
      loadTables();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'circular',
      recipients: '',
      sendDate: new Date().toISOString().split('T')[0],
      deadline: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredTables = tables.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    const labels = {
      pending: 'قيد الانتظار',
      sent: 'تم الإرسال',
      completed: 'مكتمل'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      circular: 'تعميم',
      report: 'تقرير',
      request: 'طلب'
    };
    return labels[type as keyof typeof labels];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">جداول الإرسال</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          إضافة جدول
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'تعديل الجدول' : 'إضافة جدول جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="العنوان"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-4 py-2 border rounded-lg md:col-span-2"
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="px-4 py-2 border rounded-lg"
              required
            >
              <option value="circular">تعميم</option>
              <option value="report">تقرير</option>
              <option value="request">طلب</option>
            </select>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="px-4 py-2 border rounded-lg"
              required
            >
              <option value="pending">قيد الانتظار</option>
              <option value="sent">تم الإرسال</option>
              <option value="completed">مكتمل</option>
            </select>
            <input
              type="date"
              placeholder="تاريخ الإرسال"
              value={formData.sendDate}
              onChange={(e) => setFormData({ ...formData, sendDate: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="date"
              placeholder="الموعد النهائي"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="المستلمون (افصل بفاصلة)"
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              className="px-4 py-2 border rounded-lg md:col-span-2"
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
            placeholder="البحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(table.status)}
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                    {getTypeBadge(table.type)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{table.title}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(table)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500">تاريخ الإرسال:</span>
                <p className="font-medium">{new Date(table.sendDate).toLocaleDateString('ar-EG')}</p>
              </div>
              <div>
                <span className="text-gray-500">الموعد النهائي:</span>
                <p className="font-medium">{new Date(table.deadline).toLocaleDateString('ar-EG')}</p>
              </div>
              <div>
                <span className="text-gray-500">عدد المستلمين:</span>
                <p className="font-medium">{table.recipients.length}</p>
              </div>
            </div>
            {table.notes && (
              <p className="text-sm text-gray-600">{table.notes}</p>
            )}
          </div>
        ))}
        {filteredTables.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">لا توجد جداول</div>
        )}
      </div>
    </div>
  );
}
