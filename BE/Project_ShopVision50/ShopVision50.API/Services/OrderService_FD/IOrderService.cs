using Shop_Db.Models;


namespace ShopVision50.API.Service.OrderService_FD
{
    public interface IOrderService{
        Task<Order?> GetByIdAsync(int id);
        Task<IEnumerable<Order>> GetAllAsync();
        Task AddAsync(Order order);
        Task UpdateAsync(Order order);
        Task DeleteAsync(int id);
    }

}