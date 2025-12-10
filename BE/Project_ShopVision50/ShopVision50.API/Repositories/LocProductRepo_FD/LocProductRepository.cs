using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.LocProductRepo_FD
{
    public class LocProductRepository : ILocProductRepository
    {
        private readonly AppDbContext _context;

        public LocProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetProductsByCategoryNameAsync(string categoryName)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Include(p => p.ProductVariants)
                    .ThenInclude(v => v.Color)
                .Include(p => p.ProductVariants)
                    .ThenInclude(v => v.Size)
                .Where(p => p.Category != null &&
                            p.Category.Name.ToLower().Contains(categoryName.ToLower()))
                .ToListAsync();
        }
    }
}
