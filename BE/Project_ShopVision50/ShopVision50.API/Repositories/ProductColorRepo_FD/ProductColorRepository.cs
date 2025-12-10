using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.ProductColorRepo_FD
{
    public class ProductColorRepository : IProductColorRepository
    {
        private readonly AppDbContext _context;

        public ProductColorRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductColor>> GetAllAsync()
        {
            // Lấy toàn bộ màu sản phẩm, có thể include các khóa ngoại nếu cần
            return await _context.Colors
                //.Include(c => c.RelatedEntity) // nếu có FK liên quan
                .ToListAsync();
        }
    }
}
