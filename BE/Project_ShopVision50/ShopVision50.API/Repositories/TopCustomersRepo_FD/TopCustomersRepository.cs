using Microsoft.EntityFrameworkCore;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.TopCustomersRepo_FD
{
    public class TopCustomersRepository : ITopCustomersRepository
    {
        private readonly AppDbContext _context;

        public TopCustomersRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<object>> GetTopCustomersAsync(int limit)
        {
            var query =
                from o in _context.Orders
                join p in _context.Payments on o.OrderId equals p.OrderId
                join u in _context.Users on o.UserId equals u.UserId
                where p.Status == true   // 🔥 status là bool
                group o by new { o.UserId, u.FullName } into g
                orderby g.Sum(x => x.TotalAmount) descending
                select new
                {
                    userId = g.Key.UserId,
                    fullName = g.Key.FullName,
                    totalSpent = g.Sum(x => x.TotalAmount),
                    orderCount = g.Count()
                };

            return await query
                .Take(limit)
                .ToListAsync<object>();
        }
    }
}
