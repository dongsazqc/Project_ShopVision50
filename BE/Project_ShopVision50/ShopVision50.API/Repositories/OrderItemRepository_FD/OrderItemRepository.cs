using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.OrderItemRepository_FD
{
   public class OrderItemRepository : IOrderItemRepository
{
    private readonly AppDbContext _context;

    public OrderItemRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<OrderItem>> GetAllAsync()
    {
        return await _context.OrderItems
            .Include(o => o.ProductVariant)
            .Include(o => o.Order)
            .Include(o => o.Promotion)
            .ToListAsync();
    }

    public async Task<OrderItem?> GetByIdAsync(int id)
    {
        return await _context.OrderItems
            .Include(o => o.ProductVariant)
            .Include(o => o.Order)
            .Include(o => o.Promotion)
            .FirstOrDefaultAsync(o => o.OrderItemId == id);
    }

    public async Task<OrderItem> AddAsync(OrderItem entity)
    {
        _context.OrderItems.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<OrderItem> UpdateAsync(OrderItem entity)
    {
        _context.OrderItems.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _context.OrderItems.FindAsync(id);
        if (item == null) return false;

        _context.OrderItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}

}