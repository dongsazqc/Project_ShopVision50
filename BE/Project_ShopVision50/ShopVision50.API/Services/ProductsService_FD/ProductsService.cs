using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories;
using ShopVision50.API.Repositories.ProductsRepo_FD;

namespace ShopVision50.API.Services.ProductsService_FD
{
    public class ProductsService : IProductsService
    {
        private readonly IProductsRepo _productsRepo;
        public ProductsService(IProductsRepo productsRepo)
        {
            _productsRepo = productsRepo;
        }

        public async Task<bool> AddProductAsync(ProductDto productDto)
        {
            try
            {
                var product = new Product
                {
                    Name = productDto.Name,
                    Price = productDto.Price,
                    Description = productDto.Description,
                    Brand = productDto.Brand,
                    Warranty = productDto.Warranty,
                    CreatedDate = DateTime.Now,
                    Status = productDto.Status,
                    MaterialId = productDto.MaterialId,
                    StyleId = productDto.StyleId,
                    GenderId = productDto.GenderId,
                    OriginId = productDto.OriginId,
                    CategoryId = productDto.CategoryId
                };

                await _productsRepo.AddProductAsync(product);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi ở Service AddProductAsync: {ex.Message}");
                return false;
            }
        }


        public async Task<List<ProductDto>> GetProductByNameAsync(string productName)
        {
            try
            {
                var products = await _productsRepo.GetProductByNameAsync(productName);
                if (products == null || products.Count == 0)
                {
                    return null; // Hoặc trả về một danh sách rỗng tuỳ theo yêu cầu
                }
                else
                {
                    var productDtoList = new List<ProductDto>(); // khởi tạo productDtoList là 1 list rỗng kiểu ProductDto để chứa dữ liệu trả về

                    foreach (var p in products) // chổ này là khởi tạo 1 biến p để duyệt từng thằng product trong biến products
                    {
                        var productDto = new ProductDto()  // khởi tạo biến productDto kiểu ProductDto để chứa dữ liệu từng product
                        {
                            ProductId = p.ProductId,
                            Name = p.Name,
                            Price = p.Price,
                            Description = p.Description
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
                        var productDto = new ProductDto()  // khởi tạo biến productDto kiểu ProductDto để chứa dữ liệu từng product
                        {
                            ProductId = p.ProductId,
                            Name = p.Name,
                            Price = p.Price,
                            Description = p.Description
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
                return ServiceResult<Product>.Ok(productVariant, "Lấy chi tiết sản phẩm thành công");
            }
            else
            {
                return ServiceResult<Product>.Fail("Không tìm thấy chi tiết sản phẩm");
            }
        }
    }

}