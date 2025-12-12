'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Bell, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { Appointment } from '@/lib/types';

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    attendees: '',
    type: 'meeting' as 'meeting' | 'visit' | 'other',
    reminderBefore: 30,
    status: 'upcoming' as 'upcoming' | 'completed' | 'cancelled'
  });

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(interval);
  }, []);

  const loadAppointments = () => {
    setAppointments(db.getAppointments());
  };

  const checkReminders = () => {
    const now = new Date();
    const upcomingNotifications: string[] = [];

    appointments.forEach((appointment) => {
      if (appointment.status !== 'upcoming') return;

      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const minutesDiff = Math.floor(timeDiff / 60000);

      if (minutesDiff > 0 && minutesDiff <= appointment.reminderBefore) {
        upcomingNotifications.push(
          `تذكير: ${appointment.title} بعد ${minutesDiff} دقيقة في ${appointment.location}`
        );
      }
    });

    if (upcomingNotifications.length > 0) {
      setNotifications(upcomingNotifications);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const attendeesArray = formData.attendees.split(',').map(a => a.trim());

    if (editingId) {
      db.updateAppointment(editingId, {
        ...formData,
        attendees: attendeesArray,
        date: new Date(formData.date)
      });
    } else {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        ...formData,
        attendees: attendeesArray,
        date: new Date(formData.date),
        createdAt: new Date()
      };
      db.addAppointment(newAppointment);
    }

    resetForm();
    loadAppointments();
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      title: appointment.title,
      description: appointment.description,
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: appointment.time,
      location: appointment.location,
      attendees: appointment.attendees.join(', '),
      type: appointment.type,
      reminderBefore: appointment.reminderBefore,
      status: appointment.status
    });
    setEditingId(appointment.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      db.deleteAppointment(id);
      loadAppointments();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      location: '',
      attendees: '',
      type: 'meeting',
      reminderBefore: 30,
      status: 'upcoming'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      upcoming: 'قادم',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      meeting: 'اجتماع',
      visit: 'زيارة',
      other: 'أخرى'
    };
    return labels[type as keyof typeof labels];
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime();
    const dateB = new Date(`${b.date}T${b.time}`).getTime();
    return dateA - dateB;
  });

  const upcomingAppointments = sortedAppointments.filter(a => a.status === 'upcoming');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">المواعيد والاجتماعات</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          إضافة موعد
        </button>
      </div>

      {notifications.length > 0 && (
        <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 text-yellow-600 animate-pulse" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 mb-2">تنبيهات المواعيد:</h4>
              {notifications.map((notif, index) => (
                <p key={index} className="text-sm text-yellow-700 mb-1">{notif}</p>
              ))}
            </div>
            <button
              onClick={() => setNotifications([])}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'تعديل الموعد' : 'إضافة موعد جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="عنوان الموعد"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-4 py-2 border rounded-lg md:col-span-2"
              required
            />
            <textarea
              placeholder="الوصف"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-4 py-2 border rounded-lg md:col-span-2"
              rows={3}
              required
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="المكان"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="px-4 py-2 border rounded-lg"
              required
            >
              <option value="meeting">اجتماع</option>
              <option value="visit">زيارة</option>
              <option value="other">أخرى</option>
            </select>
            <input
              type="number"
              placeholder="التذكير قبل (بالدقائق)"
              value={formData.reminderBefore}
              onChange={(e) => setFormData({ ...formData, reminderBefore: parseInt(e.target.value) })}
              className="px-4 py-2 border rounded-lg"
              required
              min="5"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="px-4 py-2 border rounded-lg"
              required
            >
              <option value="upcoming">قادم</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
            <input
              type="text"
              placeholder="الحضور (افصل بفاصلة)"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              className="px-4 py-2 border rounded-lg md:col-span-2"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-500" />
            المواعيد القادمة
          </h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-r-4 border-teal-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(appointment.status)}
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        {getTypeBadge(appointment.type)}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">{appointment.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{appointment.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(appointment.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">المكان:</span> {appointment.location}
                </div>
                {appointment.attendees.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">الحضور:</span> {appointment.attendees.join(', ')}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                  <Bell className="w-4 h-4" />
                  <span>تذكير قبل {appointment.reminderBefore} دقيقة</span>
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg">لا توجد مواعيد قادمة</div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            جميع المواعيد
          </h3>
          <div className="space-y-3 max-h-[800px] overflow-y-auto">
            {sortedAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(appointment.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(appointment.date).toLocaleDateString('ar-EG')} - {appointment.time}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800">{appointment.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{appointment.location}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {sortedAppointments.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg">لا توجد مواعيد</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
