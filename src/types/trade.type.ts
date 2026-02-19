export type Asset = {
  id: number;
  name: string;
};

export type Trade = {
  id: number | string;
  asset: Asset;
  expiration: number;
  amount: number;
  direction: number;
  payout: number;
  color?: string;
};
