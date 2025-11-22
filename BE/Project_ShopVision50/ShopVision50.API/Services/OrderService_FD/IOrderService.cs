using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;


namespace ShopVision50.API.Service.OrderService_FD
{
    public interface IOrderService{
        Task<Order?> GetByIdAsync(int id);
        Task<IEnumerable<Order>> GetAllAsync();
Task<Order> CreateOrderAsync(CreateOrderRequest request);
        Task UpdateAsync(Order order);
        Task DeleteAsync(int id);
    }

}