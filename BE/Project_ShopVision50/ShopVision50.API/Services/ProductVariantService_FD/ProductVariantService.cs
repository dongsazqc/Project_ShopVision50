using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.ProductVariantsRepo_FD;
using ShopVision50.Infrastructure;

public class ProductVariantService : IProductVariantService
{
        private readonly AppDbContext _context;

    private readonly IProductVariantsRepo _repository;
    public ProductVariantService(IProductVariantsRepo repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<BienTheResponseDto>> GetAllAsync()
    {
        var variants = await _repository.GetAllAsync();

        return variants.Select(v => new BienTheResponseDto
        {
            ProductVariantId = v.ProductVariantId,
            GiaBan = v.SalePrice,
            SoLuongTon = v.Stock,
            TenMau = v.Color?.Name ?? "Unknown",
            TenKichCo = v.Size?.Name ?? "Unknown",
            ProductId = v.ProductId,
            TenSanPham = v.Product?.Name ?? "Unknown",
            DiscountPercent = 0 // Nếu m có chỗ lưu discount thì xử lý thêm
        });
    }

    public async Task<IEnumerable<BienTheResponseDto>> GetByProductIdAsync(int productId)
    {
        var variants = await _repository.GetByProductIdAsync(productId);

        return variants.Select(v => new BienTheResponseDto
        {
            ProductVariantId = v.ProductVariantId,
            GiaBan = v.SalePrice,
            SoLuongTon = v.Stock,
            TenMau = v.Color?.Name ?? "Unknown",
            TenKichCo = v.Size?.Name ?? "Unknown",
            ProductId = v.ProductId,
            TenSanPham = v.Product?.Name ?? "Unknown",
            DiscountPercent = 0
        });
    }

    public async Task<bool> CreateAsync(BienTheDto dto)
    {
        var color = await _repository.GetColorByNameAsync(dto.tenMau);
        if (color == null) return false;

        var size = await _repository.GetSizeByNameAsync(dto.tenKichCo);
        if (size == null) return false;

        var product = await _repository.GetProductByIdAsync(dto.ProductId);
        if (product == null) return false;

        var variant = new ProductVariant
        {
            ProductId = dto.ProductId,
            ColorId = color.ColorId,
            SizeId = size.SizeId,
            SalePrice = dto.giaBan,
            Stock = dto.soLuongTon,
            // discountPercent nếu lưu ở đâu thì xử lý sau
        };

        await _repository.AddAsync(variant);
        await _repository.SaveChangesAsync();

        return true;
    }
public async Task<ProductWithVariantsDto?> GetProductWithVariantsAsync(int productId)
{
    var product = await _repository.GetProductWithVariantsAsync(productId);
    if (product == null) return null;

    return new ProductWithVariantsDto
    {
        ProductId = product.ProductId,
        TenSanPham = product.Name,
        Variants = product.ProductVariants?.Select(v => new VariantDto
        {
            ProductVariantId = v.ProductVariantId,
            GiaBan = v.SalePrice,
            SoLuongTon = v.Stock,
            TenMau = v.Color?.Name ?? "Unknown",
            TenKichCo = v.Size?.Name ?? "Unknown"
        }).ToList() ?? new List<VariantDto>()
    };


    
}

    public async Task<IEnumerable<BienTheResponseDto>> GetVariantsByCategoryIdAsync(int categoryId)
    {
    var variants = await _repository.GetVariantsByCategoryIdAsync(categoryId);

    return variants.Select(v => new BienTheResponseDto
    {
        ProductVariantId = v.ProductVariantId,
        GiaBan = v.SalePrice,
        SoLuongTon = v.Stock,
        TenMau = v.Color?.Name ?? "Unknown",
        TenKichCo = v.Size?.Name ?? "Unknown",
        ProductId = v.ProductId,
        TenSanPham = v.Product?.Name ?? "Unknown",
        DiscountPercent = 0
    });    }
}
