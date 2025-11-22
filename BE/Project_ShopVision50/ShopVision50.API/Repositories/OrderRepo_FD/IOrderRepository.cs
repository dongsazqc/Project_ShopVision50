using Shop_Db.Models;
using Microsoft.EntityFrameworkCore;

namespace ShopVision50.API.Repositories.OrderRepo_FD
{
    public interface IOrderRepository
    {
        Task<Order?> GetByIdAsync(int id);
        Task<IEnumerable<Order>> GetAllAsync();
 Task<Order> AddOrderAsync(Order order);
         Task UpdateAsync(Order order);
        Task DeleteAsync(int id);
    }
}
