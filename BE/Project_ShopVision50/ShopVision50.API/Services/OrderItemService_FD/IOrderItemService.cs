using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Services.OrderItemService_FD
{
    public interface IOrderItemService
{
    Task<IEnumerable<OrderItem>> GetAllAsync();
    Task<OrderItem?> GetByIdAsync(int id);
    Task<OrderItem> CreateAsync(OrderItem entity);
    Task<OrderItem> UpdateAsync(int id, OrderItem entity);
    Task<bool> DeleteAsync(int id);
}

}