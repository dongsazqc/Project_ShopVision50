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

        public async Task<Product?> GetProductDetailAsync(int productId)
        {
            var product = await _context.Products                      //  Lấy dữ liệu từ bảng Products
                .Include(p => p.Category)                              //  Join bảng Category (danh mục)
                .Include(p => p.Material)                              //  Join bảng Material (chất liệu)
                .Include(p => p.Style)                                 //  Join bảng Style (kiểu dáng)
                .Include(p => p.Origin)                                //  Join bảng Origin (xuất xứ)
                .Include(p => p.Gender)                                //  Join bảng Gender (giới tính)
                .Include(p => p.ProductImages)                         //  Join bảng ProductImages (ảnh sản phẩm)
                .Include(p => p.ProductVariants)                       //  Join bảng ProductVariants (các biến thể)
                    .ThenInclude(v => v.Color)                         //  Join tiếp bảng Color của từng biến thể
                .Include(p => p.ProductVariants)                       //  Join lại ProductVariants
                    .ThenInclude(v => v.Size)                          //  Join tiếp bảng Size của từng biến thể
                .FirstOrDefaultAsync(p => p.ProductId == productId);   //  Lấy sản phẩm đầu tiên có ProductId khớp

            return product;                                            // 🔁 Trả về Product entity (nếu không có => null)
        }

    }
}
    


