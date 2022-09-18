export interface GetKpiStatisticInterface {
  items: {
    totalUsers: number;
    activeUsers: number;
    ratingOfService: number;
    totalSaleTickets: number;
    totalBuyTickets: number;
  }[];
}
