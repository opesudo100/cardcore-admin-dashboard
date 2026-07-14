// Authentication DTOs
export interface SignInDto {
  email: string;
  password: string;
}

export interface OtpDto {
  trackingId: string;
  code: string;
  method?: "SmsOTP" | "EmailOTP" | "TOTP" | "PIN";
}

// Institution DTOs
export interface FormDto {
  name:
    | "name"
    | "code"
    | "websiteUrl"
    | "institutionEmail"
    | "institutionPhone"
    | "firstName"
    | "lastName"
    | "otherNames"
    | "adminEmail"
    | "adminPhone"
    | "city"
    | "state"
    | "country"
    | "street"
    | "serviceCode"
    | "panPrefix"
    | "panLength"
    | "panStart"
    | "panEnd"
    | "maxExpiry"
    | "mkac"
    | "mksmi"
    | "mksmc"
    | "cvk"
    | "pek"
    | "settlementAccount"
    | "issuer"
    | "seqNumber";
  form?: "form1" | "form2" | "form3";
  value: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface CreateInstitutionDto {
  name: string;
  code: string;
  registrationCountry: string;
  websiteUrl: string;
  institutionEmail: string;
  institutionPhone: string;
  firstName: string;
  lastName: string;
  otherNames: string;
  adminEmail: string;
  adminPhone: string;
  address: Address;
}

// Institution Response Data Models
export interface HsmKeyDetails {
  keyUnderLmk: string;
  keyUnderLmkKcv: string;
  keyUnderZmk?: string;
  keyUnderZmkKcv?: string;
  zmk?: string;
}

export interface InstitutionHsmKeys {
  KEK: HsmKeyDetails | null;
  ZMK: HsmKeyDetails | null;
  MKAC: HsmKeyDetails | null;
  CVK: HsmKeyDetails | null;
  PEK?: HsmKeyDetails | null;
}

export interface Institution {
  id: string;
  name: string;
  email: string;
  emailAddress?: string;
  phone: string;
  phoneNumber?: string;
  type: string;
  walletId: string;
  createdAt: string;
  registrationNumber?: string;
  hsmKeys?: InstitutionHsmKeys;
}

// Billing / Invoice Models
export interface InstitutionInvoice {
  institution: { name: string };
  totalHostingCost: number;
  totalKeyCost: number;
  totalProvisioningCost: number;
  totalProvisioningCount: number;
  totalReProvisioningCount: number;
}

export interface Invoice {
  _id: string;
  client: { name: string };
  amount: number;
  status: "completed" | "pending";
  createdAt: string;
  totalHostingCost: number;
  totalKeyCost: number;
  totalProvisioningCost: number;
  totalProvisioningCount: number;
  totalReProvisioningCount: number;
  institutionInvoice: InstitutionInvoice[];
}

export interface Pagination {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

// Common API Response Wrapper
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: Pagination;
  failed: boolean;
}

export interface TwoFactorMethod {
  type: "TOTP" | "EmailOTP" | "SmsOTP" | "PIN";
  enabled: boolean;
}

export interface AuthResponseData {
  adminData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  membership: any;
  secret?: string;
  token?: string;
  twoFactorRequired?: boolean;
  trackingId?: string;
  twoFactorMethods?: TwoFactorMethod[];
  access_token?: { access_token: string };
}

export interface CreateHsmDto {
  code: string;
  ip: string;
  port: number;
  isPrimary: boolean;
  status: "active" | "inactive" | "maintenance" | "error";
}

export interface Hsm {
  id: string;
  _id?: string;
  code: string;
  ip: string;
  port: number;
  isPrimary: boolean;
  status: "active" | "inactive" | "maintenance" | "error";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
