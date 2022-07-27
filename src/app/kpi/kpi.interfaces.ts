export interface GetKpiStatisticInterface {
  items: {
    totalUsers: number;
    activeUsers: number;
    ratingOfService: number;
    totalNewReg: number;
    totalSaleTickets: number;
    totalBuyTickets: number;
  }[];
}
