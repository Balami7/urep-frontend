'use client'
import {useEffect, useState} from "react";
import Image from "next/image";
import {FaCopy} from "react-icons/fa";
import {useRouter} from "next/navigation";
import QRCode from "react-qr-code";
import {REGISTERED_USER_ID_KEY} from "@/lib/urep-api";

export default function SuccessPage() {
    const router = useRouter();
    const [registrationReference, setRegistrationReference] = useState('');
    const [referenceLoaded, setReferenceLoaded] = useState(false);
    const [referenceError, setReferenceError] = useState('');
    const [copiedReference, setCopiedReference] = useState(false);
    const [copyError, setCopyError] = useState('');
    const [downloadError, setDownloadError] = useState('');
    const [programName, setProgramName] = useState('');

    useEffect(() => {
        try {
            const userId = sessionStorage.getItem(REGISTERED_USER_ID_KEY);
            if (userId) {
                setRegistrationReference(userId);
            }
            const programId = new URLSearchParams(window.location.search).get('program');
            const programNames: Record<string, string> = {
                african_youth: 'African/National Youth Day 2025',
                bakeprenuer: 'Bakeprenuer Nigeria',
                entrepreneurship: 'Entrepreneurship Programme for Unemployed Youths',
                national_youth: 'National Validation and Adoption Workshop on the National Youth Policy (2026–2030)',
                youth_migration: 'Youth Migration Awareness and Management Programme',
            };
            if (programId) {
                setProgramName(programNames[programId] ?? 'Youth Development Programme');
            }
        } catch {
            setReferenceError('Could not access the registration reference in this browser.');
        } finally {
            setReferenceLoaded(true);
        }
    }, []);

    const navigateToDashboard = () => {
        router.push('/dashboard');
    }

    const navigateToHome = () => {
        router.push('/');
    }

    const handleCopyReference = async () => {
        try {
            await navigator.clipboard.writeText(registrationReference);
            setCopiedReference(true);
            setCopyError('');
        } catch {
            setCopyError('Could not copy the reference. Please select and copy it manually.');
        }
    };

    const handleDownloadConfirmation = async () => {
        if (!registrationReference) return;

        try {
            setDownloadError('');
            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF();
            const margin = 24;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const contentWidth = pageWidth - margin * 2;

            pdf.setProperties({
                title: 'UREP Registration Confirmation',
                subject: 'Registration confirmation slip',
            });
            pdf.setFillColor(39, 123, 18);
            pdf.rect(0, 0, pageWidth, 14, 'F');
            pdf.setTextColor(39, 123, 18);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            pdf.text('Registration Confirmation', margin, 38);

            pdf.setTextColor(35, 35, 35);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.text('Unified Registration Portal', margin, 48);
            pdf.text('Federal Ministry of Youth Development', margin, 55);

            pdf.setDrawColor(220, 220, 220);
            pdf.line(margin, 66, pageWidth - margin, 66);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text('Registration reference', margin, 82);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.text(
                pdf.splitTextToSize(registrationReference, contentWidth),
                margin,
                91
            );

            let nextY = 111;
            if (programName) {
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.text('Programme', margin, nextY);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(11);
                const wrappedProgramName = pdf.splitTextToSize(programName, contentWidth);
                pdf.text(wrappedProgramName, margin, nextY + 9);
                nextY += 9 + wrappedProgramName.length * 6 + 8;
            }

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text('Confirmation date', margin, nextY);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.text(new Date().toLocaleDateString(), margin, nextY + 9);

            pdf.setFontSize(9);
            pdf.setTextColor(110, 110, 110);
            pdf.text(
                'Please keep this slip and your registration reference for your records.',
                margin,
                270,
                { maxWidth: contentWidth }
            );

            const safeReference = registrationReference.replace(/[^a-zA-Z0-9-]/g, '');
            pdf.save(`UREP-confirmation-${safeReference || 'registration'}.pdf`);
        } catch {
            setDownloadError('Unable to download your confirmation slip. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-6 sm:py-8">
            <main className="flex w-full max-w-3xl flex-col items-center rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                <Image
                    src="/images/success.png"
                    alt="Registration successful"
                    width={600}
                    height={400}
                    className="mx-auto mb-2 h-auto w-full max-w-[280px] sm:max-w-[340px]"
                />
                <h1 className="mb-1 text-center text-xl font-bold text-gray-900 sm:text-2xl">
                    Registration successful
                </h1>
                <p className="text-center text-sm text-gray-600">
                    Your registration reference:
                </p>

                {registrationReference ? (
                    <div className="mt-3 flex max-w-full items-center justify-center gap-4 rounded-lg bg-gray-100 px-4 py-3">
                        <p className="break-all text-sm font-bold text-gray-900 sm:text-base">{registrationReference}</p>
                        <button
                            type="button"
                            onClick={handleCopyReference}
                            aria-label="Copy registration reference"
                            className="shrink-0 text-[#277B12] hover:opacity-70"
                        >
                            <FaCopy size={20} />
                        </button>
                    </div>
                ) : (
                    <p role={referenceLoaded ? "status" : undefined} className="mt-3 text-center text-sm text-gray-600">
                        {referenceLoaded
                            ? referenceError || 'Registration reference is unavailable. Please contact support if you need help.'
                            : 'Loading registration reference...'}
                    </p>
                )}
                {copiedReference && <p className="mt-2 text-sm text-green-700">Reference copied.</p>}
                {copyError && <p role="alert" className="mt-2 text-sm text-red-600">{copyError}</p>}

                {/* QR CODE*/}
                {registrationReference && (
                    <div className="my-4 flex flex-col items-center justify-center">
                        <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                            <QRCode
                                value={registrationReference}
                                size={144}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                    </div>
                )}


                <div className="mt-2 flex w-full max-w-2xl flex-col items-center justify-center gap-3 sm:flex-row">
                    <button className="w-full rounded-lg border-2 border-[#277B12] bg-[#277B12] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#1b5c0d] sm:w-auto" onClick={navigateToDashboard}>Go to Dashboard</button>
                    <button
                        type="button"
                        onClick={handleDownloadConfirmation}
                        disabled={!registrationReference}
                        className="w-full rounded-lg border-2 border-[#277B12] px-4 py-2.5 text-center text-sm font-bold text-gray-900 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        Download Confirmation Slip
                    </button>
                    <button className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto" onClick={navigateToHome}>Back to Home</button>
                </div>
                {downloadError && (
                    <p role="alert" className="mt-4 text-center text-sm text-red-600">
                        {downloadError}
                    </p>
                )}
            </main>
        </div>
    );
}
