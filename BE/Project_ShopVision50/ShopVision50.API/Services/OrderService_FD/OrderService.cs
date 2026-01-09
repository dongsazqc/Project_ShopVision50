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
        private readonly IProductVariantService _variantService;
        private readonly AppDbContext _context;


        public OrderService(
            IOrderRepository repository,
            IOrderItemService orderItemService,
            IProductVariantService variantService,
            AppDbContext context)
        {
            _repository = repository;
            _orderItemService = orderItemService;
            _context = context;
            _variantService = variantService;
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
    if (request == null) throw new ArgumentNullException(nameof(request));
    if (request.OrderItems == null || !request.OrderItems.Any())
        throw new ArgumentException("OrderItems không được để trống", nameof(request.OrderItems));
    if (request.Payments == null || !request.Payments.Any())
        throw new ArgumentException("Payments không được để trống", nameof(request.Payments));

    // Tạo order mới (chưa có items/payments)
    var order = new Order
    {
        OrderDate = request.OrderDate,
        OrderType = request.OrderType,
        Status = request.Status,
        RecipientName = request.RecipientName,
        RecipientPhone = request.RecipientPhone,
        ShippingAddress = request.ShippingAddress,
        TotalAmount = request.TotalAmount,
        UserId = request.UserId
    };

    var createdOrder = await _repository.AddOrderAsync(order);
    if (createdOrder == null) throw new Exception("Tạo order thất bại");

    // Tạo order items và gán OrderId
    var orderItems = request.OrderItems.Select(p => new OrderItem
    {
        ProductVariantId = p.ProductVariantId,
        Quantity = p.Quantity,
        DiscountAmount = p.DiscountAmount,
        OrderId = createdOrder.OrderId
    }).ToList();

    // Cập nhật stock theo từng item (chạy async parallel cho nhanh)
foreach (var item in orderItems)
{
    await _variantService.Updatestock(item.ProductVariantId, item.Quantity);
}
    // Tạo order items (chạy async parallel)
// 2. Tạo order items cũng tuần tự
foreach (var item in orderItems)
{
    await _orderItemService.CreateAsync(item);
}
    // Tạo payments
    var payments = request.Payments.Select(p => new Payment
    {
        Method = p.Method,
        Amount = p.Amount,
        PaymentDate = DateTime.UtcNow,
        Status = true,
        OrderId = createdOrder.OrderId
    }).ToList();

    // Thêm payments vào DbContext
    _context.Payments.AddRange(payments);

    // Lưu thay đổi
    await _context.SaveChangesAsync();

    // Lấy lại order đầy đủ
    var fullOrder = await _repository.GetByIdAsync(createdOrder.OrderId);
    if (fullOrder == null)
        throw new Exception("Không lấy được dữ liệu order vừa tạo");

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
                OrderStatus = (int)o.Status,
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
