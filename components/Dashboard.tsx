'use client';

import { useState } from 'react';
import {
  Users,
  School,
  FileText,
  UserCheck,
  Send,
  TrendingUp,
  Mail,
  Calendar,
  LogOut,
  Home
} from 'lucide-react';
import ManagersView from './ManagersView';
import SchoolsView from './SchoolsView';
import ReportsView from './ReportsView';
import ManagerFollowView from './ManagerFollowView';
import SendTablesView from './SendTablesView';
import ProductivityView from './ProductivityView';
import EmailView from './EmailView';
import AppointmentsView from './AppointmentsView';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type ViewType = 'home' | 'managers' | 'schools' | 'reports' | 'follow' | 'send' | 'productivity' | 'email' | 'appointments';

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const menuItems = [
    { id: 'managers' as ViewType, icon: Users, label: 'معلومات المديرين', color: 'bg-blue-500' },
    { id: 'schools' as ViewType, icon: School, label: 'معلومات الابتدائيات', color: 'bg-green-500' },
    { id: 'reports' as ViewType, icon: FileText, label: 'تقارير المفتشية', color: 'bg-purple-500' },
    { id: 'follow' as ViewType, icon: UserCheck, label: 'متابعة المدراء', color: 'bg-orange-500' },
    { id: 'send' as ViewType, icon: Send, label: 'جداول الإرسال', color: 'bg-pink-500' },
    { id: 'productivity' as ViewType, icon: TrendingUp, label: 'حساب المردودية', color: 'bg-indigo-500' },
    { id: 'email' as ViewType, icon: Mail, label: 'إرسال رسائل Gmail', color: 'bg-red-500' },
    { id: 'appointments' as ViewType, icon: Calendar, label: 'المواعيد والاجتماعات', color: 'bg-teal-500' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'managers':
        return <ManagersView />;
      case 'schools':
        return <SchoolsView />;
      case 'reports':
        return <ReportsView />;
      case 'follow':
        return <ManagerFollowView />;
      case 'send':
        return <SendTablesView />;
      case 'productivity':
        return <ProductivityView />;
      case 'email':
        return <EmailView />;
      case 'appointments':
        return <AppointmentsView />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`${item.color} hover:opacity-90 text-white p-8 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center gap-4`}
              >
                <item.icon className="w-16 h-16" />
                <span className="text-xl font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {currentView !== 'home' && (
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  <Home className="w-5 h-5" />
                  <span>الرئيسية</span>
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-800">
                نظام المفتش
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">مرحباً</p>
                <p className="font-semibold text-gray-800">{user.name}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}
