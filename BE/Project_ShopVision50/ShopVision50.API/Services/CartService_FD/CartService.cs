using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.CartRepository_FD;

namespace ShopVision50.API.Services.CartService_FD
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _repo;

        public CartService(ICartRepository repo)
        {
            _repo = repo;
        }

        public async Task<CartDto?> GetCartByUserIdAsync(int userId)
        {
            var cart = await _repo.GetCartByUserIdAsync(userId);
            if (cart == null) return null;

            return new CartDto
            {
                CartId = cart.CartId,
                CreatedDate = cart.CreatedDate,
                Status = cart.Status,
                UserId = cart.UserId,
                CartItems = cart.CartItems?.Select(ci => new CartItemDto
                {
                    CartItemId = ci.CartItemId,
                    Quantity = ci.Quantity,
                    Price = ci.Price,
                    ProductVariantId = ci.ProductVariantId,
                    ProductVariant = new ProductVariantDto
                    {
                        ProductVariantId = ci.ProductVariant.ProductVariantId,
                        SalePrice = ci.ProductVariant.SalePrice,
                        Stock = ci.ProductVariant.Stock,
                        ProductId = ci.ProductVariant.ProductId
                    }
                }).ToList()
            };
        }

        public async Task<bool> RemoveCartItemAsync(int cartItemId)
        {
            var item = await _repo.GetCartItemByIdAsync(cartItemId);
            if (item == null) return false;

            await _repo.RemoveCartItemAsync(item);
            return true;
        }
    }
}
