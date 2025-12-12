'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FileText } from 'lucide-react';
import { db } from '@/lib/db';
import { Report } from '@/lib/types';

export default function ReportsView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'visit' as 'visit' | 'evaluation' | 'meeting' | 'other',
    school: '',
    inspector: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    recommendations: '',
    status: 'draft' as 'draft' | 'submitted' | 'approved'
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    setReports(db.getReports());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      db.updateReport(editingId, { ...formData, date: new Date(formData.date) });
    } else {
      const newReport: Report = {
        id: Date.now().toString(),
        ...formData,
        date: new Date(formData.date),
        createdAt: new Date()
      };
      db.addReport(newReport);
    }

    resetForm();
    loadReports();
  };

  const handleEdit = (report: Report) => {
    setFormData({
      title: report.title,
      type: report.type,
      school: report.school,
      inspector: report.inspector,
      date: new Date(report.date).toISOString().split('T')[0],
      content: report.content,
      recommendations: report.recommendations,
      status: report.status
    });
    setEditingId(report.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      db.deleteReport(id);
      loadReports();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'visit',
      school: '',
      inspector: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
      recommendations: '',
      status: 'draft'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredReports = reports.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.inspector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800'
    };
    const labels = {
      draft: 'مسودة',
      submitted: 'مقدم',
      approved: 'معتمد'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      visit: 'زيارة',
      evaluation: 'تقييم',
      meeting: 'اجتماع',
      other: 'أخرى'
    };
    return labels[type as keyof typeof labels];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">تقارير المفتشية</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          إضافة تقرير
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'تعديل التقرير' : 'إضافة تقرير جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="عنوان التقرير"
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
              <option value="visit">زيارة</option>
              <option value="evaluation">تقييم</option>
              <option value="meeting">اجتماع</option>
              <option value="other">أخرى</option>
            </select>
            <input
              type="text"
              placeholder="المدرسة"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="المفتش"
              value={formData.inspector}
              onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
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
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="px-4 py-2 border rounded-lg"
              required
            >
              <option value="draft">مسودة</option>
              <option value="submitted">مقدم</option>
              <option value="approved">معتمد</option>
            </select>
            <textarea
              placeholder="محتوى التقرير"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="px-4 py-2 border rounded-lg md:col-span-2"
              rows={5}
              required
            />
            <textarea
              placeholder="التوصيات"
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
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
            placeholder="البحث عن تقرير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-purple-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(report.status)}
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                      {getTypeBadge(report.type)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(report)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500">المدرسة:</span>
                <p className="font-medium">{report.school}</p>
              </div>
              <div>
                <span className="text-gray-500">المفتش:</span>
                <p className="font-medium">{report.inspector}</p>
              </div>
              <div>
                <span className="text-gray-500">التاريخ:</span>
                <p className="font-medium">{new Date(report.date).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="line-clamp-2">{report.content}</p>
            </div>
          </div>
        ))}
        {filteredReports.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">لا توجد تقارير</div>
        )}
      </div>
    </div>
  );
}
