using Shop_Db.Models;

using ShopVision50.API.Repositories.OrderRepo_FD;

namespace ShopVision50.API.Service.OrderService_FD
{
    public class OrderService : IOrderService{

        private readonly IOrderRepository _repository;
        public OrderService(IOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task AddAsync(Order order)
        {
            // Nếu cần validate gì thì xử lý ở đây
            await _repository.AddAsync(order);
        }

        public async Task UpdateAsync(Order order)
        {
            // Logic validate, check trạng thái,...
            await _repository.UpdateAsync(order);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }

    }
}
