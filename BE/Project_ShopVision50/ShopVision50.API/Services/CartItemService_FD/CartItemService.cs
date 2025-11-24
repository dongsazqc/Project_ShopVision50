using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Repositories.CartItemRepository;

namespace ShopVision50.API.Services.CartItemService
{
   public class CartItemService : ICartItemService
{
    private readonly ICartItemRepository _cartItemRepository;

    public CartItemService(ICartItemRepository cartItemRepository)
    {
        _cartItemRepository = cartItemRepository;
    }

    public async Task<List<CartItem>> GetAllAsync()
    {
        return await _cartItemRepository.GetAllAsync();
    }

    public async Task<CartItem?> GetByIdAsync(int id)
    {
        return await _cartItemRepository.GetByIdAsync(id);
    }

    public async Task AddAsync(CartItem cartItem)
    {
        await _cartItemRepository.AddAsync(cartItem);
        await _cartItemRepository.SaveChangesAsync();
    }

    public async Task UpdateAsync(CartItem cartItem)
    {
        _cartItemRepository.Update(cartItem);
        await _cartItemRepository.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var cartItem = await _cartItemRepository.GetByIdAsync(id);
        if (cartItem == null) throw new Exception("CartItem not found");

        _cartItemRepository.Delete(cartItem);
        await _cartItemRepository.SaveChangesAsync();
    }
}

}