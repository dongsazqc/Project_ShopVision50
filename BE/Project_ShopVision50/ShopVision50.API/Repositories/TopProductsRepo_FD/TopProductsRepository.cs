using Microsoft.EntityFrameworkCore;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.TopProductsRepo_FD
{
    public class TopProductsRepository : ITopProductsRepository
    {
        private readonly AppDbContext _context;

        public TopProductsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<object>> GetTopProductsAsync(int limit)
        {
            var query =
                from oi in _context.OrderItems
                join o in _context.Orders on oi.OrderId equals o.OrderId
                join pv in _context.ProductVariants on oi.ProductVariantId equals pv.ProductVariantId
                join p in _context.Products on pv.ProductId equals p.ProductId
                where o.IsPaid == true   // trạng thái hoàn tất
                group oi by new { p.ProductId, p.Name } into g
                orderby g.Sum(x => x.Quantity) descending
                select new
                {
                    productId = g.Key.ProductId,
                    tenSanPham = g.Key.Name,
                    tongSoLuongBan = g.Sum(x => x.Quantity)
                };

            return await query.Take(limit).ToListAsync();
        }
    }
}
