export interface GetTicketsInterface {
  items: {
    date: string;
    dateTime: string;
    type: string;
    col: number;
    active: boolean;
    region: number;
    state: number;
    otg: number;
    description: string;
    photo: string;
  }[];
}
