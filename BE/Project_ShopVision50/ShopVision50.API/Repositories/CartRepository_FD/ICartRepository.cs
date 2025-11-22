using Shop_Db.Models;

namespace ShopVision50.API.Repositories.CartRepository_FD
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(int userId);
        Task<CartItem?> GetCartItemByIdAsync(int cartItemId);
        Task SaveChangesAsync();
        Task RemoveCartItemAsync(CartItem item);
    }
}
