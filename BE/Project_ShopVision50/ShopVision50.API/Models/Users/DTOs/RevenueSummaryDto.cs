using System;
using System.Collections.Generic;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class RevenueSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TotalCustomers { get; set; }
        public List<TopCustomerDto> TopCustomers { get; set; } = new();
        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
    }

    // ------------------ TOP CUSTOMER ------------------
    public class TopCustomerDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public decimal TotalSpent { get; set; }
        public int OrderCount { get; set; }
    }

    // ------------------ TOP PRODUCTS ------------------
    public class TopProductDto
    {
        public int ProductVariantId { get; set; }   // cần cho group by variant
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;

        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
    }

    // ------------------ MONTHLY REVENUE ------------------
    public class MonthlyRevenueDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal Revenue { get; set; }
    }
}
