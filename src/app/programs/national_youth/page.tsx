'use client';
import React, {useState} from 'react';
import {TextField} from "@/components";
import Header from "@/components/Header";
import {useRouter} from "next/navigation";
import {
    NATIONAL_YOUTH_DRAFT_KEY,
    NationalYouthDraft,
    REGISTERED_USER_ID_KEY,
    REGISTRATION_CONTEXT_KEY,
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
    const [areaOfExpertise, setAreaOfExpertise] = useState('');
    const [otherExpertise, setOtherExpertise] = useState('');
    const [expectation, setExpectation] = useState('');
    const [application, setApplication] = useState('');
    const [previousEngagement, setPreviousEngagement] = useState('');
    const [reason, setReason] = useState('');
    const [urgentPriority, setUrgentPriority] = useState('');
    const [submitError, setSubmitError] = useState('');

    const getRegistrationContext = () => {
        try {
            const storedContext = sessionStorage.getItem(REGISTRATION_CONTEXT_KEY);
            if (!storedContext) return { organization: '', geopoliticalZone: '' };

            const context = JSON.parse(storedContext) as {
                organization?: string;
                state_of_residence?: string;
            };
            const state = context.state_of_residence ?? '';

            const northCentral = ['Benue', 'FCT', 'Federal Capital Territory', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau'];
            const northEast = ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'];
            const northWest = ['Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'];
            const southEast = ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'];
            const southSouth = ['Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers'];
            const southWest = ['Ekiti', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo'];

            let geopoliticalZone = '';
            if (northCentral.includes(state)) geopoliticalZone = 'North Central';
            else if (northEast.includes(state)) geopoliticalZone = 'North East';
            else if (northWest.includes(state)) geopoliticalZone = 'North West';
            else if (southEast.includes(state)) geopoliticalZone = 'South East';
            else if (southSouth.includes(state)) geopoliticalZone = 'South South';
            else if (southWest.includes(state)) geopoliticalZone = 'South West';

            return {
                organization: context.organization ?? '',
                geopoliticalZone,
            };
        } catch {
            return { organization: '', geopoliticalZone: '' };
        }
    };

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

    const expertiseOptions = [
        { value: 'policy_formulation', label: 'Policy Formulation' },
        { value: 'programme_project_design', label: 'Programme/Project Design' },
        { value: 'resource_mobilisation', label: 'Resource Mobilisation' },
        { value: 'monitoring_evaluation', label: 'Monitoring & Evaluation' },
        { value: 'youth_mobilisation', label: 'Youth Mobilisation' },
        { value: 'systems_design_strengthening', label: 'Systems Design & Strengthening' },
        { value: 'other', label: 'Other' },
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
                stakeholder: stakeholder === 'yes'
                    ? `Yes; Area of Expertise: ${areaOfExpertise === 'other' ? otherExpertise : expertiseOptions.find((option) => option.value === areaOfExpertise)?.label ?? areaOfExpertise}`
                    : 'No',
                reason,
                expectation,
                organization: getRegistrationContext().organization,
                youth_focused_organization: getRegistrationContext().organization,
                application,
                previous_engagement: previousEngagement,
                benefited_from_fmyd: previousEngagement,
                urgent_priority: urgentPriority,
                geopolitical_zone: getRegistrationContext().geopoliticalZone,
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

                <section>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">
                    <TextField
                        type="dropdown"
                        label="Are you a youth development stakeholder?"
                        placeholder="Select an option"
                        value={stakeholder}
                        onChange={(value) => {
                            setStakeholder(value);
                            setAreaOfExpertise('');
                            setOtherExpertise('');
                        }}
                        options={previousEngagementOptions}
                        required
                        id="stakeholder"
                    />

                    {stakeholder === 'yes' && (
                        <>
                            <TextField
                                type="dropdown"
                                label="Your Area of Expertise"
                                placeholder="Select an option"
                                value={areaOfExpertise}
                                onChange={setAreaOfExpertise}
                                options={expertiseOptions}
                                required
                                id="area_of_expertise"
                            />
                            {areaOfExpertise === 'other' && (
                                <TextField
                                    type="text"
                                    label="Please specify your area of expertise"
                                    placeholder="Enter your area of expertise"
                                    value={otherExpertise}
                                    onChange={setOtherExpertise}
                                    required
                                    id="other_expertise"
                                />
                            )}
                        </>
                    )}

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

                    {/* Baking Business field */}
                    <TextField
                        type="dropdown"
                        label="How do you intend to apply the outcome of the revised National Youth Policy?"
                        placeholder="Select an option"
                        value={application}
                        onChange={setApplication}
                        required
                        options={useOfOutcomeOptions}
                        id="application"
                    />
                    {/* Baking Business field */}
                    <TextField
                        type="dropdown"
                        label="Have you previously participated in any Federal Ministry of Youth Development programme, study, workshop or training?"
                        placeholder="Select an option"
                        value={previousEngagement}
                        onChange={setPreviousEngagement}
                        required
                        options={previousEngagementOptions}
                        id="previous_engagement"
                    />
                    {/* Urgent Priority field */}
                    <TextField
                        type="dropdown"
                        label="What do you think is the most urgent priority for youth development in Nigeria?"
                        placeholder="Select an option"
                        value={urgentPriority}
                        onChange={setUrgentPriority}
                        required
                        options={urgentPriorityOptions}
                        id="urgent_priority"
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