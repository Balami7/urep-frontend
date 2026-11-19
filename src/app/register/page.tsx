'use client';

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TextField } from "@/components";
import { useRouter } from "next/navigation";
import statesData from "nigerian-states/src/states.json";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
    postToApi,
    REGISTERED_USER_ID_KEY,
    REGISTRATION_REFERENCE_KEY,
    REGISTRATION_CONTEXT_KEY,
} from "@/lib/urep-api";

const GUEST_ORGANIZATION_CODE = 'UREP-GUEST';

export default function RegisterPage() {
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);

    const [registrantType, setRegistrantType] = useState('');
    const [programme, setProgramme] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [stateOptions, setStateOptions] = useState<{ value: string; label: string }[]>([]);
    const [organization, setOrganization] = useState('');
    const [organizationCode, setOrganizationCode] = useState('');
    const [staffId, setStaffId] = useState('');
    const [stateOfResidence, setStateOfResidence] = useState('');
    const [lgaOfResidence, setLgaOfResidence] = useState('');
    const [lgaOfResidenceOptions, setLgaOfResidenceOptions] = useState<{ value: string; label: string }[]>([]);
    const [apiError, setApiError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registeredUserId, setRegisteredUserId] = useState('');
    const [registrationReference, setRegistrationReference] = useState('');
    const isMinistryStaff = registrantType === 'ministry_of_youth';
    const isGuest = registrantType === 'guest';
    const isFastTrackRegistrant = ['fmyd', 'govt_agency', 'state_ministry'].includes(registrantType);
    const requiresNin = !isFastTrackRegistrant && [
        'youth_participant',
        'nycn',
        'nans',
        'youth_parliament',
        'confab_delegate',
    ].includes(registrantType);
    const totalSteps = isMinistryStaff ? 2 : 5;
    const [nin, setNin] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpRequestId, setOtpRequestId] = useState('');
    const [isNinVerified, setIsNinVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    const registrantTypeOptions = [
        { value: 'youth_participant', label: 'Youth Participants' },
        { value: 'nycn', label: 'NYCN' },
        { value: 'nans', label: 'NANS' },
        { value: 'youth_parliament', label: 'Youth Parliament' },
        { value: 'confab_delegate', label: 'Confab Delegate' },
        { value: 'ngo', label: 'NGO' },
        { value: 'fmyd', label: 'FMYD' },
        { value: 'govt_agency', label: 'Govt Agency' },
        { value: 'state_ministry', label: 'State Ministry' },
        { value: 'guest', label: 'Guest' },
        { value: 'ministry_of_youth', label: 'Staff' },
    ];

    const governmentAgencyOptions = [
        'CITIZENSHIP AND LEADERSHIP TRAINING CENTRE',
        'FEDERAL MIN. OF WOMEN AFFAIRS AND SOCIAL DEVELOPMENT',
        'FEDERAL MINISTRY OF ENVIRONMENT',
        'FEDERAL MINISTRY OF EDUCATION',
        'FEDERAL MINISTRY OF HUMANITARIAN AFFAIRS AND POVERTY REDUCTION',
        'FEDERAL MINISTRY OF LABOUR AND EMPLOYMENT',
        'FEDERAL MINISTRY OF WATER RESOURCES AND SANITATION',
        'FEDERAL MINISTRY OF INNOVATION, SCIENCE AND TECHNOLOGY',
        'FEDERAL MINISTRY OF AGRICULTURE AND FOOD SECURITY',
        'NATIONAL INFORMATION, TECHNOLOGY DEVELOPMENT AGENCY (NITDA)',
        'NATIONAL YOUTH SERVICE CORPS (NYSC)',
        'NATIONAL DRUGS LAW ENFORCEMENT AGENCY (NDLEA)',
        'NIGERIAN DATA PROTECTION COMMISSION',
        'NIGERIAN EDUCATION LOAN FUND (NELFUND)',
        'SMALL AND MEDIUM ENTERPRISES DEVELOPMENT AGENCY OF NIGERIA',
        'FEDERAL MINISTRY OF INFORMATION AND NATIONAL ORIENTATION',
        'FEDERAL MINISTRY OF HEALTH AND SOCIAL WELFARE',
        'FEDERAL MINISTRY OF COMMUNICATION, INNOVATION AND DIGITAL ECONOMY',
        'FEDERAL MINISTRY OF SCIENCE AND TECNOLOGY AND INNOVATION',
        'NATIONAL DRUG LAWENFORCEMENT AGENCY (NDLEA)',
        'FEDERAL MINISTRY OF BUGET AND ECONOMIC PLANNING',
        'FEDERAL MINISTRY OF INDUSTRY, TRADE AND INVESTEMENT',
        'NIGERIAN IMMIGRATION SERVICES',
        'FEDERAL MINISTRY OF JUSTICE',
        'NATIONAL SPORTS COMMISSION',
        'NATIONAL DIRECTORATE OF EMPLOYMENT (NDE)',
        'NATIONAL BOARD FOR TECHNICAL EDUCATION (NBTE)',
        'NATIONAL HUMAN RIGHTS COMMISSION (NHRC)',
        'NATIONAL POPULATION COMMISSION',
    ].map((agency) => ({ value: agency, label: agency }));

    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
    ];

    // Section C: Demographics
    const [stateOfOrigin, setStateOfOrigin] = useState('');
    const [lgaOfOrigin, setLgaOfOrigin] = useState('');
    const [lgaOfOriginOptions, setLgaOfOriginOptions] = useState<{ value: string; label: string }[]>([]);
    const [disabilityStatus, setDisabilityStatus] = useState<string[]>(['none']);
    const [otherDisability, setOtherDisability] = useState('');
    const [maritalStatus, setMaritalStatus] = useState('');

    // Section D: Education & Skills
    const [educationLevel, setEducationLevel] = useState('');
    const [otherEducation, setOtherEducation] = useState('');
    const [occupationStatus, setOccupationStatus] = useState('');
    const [otherOccupation, setOtherOccupation] = useState('');
    const [skills, setSkills] = useState('');
    const [areasOfInterest, setAreasOfInterest] = useState('');
    const [yearsExperience, setYearsExperience] = useState('');

    const isOfficialGovernmentEmail = (value: string) => /^[^@\s]+@[^@\s]+\.gov\.ng$/i.test(value);

    // Set the program from URL parameter when component mounts
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const programParam = searchParams.get('program');
        if (programParam) {
            setProgramme(programParam);
        }
        if (searchParams.get('type') === 'staff') {
            setRegistrantType('ministry_of_youth');
        }
    }, []);

    // Load Nigerian states on mount
    useEffect(() => {
        const stateNames = Object.keys(statesData);
        const stateOpts = stateNames.map((stateName: string) => ({
            value: stateName,
            label: stateName
        }));
        setStateOptions(stateOpts);
    }, []);

    const programmeOptions = useMemo(() => [
        { value: 'african_youth', label: 'African/National Youth Day 2025' },
        { value: 'bakeprenuer', label: 'Bakeprenuer Nigeria' },
        { value: 'entrepreneurship', label: 'Entrepreneurship Programme for Unemployed Youths Of South-West Geopolitical Zone' },
        { value: 'national_youth', label: 'National Validation and Adoption Workshop on the National Youth Policy (2026–2030)' },
        { value: 'youth_migration', label: 'Youth Migration Awareness and Management Programme (YMAMP)' },
    ], []);

    // Get the selected program name
    const selectedProgramName = useMemo(() => {
        if (!programme) return '';
        const selectedProgram = programmeOptions.find(option => option.value === programme);
        return selectedProgram ? selectedProgram.label : '';
    }, [programme, programmeOptions]);

    const handleRegistrantTypeChange = (value: string) => {
        setRegistrantType(value);
        if (value === 'guest') {
            setOrganizationCode(GUEST_ORGANIZATION_CODE);
        } else if (registrantType === 'guest' && organizationCode === GUEST_ORGANIZATION_CODE) {
            setOrganizationCode('');
        }
        setNin('');
        setOtpCode('');
        setOtpRequestId('');
        setIsNinVerified(false);
        if (value === 'ministry_of_youth') {
            setStateOfResidence('');
            setLgaOfResidence('');
            setLgaOfResidenceOptions([]);
            setStateOfOrigin('');
            setLgaOfOrigin('');
            setLgaOfOriginOptions([]);
        }
    };

    const handleSendNinOtp = async () => {
        if (!/^\d{11}$/.test(nin)) {
            setApiError('Enter a valid 11-digit NIN.');
            return;
        }

        setApiError('');
        setIsSendingOtp(true);
        try {
            const lookup = await postToApi<{
                nin: string;
                first_name: string;
                last_name: string;
                phone_number: string;
            }>('/api/nin/lookup', { nin });

            const otp = await postToApi<{ request_id: string; expires_at: string }>('/api/nin/otp', {
                phone_number: lookup.phone_number,
            });

            setName(`${lookup.first_name} ${lookup.last_name}`.trim());
            setPhoneNumber(lookup.phone_number);
            setOtpRequestId(otp.request_id);
        } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Unable to verify NIN.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyNinOtp = async () => {
        if (!/^\d{6}$/.test(otpCode) || !otpRequestId) {
            setApiError('Enter the 6-digit OTP.');
            return;
        }

        setApiError('');
        setIsVerifyingOtp(true);
        try {
            await postToApi<{ request_id: string; phone_number: string; verified_at: string }>(
                '/api/nin/otp/verify',
                { request_id: otpRequestId, otp_code: otpCode },
            );
            setIsNinVerified(true);
        } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Unable to verify the OTP.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // Handle password changes
    const handlePasswordChange = (value: string) => {
        setPassword(value);
        const passwordElem = document.getElementById('password') as HTMLInputElement;
        if (passwordElem) {
            passwordElem.setCustomValidity(value.length < 8 ? 'Password must be at least 8 characters' : '');
        }
        const confirmElem = document.getElementById('confirmPassword') as HTMLInputElement;
        if (confirmElem && confirmPassword && value !== confirmPassword) {
            confirmElem.setCustomValidity('Passwords do not match');
        } else if (confirmElem) {
            confirmElem.setCustomValidity('');
        }
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        const confirmElem = document.getElementById('confirmPassword') as HTMLInputElement;
        if (confirmElem) {
            if (password && value !== password) {
                confirmElem.setCustomValidity('Passwords do not match');
            } else {
                confirmElem.setCustomValidity('');
            }
        }
    };

    const getLgaOptionsForState = (selectedState: string) => {
        const stateInfo = statesData[selectedState as keyof typeof statesData];
        let lgas: string[] = [];

        if (Array.isArray(stateInfo)) {
            lgas = stateInfo;
        } else if (stateInfo && typeof stateInfo === 'object' && 'lgas' in stateInfo) {
            lgas = stateInfo.lgas;
        }

        return lgas.map((lgaName: string) => ({ value: lgaName, label: lgaName }));
    };

    const handleStateOfOriginChange = (selectedState: string) => {
        setStateOfOrigin(selectedState);
        setLgaOfOrigin('');
        setLgaOfOriginOptions(getLgaOptionsForState(selectedState));
    };

    const handleStateOfResidenceChange = (selectedState: string) => {
        setStateOfResidence(selectedState);
        setLgaOfResidence('');
        setLgaOfResidenceOptions(getLgaOptionsForState(selectedState));
    };

    // Handle disability checkbox
    const handleDisabilityCheckbox = (value: string) => {
        const firstBox = document.getElementById('disability-none') as HTMLInputElement;
        if (firstBox) {
            firstBox.setCustomValidity('');
        }

        if (value === 'none') {
            setDisabilityStatus(['none']);
            setOtherDisability('');
            return;
        }

        let updated = disabilityStatus.filter(v => v !== 'none');
        if (updated.includes(value)) {
            updated = updated.filter(item => item !== value);
            if (value === 'other') setOtherDisability('');
        } else {
            updated.push(value);
        }

        if (updated.length === 0) {
            updated = ['none'];
        }
        setDisabilityStatus(updated);
    };

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

    const steps = isMinistryStaff
        ? [
            { number: 1, title: 'Staff Details', desc: 'Official and personal details' },
            { number: 2, title: 'Review', desc: 'Check your information before submitting' },
        ]
        : isGuest
            ? [
                { number: 1, title: 'Personal Info', desc: 'Personal and account details' },
                { number: 4, title: 'Education & Skills', desc: 'Qualifications, skills and experience' },
                { number: 5, title: 'Review', desc: 'Check your information before submitting' },
            ]
        : isFastTrackRegistrant
            ? [
                { number: 1, title: 'Personal Info', desc: 'Personal and account details' },
                { number: 5, title: 'Review', desc: 'Check your information before submitting' },
            ]
        : [
            { number: 1, title: 'Personal Info', desc: 'Personal details' },
            { number: 2, title: 'Account', desc: 'Login credentials' },
            { number: 3, title: 'Demographics', desc: 'Origin, zone and accessibility' },
            { number: 4, title: 'Education & Skills', desc: 'Qualifications, skills and experience' },
            { number: 5, title: 'Review', desc: 'Check your information before submitting' },
        ];

    const currentStepIndex = steps.findIndex((step) => step.number === currentStep);
    const progressPercent = steps.length > 1
        ? (currentStepIndex / (steps.length - 1)) * 100
        : 0;

    const handlePrev = () => {
        const currentStepIndex = steps.findIndex((step) => step.number === currentStep);
        if (currentStepIndex > 0) {
            setCurrentStep(steps[currentStepIndex - 1].number);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            handlePrev();
            return;
        }
        router.back();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        // Step 1 cross-field validation
        if (currentStep === 1) {
            if (requiresNin && !isNinVerified) {
                setApiError('Complete NIN lookup and OTP verification before continuing.');
                return;
            }
            if (isFastTrackRegistrant || isGuest) {
                if (password.length < 8) {
                    const passwordElem = document.getElementById('password') as HTMLInputElement;
                    if (passwordElem) {
                        passwordElem.setCustomValidity('Password must be at least 8 characters');
                        passwordElem.reportValidity();
                    }
                    return;
                }
                if (password !== confirmPassword) {
                    const confirmElem = document.getElementById('confirmPassword') as HTMLInputElement;
                    if (confirmElem) {
                        confirmElem.setCustomValidity('Passwords do not match');
                        confirmElem.reportValidity();
                    }
                    return;
                }
            }
            if (isMinistryStaff) {
                if (!isOfficialGovernmentEmail(email)) {
                    const emailElem = document.getElementById('email') as HTMLInputElement;
                    emailElem?.setCustomValidity('Use your official government email address ending in .gov.ng.');
                    emailElem?.reportValidity();
                    return;
                }
            }
            setCurrentStep(isFastTrackRegistrant ? 5 : isGuest ? 4 : 2);
            return;
        }

        // Step 2 cross-field validation
        if (currentStep === 2 && !isMinistryStaff) {
            if (password.length < 8) {
                const passwordElem = document.getElementById('password') as HTMLInputElement;
                if (passwordElem) {
                    passwordElem.setCustomValidity('Password must be at least 8 characters');
                    passwordElem.reportValidity();
                }
                return;
            }
            if (password !== confirmPassword) {
                const confirmElem = document.getElementById('confirmPassword') as HTMLInputElement;
                if (confirmElem) {
                    confirmElem.setCustomValidity('Passwords do not match');
                    confirmElem.reportValidity();
                }
                return;
            }
            const emailElem = document.getElementById('email') as HTMLInputElement;
            emailElem?.setCustomValidity('');
            setCurrentStep(3);
            return;
        }

        // Step 3 cross-field validation
        if (currentStep === 3 && !isMinistryStaff) {
            if (disabilityStatus.length === 0) {
                const firstBox = document.getElementById('disability-none') as HTMLInputElement;
                if (firstBox) {
                    firstBox.setCustomValidity('Please select at least one option');
                    firstBox.reportValidity();
                }
                return;
            }
            setCurrentStep(4);
            return;
        }

        if (currentStep === 4 && !isMinistryStaff) {
            setCurrentStep(5);
            return;
        }

        setIsSubmitting(true);
        try {
            if (isMinistryStaff) {
                const staffRegistration = await postToApi<{
                    id: string;
                    official_email: string;
                    urep_code: string;
                }>('/api/auth/staff/register', {
                    official_email: email,
                    full_name: name,
                    phone_number: phoneNumber,
                    gender,
                    staff_id: staffId,
                });

                if (!staffRegistration.id) {
                    throw new Error('The registration service did not return a staff ID. Please try again.');
                }
                if (!staffRegistration.urep_code?.trim()) {
                    throw new Error('The registration service did not return a reference code. Please contact support.');
                }

                try {
                    sessionStorage.setItem(REGISTRATION_REFERENCE_KEY, staffRegistration.urep_code.trim());
                } catch {
                    throw new Error('Your staff record was created, but browser storage is blocked. Enable storage and retry.');
                }

                router.push('/success');
                return;
            }

            const requestedProgramme = new URLSearchParams(window.location.search).get('program');
            const selectedProgramme = programmeOptions.find((option) => option.value === requestedProgramme)?.value
                || programme;
            let userId = registeredUserId;
            let referenceCode = registrationReference;
            if (!userId) {
                const registration = await postToApi<{
                    id: string;
                    email: string;
                    urep_code: string;
                }>('/api/auth/register', {
                    full_name: name,
                    email,
                    password,
                    registrant_type: registrantType,
                    selected_program: selectedProgramme || 'general',
                    organization,
                    organization_code: organizationCode,
                    phone_number: phoneNumber,
                    gender,
                    state_of_residence: stateOfResidence,
                    lga_of_residence: lgaOfResidence,
                });

                if (!registration.id) {
                    throw new Error('The registration service did not return a user ID. Please try again.');
                }
                if (!registration.urep_code?.trim()) {
                    throw new Error('The registration service did not return a reference code. Please contact support.');
                }

                userId = registration.id;
                referenceCode = registration.urep_code.trim();
                setRegisteredUserId(userId);
                setRegistrationReference(referenceCode);
            }

            try {
                sessionStorage.setItem(REGISTERED_USER_ID_KEY, userId);
                if (referenceCode) {
                    sessionStorage.setItem(REGISTRATION_REFERENCE_KEY, referenceCode);
                }
                sessionStorage.setItem(REGISTRATION_CONTEXT_KEY, JSON.stringify({
                    organization,
                    state_of_residence: stateOfResidence,
                }));
            } catch {
                throw new Error('Your account was created, but browser storage is blocked. Enable storage and retry.');
            }

            if (!isFastTrackRegistrant) {
                await postToApi(`/api/auth/users/${encodeURIComponent(userId)}/profile`, {
                    state_of_origin: stateOfOrigin,
                    lga_of_origin: lgaOfOrigin,
                    marital_status: maritalStatus,
                    disability: disabilityStatus
                        .map((value) => value === 'other' && otherDisability ? `other: ${otherDisability}` : value)
                        .join(', '),
                    education_level: educationLevel === 'other' ? otherEducation : educationLevel,
                    occupation_status: occupationStatus === 'other' ? otherOccupation : occupationStatus,
                    skills,
                    area_of_interest: areasOfInterest,
                    years_of_experience: yearsExperience,
                });
            }

            router.push(isMinistryStaff ? '/dashboard' : selectedProgramme ? `/programs/${selectedProgramme}` : '/');
        } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Unable to complete registration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen overflow-y-auto flex flex-col bg-white relative justify-center py-6 sm:py-8">
            {/* Top-left corner branding */}
            <Link href="/" className="absolute top-5 left-5 sm:top-7 sm:left-10 flex items-center gap-3 z-20 group">
                <Image
                    src="/fmyd_logo1.png"
                    alt="Federal Ministry of Youth Development Logo"
                    width={64}
                    height={64}
                    className="h-12 sm:h-14 w-auto object-contain"
                    priority
                />
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm sm:text-base tracking-tight leading-tight group-hover:text-[#277B12] transition-colors">
                        Unified Registration Portal
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium leading-none">
                        Federal Ministry of Youth Development
                    </span>
                </div>
            </Link>

            <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 my-auto pt-16 sm:pt-4">
                {/* Heading */}
                <div className="text-center mb-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                        {isMinistryStaff ? 'Ministry Staff Sign Up' : 'Create your account'}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {isMinistryStaff
                            ? 'Create a staff account with your official government email'
                            : isFastTrackRegistrant
                                ? 'Quick registration — complete your details, then review'
                                : isGuest
                                    ? 'Quick registration — complete your details, then continue to education and skills'
                                    : `Join the Unified Registration Portal in ${totalSteps} steps`}
                    </p>
                </div>

                {/* Progressive Stepper */}
                <div className="mb-4">
                    <div className="flex items-center justify-between relative max-w-lg mx-auto px-2">
                        <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-gray-200 -z-0" />
                        <div
                            className="absolute top-3.5 left-6 h-0.5 bg-[#277B12] -z-0 transition-all duration-300"
                            style={{ width: progressPercent === 100 ? 'calc(100% - 48px)' : `calc(${progressPercent}% - 24px)` }}
                        />
                        {steps.map((s, index) => {
                            const isCompleted = index < currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            return (
                                <div key={s.number} className="flex flex-col items-center z-10 bg-white px-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (index < currentStepIndex) {
                                                setCurrentStep(s.number);
                                            }
                                        }}
                                        disabled={index > currentStepIndex}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${isCompleted
                                                ? 'bg-[#277B12] text-white hover:bg-[#1b5c0d] cursor-pointer'
                                                : isCurrent
                                                    ? 'border-2 border-[#277B12] bg-white text-[#277B12] ring-2 ring-green-100'
                                                    : 'border-2 border-gray-200 bg-white text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isCompleted ? <Check size={14} /> : index + 1}
                                    </button>
                                    <span className={`text-[10px] sm:text-xs mt-1 hidden sm:block font-medium ${isCurrent ? 'text-[#277B12] font-semibold' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                                        }`}>
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Active Section Header */}
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-semibold text-[#277B12] uppercase tracking-wider">
                            Step {currentStepIndex + 1} of {steps.length}
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">
                            {steps.find((step) => step.number === currentStep)?.title}
                        </h2>
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:block">
                        {steps.find((step) => step.number === currentStep)?.desc}
                    </span>
                </div>

                {/* Form Body - Native HTML5 Validation */}
                <form onSubmit={handleSubmit} className="space-y-2.5">
                    {apiError && (
                        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {apiError}
                        </p>
                    )}

                    {/* ── STEP 1: Personal Information ── */}
                    {currentStep === 1 && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                            <TextField
                                type="dropdown"
                                label="Registration Type"
                                placeholder="Select registration type"
                                value={registrantType}
                                onChange={handleRegistrantTypeChange}
                                options={registrantTypeOptions}
                                required
                                id="registrantType"
                            />

                            {requiresNin && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
                                    <TextField
                                        type="text"
                                        label="National Identity Number (NIN)"
                                        placeholder="Enter 11-digit NIN"
                                        value={nin}
                                        onChange={(value) => {
                                            setNin(value.replace(/\D/g, '').slice(0, 11));
                                            setIsNinVerified(false);
                                            setOtpRequestId('');
                                            setOtpCode('');
                                        }}
                                        required
                                        id="nin"
                                        disabled={isNinVerified}
                                    />
                                    {!otpRequestId ? (
                                        <button
                                            type="button"
                                            onClick={handleSendNinOtp}
                                            disabled={isSendingOtp}
                                            className="rounded-lg bg-[#277B12] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSendingOtp ? 'Sending OTP...' : 'Lookup NIN and Send OTP'}
                                        </button>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <TextField
                                                type="text"
                                                label="OTP Code"
                                                placeholder="Enter 6-digit OTP"
                                                value={otpCode}
                                                onChange={(value) => setOtpCode(value.replace(/\D/g, '').slice(0, 6))}
                                                required
                                                id="otpCode"
                                                disabled={isNinVerified}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyNinOtp}
                                                disabled={isVerifyingOtp || isNinVerified}
                                                className="self-end mb-1 rounded-lg bg-[#277B12] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isNinVerified ? 'Verified' : isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 pt-1">
                                <TextField
                                    type="text"
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={setName}
                                    id="name"
                                    required
                                    readOnly={requiresNin}
                                />
                                <TextField
                                    type="text"
                                    label="Phone Number"
                                    placeholder="Enter your phone number"
                                    value={phoneNumber}
                                    onChange={setPhoneNumber}
                                    id="phoneNumber"
                                    required
                                    readOnly={requiresNin}
                                />
                                <TextField
                                    type="dropdown"
                                    label="Gender"
                                    placeholder="Select gender"
                                    value={gender}
                                    onChange={setGender}
                                    options={genderOptions}
                                    id="gender"
                                    required
                                />
                                {isMinistryStaff && (
                                    <>
                                        <TextField
                                            type="email"
                                            label="Official Government Email"
                                            placeholder="name@agency.gov.ng"
                                            value={email}
                                            onChange={(value) => {
                                                setEmail(value);
                                                (document.getElementById('email') as HTMLInputElement | null)?.setCustomValidity('');
                                            }}
                                            required
                                            id="email"
                                            hint="Staff accounts require an official .gov.ng email address."
                                        />
                                        <TextField
                                            type="text"
                                            label="Staff ID"
                                            placeholder="Enter your staff ID"
                                            value={staffId}
                                            onChange={setStaffId}
                                            required
                                            id="staffId"
                                        />
                                    </>
                                )}
                                {(isFastTrackRegistrant || isGuest) && (
                                    <>
                                        <TextField
                                            type="email"
                                            label="Email Address"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(value) => {
                                                setEmail(value);
                                                (document.getElementById('email') as HTMLInputElement | null)?.setCustomValidity('');
                                            }}
                                            required
                                            id="email"
                                        />
                                        <TextField
                                            type="password"
                                            label="Password"
                                            placeholder="Create password"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            required
                                            id="password"
                                        />
                                        <TextField
                                            type="password"
                                            label="Confirm Password"
                                            placeholder="Re-enter password"
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordChange}
                                            required
                                            id="confirmPassword"
                                        />
                                    </>
                                )}
                            </div>
                            {!isMinistryStaff && (
                                <>
                                    <TextField
                                        type={registrantType === 'govt_agency' ? 'dropdown' : 'text'}
                                        label="Organization"
                                        placeholder={registrantType === 'govt_agency' ? 'Select your agency' : 'Enter your organization'}
                                        value={organization}
                                        onChange={setOrganization}
                                        options={registrantType === 'govt_agency' ? governmentAgencyOptions : undefined}
                                        required
                                        id="organization"
                                    />
                                    <TextField
                                        type="text"
                                        label="Organization Code"
                                        placeholder="Enter your organization code"
                                        value={organizationCode}
                                        onChange={setOrganizationCode}
                                        required
                                        id="organizationCode"
                                    />
                                </>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                <TextField
                                    type="dropdown"
                                    label="State of Residence"
                                    placeholder="Select State"
                                    value={stateOfResidence}
                                    onChange={handleStateOfResidenceChange}
                                    options={stateOptions}
                                    required={!isMinistryStaff}
                                    disabled={isMinistryStaff}
                                    id="stateOfResidence"
                                />
                                <TextField
                                    type="dropdown"
                                    label="LGA of Residence"
                                    placeholder="Select LGA"
                                    value={lgaOfResidence}
                                    onChange={setLgaOfResidence}
                                    options={lgaOfResidenceOptions}
                                    required={!isMinistryStaff}
                                    disabled={isMinistryStaff}
                                    id="lgaOfResidence"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Account Details ── */}
                    {currentStep === 2 && !isMinistryStaff && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                            <TextField
                                type="email"
                                label="Email Address"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(value) => {
                                    setEmail(value);
                                    (document.getElementById('email') as HTMLInputElement | null)?.setCustomValidity('');
                                }}
                                required
                                id="email"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                <TextField
                                    type="password"
                                    label="Password"
                                    placeholder="Create password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    id="password"
                                />
                                <TextField
                                    type="password"
                                    label="Confirm Password"
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    required
                                    id="confirmPassword"
                                />
                            </div>

                        </div>
                    )}

                    {/* ── STEP 3: Demographics ── */}
                    {currentStep === 3 && !isMinistryStaff && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                <TextField
                                    type="dropdown"
                                    label="State of Origin"
                                    placeholder="Select State"
                                    value={stateOfOrigin}
                                    onChange={handleStateOfOriginChange}
                                    options={stateOptions}
                                    required
                                    id="stateOfOrigin"
                                />
                                <TextField
                                    type="dropdown"
                                    label="LGA of Origin"
                                    placeholder="Select LGA"
                                    value={lgaOfOrigin}
                                    onChange={setLgaOfOrigin}
                                    options={lgaOfOriginOptions}
                                    required
                                    id="lgaOfOrigin"
                                />
                            </div>

                            <TextField
                                type="dropdown"
                                label="Marital Status"
                                placeholder="Select status"
                                value={maritalStatus}
                                onChange={setMaritalStatus}
                                options={maritalStatusOptions}
                                required
                                id="maritalStatus"
                            />

                            {/* Disability Status */}
                            <div className="flex flex-col gap-1 pt-1">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Disability Status <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-0.5">
                                    {disabilityOptions.map((option) => (
                                        <label key={option.value} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer text-sm">
                                            <input
                                                type="checkbox"
                                                id={`disability-${option.value}`}
                                                checked={disabilityStatus.includes(option.value)}
                                                onChange={() => handleDisabilityCheckbox(option.value)}
                                                className="h-4 w-4 rounded border-gray-300 text-[#277B12] focus:ring-[#277B12]"
                                            />
                                            <span className="text-gray-700 text-xs sm:text-sm">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {disabilityStatus.includes('other') && (
                                    <div className="mt-2">
                                        <TextField
                                            type="text"
                                            placeholder="Please specify disability"
                                            value={otherDisability}
                                            onChange={setOtherDisability}
                                            required
                                            id="otherDisability"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Education & Skills ── */}
                    {currentStep === 4 && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                <TextField
                                    type="dropdown"
                                    label="Highest Level of Education"
                                    placeholder="Select qualification"
                                    value={educationLevel}
                                    onChange={setEducationLevel}
                                    options={educationLevelOptions}
                                    required
                                    id="educationLevel"
                                />
                                {educationLevel === 'other' ? (
                                    <TextField
                                        type="text"
                                        label="Specify Education"
                                        placeholder="Enter qualification"
                                        value={otherEducation}
                                        onChange={setOtherEducation}
                                        required
                                        id="otherEducation"
                                    />
                                ) : <div />}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                <TextField
                                    type="dropdown"
                                    label="Current Occupation / Status"
                                    placeholder="Select status"
                                    value={occupationStatus}
                                    onChange={setOccupationStatus}
                                    options={occupationStatusOptions}
                                    required
                                    id="occupationStatus"
                                />
                                {occupationStatus === 'other' ? (
                                    <TextField
                                        type="text"
                                        label="Specify Occupation"
                                        placeholder="Enter occupation"
                                        value={otherOccupation}
                                        onChange={setOtherOccupation}
                                        required
                                        id="otherOccupation"
                                    />
                                ) : <div />}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="skills" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Skills <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="skills"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder="Describe your skills..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#277B12] focus:border-[#277B12] placeholder:text-gray-400 min-h-16 h-16 resize-none bg-white"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="areasOfInterest" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Areas of Interest <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="areasOfInterest"
                                    value={areasOfInterest}
                                    onChange={(e) => setAreasOfInterest(e.target.value)}
                                    placeholder="Describe your areas of interest..."
                                    className="w-full min-h-16 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#277B12] focus:outline-none focus:ring-1 focus:ring-[#277B12]"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1 mb-2.5">
                                <label htmlFor="yearsExperience" className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Years of Experience <span className="ml-1 text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="yearsExperience"
                                    inputMode="numeric"
                                    pattern="[0-9]{1,2}"
                                    maxLength={2}
                                    value={yearsExperience}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        if (/^\d{0,2}$/.test(value)) setYearsExperience(value);
                                    }}
                                    placeholder="e.g. 3"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#277B12] focus:outline-none focus:ring-1 focus:ring-[#277B12]"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === totalSteps && (
                        <section aria-labelledby="review-heading" className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div>
                                <h3 id="review-heading" className="font-semibold text-gray-900">Review your information</h3>
                                <p className="text-sm text-gray-500">Confirm these details before submitting.</p>
                            </div>
                            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                <div><dt className="font-medium text-gray-500">{isMinistryStaff ? 'Registrant type' : 'Participant type'}</dt><dd className="text-gray-900">{registrantTypeOptions.find((option) => option.value === registrantType)?.label || '—'}</dd></div>
                                <div><dt className="font-medium text-gray-500">Full name</dt><dd className="text-gray-900">{name || '—'}</dd></div>
                                <div><dt className="font-medium text-gray-500">{isMinistryStaff ? 'Official email' : 'Email'}</dt><dd className="text-gray-900">{email || '—'}</dd></div>
                                <div><dt className="font-medium text-gray-500">Phone number</dt><dd className="text-gray-900">{phoneNumber || '—'}</dd></div>
                                {!isMinistryStaff && <div><dt className="font-medium text-gray-500">Programme</dt><dd className="text-gray-900">{selectedProgramName || 'General Youth Registration'}</dd></div>}
                                {isMinistryStaff ? (
                                    <>
                                        <div><dt className="font-medium text-gray-500">Gender</dt><dd className="text-gray-900">{gender || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Staff ID</dt><dd className="text-gray-900">{staffId || '—'}</dd></div>
                                    </>
                                ) : isFastTrackRegistrant ? (
                                    <>
                                        <div><dt className="font-medium text-gray-500">Gender</dt><dd className="text-gray-900">{gender || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Organization</dt><dd className="text-gray-900">{organization || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Organization code</dt><dd className="text-gray-900">{organizationCode || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">State of residence</dt><dd className="text-gray-900">{stateOfResidence || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">LGA of residence</dt><dd className="text-gray-900">{lgaOfResidence || '—'}</dd></div>
                                    </>
                                ) : (
                                    <>
                                        <div><dt className="font-medium text-gray-500">Gender</dt><dd className="text-gray-900">{gender || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Organization</dt><dd className="text-gray-900">{organization || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Organization code</dt><dd className="text-gray-900">{organizationCode || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">State of residence</dt><dd className="text-gray-900">{stateOfResidence || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">LGA of residence</dt><dd className="text-gray-900">{lgaOfResidence || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">State of origin</dt><dd className="text-gray-900">{stateOfOrigin || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">LGA of origin</dt><dd className="text-gray-900">{lgaOfOrigin || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Marital status</dt><dd className="text-gray-900">{maritalStatus || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Education level</dt><dd className="text-gray-900">{educationLevel === 'other' ? otherEducation : educationLevel || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Occupation</dt><dd className="text-gray-900">{occupationStatus === 'other' ? otherOccupation : occupationStatus || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Skills</dt><dd className="text-gray-900">{skills || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Areas of interest</dt><dd className="text-gray-900">{areasOfInterest || '—'}</dd></div>
                                        <div><dt className="font-medium text-gray-500">Years of experience</dt><dd className="text-gray-900">{yearsExperience || '—'}</dd></div>
                                    </>
                                )}
                            </dl>
                        </section>
                    )}

                    {/* Progressive Stepper Controls */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                        >
                            <ChevronLeft size={16} />
                            Back
                        </button>

                        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
                            <span className="text-xs text-gray-500">
                                Already have an account?{' '}
                                <Link href={isMinistryStaff ? '/login?type=staff' : '/login'} className="text-[#277B12] hover:underline font-semibold">
                                {isMinistryStaff ? 'Staff Login' : 'Login'}
                                </Link>
                            </span>

                            {currentStep < totalSteps ? (
                                <button
                                    type="submit"
                                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold bg-[#277B12] text-white hover:bg-[#1b5c0d] transition-colors shadow-sm cursor-pointer"
                                >
                                    Continue
                                    <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-1.5 rounded-lg bg-[#277B12] px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1b5c0d] disabled:cursor-wait disabled:opacity-60"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
