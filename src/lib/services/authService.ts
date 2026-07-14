import { ApiService } from './apiService';

// ==========================================
// Auth DTOs & Interfaces
// ==========================================
export interface SignInDto {
  username?: string;
  email?: string;
  password?: string;
  [key: string]: any; // Catch-all for extra payload fields
}

export interface OtpDto {
  code: string;
  [key: string]: any;
}

export interface UpdatePasswordPayload {
  password: string;
  passwordConfirmation: string;
  oldPassword?: string;
  token?: string;
}

// ==========================================
// Authentication & User Management Service
// ==========================================
export class AuthService {
  
  /**
   * Logs in a user.
   * Catches exceptions directly to return a structured state response payload 
   * and satisfy Next.js dev runtime error handlers.
   */
  public static async signIn(payload: SignInDto): Promise<any> {
    return ApiService.post('/login', payload);
  }

  // Verify 2FA OTP Code
  public static async verify2fa(payload: OtpDto): Promise<any> {
    return ApiService.post('/verify-two-factor', payload);
  }

  // Fetch current authenticated user's profile info
  public static async getUserData(): Promise<any> {
    return ApiService.get('/me');
  }

  // Update password / Forgot password completion
  public static async updatePassword(payload: UpdatePasswordPayload): Promise<any> {
    return ApiService.post('/update-password', payload);
  }

  // Fetch all admin/team users
  public static async getAllUsers(): Promise<any> {
    return ApiService.getCore('/users');
  }

  // Invite a new member to the platform
  public static async inviteUser(payload: any): Promise<any> {
    return ApiService.postCore('/users/invite', payload);
  }

  // Update a specific admin user's configuration
  public static async updateAdminUser(id: string, payload: any): Promise<any> {
    return ApiService.putCore(`/users/${id}/update`, payload);
  }

  // Update user status
  public static async updateStatus(payload: any): Promise<any> {
    return ApiService.postCore('/users/invite', payload);
  }

  // Resend team invitation email
  public static async resendInvite(id: string): Promise<any> {
    return ApiService.getCore(`/users/invite/${id}/resend/`);
  }

  // Delete a specific admin user
  public static async deleteAdminUser(id: string): Promise<any> {
    return ApiService.deleteCore(`/users/${id}`);
  }

  // Request/Generate 2FA configuration secret
  public static async enable2fa(payload: any): Promise<any> {
    return ApiService.put('/enable-two-factor', payload);
  }

  // Verify and fully turn on 2FA for account
  public static async activate2fa(payload: any): Promise<any> {
    return ApiService.post('/activate-two-factor', payload);
  }
}
