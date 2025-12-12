'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, BarChart } from 'lucide-react';
import { db } from '@/lib/db';
import { Productivity } from '@/lib/types';

export default function ProductivityView() {
  const [productivity, setProductivity] = useState<Productivity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    inspector: '',
    month: new Date().toISOString().slice(0, 7),
    visits: 0,
    reports: 0,
    meetings: 0,
    followups: 0
  });

  useEffect(() => {
    loadProductivity();
  }, []);

  const loadProductivity = () => {
    setProductivity(db.getProductivity());
  };

  const calculateScore = (visits: number, reports: number, meetings: number, followups: number): number => {
    return (visits * 10) + (reports * 15) + (meetings * 8) + (followups * 5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const score = calculateScore(
      formData.visits,
      formData.reports,
      formData.meetings,
      formData.followups
    );

    const newProd: Productivity = {
      id: Date.now().toString(),
      ...formData,
      score,
      createdAt: new Date()
    };

    db.addProductivity(newProd);
    resetForm();
    loadProductivity();
  };

  const resetForm = () => {
    setFormData({
      inspector: '',
      month: new Date().toISOString().slice(0, 7),
      visits: 0,
      reports: 0,
      meetings: 0,
      followups: 0
    });
    setShowForm(false);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 500) return 'text-green-600';
    if (score >= 300) return 'text-blue-600';
    if (score >= 150) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 500) return 'ممتاز';
    if (score >= 300) return 'جيد جداً';
    if (score >= 150) return 'جيد';
    return 'يحتاج تحسين';
  };

  const totalStats = productivity.reduce(
    (acc, curr) => ({
      visits: acc.visits + curr.visits,
      reports: acc.reports + curr.reports,
      meetings: acc.meetings + curr.meetings,
      followups: acc.followups + curr.followups,
      score: acc.score + curr.score
    }),
    { visits: 0, reports: 0, meetings: 0, followups: 0, score: 0 }
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">حساب المردودية</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          إضافة سجل
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الزيارات</p>
              <p className="text-2xl font-bold text-blue-600">{totalStats.visits}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">التقارير</p>
              <p className="text-2xl font-bold text-green-600">{totalStats.reports}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الاجتماعات</p>
              <p className="text-2xl font-bold text-purple-600">{totalStats.meetings}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">المتابعات</p>
              <p className="text-2xl font-bold text-orange-600">{totalStats.followups}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">النقاط الكلية</p>
              <p className={`text-2xl font-bold ${getScoreColor(totalStats.score)}`}>
                {totalStats.score}
              </p>
            </div>
            <BarChart className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">إضافة سجل مردودية</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="اسم المفتش"
              value={formData.inspector}
              onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="عدد الزيارات"
              value={formData.visits}
              onChange={(e) => setFormData({ ...formData, visits: parseInt(e.target.value) })}
              className="px-4 py-2 border rounded-lg"
              required
              min="0"
            />
            <input
              type="number"
              placeholder="عدد التقارير"
              value={formData.reports}
              onChange={(e) => setFormData({ ...formData, reports: parseInt(e.target.value) })}
              className="px-4 py-2 border rounded-lg"
              required
              min="0"
            />
            <input
              type="number"
              placeholder="عدد الاجتماعات"
              value={formData.meetings}
              onChange={(e) => setFormData({ ...formData, meetings: parseInt(e.target.value) })}
              className="px-4 py-2 border rounded-lg"
              required
              min="0"
            />
            <input
              type="number"
              placeholder="عدد المتابعات"
              value={formData.followups}
              onChange={(e) => setFormData({ ...formData, followups: parseInt(e.target.value) })}
              className="px-4 py-2 border rounded-lg"
              required
              min="0"
            />
            <div className="md:col-span-3 flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                حفظ
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المفتش</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشهر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الزيارات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقارير</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاجتماعات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتابعات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النقاط</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productivity.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{prod.inspector}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prod.month}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prod.visits}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prod.reports}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prod.meetings}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prod.followups}</td>
                <td className={`px-6 py-4 whitespace-nowrap font-bold ${getScoreColor(prod.score)}`}>
                  {prod.score}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(prod.score)}`}>
                    {getScoreLabel(prod.score)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productivity.length === 0 && (
          <div className="text-center py-8 text-gray-500">لا توجد بيانات</div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-blue-800 mb-2">معايير حساب النقاط:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• كل زيارة = 10 نقاط</li>
          <li>• كل تقرير = 15 نقطة</li>
          <li>• كل اجتماع = 8 نقاط</li>
          <li>• كل متابعة = 5 نقاط</li>
        </ul>
      </div>
    </div>
  );
}
