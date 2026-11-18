const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '');

export const REGISTERED_USER_ID_KEY = 'urep_registered_user_id';
export const REGISTRATION_REFERENCE_KEY = 'urep_registration_reference';
export const NATIONAL_YOUTH_DRAFT_KEY = 'urep_national_youth_draft';

export interface NationalYouthDraft {
  stakeholder: string;
  reason: string;
  expectation: string;
  organization: string;
  youth_focused_organization: string;
  application: string;
  previous_engagement: string;
  benefited_from_fmyd: string;
  urgent_priority: string;
  geopolitical_zone: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function formatErrorDetails(details: unknown): string {
  if (typeof details === 'string') return details;
  if (Array.isArray(details)) {
    return details
      .filter((detail): detail is string => typeof detail === 'string')
      .join(' ');
  }
  if (!isRecord(details)) return '';

  return Object.entries(details)
    .flatMap(([field, value]) => {
      if (typeof value === 'string') return [`${field}: ${value}`];
      if (Array.isArray(value)) {
        return value
          .filter((detail): detail is string => typeof detail === 'string')
          .map((detail) => `${field}: ${detail}`);
      }
      return [];
    })
    .join(' ');
}

export function isNationalYouthDraft(value: unknown): value is NationalYouthDraft {
  return isRecord(value)
    && typeof value.stakeholder === 'string'
    && typeof value.reason === 'string'
    && typeof value.expectation === 'string'
    && typeof value.organization === 'string'
    && typeof value.youth_focused_organization === 'string'
    && typeof value.application === 'string'
    && typeof value.previous_engagement === 'string'
    && typeof value.benefited_from_fmyd === 'string'
    && typeof value.urgent_priority === 'string'
    && typeof value.geopolitical_zone === 'string';
}

export async function postToApi<T>(path: string, body: Record<string, unknown>): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('The registration service is not configured. Please contact support.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Unable to reach the registration service. Your entries are still here; please try again.');
  }

  const responseBody: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 409 && path === '/api/auth/register') {
      throw new Error('A user with this email already exists.');
    }

    const error = isRecord(responseBody) && typeof responseBody.error === 'string'
      ? responseBody.error
      : `The registration service returned an error (${response.status}). Please try again.`;
    const details = isRecord(responseBody) ? formatErrorDetails(responseBody.details) : '';
    const message = details ? `${error} ${details}` : error;
    throw new Error(message);
  }

  if (!isRecord(responseBody) || !('data' in responseBody)) {
    throw new Error('The registration service returned an invalid response. Please try again.');
  }

  return responseBody.data as T;
}
