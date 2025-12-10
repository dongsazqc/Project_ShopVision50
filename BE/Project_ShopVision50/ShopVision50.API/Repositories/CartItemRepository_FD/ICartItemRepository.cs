using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Repositories.CartItemRepository
{
    public interface ICartItemRepository
{
    Task<List<CartItem>> GetAllAsync();
    Task<CartItem?> GetByIdAsync(int id);
    Task AddAsync(CartItem cartItem);
    void Update(CartItem cartItem);
    void Delete(CartItem cartItem);
    Task SaveChangesAsync();
}

}