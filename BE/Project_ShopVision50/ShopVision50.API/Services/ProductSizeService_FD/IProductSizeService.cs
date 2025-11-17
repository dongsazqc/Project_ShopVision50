using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.ProductSizeService_FD
{
    public interface IProductSizeService
    {
        Task<IEnumerable<ProductSizeDto>> GetAllAsync();
    }
}
