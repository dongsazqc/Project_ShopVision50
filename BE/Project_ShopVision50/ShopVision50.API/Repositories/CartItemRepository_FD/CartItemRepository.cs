using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.CartItemRepository
{
public class CartItemRepository : ICartItemRepository
{
    private readonly AppDbContext _context;

    public CartItemRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CartItem>> GetAllAsync()
    {
        return await _context.CartItems
            .Include(ci => ci.ProductVariant)
                .ThenInclude(pv => pv.Size)
            .Include(ci => ci.ProductVariant)
                .ThenInclude(pv => pv.Color)
            .Include(ci => ci.Cart)
            .ToListAsync();
    }


        public async Task<CartItem?> GetByIdAsync(int id)
        {
            return await _context.CartItems
                .Include(ci => ci.ProductVariant)
                    .ThenInclude(pv => pv.Size)
                .Include(ci => ci.ProductVariant)
                    .ThenInclude(pv => pv.Color)
                .Include(ci => ci.Cart)
                .FirstOrDefaultAsync(ci => ci.CartItemId == id);
        }
    public async Task AddAsync(CartItem cartItem)
    {
        await _context.CartItems.AddAsync(cartItem);
    }

    public void Update(CartItem cartItem)
    {
        _context.CartItems.Update(cartItem);
    }

    public void Delete(CartItem cartItem)
    {
        _context.CartItems.Remove(cartItem);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

}