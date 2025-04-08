export interface Position {
  id: string;
  platform: string;
  type: string;
  symbol: string;
  openPrice: number;
  currentPrice: number;
  volume: number;
  profit: number;
  time: string;
  updateTime: string;
}

export interface Deal {
  id: string;
  symbol?: string;
  type: string;
  entryPrice?: number;
  closePrice?: number;
  volume?: number;
  profit: number;
  time: string;
  positionId?: string;
  orderId?: string;
}

export interface Order {
  id: string;
  symbol: string;
  type: string;
  price: number;
  volume: number;
  status: string;
}

export interface Account {
  userId: string;
  accountId: string;
  name: string;
  groupId: string;
  freezeCount: number;
  pnlPercentage: number;
  tradeCount: number;
  deals: Deal[];
  positions: Position[];
  orders: Order[];
  balance: number;
  equity: number;
  profitLoss: number;
  firstName: string;
  lastName: string;
  email: string;
  phonenumber: number;
}

export interface UserData {
  account: Account;
}
