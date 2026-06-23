import { ApiService } from './apiService';
import { CreateInstitutionDto } from '@/types/api';

export interface InstitutionFilters {
  search?: string;
  code?: string;
  status?: string;
  phoneNumber?: string;
  emailAddress?: string;
  id?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export type StatusToggle = 'active' | 'inactive';

export class InstitutionService {
  /**
   * Registers a brand new enterprise institution profile.
   */
  public static async createInstitution(payload: CreateInstitutionDto): Promise<any> {
    return ApiService.post('/institutions/create-institution', payload);
  }

  /**
   * Fetches a paginated, filtered registry matrix of all institutions.
   */
  public static async getInstitutions({
    search = '',
    code = '',
    status = '',
    phoneNumber = '',
    emailAddress = '',
    id = '',
    createdBy = '',
    startDate = '',
    endDate = '',
    limit = 50,
    page = 1,
  }: InstitutionFilters = {}): Promise<any> {
    const queryParams = new URLSearchParams({
      search,
      code,
      status,
      phoneNumber,
      emailAddress,
      id,
      createdBy,
      'createdAt.to': endDate,
      'createdAt.from': startDate,
      limit: String(limit),
      page: String(page),
    });

    return ApiService.get(`/institutions?${queryParams.toString()}`);
  }

  /**
   * Retrieves profile details for a distinct isolated institution.
   */
  public static async getInstitution(id: string): Promise<any> {
    return ApiService.get(`/institutions?id=${encodeURIComponent(id)}`);
  }

  /**
   * Pulls the contextual directory of team members linked to an institution workspace.
   */
  public static async getTeamMembers(id: string): Promise<any> {
    return ApiService.get(`/institutions/users?institution=${encodeURIComponent(id)}`);
  }

  /**
   * Retrieves active platform configurations or membership tier allocations.
   */
  public static async getMemberships(): Promise<any> {
    return ApiService.get('/institutions/memberships');
  }

  /**
   * Dispatches a fresh workspace onboarding invitation to a target institutional admin.
   */
  public static async resendInvitation(id: string): Promise<any> {
    return ApiService.get(`/institutions/${encodeURIComponent(id)}/resend-invitation`);
  }

  /**
   * Toggles the top-level platform permission scope for an entire institution block.
   */
  public static async updateInstitutionStatus(id: string, status: StatusToggle): Promise<any> {
    return ApiService.put(`/institutions/${encodeURIComponent(id)}/update`, { status });
  }

  /**
   * Clears out an operator's multi-factor credentials if they run into authentication locking.
   */
  public static async reset2fa(id: string): Promise<any> {
    return ApiService.get(`/institutions/${encodeURIComponent(id)}/reset-user`);
  }

  /**
   * Modifies an individual user account's clearance status within a workspace team modal.
   */
  public static async updateIndividualStatus(id: string, status: StatusToggle): Promise<any> {
    return ApiService.put(`/institutions/${encodeURIComponent(id)}/update-user`, { status });
  }
}