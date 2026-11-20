'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { TextField } from '@/components';
import { postToApi, storeAdminAuth } from '@/lib/urep-api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError('');
    setIsSubmitting(true);
    try {
      const admin = await postToApi<{
        id: string;
        name: string;
        email: string;
        access_token: string;
        token_type: string;
        expires_in: number;
      }>('/api/auth/admin/login', { email, password });
      storeAdminAuth(admin);
      router.push('/admin');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f4] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <Image
            src="/fmyd_logo1.png"
            alt="Federal Ministry of Youth Development"
            width={56}
            height={56}
            className="h-12 w-auto object-contain"
          />
          <div>
            <p className="font-bold text-gray-900">Unified Registration Portal</p>
            <p className="text-xs text-gray-500">Federal Ministry of Youth Development</p>
          </div>
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-[#277B12]">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in with your provisioned administrator account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <TextField
            id="admin-email"
            type="email"
            label="Admin email address"
            placeholder="admin@example.gov.ng"
            value={email}
            onChange={setEmail}
            required
          />
          <TextField
            id="admin-password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            required
          />

          {apiError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#277B12] px-4 py-2.5 font-semibold text-white transition hover:bg-[#1b5c0d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
            {isSubmitting ? 'Signing in...' : 'Sign in to admin portal'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Not an administrator?{' '}
          <Link href="/login" className="font-semibold text-[#277B12] hover:underline">
            Participant sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
