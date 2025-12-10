using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Repositories.OrderItemRepository_FD
{
   public interface IOrderItemRepository
{
    Task<IEnumerable<OrderItem>> GetAllAsync();
    Task<OrderItem?> GetByIdAsync(int id);
    Task<OrderItem> AddAsync(OrderItem entity);
    Task<OrderItem> UpdateAsync(OrderItem entity);
    Task<bool> DeleteAsync(int id);
}

}