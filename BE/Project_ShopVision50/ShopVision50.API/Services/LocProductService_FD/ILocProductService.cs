using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.LocProductService_FD
{
    public interface ILocProductService
    {
        Task<List<ProductDto>> GetProductsByCategoryNameAsync(string categoryName);
    }
}
