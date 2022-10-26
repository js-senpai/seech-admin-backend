export interface GetMyRequestsInterface {
  items: {
    _id: string;
    title: string;
    img?: string;
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

export interface ISuccessfulMyRequest {
  ok: string;
}
