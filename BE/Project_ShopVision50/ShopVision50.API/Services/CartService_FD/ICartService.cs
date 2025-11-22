using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.CartService_FD
{
    public interface ICartService
    {
        Task<CartDto?> GetCartByUserIdAsync(int userId);
        Task<bool> RemoveCartItemAsync(int cartItemId);
    }
}
