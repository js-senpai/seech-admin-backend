export interface GetRequestsInterface {
  items: {
    img?: string;
    active?: boolean;
    _id: string;
    title: string;
    updatedAt: string;
    price: number;
    weight: number;
    weightType: string;
    author: string;
    phone: number;
    region: number;
    state: string;
    otg: string;
    description: string;
  }[];
}

export interface ISuccessfulRequest {
  ok: string;
}

export interface ITotalRequests {
  totalBuy: number;
  totalSell: number;
}
