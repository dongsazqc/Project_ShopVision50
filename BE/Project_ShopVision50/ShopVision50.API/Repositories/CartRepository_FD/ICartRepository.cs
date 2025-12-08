using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Repositories.CartRepository_FD
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(int userId);
        Task<CartItem?> GetCartItemByIdAsync(int cartItemId);
        Task SaveChangesAsync();

        Task RemoveCartItemAsync(CartItem item);
        Task<ProductVariant?> GetProductVariantByIdAsync(int productVariantId);
        Task<CartItem?> GetCartItemByIdWithCartAsync(int cartItemId);

    void AddCart(Cart cart);
    void AddCartItem(CartItem cartItem);
    }
}
