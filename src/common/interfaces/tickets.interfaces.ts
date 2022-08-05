export interface GetTicketsInterface {
  items: {
    date: string;
    dateTime: string;
    type: string;
    weightType: string;
    col: number;
    price: number;
    active: boolean;
    region: number;
    state: number;
    otg: number;
    name: string;
    phone: string;
    description: string;
    photo: string;
  }[];
}
