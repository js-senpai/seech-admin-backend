export interface GetKpiMonthlyStatisticInterface {
  items: {
    date: string;
    totalUsers: number;
    activeUsers: number;
    ratingOfService: number;
    totalSaleTickets: number;
    totalBuyTickets: number;
  }[];
}
