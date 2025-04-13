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

export interface Mentor {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  createdAt: string;
  updatedAt: string;
}

export type Group = {
  _id?: string;
  name: string;
  description: string;
  freezeDuration?: number;
  freezeThreshold?: number;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  participantsCount?: number;
  isPublic?: boolean;
  isRegistrationOpen?: boolean;
  initialBalance: number;
  mentorId?: {
    firstname: string;
    _id: string;
    email: string;
    lastname: string;
  };
};

export type JoinRequest = {
  _id?: string;
  groupId: string;
  groupName: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
};
