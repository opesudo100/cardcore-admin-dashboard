import { ApiService } from './apiService';

// ==========================================
// Query Parameters Interface
// ==========================================
export interface CardProgramsFilterParams {
  search?: string;
  type?: string;
  scheme?: string;
  startDate?: string;
  endDate?: string;
  id?: string;
  institution?: string;
  limit?: number;
  page?: number;
}

// ==========================================
// Card Program Management Service
// ==========================================
export class CardProgramService {
  
  // Create a brand new card program configuration
  public static async createCardProgram(payload: any): Promise<any> {
    return ApiService.post('/card-programs', payload);
  }

  // Fetch all card programs with rich search/filter query parameters
  public static async getCardPrograms(filters: CardProgramsFilterParams = {}): Promise<any> {
    // Setting defaults to match your original Angular fallback values precisely
    const search = filters.search ?? '';
    const type = filters.type ?? '';
    const scheme = filters.scheme ?? '';
    const startDate = filters.startDate ?? '';
    const endDate = filters.endDate ?? '';
    const id = filters.id ?? '';
    const institution = filters.institution ?? '';
    const limit = filters.limit ?? 50;
    const page = filters.page ?? 1;

    // Use built-in URLSearchParams to build a perfectly encoded query string
    const queryParams: Record<string, string> = {
      search,
      type,
      'createdAt.from': startDate,
      'createdAt.to': endDate,
      scheme,
      institution,
      id,
      limit: String(limit),
      page: String(page),
    };

    return ApiService.get('/card-programs', queryParams);
  }

  // Fetch a specific card program configuration by query parameter ID
  public static async getCardProgram(id: string): Promise<any> {
    return ApiService.get('/card-programs', { id });
  }

  // Update base settings for an existing card program profile
  public static async updateCardProgram(id: string, payload: any): Promise<any> {
    return ApiService.put(`/card-programs/${id}/update`, payload);
  }

  // Isolated predictive search helper for programmatic lookup selectors
  public static async searchCardPrograms(search: string = ''): Promise<any> {
    return ApiService.get('/card-programs', { search });
  }

  // Delete a card program profile by setting active state flags to false
  public static async deleteCardProgram(id: string): Promise<any> {
    return ApiService.put(`/card-programs/${id}/update`, { active: false });
  }

  // Activate/Restore a card program configuration
  public static async activateCardProgram(id: string): Promise<any> {
    return ApiService.put(`/card-programs/${id}/update`, { active: true });
  }

  // Update production or staging keys bound to a specific card issuing architecture
  public static async updateProgramKeys(id: string, payload: any): Promise<any> {
    return ApiService.put(`/card-programs/keys/${id}/update`, payload);
  }
}