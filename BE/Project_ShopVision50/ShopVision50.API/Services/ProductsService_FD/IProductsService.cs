using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.ProductsService_FD
{


    public interface IProductsService
    {
        Task<bool> AddProductAsync(Product product);
        Task<List<ProductDto>> GetAllProductsAsync();
        Task<ServiceResult<Product>> GetProductDetails(int productsDetailsId);
        Task<ServiceResult<List<ProductDto>>> GetProductByNameAsync(string productName);
        Task <ServiceResult<string>> DeleteProductsAsync(int productId);
        Task<ServiceResult<string>> UpdateProductAsync(int productId, ProductDto dto);
        

    }

}
