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

    useEffect(() => {
        try {
            const userId = sessionStorage.getItem(REGISTERED_USER_ID_KEY);
            if (userId) {
                setRegistrationReference(userId);
                sessionStorage.removeItem(REGISTERED_USER_ID_KEY);
            }
        } catch {
            setReferenceError('Could not access the registration reference in this browser.');
        } finally {
            setReferenceLoaded(true);
        }
    }, []);

    const navigateToDashboard = () => {
        router.push('/admin');
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

    return (
        <div className={'w-screen min-h-screen py-3 pt-1 bg-white'}>
            <div className={'flex items-center justify-center px-1 py-2 mb-4'}>
                <Image src={'/images/success.png'} alt={'success'} width={600} height={400} className={'w-full max-w-[600px] h-auto mx-auto my-4 sm:my-8'} />
            </div>
            <div className={'w-full bg-white px-4 sm:px-8 md:px-16 lg:px-44 items-center justify-center flex flex-col'}>
                <h1 className={'text-black font-bold text-xl sm:text-2xl text-center my-6 sm:my-10'}>You have successfully registered with UREP</h1>
                <h2 className={'text-black font-medium text-lg sm:text-xl text-center'}>Your registration reference:</h2>

                {registrationReference ? (
                    <div className={'bg-gray-100 px-4 sm:px-8 py-4 sm:py-6 mt-6 flex flex-row items-center justify-center gap-4 rounded-lg'}>
                        <p className={'break-all font-bold text-sm sm:text-base'}>{registrationReference}</p>
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
                    <p role={referenceLoaded ? "status" : undefined} className="mt-6 text-center text-sm text-gray-600">
                        {referenceLoaded
                            ? referenceError || 'Registration reference is unavailable. Please contact support if you need help.'
                            : 'Loading registration reference...'}
                    </p>
                )}
                {copiedReference && <p className="mt-2 text-sm text-green-700">Reference copied.</p>}
                {copyError && <p role="alert" className="mt-2 text-sm text-red-600">{copyError}</p>}

                {/* QR CODE*/}
                {registrationReference && (
                    <div className="flex flex-col items-center justify-center mt-4 mb-6">
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <QRCode
                                value={registrationReference}
                                size={200}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                    </div>
                )}


                <div className={'flex flex-col sm:flex-row items-center justify-center sm:justify-between w-full max-w-[800px] gap-4 mt-4 sm:mt-5 px-4'}>
                    <button className={'w-full sm:w-auto bg-[#277B12] text-white font-bold hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm sm:text-md px-4 sm:px-6 py-3 sm:py-4 text-center border-white border-2'} onClick={navigateToDashboard}>Go to Dashboard</button>
                    <button className={'w-full sm:w-auto border-[#277B12] text-black font-bold hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm sm:text-md px-4 py-3 sm:py-4 text-center border-2'}>Download Confirmation slip </button>
                    <button className={'w-full sm:w-auto bg-white text-black font-bold hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm sm:text-md px-4 sm:px-6 py-3 sm:py-4 text-center border-[#277B12] border-2'} onClick={navigateToHome}>Back to Home</button>
                </div>
            </div>
        </div>
    );
}
