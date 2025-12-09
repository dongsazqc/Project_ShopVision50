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
            // Tạo đối tượng order (chưa có items/payments)
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

            // Lưu order trước, EF sẽ gán OrderId tự động
            var createdOrder = await _repository.AddOrderAsync(order);

            // Tạo order items từ request, gán OrderId đã có
            var orderItems = request.Products.Select(p => new OrderItem
            {
                ProductVariantId = p.ProductVariantId,
                Quantity = p.Quantity,
                DiscountAmount = p.DiscountAmount,
                OrderId = createdOrder.OrderId
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
                OrderStatus = o.Status ? 1 : 0,
                ReceiverName = o.RecipientName,
                ReceiverPhone = o.RecipientPhone,
                DeliveryAddress = o.ShippingAddress
            }).ToList();
        }
        public async Task<string> GetRealOrderStatusAsync(Order order)
        {
            if (order == null) return "Unknown";

            // ===== 1. Check Returned =====
            // Nếu có ReturnNotes và lý do có chữ "return" hoặc "trả"
            if (order.ReturnNotes != null && order.ReturnNotes.Any())
            {
                foreach (var rn in order.ReturnNotes)
                {
                    if (!string.IsNullOrEmpty(rn.Reason))
                    {
                        var reason = rn.Reason.ToLower();

                        if (reason.Contains("trả") || reason.Contains("return"))
                            return "Returned";

                        if (reason.Contains("hủy") || reason.Contains("huy") || reason.Contains("cancel"))
                            return "Cancelled";
                    }
                }
            }

            // ===== 2. Completed =====
            // Order.Status = true hiện tại là flag "đã thanh toán"
            if (order.Status)
                return "Completed";

            // ===== 3. Processing =====
            // Nếu có payment nào Status = true
            if (order.Payments != null && order.Payments.Any(p => p.Status))
                return "Processing";

            // ===== 4. Pending =====
            return "Pending";
        }

        public async Task<string> ChangeOrderStatusAsync(int orderId, string newStatus)
        {
            var order = await _repository.GetByIdAsync(orderId);
            if (order == null) return "Order không tồn tại";

            var currentStatus = await GetRealOrderStatusAsync(order);
            string target = newStatus.Trim();

            // Không đổi trạng thái nếu Completed hoặc Cancelled
            if (currentStatus == "Completed" || currentStatus == "Cancelled")
                return $"Không thể đổi trạng thái vì đơn hàng đã {currentStatus}";

            // Pending -> Processing
            if (currentStatus == "Pending")
            {
                if (target != "Processing")
                    return "Pending chỉ được chuyển sang Processing";
            }

            // Processing -> Shipping
            if (currentStatus == "Processing")
            {
                if (target != "Shipping")
                    return "Processing chỉ được chuyển sang Shipping";
            }

            // Shipping -> Completed
            if (currentStatus == "Shipping")
            {
                if (target != "Completed")
                    return "Shipping chỉ được chuyển sang Completed";
            }

            // Nếu target = Cancelled → set Status = false
            if (target == "Cancelled")
            {
                order.Status = false;
                await _repository.UpdateAsync(order);
                return "Đã hủy đơn hàng";
            }

            // Nếu Completed → set Status = true
            if (target == "Completed")
            {
                order.Status = true;
                await _repository.UpdateAsync(order);
                return "Đơn hàng đã Completed";
            }

            // Không cần lưu trạng thái trung gian vào DB
            return $"Trạng thái đã được cập nhật từ {currentStatus} sang {target}";
        }
    }
}
