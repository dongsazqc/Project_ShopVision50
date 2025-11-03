using Shop_Db.Models;
using ShopVision50.Infrastructure; 
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopVision50.API.Repositories.CategoriesRepo_FD
{
    public class CategoriesReposirory : ICategoriesReposirory
    {
        private readonly AppDbContext _context;

        public CategoriesReposirory(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _context.Categories
                                 .Include(c => c.Products)
                                 .ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _context.Categories
                                 .Include(c => c.Products)
                                 .FirstOrDefaultAsync(c => c.CategoryId == id);
        }

        public async Task AddAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Category category)
        {
                var existing = await _context.Categories.FindAsync(category.CategoryId);
                if (existing == null)
                    throw new Exception("Category không tồn tại");

                existing.Name = category.Name;
                existing.Description = category.Description;

                await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
        }
    }

   
}
