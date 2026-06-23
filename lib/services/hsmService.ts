import { ApiService } from './apiService';
import type { CreateHsmDto, Hsm, ApiResponse } from '@/types/api';

export interface HsmFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class HsmService {
  /**
   * Registers or provisions a new Hardware Security Module (HSM) configuration.
   */
  public static async createHsm(payload: CreateHsmDto): Promise<ApiResponse<Hsm>> {
    return ApiService.post('/hsm', payload);
  }

  /**
   * Fetches a paginated, filtered registry log of all active HSM clusters.
   */
  public static async getHsms({
    search = '',
    startDate = '',
    endDate = '',
    page = 1,
    limit = 50,
  }: HsmFilters = {}): Promise<ApiResponse<Hsm[]>> {
    // Constructing query string using dynamic template parameters matching your API schema
    const query = `search=${encodeURIComponent(search)}&createdAt.to=${encodeURIComponent(endDate)}&createdAt.from=${encodeURIComponent(startDate)}&page=${page}&limit=${limit}`;
    
    return ApiService.get(`/hsm?${query}`);
  }
}