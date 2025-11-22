using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Repositories.OrderRepo_FD;
using ShopVision50.Infrastructure;
namespace ShopVision50.API.Repositories.ProductsRepo_FD.OrderRepo
{
        public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _context;
        public OrderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.OrderPromotions)
                .Include(o => o.Payments)
                .Include(o => o.ReturnNotes)
                .FirstOrDefaultAsync(o => o.OrderId == id);
        }

        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await _context.Orders.ToListAsync();
        }

       
    public async Task<Order> AddOrderAsync(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

        public async Task UpdateAsync(Order order)
{
    var existingOrder = await _context.Orders
        .Include(o => o.OrderItems)
        .Include(o => o.OrderPromotions)
        .Include(o => o.Payments)
        .Include(o => o.ReturnNotes)
        .FirstOrDefaultAsync(o => o.OrderId == order.OrderId);

    if (existingOrder == null)
        throw new Exception("Order không tồn tại");

    // Cập nhật các field đơn giản
    existingOrder.OrderDate = order.OrderDate;
    existingOrder.OrderType = order.OrderType;
    existingOrder.Status = order.Status;
    existingOrder.TotalAmount = order.TotalAmount;
    existingOrder.RecipientName = order.RecipientName;
    existingOrder.RecipientPhone = order.RecipientPhone;
    existingOrder.ShippingAddress = order.ShippingAddress;
    existingOrder.UserId = order.UserId;

    // Cập nhật order items
    // Xóa item không còn trong danh sách
    foreach (var existingItem in existingOrder.OrderItems.ToList())
    {
        if (!order.OrderItems.Any(i => i.OrderItemId == existingItem.OrderItemId))
            _context.OrderItems.Remove(existingItem);
    }

    // Thêm hoặc cập nhật item mới/cũ
    foreach (var item in order.OrderItems)
    {
        var existingItem = existingOrder.OrderItems
            .FirstOrDefault(i => i.OrderItemId == item.OrderItemId);

        if (existingItem != null)
        {
            existingItem.Quantity = item.Quantity;
            existingItem.DiscountAmount = item.DiscountAmount;
            existingItem.ProductVariantId = item.ProductVariantId;
            existingItem.PromotionId = item.PromotionId;
        }
        else
        {
            existingOrder.OrderItems.Add(item);
        }
    }

    // Có thể làm tương tự với OrderPromotions, Payments, ReturnNotes nếu cần

    await _context.SaveChangesAsync();
}

        public async Task DeleteAsync(int id)
        {
            var order = await GetByIdAsync(id);
            if (order != null)
            {
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();
            }
        }
    }
}