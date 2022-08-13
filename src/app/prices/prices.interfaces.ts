export interface GetPricesInterface {
  items: {
    name: string;
    list: {
      name: string;
      value: string;
    }[];
  }[];
}
