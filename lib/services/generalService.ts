import { ApiService } from './apiService';
import { AuthService } from './authService';
import { SessionService } from './sessionService';
import { ISO3ResponseCode, ISO8583Fields } from '../constants/isoCode';

export interface PosDataCodeBreakdown {
  field: string;
  description: string;
  value: string;
  meaning: string;
}

// ============================================================================
// Core Operational & Parsing Helper Utilities
// ============================================================================
export class GeneralService {
  public static readonly months = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  public static readonly transactionResponseCodes = [
    { code: '00', message: 'Success', color: 'border-l-2 border-l-green-600', box: 'bg-green-600', text: 'text-green-600' },
    { code: '01', message: 'Pending', color: 'border-l-2 border-l-yellow-500', box: 'bg-yellow-500', text: 'text-yellow-500' },
    { code: '02', message: 'Failed', color: 'border-l-2 border-l-red-600', box: 'bg-red-600', text: 'text-red-600' },
    { code: '03', message: 'Insufficient Funds', color: 'border-l-2 border-l-orange-600', box: 'bg-orange-600', text: 'text-orange-600' },
    { code: '04', message: 'Transaction Error', color: 'border-l-2 border-l-red-500', box: 'bg-red-500', text: 'text-red-500' },
    { code: '05', message: 'Declined', color: 'border-l-2 border-l-red-700', box: 'bg-red-700', text: 'text-red-700' },
    { code: '06', message: 'Bank Unavailable', color: 'border-l-2 border-l-gray-600', box: 'bg-gray-600', text: 'text-gray-600' },
    { code: '07', message: 'Card Expired', color: 'border-l-2 border-l-purple-600', box: 'bg-purple-600', text: 'text-purple-600' },
    { code: '08', message: 'Invalid Card', color: 'border-l-2 border-l-pink-600', box: 'bg-pink-600', text: 'text-pink-600' },
    { code: '09', message: 'Limit Exceeded', color: 'border-l-2 border-l-blue-600', box: 'bg-blue-600', text: 'text-blue-600' },
    { code: '10', message: 'Duplicate Transaction', color: 'border-l-2 border-l-gray-500', box: 'bg-gray-500', text: 'text-gray-500' },
    { code: '11', message: 'Restricted Card', color: 'border-l-2 border-l-orange-500', box: 'bg-orange-500', text: 'text-orange-500' },
    { code: '12', message: 'Invalid Transaction', color: 'border-l-2 border-l-red-400', box: 'bg-red-400', text: 'text-red-400' },
    { code: '13', message: 'Security Violation', color: 'border-l-2 border-l-indigo-600', box: 'bg-indigo-600', text: 'text-indigo-600' },
    { code: '14', message: 'Issuer Unavailable', color: 'border-l-2 border-l-gray-400', box: 'bg-gray-400', text: 'text-gray-400' },
    { code: '15', message: 'Timeout', color: 'border-l-2 border-l-yellow-600', box: 'bg-yellow-600', text: 'text-yellow-600' },
  ];

  // ==========================================
  // Session / Storage Operations (Proxies to SessionService)
  // ==========================================

  public static getStorageData(key: string): any {
    return SessionService.getStorageData(key);
  }

  public static saveStorageData(key: string, value: any): void {
    SessionService.saveStorageData(key, value);
  }

  public static async getUserData(): Promise<{ statusCode: number; message: string }> {
    try {
      const res = await AuthService.getUserData();
      if (res?.statusCode === 200) {
        this.saveStorageData('core', res.data?.adminData);
        this.saveStorageData('membership', res.data?.membership);
        return { statusCode: res.statusCode, message: 'success' };
      }
      return { statusCode: res?.statusCode ?? 400, message: res?.message || 'Failed to retrieve profile data' };
    } catch (err) {
      return { statusCode: 500, message: 'Something went wrong' };
    }
  }

  public static logout(): void {
    SessionService.logout();
  }

  // ==========================================
  // Formatting & Mapping Helpers
  // ==========================================

  public static getAcronym(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').slice(0, 3);
  }

  public static formatPanNumber(pan: string): string {
    if (!pan) return '';
    if (pan.length <= 10) return pan;
    const firstSix = pan.slice(0, 6);
    const lastFour = pan.slice(-4);
    const maskedPart = '*'.repeat(pan.length - 10);
    return `${firstSix}${maskedPart}${lastFour}`;
  }

  public static getExpiryDate(month: number, year: string) {
    return {
      month: month.toString().length < 2 ? `0${month}` : String(month),
      year: year?.toString()?.slice(2) || '',
    };
  }

  public static getCardScheme(scheme: 'Verve' | 'Visa' | 'Mastercard' | 'AfriGo'): string {
    const assetMap = {
      AfriGo: '/assets/icons/afrigo.png',
      Visa: '/assets/icons/visa.svg',
      Verve: '/assets/icons/verve.svg',
      Mastercard: '/assets/icons/master.svg',
    };
    return assetMap[scheme] || assetMap['Mastercard'];
  }

  public static getResponseCode(code: any) {
    if (!code) return this.fallbackResponseCode(code);
    const matched = this.transactionResponseCodes.find(
      (c) => c.code === code || c.message.toLowerCase() === code.toString().toLowerCase()
    );
    return matched || this.fallbackResponseCode(code);
  }

  private static fallbackResponseCode(code: any) {
    return {
      code,
      message: '',
      color: 'border-l-2 border-l-slate-600',
      text: 'text-slate-600',
      box: 'bg-slate-600',
    };
  }

  public static formatAmount(amount: any): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    return formatter.format(amount).replace('$', '₦');
  }

  public static getExpiryMonths(totalMonths: number = 72): string[] {
    return Array.from({ length: totalMonths }, (_, i) => `${i + 1} month${i + 1 > 1 ? 's' : ''}`);
  }

  // ==========================================
  // Validation Assertions
  // ==========================================

  public static emailValidator(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static urlValidator(url: string): boolean {
    try {
      new URL(url);
      if (!url.includes('.')) return false;
      const sections = url.split('.');
      return sections.length >= 2 && sections[1].length >= 2;
    } catch {
      return false;
    }
  }

  public static validateIpAddress(ip: string): boolean {
    const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  }

  // ==========================================
  // Core Bank Routing APIs
  // ==========================================

  public static async getBanks(): Promise<any> {
    return ApiService.get('/util/banks');
  }

  public static async nameInquiry(payload: { bankCode: string; accountNumber: string }): Promise<any> {
    return ApiService.post('/util/name-enquiry', payload);
  }

  // ==========================================
  // Advanced ISO8583 / Telemetry Parsers
  // ==========================================

  public static getISOCodes(code: string) {
    return ISO3ResponseCode.find((res) => res.code === code) || {
      code,
      description: 'N/A',
      color: 'border-l-2 border-l-slate-600',
      text: 'text-slate-600',
      box: 'bg-slate-600',
    };
  }

  public static getISOFields(code: string) {
    return ISO8583Fields.find((res) => res.field === code) || {
      field: code,
      description: '',
      color: 'border-l-2 border-l-slate-600',
      box: 'bg-slate-600',
      text: 'text-slate-600',
    };
  }

  public static decodePosDataCode(code: string): PosDataCodeBreakdown[] {
    if (!/^\d{15}$/.test(code)) {
      throw new Error('POS Data Code must be a 15-digit numeric string.');
    }

    const interpretations: Record<number, Record<string, string>> = {
      0: { '5': 'Chip, magstripe, manual entry' },
      1: { '1': 'Signature only' },
      2: { '0': 'No card capture' },
      3: { '1': 'Attended terminal' },
      4: { '0': 'Chip card' },
      5: { '1': 'Signature' },
      6: { '5': 'Print + display output' },
      7: { '1': 'Encrypted PIN pad' },
      8: { '3': 'Terminal type: attended POS' },
      9: { '4': 'Terminal subtype: EMV capable' },
      10: { '4': 'Chip read entry' },
      11: { '1': 'Terminal supports data authentication' },
      12: { '0': 'No cardholder verification method (CVM)' },
      13: { '1': 'CVM results supported' },
      14: { '0': 'No card capture capability' },
    };

    const labels = [
      'Terminal Input Capability', 'Cardholder Authentication Capability', 'Card Capture Capability',
      'Operating Environment', 'Card Data Input Mode', 'Cardholder Authentication Method',
      'Terminal Output Capability', 'PIN Capture Capability', 'Terminal Type', 'Terminal Subtype',
      'POS Entry Mode', 'Terminal Data Authentication', 'CVM Supported', 'CVM Result Capability',
      'Card Capture Capability'
    ];

    return code.split('').map((char, idx) => ({
      field: `${idx + 1}`,
      description: labels[idx],
      value: char,
      meaning: interpretations[idx]?.[char] ?? 'Unknown or not interpreted',
    }));
  }
}
