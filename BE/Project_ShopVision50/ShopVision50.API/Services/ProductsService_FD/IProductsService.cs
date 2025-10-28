using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.ProductsService_FD
{


    public interface IProductsService
    {
        Task<List<ProductDto>> GetProductByNameAsync(string productName);
        Task<bool> AddProductAsync(ProductDto productDto);
        Task<List<ProductDto>> GetAllProductsAsync();
        Task<ServiceResult<string>> GetProductDetails(int productsDetailsId);
    }

}
