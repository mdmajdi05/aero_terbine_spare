'use client';
import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <ShieldX className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-3">Access Denied</h1>
      <p className="text-[#4A4A6A] max-w-md mb-8">
        You do not have permission to access this page. Contact your system administrator if you believe this is an error.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard" className="px-6 py-3 bg-[#0A1628] text-white rounded-xl font-medium hover:bg-[#0B1A33] transition-colors">
          Go to Dashboard
        </Link>
        <Link href="/" className="px-6 py-3 bg-[#E8EDF2] text-[#1A1A2E] rounded-xl font-medium hover:bg-[#C0C9D5] transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
