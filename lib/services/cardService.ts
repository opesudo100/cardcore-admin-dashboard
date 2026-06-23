import { ApiService } from './apiService';

// ==========================================
// Query Parameters Interface
// ==========================================
export interface CardsFilterParams {
  search?: string;
  type?: string;
  scheme?: string;
  id?: string;
  startDate?: string;
  endDate?: string;
  cardProgram?: string;
  limit?: number;
  page?: number;
}

// ==========================================
// Card Core Operational Service
// ==========================================
export class CardService {

  // Issue or request a brand new card instance
  public static async createCard(payload: any): Promise<any> {
    return ApiService.post('/card', payload);
  }

  // Fetch a list of all cards filtered by specific parameters
  public static async getCards(filters: CardsFilterParams = {}): Promise<any> {
    const search = filters.search ?? '';
    const type = filters.type ?? '';
    const scheme = filters.scheme ?? '';
    const cardProgram = filters.cardProgram ?? '';
    const limit = filters.limit ?? 50;
    const page = filters.page ?? 1;

    // Constructed parameter map mirroring your endpoint schema exactly
    const queryParams: Record<string, string> = {
      search,
      type,
      scheme,
      cardProgram,
      limit: String(limit),
      page: String(page),
    };

    return ApiService.get('/cards', queryParams);
  }

  // Fetch a single card item instance by explicit lookup ID query
  public static async getCard(id: string): Promise<any> {
    return ApiService.get('/cards', { id });
  }

  // Temporary freeze / lock operations targeting a single card profile
  public static async freezeCard(id: string): Promise<any> {
    return ApiService.delete(`/cards/${id}`);
  }
}