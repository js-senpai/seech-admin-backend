export interface GetTicketsInterface {
  items: {
    _id: string;
    checked: boolean;
    date: string;
    dateTime: string;
    type: string;
    weightType: string;
    col: number;
    price?: number;
    active: boolean;
    region: number;
    state: string;
    otg: string;
    name: string;
    phone: number;
    description: string;
  }[];
}
