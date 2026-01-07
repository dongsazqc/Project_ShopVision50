using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.OrderRepo_FD;
using ShopVision50.API.Service.OrderService_FD;
using ShopVision50.API.Services.OrderItemService_FD;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Services.OrderService_FD
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _repository;
        private readonly IOrderItemService _orderItemService;
        private readonly AppDbContext _context;

        public OrderService(
            IOrderRepository repository,
            IOrderItemService orderItemService,
            AppDbContext context)
        {
            _repository = repository;
            _orderItemService = orderItemService;
            _context = context;
        }

        public async Task<OrderDto?> GetByIdAsync(int id)
        {
               var order = await _repository.GetByIdAsync(id);

                if (order == null)
        return null;

    return new OrderDto
    {
        OrderId = order.OrderId,
        OrderDate = order.OrderDate,
        OrderType = order.OrderType,
        Status = order.IsPaid,
        TotalAmount = order.TotalAmount,
        RecipientName = order.RecipientName,
        RecipientPhone = order.RecipientPhone,
        ShippingAddress = order.ShippingAddress,
        OrderItems = order.OrderItems?.Select(oi => new OrderItemDto
        {
            OrderItemId = oi.OrderItemId,
            Quantity = oi.Quantity,
            DiscountAmount = oi.DiscountAmount,
            ProductVariant = oi.ProductVariant == null ? null : new ProductVariantDto
            {
                ProductVariantId = oi.ProductVariant.ProductVariantId,
                SalePrice = oi.ProductVariant.SalePrice,
                Stock = oi.ProductVariant.Stock,
                Size = oi.ProductVariant.Size == null ? null : new ProductSizeDto
                {
                    SizeId = oi.ProductVariant.Size.SizeId,
                    Name = oi.ProductVariant.Size.Name
                },
                Color = oi.ProductVariant.Color == null ? null : new ProductColorDto
                {
                    ColorId = oi.ProductVariant.Color.ColorId,
                    Name = oi.ProductVariant.Color.Name
                },
                ProductOrder = oi.ProductVariant.Product == null ? null : new ProductOrderDto
                {
                    ProductId = oi.ProductVariant.Product.ProductId,
                    Name = oi.ProductVariant.Product.Name,
                    Price = oi.ProductVariant.Product.Price,
                    Brand = oi.ProductVariant.Product.Brand
                }
            },
                OrderId = oi.OrderId,
                Promotion = oi.Promotion== null ? null : new PromotionDto
                {
                    PromotionId = oi.Promotion.PromotionId,
                    Code = oi.Promotion.Code,
                }


        }).ToList() ?? new List<OrderItemDto>(),
        Payments = order.Payments?.Select(p => new PaymentDto
        {
            PaymentId = p.PaymentId,
            Method = p.Method,
            Amount = p.Amount,
            Status = p.Status,
            PaymentDate = p.PaymentDate
        }).ToList() ?? new List<PaymentDto>()
    };
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
            // Tạo đối tượng order (chưa có items/payments)
            var order = new Order
            {
                OrderDate = request.OrderDate,
                OrderType = request.OrderType,
                IsPaid = request.IsPaid,
                RecipientName = request.RecipientName,
                RecipientPhone = request.RecipientPhone,
                ShippingAddress = request.ShippingAddress,
                TotalAmount = request.TotalAmount,
                UserId = request.UserId,
                Status = request.Status
                
            };

            // Lưu order trước, EF sẽ gán OrderId tự động
            var createdOrder = await _repository.AddOrderAsync(order);

            // Tạo order items từ request, gán OrderId đã có
            var orderItems = request.OrderItems.Select(p => new OrderItem
            {
                ProductVariantId = p.ProductVariantId,
                Quantity = p.Quantity,
                DiscountAmount = p.DiscountAmount,
                OrderId = createdOrder.OrderId,
                
            }).ToList();

            // Thêm từng order item qua service (để tách logic, nếu không thì có thể thêm trực tiếp vào DbContext)
            foreach (var item in orderItems)
            {
                await _orderItemService.CreateAsync(item);
            }

            // Tạo payments từ request, gán OrderId đã có
            var payments = request.Payments.Select(p => new Payment
            {
                Method = p.Method,
                Amount = p.Amount,
                PaymentDate = DateTime.UtcNow,
                Status = true,
                OrderId = createdOrder.OrderId
            }).ToList();

            // Thêm payments trực tiếp vào DbContext (nếu có repo/payment service thì dùng)
            foreach (var payment in payments)
            {
                _context.Payments.Add(payment);
            }
            await _context.SaveChangesAsync();

            // Load lại order đầy đủ thông tin để trả về
            var fullOrder = await _repository.GetByIdAsync(createdOrder.OrderId);

            if (fullOrder == null)
                throw new Exception("Order vừa tạo không thể lấy được dữ liệu");

            return fullOrder;
        }

        public async Task<List<UserOrderResponse>> GetOrdersByUserIdAsync(int userId)
        {
            var orders = await _repository.GetOrdersByUserIdAsync(userId);

            return orders.Select(o => new UserOrderResponse
            {
                Id = o.OrderId,
                DateOrdered = o.OrderDate,
                AmountTotal = o.TotalAmount,
                OrderStatus = o.IsPaid ? 1 : 0,
                ReceiverName = o.RecipientName,
                ReceiverPhone = o.RecipientPhone,
                DeliveryAddress = o.ShippingAddress
            }).ToList();
        }
        public async Task UpdateStatusAsync(int orderId, OrderStatus status)
{
    var order = await _repository.GetByIdAsync(orderId);

    if (order == null)
        throw new Exception("Order not found");

    order.Status = status;

    await _repository.UpdateAsync(order);
}

    }
}
