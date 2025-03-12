'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import api from '@/lib/axios';

interface Attendance {
  id: number;
  userId: number;
  checkIn: string;
  checkOut: string | null;
  location: string;
  ipAddress: string;
  photoUrl: string;
}

const AttendanceReport = forwardRef((_, ref) => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fetchAttendances = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/attendance/report', {
        params: {
          timezone,
          ...(startDate && { startDate }),
          ...(endDate && { endDate })
        }
      });
      setAttendances(data);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || 'Failed to fetch attendance data');
      } else {
        toast.error('Failed to fetch attendance data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchAttendances
  }));

  useEffect(() => {
    fetchAttendances();
  }, [startDate, endDate]);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Report</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Timezone:</span>
          <span className="text-sm font-medium text-gray-700">{timezone}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : attendances.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((attendance) => {
                    const checkInDate = new Date(attendance.checkIn);
                    const checkOutDate = attendance.checkOut ? new Date(attendance.checkOut) : null;
                    const duration = checkOutDate 
                      ? Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60)) 
                      : null;

                    return (
                      <tr key={attendance.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{format(checkInDate, 'dd MMM yyyy')}</div>
                          <div className="text-sm text-gray-500">{format(checkInDate, 'HH:mm:ss')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            attendance.checkOut 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attendance.checkOut ? 'Checked Out' : 'Checked In'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{attendance.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {duration ? `${duration} minutes` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {startDate || endDate 
                ? 'Try adjusting your date range'
                : 'Start by selecting a date range'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

AttendanceReport.displayName = 'AttendanceReport';

export default AttendanceReport; 