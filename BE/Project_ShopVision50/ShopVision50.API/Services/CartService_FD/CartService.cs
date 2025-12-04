using Shop_Db.Models;
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
          public async Task AddToCartAsync(int userId, AddToCartRequest request)
    {
        var cart = await _repo.GetCartByUserIdAsync(userId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                CreatedDate = DateTime.Now,
                Status = true,
                CartItems = new List<CartItem>()
            };
            _repo.AddCart(cart);
            await _repo.SaveChangesAsync();
        }

        var existingItem = cart.CartItems?.FirstOrDefault(ci => ci.ProductVariantId == request.ProductVariantId);

        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            var newItem = new CartItem
            {
                ProductVariantId = request.ProductVariantId,
                Quantity = request.Quantity,
                CartId = cart.CartId,
            };
            _repo.AddCartItem(newItem);
        }

        await _repo.SaveChangesAsync();
    }

        
    }
}
