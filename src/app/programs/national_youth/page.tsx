'use client';
import React, {useState} from 'react';
import {TextField} from "@/components";
import Header from "@/components/Header";
import {useRouter} from "next/navigation";
import {
    NATIONAL_YOUTH_DRAFT_KEY,
    NationalYouthDraft,
    REGISTERED_USER_ID_KEY,
} from "@/lib/urep-api";

export default function NationalYouthPage() {

    const router = useRouter();
    const backToPreviousPage = () => {
        router.back();
    }
    const routeToNextPage = () => {
        router.push('/consent?program=national_youth');
    }

    const [stakeholder, setStakeholder] = useState('');
    const [organization, setOrganization] = useState('');
    const [expectation, setExpectation] = useState('');
    const [application, setApplication] = useState('');
    const [previousEngagement, setPreviousEngagement] = useState('');
    const [benefitedFromFMYD, setBenefitedFromFMYD] = useState('');
    const [geopoliticalZone, setGeopoliticalZone] = useState('');
    const [reason, setReason] = useState('');
    const [youthFocusedOrganization, setYouthFocusedOrganization] = useState('');
    const [urgentPriority, setUrgentPriority] = useState('');
    const [submitError, setSubmitError] = useState('');

    const embassyOptions = [
        { value: 'line_ministries', label: 'Federal line Ministries, Departments and Agencies' },
        { value: 'state_ministry_of_youth_development', label: 'State Ministry of Youth Development' },
        { value: 'development_partnership', label: 'Development Partnership' },
        { value: 'youth_policy_coalition', label: 'Youth Policy Coalition' },
        { value: 'youth_ngo', label: 'Youth NGO' },
        { value: 'youth_cso', label: 'Youth CSO' },
        { value: 'national_assembly', label: 'National Assembly' },
        { value: 'un_system_donor', label: 'UN System or Donor' },
        { value: 'vulnerable_youth_group', label: 'Vulnerable Youth Group' },
        {value: 'Private_Sector', label: 'Private Sector'},
        {value: 'academic_institution', label: 'Academic Institution'},
        {value: 'research_institution', label: 'Research Institution'},
        {value: 'media_house', label: 'Media House'},
        {value: 'others', label: 'Others'},
    ];

    const useOfOutcomeOptions = [
        { value: 'advocacy', label: 'Advocacy' },
        { value: 'community_development', label: 'Community Development' },
        { value: 'networking', label: 'Networking with other youth stakeholders' },
        { value: 'strengthen_collaboration', label: 'Strengthen Collaboration between government and youth' },
        { value: 'other', label: 'Other' },
    ];

    const previousEngagementOptions = [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
    ];

    const geographicalLocationOptions = [
        { value: 'North Central', label: 'North Central' },
        { value: 'North East', label: 'North East' },
        { value: 'North West', label: 'North West' },
        { value: 'South East', label: 'South East' },
        { value: 'South South', label: 'South South' },
        { value: 'South West', label: 'South West' },
    ];

    const urgentPriorityOptions = [
        {value: 'employment_and_job_creation', label: 'Employment and Job Creation'},
        {value: 'education', label: 'Education'},
        {value: 'health', label: 'Health'},
        {value: 'political_participation', label: 'Political Participation'},
        {value: 'digital_transformation', label: 'Digital Transformation'},
        {value: 'gender_equality', label: 'Gender Equality'},
        {value: 'peace_building', label: 'Peace Building'},
        {value: 'youth_right_and_civic_engagement', label: 'Youth Right and Civic Engagement'},
        {value: 'other', label: 'Other'},
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        try {
            if (!sessionStorage.getItem(REGISTERED_USER_ID_KEY)) {
                setSubmitError('Your registration session could not be found. Please complete registration again.');
                return;
            }

            const draft: NationalYouthDraft = {
                stakeholder,
                reason,
                expectation,
                organization,
                youth_focused_organization: youthFocusedOrganization,
                application,
                previous_engagement: previousEngagement,
                benefited_from_fmyd: benefitedFromFMYD,
                urgent_priority: urgentPriority,
                geopolitical_zone: geopoliticalZone,
            };
            sessionStorage.setItem(NATIONAL_YOUTH_DRAFT_KEY, JSON.stringify(draft));
            routeToNextPage();
        } catch {
            setSubmitError('Your responses could not be saved in this browser. Please enable storage and try again.');
        }
    };
    return (
        <div className="min-h-screen w-full bg-gray-50">
            <Header />
            <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-4 text-center">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Program registration
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        National Youth Policy (2026–2030)
                    </p>
                </div>

                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-4 border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#277B12]">
                            Program-specific questions
                        </span>
                        <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                            National validation and adoption workshop
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">
                    <TextField
                        type="text"
                        label="Are you a youth development stakeholder? If yes, what is your area of expertise?"
                        placeholder="Yes, please specify your area of expertise"
                        value={stakeholder}
                        onChange={setStakeholder}
                        required
                        id="stakeholder"
                    />

                    <TextField
                        type="text"
                        label="Why do you want to participate in the National Validation and Adoption Workshop?"
                        placeholder="Reason"
                        value={reason}
                        onChange={setReason}
                        required
                        id="reason"
                    />

                    <TextField
                        type="text"
                        label="What is your expectation from the National Validation and Adoption Workshop?"
                        placeholder="Expectation"
                        value={expectation}
                        onChange={setExpectation}
                        required
                        id="expectation"
                    />

                    {/* Embassy field */}
                    <TextField
                        type="dropdown"
                        label="Which organisation or institution do you represent"
                        placeholder="NGO/ISO"
                        value={organization}
                        onChange={setOrganization}
                        required
                        options={embassyOptions}
                        id="organization"
                    />

                    <TextField
                        type="text"
                        label="Do you belong to a youth focused organization?"
                        placeholder="Yes/No, Name of Organization"
                        value={youthFocusedOrganization}
                        onChange={setYouthFocusedOrganization}
                        required
                        id="youth_focused_organization"
                    />

                    {/* Baking Business field */}
                    <TextField
                        type="dropdown"
                        label="How do you intend to apply the outcome of the revised National Youth Policy?"
                        placeholder="Advocacy"
                        value={application}
                        onChange={setApplication}
                        required
                        options={useOfOutcomeOptions}
                        id="application"
                    />
                    {/* Baking Business field */}
                    <TextField
                        type="dropdown"
                        label="How have you previously engaged with the Federal Ministry of Youth Development?"
                        placeholder="Workshops/Training"
                        value={previousEngagement}
                        onChange={setPreviousEngagement}
                        required
                        options={previousEngagementOptions}
                        id="previous_engagement"
                    />
                    {/* Benefited from FMYD field */}
                    <TextField
                        type="dropdown"
                        label="Have you benefited from the Federal Ministry of Youth Development?"
                        placeholder="Yes/No"
                        value={benefitedFromFMYD}
                        onChange={setBenefitedFromFMYD}
                        required
                        options={previousEngagementOptions}
                        id="benefited_from_fmyd"
                    />
                    {/* Urgent Priority field */}
                    <TextField
                        type="dropdown"
                        label="What do you think is the most urgent priority for youth development in Nigeria?"
                        placeholder="Urgent Priority"
                        value={urgentPriority}
                        onChange={setUrgentPriority}
                        required
                        options={urgentPriorityOptions}
                        id="urgent_priority"
                    />

                    {/* Geopolitical Zone field */}
                    <TextField
                        type="dropdown"
                        label="What is your geopolitical zone?"
                        placeholder="Geopolitical Zone"
                        value={geopoliticalZone}
                        onChange={setGeopoliticalZone}
                        required
                        options={geographicalLocationOptions}
                        id="geopolitical_zone"
                    />

                    {submitError && (
                        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
                            {submitError}
                        </p>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 sm:col-span-2">
                        <button
                            onClick={backToPreviousPage}
                            type="button"
                            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-1.5 rounded-lg bg-[#277B12] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1b5c0d]"
                        >
                            Continue
                        </button>
                    </div>
                    </form>
                </section>
            </main>
        </div>
    );
}