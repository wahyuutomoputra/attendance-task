'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceForm from '@/components/AttendanceForm';
import AttendanceReport from '@/components/AttendanceReport';
import ProfileSection from '@/components/ProfileSection';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const attendanceReportRef = useRef<{ refresh: () => void }>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleAttendanceUpdate = () => {
    attendanceReportRef.current?.refresh();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Employee Attendance System</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <ProfileSection user={user} setUser={setUser} />
              <AttendanceForm onAttendanceUpdate={handleAttendanceUpdate} />
            </div>
            <div>
              <AttendanceReport ref={attendanceReportRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 