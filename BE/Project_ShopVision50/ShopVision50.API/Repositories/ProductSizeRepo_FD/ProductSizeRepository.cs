using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.ProductSizeRepo_FD
{
    public class ProductSizeRepository : IProductSizeRepository
    {
        private readonly AppDbContext _context;

        public ProductSizeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductSize>> GetAllAsync()
        {
            // Nếu ProductSize có FK, có thể include nếu cần
            return await _context.Sizes.ToListAsync();
        }
    }
}
