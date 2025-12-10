using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.CartService_FD
{
    public interface ICartService
    {
        Task<CartDto?> GetCartByUserIdAsync(int userId);
        Task<bool> RemoveCartItemAsync(int cartItemId);
        Task AddToCartAsync(int userId, AddToCartRequest request);
        Task<CartItem?> GetCartItemByIdWithCartAsync(int cartItemId);

            Task<bool> IncreaseQuantityAsync(int cartItemId, int quantity);
            Task<bool> DecreaseQuantityAsync(int cartItemId, int quantity);
    }
}
