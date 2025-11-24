using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.ProductImageRepo_FD;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Services.ProductImageService_FD
{
public class ProductImageService : IProductImageService
{
    private readonly IProductImageRepository _repo;
    private readonly IWebHostEnvironment _env;

    public ProductImageService(IProductImageRepository repo, IWebHostEnvironment env)
    {
        _repo = repo;
        _env = env;
    }

    public async Task<List<ImageDetailDto>> GetImagesByProductIdAsync(int productId)
    {
        var images = await _repo.GetByProductIdWithRelationsAsync(productId);

        var dtos = images
            .OrderByDescending(img => img.IsMain)
            .Select(img => new ImageDetailDto
            {
                ImageId = img.ProductImageId,
                Url = img.Url,
                IsPrimary = img.IsMain,
                ProductId = img.ProductId,
                Product = img.Product == null ? null : new ProductSummaryDto
                {
                    Id = img.Product.ProductId,
                    Name = img.Product.Name,
                    Price = img.Product.Price,
                    Brand = img.Product.Brand
                },
                Variant = null // map nếu có variant
            }).ToList();

        return dtos;
    }

    public async Task<bool> AddProductImageAsync(int productId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

        var productImageFolder = Path.Combine(_env.ContentRootPath, "images", "products");
        if (!Directory.Exists(productImageFolder))
            Directory.CreateDirectory(productImageFolder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(productImageFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var productImage = new ProductImage
        {
            ProductId = productId,
            Url = $"/images/products/{fileName}",
            IsMain = false,
        };

        await _repo.AddAsync(productImage);
        await _repo.SaveChangesAsync();

        return true;
    }
}
}
