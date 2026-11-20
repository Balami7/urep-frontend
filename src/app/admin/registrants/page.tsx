'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaSearch, FaUser } from 'react-icons/fa';
import { getFromApi } from '@/lib/urep-api';
import useSWR from 'swr';

interface ApiUser {
  id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  selected_program?: string;
  state_of_residence?: string;
  lga_of_residence?: string;
  demographic?: {
    education_level?: string;
    occupation_status?: string;
    state_of_origin?: string;
    lga_of_origin?: string;
  };
  education?: {
    education_level?: string;
    occupation_status?: string;
  };
  youth_validation?: {
    organization?: string;
  } | null;
}

export default function RegistrantsPage() {
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const {
    data: registrants = [],
    error,
    isLoading,
  } = useSWR(
    '/api/admin/users',
    (path: string) => getFromApi<ApiUser[]>(path, true),
  );

  useEffect(() => {
    if (!selectedId && registrants[0]?.id) setSelectedId(registrants[0].id);
  }, [registrants, selectedId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return registrants;
    return registrants.filter((user) =>
      [user.full_name, user.name, user.email, user.phone_number, user.selected_program]
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [registrants, search]);

  const selected = filtered.find((user) => user.id === selectedId) ?? filtered[0];
  const education = selected?.education ?? selected?.demographic;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Registrants</h1>
        <p className="text-gray-600">Registered users from the UREP API</p>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Unable to load registrants.'}
        </p>
      )}
      {isLoading && <p role="status" className="text-sm text-gray-500">Loading registrants...</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <aside className="rounded-lg bg-white p-4 shadow">
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full rounded-md border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="mb-3 text-xs font-semibold uppercase text-gray-400">{filtered.length} result(s)</p>
            <div className="max-h-[520px] space-y-2 overflow-y-auto">
              {filtered.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => setSelectedId(user.id ?? '')}
                  className={`w-full rounded-md p-3 text-left ${selected?.id === user.id ? 'border border-green-300 bg-green-100' : 'hover:bg-gray-100'}`}
                >
                  <div className="font-medium">{user.full_name ?? user.name ?? 'Unnamed registrant'}</div>
                  <div className="text-sm text-gray-600">{user.email ?? 'No email'}</div>
                </button>
              ))}
              {!filtered.length && <p className="py-8 text-center text-sm text-gray-500">No registrants found</p>}
            </div>
          </aside>

          <section className="rounded-lg bg-white p-6 shadow lg:col-span-2">
            {selected ? (
              <div>
                <h2 className="mb-6 border-b pb-3 text-xl font-semibold">Registrant Profile</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {[
                    [FaUser, 'Full Name', selected.full_name ?? selected.name],
                    [FaEnvelope, 'Email Address', selected.email],
                    [FaPhone, 'Phone Number', selected.phone_number],
                    [FaMapMarkerAlt, 'Residence', [selected.state_of_residence, selected.lga_of_residence].filter(Boolean).join(', ')],
                    [FaMapMarkerAlt, 'Origin', [selected.demographic?.state_of_origin, selected.demographic?.lga_of_origin].filter(Boolean).join(', ')],
                    [FaUser, 'Gender', selected.gender],
                    [FaUser, 'Program', selected.selected_program],
                    [FaUser, 'Education', education?.education_level],
                    [FaUser, 'Occupation', education?.occupation_status],
                  ].map(([Icon, label, value]) => {
                    const FieldIcon = Icon as typeof FaUser;
                    return (
                      <div key={String(label)} className="flex items-start gap-2">
                        <FieldIcon className="mt-1 text-green-600" />
                        <div>
                          <div className="text-sm text-gray-500">{String(label)}</div>
                          <div className="font-medium">{String(value ?? 'Not provided')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500">Select a registrant to view details</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
