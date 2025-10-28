using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.ProductsRepo_FD
{

    public class ProductsRepo : IProductsRepo
    {
        private readonly AppDbContext _context; // DbContext kết nối DB
        public ProductsRepo(AppDbContext context)
        {
            _context = context; // Inject AppDbContext vào repo
        }

        public async Task AddProductAsync(Product product)
        {
            try
            {
                await _context.Products.AddAsync(product);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi thêm sản phẩm: {ex.Message}");
                throw; // ném lại lỗi để service bắt
            }
        }

        public async Task<List<Product>> GetProductByNameAsync(string productsnyname)
        {
            try
            {
                return await _context.Products
                  .Where(p => p.Name.Contains(productsnyname)) // chứa tên giống nhau
                  .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi API của GetProductByNameAsync: {ex.Message}");
                return new List<Product>(); // Tránh null reference
            }
        }
        public async Task<List<Product>> GetAllProductsAsync()
        {
            try
            {
                return await _context.Products.ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi API của GetAllProductsAsync: {ex.Message}");
                return new List<Product>(); // Tránh null reference
            }
        }


        public async Task<ProductVariant> GetProductDetailAsync(int productVariantId)
        {
            return await _context.ProductVariants
                            .Include(pv => pv.Product)
                            .Include(pv => pv.Size)
                            .Include(pv => pv.Color)
                            .FirstOrDefaultAsync(pv => pv.ProductVariantId == productVariantId);
        }
    }


}
