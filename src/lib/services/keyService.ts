import { ApiService } from './apiService';

export interface KeyFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  institution?: string;
  limit?: number;
  page?: number;
}

export class KeyService {
  /**
   * Generates or registers a fresh cryptographic key pair environment mapping.
   */
  public static async createKey(payload: any): Promise<any> {
    return ApiService.post('/keys', payload);
  }

  /**
   * Fetches a paginated roster log of encryption keys across distinct workspaces.
   */
  public static async getKeys({
    search = '',
    startDate = '',
    endDate = '',
    institution = '',
    limit = 50,
    page = 1,
  }: KeyFilters = {}): Promise<any> {
    const queryParams = new URLSearchParams({
      institution,
      'createdAt.to': endDate,
      'createdAt.from': startDate,
      search,
      page: String(page),
      limit: String(limit),
    });

    return ApiService.get(`/keys?${queryParams.toString()}`);
  }

  /**
   * Resolves explicit properties for a singular target cryptographic index.
   */
  public static async getKey(id: string): Promise<any> {
    return ApiService.get(`/keys?id=${encodeURIComponent(id)}`);
  }

  /**
   * Updates key profiles or changes rotation properties.
   */
  public static async updateKey(id: string, payload: any): Promise<any> {
    return ApiService.put(`/keys/${encodeURIComponent(id)}/update`, payload);
  }

  /**
   * Flags an active key matrix profile structure as obsolete or deleted.
   */
  public static async deleteKey(id: string): Promise<any> {
    return ApiService.delete(`/keys/${encodeURIComponent(id)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isDeleted: true }),
    });
  }
}
