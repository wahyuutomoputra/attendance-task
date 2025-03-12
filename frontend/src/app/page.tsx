import LoginForm from '@/components/LoginForm';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Employee Attendance System</h1>
        <LoginForm />
      </div>
    </main>
  );
}
