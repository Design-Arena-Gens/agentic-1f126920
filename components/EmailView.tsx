'use client';

import { useState, useEffect } from 'react';
import { Send, Mail, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { Email } from '@/lib/types';

export default function EmailView() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = () => {
    setEmails(db.getEmails());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      const newEmail: Email = {
        id: Date.now().toString(),
        ...formData,
        sentAt: new Date(),
        status: result.success ? 'sent' : 'failed'
      };

      db.addEmail(newEmail);

      if (result.success) {
        alert('تم إرسال البريد بنجاح!');
        resetForm();
      } else {
        alert('فشل إرسال البريد. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      const newEmail: Email = {
        id: Date.now().toString(),
        ...formData,
        sentAt: new Date(),
        status: 'failed'
      };
      db.addEmail(newEmail);
      alert('حدث خطأ أثناء إرسال البريد. تم حفظ الرسالة في النظام.');
    } finally {
      setSending(false);
      loadEmails();
    }
  };

  const resetForm = () => {
    setFormData({
      to: '',
      subject: '',
      body: ''
    });
  };

  const getStatusIcon = (status: string) => {
    if (status === 'sent') return <Mail className="w-5 h-5 text-green-500" />;
    if (status === 'failed') return <Mail className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      scheduled: 'bg-yellow-100 text-yellow-800'
    };
    const labels = {
      sent: 'تم الإرسال',
      failed: 'فشل',
      scheduled: 'مجدول'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إرسال رسائل Gmail</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Send className="w-6 h-6 text-red-500" />
            إنشاء رسالة جديدة
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إلى (البريد الإلكتروني)
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموضوع
              </label>
              <input
                type="text"
                placeholder="موضوع الرسالة"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نص الرسالة
              </label>
              <textarea
                placeholder="اكتب رسالتك هنا..."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={10}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    إرسال
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-800 mb-2">ملاحظة:</h4>
            <p className="text-sm text-blue-700">
              لإرسال رسائل عبر Gmail، يجب إعداد بيانات اعتماد Gmail API.
              في الوقت الحالي، يتم حفظ الرسائل في النظام فقط.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6 text-gray-600" />
            الرسائل المرسلة
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {emails.slice().reverse().map((email) => (
              <div key={email.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(email.status)}
                    <span className="font-medium text-gray-800">{email.to}</span>
                  </div>
                  {getStatusBadge(email.status)}
                </div>
                <h4 className="font-semibold text-gray-700 mb-1">{email.subject}</h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{email.body}</p>
                <p className="text-xs text-gray-500">
                  {new Date(email.sentAt).toLocaleString('ar-EG')}
                </p>
              </div>
            ))}
            {emails.length === 0 && (
              <div className="text-center py-8 text-gray-500">لا توجد رسائل</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
