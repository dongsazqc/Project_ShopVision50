using ShopVision50.Infrastructure;
using Microsoft.EntityFrameworkCore;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Repositories.RevenueSummary_FD
{
    public class RevenueRepository : IRevenueSummaryRepo
    {
        private readonly AppDbContext _context;

        public RevenueRepository(AppDbContext context)
        {
            _context = context;
        }

        public RevenueSummaryDto GetRevenueSummary(DateTime from, DateTime to)
{
    // Fix phạm vi ngày
    from = from.Date;
    to = to.Date.AddDays(1).AddTicks(-1);

    // Lấy Orders
    var orders = _context.Orders
        .Where(o => o.OrderDate >= from && o.OrderDate <= to && o.IsPaid == true)
        .ToList();

    var totalRevenue = orders.Sum(x => x.TotalAmount);
    var totalOrders = orders.Count;
    var totalCustomers = orders.Select(x => x.UserId).Distinct().Count();

    var topCustomers = orders
        .GroupBy(o => o.UserId)
        .Select(g => new TopCustomerDto
        {
            UserId = g.Key,
            TotalSpent = g.Sum(x => x.TotalAmount),
            OrderCount = g.Count()
        })
        .OrderByDescending(x => x.TotalSpent)
        .Take(5)
        .ToList();

    var orderIds = orders.Select(o => o.OrderId).ToList();

    var orderItems = _context.OrderItems
        .Where(oi => orderIds.Contains(oi.OrderId))
        .ToList();

    // Tạo Dictionary cho ProductVariants
var variants = _context.ProductVariants
    .ToList();

var topProducts = orderItems
    .GroupBy(oi => oi.ProductVariantId)
    .Select(g =>
    {
        var variant = variants.FirstOrDefault(v => v.ProductVariantId == g.Key);

        return new TopProductDto
        {
            ProductId = variant?.ProductId ?? 0,
            ProductName = variant?.Product?.Name ?? "Unknown",
            QuantitySold = g.Sum(x => x.Quantity),
            Revenue = g.Sum(x => x.Quantity * variant.SalePrice - x.DiscountAmount)
        };
    })
    .OrderByDescending(x => x.QuantitySold)
    .Take(10)
    .ToList();


    var monthlyRevenue = orders
        .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
        .Select(g => new MonthlyRevenueDto
        {
            Year = g.Key.Year,
            Month = g.Key.Month,
            Revenue = g.Sum(x => x.TotalAmount)
        })
        .OrderBy(x => x.Year)
        .ThenBy(x => x.Month)
        .ToList();

    return new RevenueSummaryDto
    {
        TotalRevenue = totalRevenue,
        TotalOrders = totalOrders,
        TotalCustomers = totalCustomers,
        TopCustomers = topCustomers,
        TopProducts = topProducts,
        MonthlyRevenue = monthlyRevenue
    };
}

    }
}
