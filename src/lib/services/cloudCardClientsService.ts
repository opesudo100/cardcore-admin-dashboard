import { cloudService } from './cloudService';

export interface ClientQueryParams {
  search?: string;
  clientId?: string;
  limit?: number;
  page?: number;
}

export const cloudCardClientsService = {
  // 1. Get Clients
  getClients: async ({
    search = '',
    clientId = '',
    limit = 10,
    page = 1
  }: ClientQueryParams = {}) => {
    
    // Instead of string concatenation, pass a structured params object
    const params = {
      search,
      clientId,
      limit,
      page
    };

    return await cloudService.get('/clients', params);
  },

  // 2. Add Kek / Update Client
  // Replaced 'any' with a generic Record type, but you should ideally map this to a proper interface later
  addKek: async (payload: Record<string, any>) => {
    return await cloudService.post('/update-client', payload);
  }
};