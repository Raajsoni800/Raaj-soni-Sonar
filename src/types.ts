export interface Business {
  id: string;
  name: string;
  baseCost: number;
  baseRevenue: number;
  description: string;
  icon: string;
  owned: number;
  locked: boolean;
}

export interface GameState {
  balance: number;
  lifetimeEarnings: number;
  clickValue: number;
  businesses: Business[];
  lastUpdate: number;
}
