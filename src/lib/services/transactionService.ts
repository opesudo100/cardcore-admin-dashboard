import { ApiService } from './apiService';

type QueryParamValue = string | number;

export interface TransactionFilterParams {
  search?: string;
  id?: string;
  cardProgram?: string;
  limit?: number;
  page?: number;
  amountMax?: number;
  amountMin?: number;
  transmissiondateTo?: string;
  transmissiondateFrom?: string;
  endDate?: string;
  startDate?: string;
  tags?: string;
  wallet?: string;
  account?: string;
  card?: string;
  currencyCode?: string;
  responseCode?: string;
  reasonCode?: string;
  functionCode?: string;
  mcc?: string;
  rrn?: string;
  mid?: string;
  acquirer?: string;
  node?: string;
  localid?: string;
}

export interface TransactionRecord {
  _id?: string;
  id?: string;
  rrn?: string;
  terminalId?: string;
  stan?: string;
  amount?: number;
  currencyCode?: string;
  createdAt?: string;
  responseCode?: string;
  transactionStatus?: string;
  response?: Record<string, string>;
  institution?: {
    name?: string;
  };
  card?: {
    customer?: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
    };
  };
}

export interface TransactionListResponse {
  statusCode?: number;
  data?: TransactionRecord[];
  pagination?: {
    pages?: number;
    total?: number;
    page?: number;
  };
}

export type TransactionDetailResponse = Omit<TransactionListResponse, 'data'> & {
  data?: TransactionRecord[] | TransactionRecord;
};

export class TransactionService {
  public static async getTransactions(params: TransactionFilterParams = {}): Promise<TransactionListResponse> {
    const queryParams: Record<string, QueryParamValue> = {
      search: params.search || '',
      cardProgram: params.cardProgram || '',
      limit: params.limit || 50,
      page: params.page || 1,
      id: params.id || '',
      amountMax: params.amountMax ? params.amountMax : '',
      amountMin: params.amountMin ? params.amountMin : '',
      transmissiondateTo: params.transmissiondateTo || '',
      transmissiondateFrom: params.transmissiondateFrom || '',
      'createdAt.from': params.startDate || '',
      'createdAt.to': params.endDate || '',
      tags: params.tags || '',
      wallet: params.wallet || '',
      account: params.account || '',
      card: params.card || '',
      currencyCode: params.currencyCode || '',
      responseCode: params.responseCode || '',
      reasonCode: params.reasonCode || '',
      functionCode: params.functionCode || '',
      mcc: params.mcc || '',
      rrn: params.rrn || '',
      mid: params.mid || '',
      acquirer: params.acquirer || '',
      node: params.node || '',
      localid: params.localid || '',
    };

    return ApiService.get('/transactions', queryParams);
  }

  public static async getTransactionById(id: string): Promise<TransactionDetailResponse> {
    return ApiService.get('/transactions', { id });
  }
}
