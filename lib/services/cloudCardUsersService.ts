import { cloudService } from './cloudService';

export interface UserQueryParams {
  search?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export const cloudCardUsersService = {
  // 1. Invite User
  inviteUser: async (payload: Record<string, any>) => {
    return await cloudService.post('/invite', payload);
  },

  // 2. Get All Users
  getUsers: async ({
    search = '',
    clientId = '',
    startDate = '',
    endDate = '',
    limit = 50,
    page = 1
  }: UserQueryParams = {}) => {
    
    // Clean key-value object mappings for Axios to safely encode
    const params = {
      search,
      clientId,
      'createdAt.from': startDate, // Maps directly to &createdAt.from=
      'createdAt.to': endDate,     // Maps directly to &createdAt.to=
      page,
      limit
    };

    return await cloudService.get('/users', params);
  },

  // 3. Get Single User (Preserved original API parameter logic)
  getUser: async (id: string) => {
    return await cloudService.get('/users', { institutionId: id });
  },

  // 4. Resend Invitation
  resendInvite: async (id: string) => {
    return await cloudService.get(`/resend-invite/${id}`);
  }
};