using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Repositories.OrderItemRepository_FD;

namespace ShopVision50.API.Services.OrderItemService_FD
{
   public class OrderItemService : IOrderItemService
{
    private readonly IOrderItemRepository _repo;

    public OrderItemService(IOrderItemRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<OrderItem>> GetAllAsync() 
        => _repo.GetAllAsync();

    public Task<OrderItem?> GetByIdAsync(int id)
        => _repo.GetByIdAsync(id);

    public Task<OrderItem> CreateAsync(OrderItem entity)
        => _repo.AddAsync(entity);

    public async Task<OrderItem> UpdateAsync(int id, OrderItem entity)
    {
        var existed = await _repo.GetByIdAsync(id);
        if (existed == null)
            throw new Exception("OrderItem not found");

        existed.Quantity = entity.Quantity;
        existed.DiscountAmount = entity.DiscountAmount;
        existed.ProductVariantId = entity.ProductVariantId;
        existed.OrderId = entity.OrderId;
        existed.PromotionId = entity.PromotionId;

        return await _repo.UpdateAsync(existed);
    }

    public Task<bool> DeleteAsync(int id)
        => _repo.DeleteAsync(id);
}

}