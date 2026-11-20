'use client';

import { useMemo } from 'react';
import { AppWindow, MapPin, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getFromApi } from '@/lib/urep-api';
import useSWR from 'swr';

interface ApiUser {
  id?: string;
  gender?: string;
  selected_program?: string;
  state_of_residence?: string;
  demographic?: { state_of_origin?: string };
  youth_validation?: { geopolitical_zone?: string } | null;
}

export default function AdminDashboard() {
  const {
    data: users = [],
    error,
    isLoading,
  } = useSWR(
    '/api/admin/users',
    (path: string) => getFromApi<ApiUser[]>(path, true),
  );

  const countsBy = (values: Array<string | undefined>) => {
    const counts = new Map<string, number>();
    values.filter((value): value is string => Boolean(value)).forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return Array.from(counts, ([name, count]) => ({ name, count }));
  };

  const programData = useMemo(
    () => countsBy(users.map((user) => user.selected_program)),
    [users],
  );
  const stateData = useMemo(
    () => countsBy(users.map((user) => user.state_of_residence ?? user.demographic?.state_of_origin)),
    [users],
  );
  const zoneData = useMemo(
    () => countsBy(users.map((user) => user.youth_validation?.geopolitical_zone)),
    [users],
  );

  return (
    <div className="p-8 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Live youth registration data from UREP</p>
      </div>

      {error && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Unable to load dashboard data.'}
        </p>
      )}
      {isLoading && <p role="status" className="mb-5 text-sm text-gray-500">Loading dashboard...</p>}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <Users className="mb-4 text-[#2E6E65]" size={20} />
          <div className="text-3xl font-bold text-[#111111]">{users.length}</div>
          <div className="text-xs font-medium text-gray-500">Total Registrations</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <AppWindow className="mb-4 text-blue-500" size={20} />
          <div className="text-3xl font-bold text-[#111111]">{programData.length}</div>
          <div className="text-xs font-medium text-gray-500">Selected Programs</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <MapPin className="mb-4 text-purple-500" size={20} />
          <div className="text-3xl font-bold text-[#111111]">{stateData.length}</div>
          <div className="text-xs font-medium text-gray-500">States Reached</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[
          ['Program Enrollment', programData],
          ['Geopolitical Validation', zoneData],
        ].map(([title, data]) => (
          <div key={String(title)} className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-5 text-[15px] font-semibold text-[#111111]">{String(title)}</h2>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data as Array<{ name: string; count: number }>}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2E6E65" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
