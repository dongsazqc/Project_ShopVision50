using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
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

        

        public async Task UpdateAsync(Order order)
        {
            // Logic validate, check trạng thái,...
            await _repository.UpdateAsync(order);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }



 public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
var order = new Order
{
    OrderDate = request.OrderDate,
    OrderType = request.OrderType,
    Status = request.Status,
    RecipientName = request.RecipientName,
    RecipientPhone = request.RecipientPhone,
    ShippingAddress = request.ShippingAddress,
    TotalAmount = request.TotalAmount,
    UserId = request.UserId,  // Đừng quên
// Service
    OrderItems = request.Products.Select(p => new OrderItem
    {
        ProductVariantId = p.ProductVariantId,  // đúng nè bro
        Quantity = p.Quantity,
        DiscountAmount = p.DiscountAmount
    }).ToList(),

    Payments = request.Payments.Select(p => new Payment
    {
        Method = p.Method,
        Amount = p.Amount,
        PaymentDate = DateTime.UtcNow,
        Status = true
    }).ToList()
};


        var createdOrder = await _repository.AddOrderAsync(order);
        return createdOrder;
    }


    }
}
