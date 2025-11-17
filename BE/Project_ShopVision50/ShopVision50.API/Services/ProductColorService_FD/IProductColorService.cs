using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.ProductColorService_FD
{
    public interface IProductColorService
    {
        Task<IEnumerable<ProductColorDto>> GetAllAsync();
    }
}
