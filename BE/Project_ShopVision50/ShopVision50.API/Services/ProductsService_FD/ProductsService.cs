    using Shop_Db.Models;
    using ShopVision50.API.Models.Users.DTOs;
    using ShopVision50.API.Repositories;
    using ShopVision50.API.Repositories.ProductsRepo_FD;
    using System.Xml.Linq;

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
                    {

                        return null;
                    }
                    else
                    {
                        var productDtoList = new List<ProductDto>(); // khởi tạo productDtoList là 1 list rỗng kiểu ProductDto để chứa dữ liệu trả về
                        foreach (var p in products) // chổ này là khởi tạo 1 biến p để duyệt từng thằng product trong biến products
                        {
                           var productDto = new ProductDto()
                            {
                                ProductId = p.ProductId,
                                Name = p.Name,
                                Price = p.Price,
                                Description = p.Description,
                                Brand = p.Brand,
                                // Chưa map categoryId, materialId...
                                CategoryId = p.CategoryId,
                                MaterialId = p.MaterialId,
                                StyleId = p.StyleId,
                                GenderId = p.GenderId,
                                OriginId = p.OriginId,
                            };

                            productDtoList.Add(productDto); // thêm từng thằng productDto vào trong productDtoList
                        }
                        return productDtoList;  // trả về cái thằng productDtoList mà trong hợp đồng có
                    }
                }
                catch (Exception ex)
                {
                    return null; // Tránh null reference
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