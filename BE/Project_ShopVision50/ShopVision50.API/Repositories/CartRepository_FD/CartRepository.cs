using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.CartRepository_FD
{
    public class CartRepository : ICartRepository
    {
        private readonly AppDbContext _context;

        public CartRepository(AppDbContext context)
        {
            _context = context;
        }

            // Lấy giỏ hàng theo User + bao gồm CartItems + ProductVariant
                public async Task<Cart?> GetCartByUserIdAsync(int userId)
        {
                        return await _context.Carts
                .Include(c => c.CartItems!)
                    .ThenInclude(ci => ci.ProductVariant!)
                    .ThenInclude(pr => pr.Product)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.ProductVariant)
                    .ThenInclude(si => si.Size)
                .Include(c => c.CartItems!)
                    .ThenInclude(ci => ci.ProductVariant!)
                        .ThenInclude(pv => pv.Color)
                .FirstOrDefaultAsync(c => c.UserId == userId);


        }


        public async Task<CartItem?> GetCartItemByIdAsync(int cartItemId)
        {
            return await _context.CartItems
                .Include(ci => ci.ProductVariant)
                .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId);
        }

        public async Task RemoveCartItemAsync(CartItem item)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
            public void AddCart(Cart cart)
    {
        _context.Carts.Add(cart);
    }

    public void AddCartItem(CartItem cartItem)
    {
        _context.CartItems.Add(cartItem);
    }

    public async Task<ProductVariant?> GetProductVariantByIdAsync(int productVariantId)
    {
        return await _context.ProductVariants.FindAsync(productVariantId);
    }


    }
}
