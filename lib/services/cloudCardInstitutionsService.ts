import { cloudService } from './cloudService';

export interface InstitutionQueryParams {
  search?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export const cloudCardInstitutionsService = {
  // 1. Invite Institution
  inviteInstitution: async (payload: Record<string, any>) => {
    return await cloudService.post('/invite', payload);
  },

  // 2. Get All Institutions
  getInstitutions: async ({
    search = '',
    clientId = '',
    startDate = '',
    endDate = '',
    limit = 50,
    page = 1
  }: InstitutionQueryParams = {}) => {
    
    // Maps the arguments cleanly to the exact keys your API expects
    const params = {
      search,
      clientId,
      'createdAt.from': startDate, // Replaces &createdAt.from=${startDate}
      'createdAt.to': endDate,     // Replaces &createdAt.to=${endDate}
      page,
      limit
    };

    return await cloudService.get('/institutions', params);
  },

  // 3. Get Single Institution By ID
  getInstitution: async (id: string) => {
    return await cloudService.get('/institutions', { institutionId: id });
  },

  // 4. Resend Invitation
  resendInvitation: async (id: string) => {
    return await cloudService.get(`/institution/resend-invitation/${id}`);
  },

  // 5. Add HSM Key
  addHsmKey: async (id: string, payload: Record<string, any>) => {
    return await cloudService.patch(`/institution-key/${id}`, payload);
  }
};