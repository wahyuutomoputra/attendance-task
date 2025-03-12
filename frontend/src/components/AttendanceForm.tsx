'use client';

import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import api, { externalApi } from '@/lib/axios';

interface AttendanceFormProps {
  onAttendanceUpdate: () => void;
}

export default function AttendanceForm({ onAttendanceUpdate }: AttendanceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const webcamRef = useRef<Webcam>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    // Get IP address
    const getIpAddress = async () => {
      try {
        const { data } = await externalApi.get('https://api.ipify.org?format=json');
        setIpAddress(data.ip);
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.error || 'Failed to get IP address');
        } else {
          toast.error('Failed to get IP address');
        }
      }
    };

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude},${position.coords.longitude}`);
        },
        () => {
          toast.error('Failed to get location');
        }
      );
    }

    getIpAddress();
    // Check if already checked in today
    checkAttendanceStatus();
  }, []);

  const checkAttendanceStatus = async () => {
    try {
      const { data } = await api.get('/attendance/report', {
        params: { limit: 1 }
      });

      const today = new Date().toDateString();
      const lastAttendance = data[0]?.checkIn ? new Date(data[0].checkIn).toDateString() : null;

      setHasCheckedIn(today === lastAttendance && !data[0].checkOut);
    } catch (error) {
      console.error('Failed to check attendance status:', error);
    }
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const photoData = webcamRef.current.getScreenshot();
      setPhotoUrl(photoData || '');
      setShowCamera(false);
    }
  };

  const handleCheckIn = async () => {
    if (!location || !ipAddress || !photoUrl) {
      toast.error('Please provide all required information');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/attendance/check-in', {
        location,
        ipAddress,
        photoUrl,
      });

      toast.success('Successfully checked in');
      setHasCheckedIn(true);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || 'Failed to check in');
      } else {
        toast.error('Failed to check in');
      }
    } finally {
      setIsLoading(false);
      onAttendanceUpdate();
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      await api.post('/attendance/check-out');
      toast.success('Successfully checked out');
      setHasCheckedIn(false);
      setPhotoUrl('');
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || 'Failed to check out');
      } else {
        toast.error('Failed to check out');
      }
    } finally {
      setIsLoading(false);
      onAttendanceUpdate();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Attendance</h2>

      {showCamera ? (
        <div className="space-y-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full rounded-lg"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCamera(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Capture Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {photoUrl && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Photo</p>
              <img src={photoUrl} alt="Captured" className="w-full rounded-lg" />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700">Location</p>
            <p className="mt-1">{location || 'Fetching location...'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">IP Address</p>
            <p className="mt-1">{ipAddress || 'Fetching IP address...'}</p>
          </div>

          {!hasCheckedIn ? (
            <div className="space-y-4">
              {!photoUrl && (
                <button
                  onClick={() => setShowCamera(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Take Photo
                </button>
              )}

              <button
                onClick={handleCheckIn}
                disabled={isLoading || !location || !ipAddress || !photoUrl}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Checking in...' : 'Check In'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleCheckOut}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? 'Checking out...' : 'Check Out'}
            </button>
          )}
        </div>
      )}
    </div>
  );
} 