export interface LeadSubmissionPayload {
  email: string;
  companyName: string;
  campaignSource?: string;
}

export async function handleLeadCaptureSlot(payload: LeadSubmissionPayload) {
  return {
    accepted: true,
    leadId: `lead-${Date.now()}`,
    companyName: payload.companyName,
  };
}
