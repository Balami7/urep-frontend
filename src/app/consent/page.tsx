'use client';
import React, {useState} from 'react';
import Link from 'next/link';
import {useRouter} from "next/navigation";
import Header from "@/components/Header";
import {
    isNationalYouthDraft,
    NATIONAL_YOUTH_DRAFT_KEY,
    postToApi,
    REGISTERED_USER_ID_KEY,
} from "@/lib/urep-api";

export default function ConsentPage() {

    const router = useRouter();
    const [programId, setProgramId] = useState('');

    // Set the program from URL parameter when component mounts
    React.useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const programParam = searchParams.get('program');
        if (programParam) {
            setProgramId(programParam);
        }
    }, []);

    const [agreement, setAgreement] = useState(false);
    const [apiError, setApiError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreement || isSubmitting) return;

        setApiError('');
        setIsSubmitting(true);
        try {
            if (programId === 'national_youth') {
                const userId = sessionStorage.getItem(REGISTERED_USER_ID_KEY);
                const savedDraft = sessionStorage.getItem(NATIONAL_YOUTH_DRAFT_KEY);

                if (!userId || !savedDraft) {
                    throw new Error('Your registration details could not be found. Go back and complete the form again.');
                }

                let draftData: unknown;
                try {
                    draftData = JSON.parse(savedDraft);
                } catch {
                    throw new Error('Your saved program responses are invalid. Go back and complete the form again.');
                }

                if (!isNationalYouthDraft(draftData)) {
                    throw new Error('Your saved program responses are incomplete. Go back and complete the form again.');
                }

                await postToApi<{ id: string; user_id: string }>('/api/youth-validation', {
                    user_id: userId,
                    ...draftData,
                });
                sessionStorage.removeItem(NATIONAL_YOUTH_DRAFT_KEY);
            }

            router.push(`/success?program=${programId}`);
        } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Unable to submit your application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const programNames: Record<string, string> = {
        african_youth: 'African/National Youth Day 2025',
        bakeprenuer: 'Bakeprenuer Nigeria',
        entrepreneurship: 'Entrepreneurship Programme for Unemployed Youths',
        national_youth: 'National Validation and Adoption Workshop on the National Youth Policy (2026–2030)',
        youth_migration: 'Youth Migration Awareness and Management Programme',
    };
    const programName = programNames[programId] ?? 'your selected programme';
    const termsPaths: Record<string, string> = {
        african_youth: '/programs/african_youth/terms',
        bakeprenuer: '/programs/bakeprenuer/terms',
        entrepreneurship: '/programs/entrepreneurship/terms',
        national_youth: '/programs/national_youth/terms',
        youth_migration: '/programs/youth_migration/terms',
    };
    const termsPath = termsPaths[programId] ?? '/terms';

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <Header />
            <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#277B12]">
                        Final step
                    </p>
                    <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Consent and declaration
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">{programName}</p>
                </div>

                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                        Please review before continuing
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        I consent to the Ministry using my information, including photos, for the
                        documentation, reporting, and administration of {programName} only. I declare
                        that the information I provided is true and correct, and understand that
                        misrepresentation may result in disqualification.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                        <label htmlFor="agreement" className="flex items-start gap-3 text-sm leading-5 text-gray-700">
                            <input
                                type="checkbox"
                                id="agreement"
                                checked={agreement}
                                onChange={(e) => setAgreement(e.target.checked)}
                                required
                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#277B12] focus:ring-[#277B12]"
                            />
                            <span>
                                I have read and accept the{' '}
                                <Link href={termsPath} className="font-semibold text-[#277B12] hover:underline">
                                    Terms and Conditions
                                </Link>{' '}
                                for this programme.
                            </span>
                        </label>

                        {apiError && (
                            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {apiError}
                            </p>
                        )}

                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={!agreement || isSubmitting}
                                className="rounded-lg bg-[#277B12] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1b5c0d] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isSubmitting ? 'Submitting...' : 'Continue'}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}
