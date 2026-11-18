'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import statesData from 'nigerian-states/src/states.json';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Home,
  LoaderCircle,
  LogOut,
  UserRound,
} from 'lucide-react';
import { TextField } from '@/components';
import { postToApi, REGISTERED_USER_ID_KEY } from '@/lib/urep-api';

type DashboardTab = 'profile' | 'programs';

const stateOptions = Object.keys(statesData).map((state) => ({ value: state, label: state }));
const maritalStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'other', label: 'Other' },
];
const disabilityOptions = [
  { value: 'none', label: 'None' },
  { value: 'physical', label: 'Physical' },
  { value: 'visual', label: 'Visual' },
  { value: 'hearing', label: 'Hearing' },
  { value: 'other', label: 'Other (Specify)' },
];
const educationLevelOptions = [
  { value: 'no_formal', label: 'No Formal Education' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'diploma_ond', label: 'Diploma/OND' },
  { value: 'hnd', label: 'HND' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
];
const occupationStatusOptions = [
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'employed_public_private', label: 'Employed (Public/Private)' },
  { value: 'other', label: 'Other' },
];

type ProfileValues = {
  state_of_origin: string;
  lga_of_origin: string;
  marital_status: string;
  disability: string;
  education_level: string;
  occupation_status: string;
  skills: string;
  area_of_interest: string;
  years_of_experience: string;
};

type ProfileField = keyof ProfileValues;

interface ProfileFieldConfig {
  name: ProfileField;
  label: string;
  type?: 'text' | 'dropdown';
  options?: { value: string; label: string }[];
}

function getLgaOptions(selectedState: string) {
  const stateInfo = statesData[selectedState as keyof typeof statesData];
  if (Array.isArray(stateInfo)) {
    return stateInfo.map((lga) => ({ value: lga, label: lga }));
  }
  if (stateInfo && typeof stateInfo === 'object' && 'lgas' in stateInfo) {
    return stateInfo.lgas.map((lga) => ({ value: lga, label: lga }));
  }
  return [];
}

const profileFields: ProfileFieldConfig[] = [
  { name: 'state_of_origin', label: 'State of origin', type: 'dropdown', options: stateOptions },
  { name: 'lga_of_origin', label: 'LGA of origin', type: 'dropdown' },
  { name: 'marital_status', label: 'Marital status', type: 'dropdown', options: maritalStatusOptions },
  { name: 'disability', label: 'Disability', type: 'dropdown', options: disabilityOptions },
  { name: 'education_level', label: 'Education level', type: 'dropdown', options: educationLevelOptions },
  { name: 'occupation_status', label: 'Occupation status', type: 'dropdown', options: occupationStatusOptions },
  { name: 'skills', label: 'Skills' },
  { name: 'area_of_interest', label: 'Area of interest' },
  { name: 'years_of_experience', label: 'Years of experience' },
];

const profileSections = [
  {
    title: 'Demographics',
    description: 'Your origin, marital status, and accessibility information.',
    fields: ['state_of_origin', 'lga_of_origin', 'marital_status', 'disability'],
  },
  {
    title: 'Education & skills',
    description: 'Your education, occupation, skills, and experience.',
    fields: ['education_level', 'occupation_status', 'skills', 'area_of_interest', 'years_of_experience'],
  },
] as const;

const emptyProfile: ProfileValues = {
  state_of_origin: '',
  lga_of_origin: '',
  marital_status: '',
  disability: '',
  education_level: '',
  occupation_status: '',
  skills: '',
  area_of_interest: '',
  years_of_experience: '',
};

export default function UserDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');
  const [activeProfileStep, setActiveProfileStep] = useState(0);
  const [profile, setProfile] = useState<ProfileValues>(emptyProfile);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(REGISTERED_USER_ID_KEY);
      router.push('/login');
    } catch {
      setLogoutError('Unable to log out. Please try again.');
    }
  };

  const handleProfileChange = (field: ProfileField, value: string) => {
    setProfile((currentProfile) => {
      if (field === 'state_of_origin') {
        return { ...currentProfile, state_of_origin: value, lga_of_origin: '' };
      }
      return { ...currentProfile, [field]: value };
    });
    setSaveMessage('');
    setSaveError('');
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveMessage('');
    setSaveError('');

    let userId: string | null;
    try {
      userId = sessionStorage.getItem(REGISTERED_USER_ID_KEY);
    } catch {
      setSaveError('Your account session is unavailable. Sign in again before saving changes.');
      return;
    }

    if (!userId) {
      setSaveError('Your account session is unavailable. Sign in again before saving changes.');
      return;
    }

    setIsSaving(true);
    try {
      await postToApi(
        `/api/auth/users/${encodeURIComponent(userId)}/profile`,
        profile,
      );
      setSaveMessage('Your profile settings have been saved.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/fmyd_logo1.png"
              alt="Federal Ministry of Youth Development"
              width={56}
              height={56}
              className="h-11 w-auto object-contain"
              priority
            />
            <span className="text-sm font-bold text-gray-900 sm:text-base">
              Unified Registration Portal
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <Home size={16} />
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#277B12]">MY ACCOUNT</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            User dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your profile and keep track of your programme registrations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav
            aria-label="Dashboard sections"
            className="flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 lg:flex-col lg:self-start"
          >
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
              className={`flex min-w-max items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition lg:w-full ${
                activeTab === 'profile'
                  ? 'bg-green-50 text-[#277B12]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <CircleUserRound size={18} />
              Profile settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('programs')}
              aria-current={activeTab === 'programs' ? 'page' : undefined}
              className={`flex min-w-max items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition lg:w-full ${
                activeTab === 'programs'
                  ? 'bg-green-50 text-[#277B12]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <BookOpen size={18} />
              My programs
              <span className="ml-auto hidden rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 lg:inline">
                0
              </span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-w-max items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-700 lg:mt-3 lg:border-t lg:border-gray-100 lg:pt-5"
            >
              <LogOut size={18} />
              Log out
            </button>
          </nav>

          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            {logoutError && (
              <p role="alert" className="mb-5 text-sm text-red-600">
                {logoutError}
              </p>
            )}
            {activeTab === 'profile' ? (
              <>
                <div className="mb-7 flex items-start gap-4 border-b border-gray-100 pb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#277B12]">
                    <UserRound size={23} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Profile settings</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Keep your personal and demographic information up to date.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div
                    aria-label="Profile sections"
                    className="mb-7 flex items-start justify-between gap-2"
                  >
                    {profileSections.map((section, index) => {
                      const isComplete = index < activeProfileStep;
                      const isCurrent = index === activeProfileStep;

                      return (
                        <button
                          key={section.title}
                          type="button"
                          onClick={() => setActiveProfileStep(index)}
                          aria-current={isCurrent ? 'step' : undefined}
                          aria-label={`Step ${index + 1}: ${section.title}`}
                          className="group flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                              isCurrent
                                ? 'bg-[#277B12] text-white ring-4 ring-green-100'
                                : isComplete
                                  ? 'bg-green-100 text-[#277B12]'
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                            }`}
                          >
                            {isComplete ? <Check size={15} /> : index + 1}
                          </span>
                          <span
                            className={`hidden text-xs sm:block ${
                              isCurrent ? 'font-semibold text-[#277B12]' : 'text-gray-500'
                            }`}
                          >
                            {section.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mb-5 border-b border-gray-100 pb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#277B12]">
                      Step {activeProfileStep + 1} of {profileSections.length}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-gray-900">
                      {profileSections[activeProfileStep].title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {profileSections[activeProfileStep].description}
                    </p>
                  </div>

                  <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                    {profileSections[activeProfileStep].fields.map((fieldName) => {
                      const field = profileFields.find((profileField) => profileField.name === fieldName);
                      if (!field) return null;

                      const options = field.name === 'lga_of_origin'
                        ? getLgaOptions(profile.state_of_origin)
                        : field.options ?? [];
                      const isLgaField = field.name === 'lga_of_origin';
                      const hasSelectedState = field.name === 'lga_of_origin'
                        ? Boolean(profile.state_of_origin)
                        : true;

                      return (
                      <div key={field.name}>
                        <TextField
                          id={`profile-${field.name}`}
                          label={field.label}
                          type={field.type ?? 'text'}
                          value={profile[field.name]}
                          onChange={(value) => handleProfileChange(field.name, value)}
                          options={options}
                          required
                          disabled={isLgaField && !hasSelectedState}
                          placeholder={field.type === 'dropdown' ? `Select ${field.label.toLowerCase()}` : `Enter ${field.label.toLowerCase()}`}
                        />
                      </div>
                      );
                    })}
                  </div>

                  {activeProfileStep === profileSections.length - 1 && saveError && (
                    <p role="alert" className="mt-5 text-sm text-red-600">
                      {saveError}
                    </p>
                  )}
                  {activeProfileStep === profileSections.length - 1 && saveMessage && (
                    <p role="status" className="mt-5 flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 size={17} />
                      {saveMessage}
                    </p>
                  )}

                  <div className="mt-7 flex justify-between border-t border-gray-100 pt-5">
                    <button
                      type="button"
                      onClick={() => setActiveProfileStep((step) => Math.max(0, step - 1))}
                      disabled={activeProfileStep === 0 || isSaving}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                      Back
                    </button>
                    {activeProfileStep < profileSections.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveProfileStep((step) => Math.min(profileSections.length - 1, step + 1))}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#277B12] px-5 text-sm font-semibold text-white transition hover:bg-[#1b5c0d]"
                      >
                        Continue
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#277B12] px-5 text-sm font-semibold text-white transition hover:bg-[#1b5c0d] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving && <LoaderCircle size={16} className="animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save changes'}
                      </button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <div>
                <div className="mb-7 border-b border-gray-100 pb-6">
                  <h2 className="text-lg font-bold text-gray-900">My programs</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    View the programmes you have registered for.
                  </p>
                </div>

                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                    <BookOpen size={22} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    No programs registered yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    When you register for a programme, its application details and status will appear here.
                  </p>
                  <Link
                    href="/#programs"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#277B12] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b5c0d]"
                  >
                    Explore programs
                    <ArrowRight size={16} />
                  </Link>
                </div>

              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
