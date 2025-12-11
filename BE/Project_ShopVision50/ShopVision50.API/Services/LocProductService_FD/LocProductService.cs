using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.LocProductRepo_FD;

namespace ShopVision50.API.Services.LocProductService_FD
{
    public class LocProductService : ILocProductService
    {
        private readonly ILocProductRepository _repo;

        public LocProductService(ILocProductRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<ProductDto>> GetProductsByCategoryNameAsync(string categoryName)
        {
            var products = await _repo.GetProductsByCategoryNameAsync(categoryName);

            return products.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Brand = p.Brand,
                Warranty = p.Warranty,
                CreatedDate = p.CreatedDate,
                Status = p.Status,
                CategoryId = p.CategoryId,
                MaterialId = p.MaterialId,
                GenderId = p.GenderId,
                OriginId = p.OriginId,
                StyleId = p.StyleId,

                ProductImages = p.ProductImages?.Select(img => new ProductImageDto
                {
                    ProductImageId = img.ProductImageId,
                    Url = img.Url,
                    IsMain = img.IsMain,
                    ProductId = img.ProductId,
                }).ToList(),

                ProductVariants = p.ProductVariants?.Select(v => new ProductVariantDto
                {
                    ProductVariantId = v.ProductVariantId,
                    ProductId = v.ProductId,
                    SalePrice = v.SalePrice,
                    Stock = v.Stock,

                    ColorId = v.ColorId,
                    Color = v.Color == null ? null : new ProductColorDto
                    {
                        ColorId = v.Color.ColorId,
                        Name = v.Color.Name
                    },

                    SizeId = v.SizeId,
                    Size = v.Size == null ? null : new ProductSizeDto
                    {
                        SizeId = v.Size.SizeId,
                        Name = v.Size.Name
                    },

                    ProductOrder = new ProductOrderDto
                    {
                        ProductId = p.ProductId,
                        Name = p.Name,
                        Price = p.Price,
                        Brand = p.Brand ?? ""
                    }
                }).ToList()

            }).ToList();
        }
    }
}
