using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

    public ProductImageService(IProductImageRepository repo, AppDbContext context, IWebHostEnvironment env)
    {
        _repo = repo;
        _context = context;
        _env = env;
    }

    public async Task<ProductImage> UploadProductImageAsync(int productId, IFormFile file)
{
    var product = await _context.Products.FindAsync(productId);
    if (product == null) throw new Exception("Product not found");

    if (file == null || file.Length == 0)
        throw new Exception("File empty");

    // Sửa đoạn này:
    var rootPath = _env.WebRootPath ?? Directory.GetCurrentDirectory(); // fix null WebRootPath
    var imagesFolder = Path.Combine(rootPath, "wwwroot", "images", "products");

    if (!Directory.Exists(imagesFolder))
        Directory.CreateDirectory(imagesFolder);

    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
    var savePath = Path.Combine(imagesFolder, fileName);

    using (var stream = new FileStream(savePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    var productImage = new ProductImage
    {
        ProductId = productId,
        Url = $"/images/products/{fileName}",
        IsMain = false,
        Stock = 0
    };

    await _repo.AddAsync(productImage);
    await _repo.SaveChangesAsync();

    return productImage;
}
public async Task<IEnumerable<ProductImage>> GetImagesByProductIdAsync(int productId)
{
    var product = await _context.Products.FindAsync(productId);
    Console.WriteLine(product == null ? "Product not found!" : $"Product found: {product.Name}");

    var images = await _repo.GetByProductIdAsync(productId);
    Console.WriteLine($"Found {images.Count()} images");

    return images;
}

}

}
