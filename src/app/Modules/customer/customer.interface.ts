export type TCustomer = {
  name: string;
  phone: string;
  address: string;
  previousDue?: number;
  type?: string
  lastTxnAt: Date;
  status: boolean;
};
