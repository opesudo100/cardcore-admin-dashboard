import { ApiService } from './apiService';

// ==========================================
// Dashboard Filter Parameters
// ==========================================
export interface MetricsFilterParams {
  month?: string;
  year?: string;
}

// ==========================================
// Data Metrics & Analytics Service
// ==========================================
export class DashboardService {

  /**
   * Fetch core dashboard status indicators and high-level card performance stats
   */
  public static async getMetrics(filters: MetricsFilterParams = {}): Promise<any> {
    const month = filters.month ?? '';
    const year = filters.year ?? '';

    return ApiService.get('/metrics', { month, year });
  }

  /**
   * Fetch structural card distribution groups filtered by card scheme types
   */
  public static async getCardScheme(year: string = ''): Promise<any> {
    return ApiService.get('/metrics/card-programs-by-scheme', { year });
  }

  /**
   * Fetch historic transactional volumes grouped sequentially by calendar month
   */
  public static async getTransactions(year: string = ''): Promise<any> {
    return ApiService.get('/metrics/transactions-by-month', { year });
  }
}