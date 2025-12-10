using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;
using System.Xml.Linq;

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


        public async Task<List<Product>> GetAllProductsAsync()
        {
           try
    {
        return await _context.Products
            .Include(p => p.Material)
            .Include(p => p.Style)
            .Include(p => p.Gender)
            .Include(p => p.Origin)
            .Include(p => p.Category)
            .Include(p => p.ProductVariants) // Nếu muốn load biến thể luôn (cân nhắc performance)
             .Include(p => p.ProductImages)   // Nếu cần ảnh
            .AsSplitQuery()
            .ToListAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Lỗi API của GetAllProductsAsync: {ex.Message}");
        return new List<Product>();
    }
        }


        public async Task<Product?> GetProductDetailAsync(int productId)
        {
            return await _context.Products
                .Include(p => p.Material)
                .Include(p => p.Style)
                .Include(p => p.Gender)
                .Include(p => p.Origin)
                .Include(p => p.Category)
                .Include(p => p.ProductVariants)
                .Include(p => p.ProductImages)
                   .AsSplitQuery()
                .FirstOrDefaultAsync(p => p.ProductId == productId);
        }

        public async Task<List<Product>> GetProductByNameAsync(string productsnyname)
        {
            return await _context.Products
                 .Where(p => p.Name.Contains(productsnyname))
                 .Include(p => p.Material)
                 .Include(p => p.Style)
                 .Include(p => p.Gender)
                 .Include(p => p.Origin)
                 .Include(p => p.Category)
                 .Include(p => p.ProductVariants)
                 .Include(p => p.ProductImages)
                 .AsSplitQuery()
                 .ToListAsync();

        }

        public async Task DeleteProductsAsync(Product productid)
        {
            await Task.Run(() =>
            {
                _context.Products.Remove(productid);
                _context.SaveChanges();
            });
        }


public async Task UpdateProductAsync(Product product)
{
    try
    {
        _context.Products.Update(product);
        await _context.SaveChangesAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Lỗi khi cập nhật sản phẩm: {ex.Message}");
        throw;
    }
}


    }



}
