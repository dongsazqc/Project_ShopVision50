using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.ProductVariantsRepo_FD
{
    public class ProductVariantsRepo : IProductVariantsRepo
    {
        private readonly AppDbContext _context;
        public ProductVariantsRepo(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(ProductVariant variant)
        {
             await _context.ProductVariants.AddAsync(variant);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.ProductVariants.FindAsync(id);
            if (entity != null)
            {
                _context.ProductVariants.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<ProductVariant>> GetAllAsync()
        {
           return await _context.ProductVariants
                .Include(p => p.Product)
                .Include(p => p.Color)
                .Include(p => p.Size)
                .ToListAsync();
        }

        public async Task<IEnumerable<ProductVariant>> GetByIdAsync(int productId)
        {
            return await _context.ProductVariants
                .Include(p => p.Product)
                .Include(p => p.Color)
                .Include(p => p.Size)
                .Where(p => p.ProductId == productId)   // 🔥 id = ProductId
                .ToListAsync();
        }

        public async Task UpdateAsync(ProductVariant variant)
        {
              _context.ProductVariants.Update(variant);
            await _context.SaveChangesAsync();
        }
    }
}