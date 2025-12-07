using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.CartItemService
{
public interface ICartItemService
{

        Task<CartItemDto?> GetByIdAsync(int id);
Task<List<CartItemDto>> GetAllAsync();

    Task AddAsync(CartItem cartItem);
    Task UpdateAsync(CartItem cartItem);
    Task DeleteAsync(int id);
}

}