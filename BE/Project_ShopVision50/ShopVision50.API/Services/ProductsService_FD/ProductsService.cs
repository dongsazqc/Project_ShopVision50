using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories;
using ShopVision50.API.Repositories.ProductsRepo_FD;
using System.Xml.Linq;
using System.Linq;

    namespace ShopVision50.API.Services.ProductsService_FD
    {
        public class ProductsService : IProductsService
        {
            private readonly IProductsRepo _productsRepo;
            public ProductsService(IProductsRepo productsRepo)
            {
                _productsRepo = productsRepo;
            }

            public async Task<bool> AddProductAsync(Product product)
            {
                try
                {
                    if (product == null)
                        return false;

                    await _productsRepo.AddProductAsync(product);
                    return true;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi ở Service AddProductAsync: {ex.Message}");
                    return false;
                }
            }
        public async Task<List<ProductDto>> GetAllProductsAsync()
        {
            try
            {
                var products = await _productsRepo.GetAllProductsAsync();
                if (products == null || products.Count == 0)
                    return null;

                var productDtoList = new List<ProductDto>();
                foreach (var p in products)
                {
                    var productDto = new ProductDto()
                    {
                        ProductId = p.ProductId,
                        Name = p.Name,
                        Price = p.Price,
                        Description = p.Description,
                        Brand = p.Brand,
                        CategoryId = p.CategoryId,
                        MaterialId = p.MaterialId,
                        StyleId = p.StyleId,
                        GenderId = p.GenderId,
                        OriginId = p.OriginId,
                        CreatedDate = p.CreatedDate,
                        Warranty = p.Warranty,
                        Status = p.Status
                    };

                    if (p.ProductVariants != null && p.ProductVariants.Any())
                    {
                        productDto.ProductVariants = p.ProductVariants.Select(v => new ProductVariantDto
                        {
                            ProductVariantId = v.ProductVariantId,
                            SalePrice = v.SalePrice,
                            Stock = v.Stock,
                            SizeId = v.SizeId,
                            Size = v.Size == null ? null : new ProductSizeDto { SizeId = v.Size.SizeId, Name = v.Size.Name },
                            ColorId = v.ColorId,
                            Color = v.Color == null ? null : new ProductColorDto { ColorId = v.Color.ColorId, Name = v.Color.Name },
                            ProductId = v.ProductId
                        }).ToList();
                    }

                    if (p.ProductImages != null && p.ProductImages.Any())
                    {
                        productDto.ProductImages = p.ProductImages.Select(img => new ProductImageDto
                        {
                            ProductImageId = img.ProductImageId,
                            Url = img.Url,
                            IsMain = img.IsMain,
                            // Stock = img.Stock,
                            ProductId = img.ProductId
                        }).ToList();
                    }

                    productDtoList.Add(productDto);
                }

                return productDtoList;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

            public async Task<ServiceResult<Product>> GetProductDetails(int productsDetailsId)
            {
                var productVariant = await _productsRepo.GetProductDetailAsync(productsDetailsId);
                if (productVariant != null)
                {
                    return await Task.FromResult(ServiceResult<Product>.Ok(productVariant, "Thêm sản phâm th"));
                }
                else
                {
                    return await Task.FromResult(ServiceResult<Product>.Fail("Không tìm thấy chi tiết sản phẩm"));
                }

            }
            

            public async Task<ServiceResult<List<ProductDto>>> GetProductByNameAsync(string productName)
            {
                var products = await _productsRepo.GetProductByNameAsync(productName);
                if (products != null && products.Any())
                {
                    var productDtos = products.Select(p => new ProductDto
                    {
                        ProductId = p.ProductId,
                        Name = p.Name,
                        Description = p.Description,
                        Price = p.Price,
                        Brand = p.Brand,
                        Warranty = p.Warranty,
                        Status = p.Status,
                    }).ToList();

                    return ServiceResult<List<ProductDto>>.Ok(productDtos, "Lấy sản phẩm thành công");
                }
                else
                {
                    return ServiceResult<List<ProductDto>>.Fail("Không tìm thấy sản phẩm");
                }
            }

            public async Task<ServiceResult<string>> DeleteProductsAsync(int productId)
            {
                var product =await _productsRepo.GetProductDetailAsync(productId);
                if (product != null)
                {
                await  _productsRepo.DeleteProductsAsync(product);
                    return await Task.FromResult(ServiceResult<string>.Ok(null, "Xóa sản phẩm thành công"));
                }
                else
                {
                    return await Task.FromResult(ServiceResult<string>.Fail("Không tìm thấy sản phẩm để xóa"));

                }
            }

            public async Task<ServiceResult<string>> UpdateProductAsync(int productId, ProductDto dto)
    {
        try
        {
            var product = await _productsRepo.GetProductDetailAsync(productId);
            if (product == null)
                return ServiceResult<string>.Fail("Không tìm thấy sản phẩm để cập nhật");

            // Cập nhật dữ liệu
            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.Brand = dto.Brand;
            product.Warranty = dto.Warranty;
            product.Status = dto.Status;
            product.CategoryId = dto.CategoryId;
            product.MaterialId = dto.MaterialId;
            product.StyleId = dto.StyleId;
            product.GenderId = dto.GenderId;
            product.OriginId = dto.OriginId;

            await _productsRepo.UpdateProductAsync(product);

            return ServiceResult<string>.Ok(null, "Cập nhật sản phẩm thành công!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi ở Service UpdateProductAsync: {ex.Message}");
            return ServiceResult<string>.Fail("Cập nhật sản phẩm thất bại.");
        }
    }


        }
    }