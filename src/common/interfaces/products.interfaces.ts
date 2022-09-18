export interface GetProductsInterface {
  items: {
    _id: string;
    title: string;
    img?: string;
    createdAt: string;
    price: number;
    weight: number;
    weightType: string;
    author: string;
    phone: number;
    region: number;
    state: string;
    otg: string;
    description: string;
    ownTicket: boolean;
  }[];
}
