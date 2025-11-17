using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Repositories.ProductVariantsRepo_FD;
using ShopVision50.Infrastructure;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class ProductVariantRepository : IProductVariantsRepo
{
    private readonly AppDbContext _context;
    public ProductVariantRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductVariant>> GetAllAsync()
    {
        return await _context.ProductVariants
            .Include(pv => pv.Color)
            .Include(pv => pv.Size)
            .Include(pv => pv.Product)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProductVariant>> GetByProductIdAsync(int productId)
    {
        return await _context.ProductVariants
            .Include(pv => pv.Color)
            .Include(pv => pv.Size)
            .Include(pv => pv.Product)
            .Where(pv => pv.ProductId == productId)
            .ToListAsync();
    }

    public async Task<ProductColor?> GetColorByNameAsync(string tenMau)
    {
        return await _context.Colors.FirstOrDefaultAsync(c => c.Name == tenMau);
    }

    public async Task<ProductSize?> GetSizeByNameAsync(string tenKichCo)
    {
        return await _context.Sizes.FirstOrDefaultAsync(s => s.Name == tenKichCo);
    }

    public async Task<Product?> GetProductByIdAsync(int productId)
    {
        return await _context.Products.FindAsync(productId);
    }

    public async Task AddAsync(ProductVariant variant)
    {
        await _context.ProductVariants.AddAsync(variant);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
