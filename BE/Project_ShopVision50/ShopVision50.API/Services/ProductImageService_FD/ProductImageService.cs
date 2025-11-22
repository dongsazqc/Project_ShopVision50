using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Shop_Db.Models;
using ShopVision50.API.Repositories.ProductImageRepo_FD;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Services.ProductImageService_FD
{
    public class ProductImageService : IProductImageService
    {
        private readonly IProductImageRepository _repo;
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly string _imageFolderPath;

        public ProductImageService(IProductImageRepository repo, AppDbContext context, IWebHostEnvironment env)
        {
            _repo = repo;
            _context = context;
            _env = env;
            _imageFolderPath = Path.Combine(_env.ContentRootPath, "images");

            if (!Directory.Exists(_imageFolderPath))
                Directory.CreateDirectory(_imageFolderPath);
        }

public async Task<bool> AddProductImageAsync(int productId, IFormFile file)
{
    if (file == null || file.Length == 0)
        return false;

    // Tạo folder images/products nếu chưa có
    var productImageFolder = Path.Combine(_env.ContentRootPath, "images", "products");
    if (!Directory.Exists(productImageFolder))
        Directory.CreateDirectory(productImageFolder);

    // Tạo tên file mới tránh trùng
    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
    var filePath = Path.Combine(productImageFolder, fileName);

    // Lưu file vào ổ cứng
    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    // Tạo đối tượng ProductImage lưu vào DB
    var productImage = new ProductImage
    {
        ProductId = productId,
        Url = $"/images/products/{fileName}",
<<<<<<< HEAD
        IsMain = false
=======
        IsMain = false,

>>>>>>> main
    };

    await _repo.AddAsync(productImage);
    await _repo.SaveChangesAsync();

    return true;
}
        public async Task<IEnumerable<ProductImage>> GetImagesByProductIdAsync(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                Console.WriteLine("Product not found!");
                return Enumerable.Empty<ProductImage>();
            }

            var images = await _repo.GetByProductIdAsync(productId);
            Console.WriteLine($"Found {images.Count()} images");

            return images;
        }
    }
}
