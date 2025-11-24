using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Services.CartItemService
{
public interface ICartItemService
{
    Task<List<CartItem>> GetAllAsync();
        Task<CartItem?> GetByIdAsync(int id);
    Task AddAsync(CartItem cartItem);
    Task UpdateAsync(CartItem cartItem);
    Task DeleteAsync(int id);
}

}