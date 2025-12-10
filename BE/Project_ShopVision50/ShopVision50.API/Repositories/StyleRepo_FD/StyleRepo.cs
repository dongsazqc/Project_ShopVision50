using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.StyleRepo_FD
{
    public class StyleRepo : IStyleRepo
    {
        private readonly AppDbContext _context;

        public StyleRepo(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Style>> GetAllAsync()
        {
            return await _context.Styles
                .Include(s => s.Products)
                .ToListAsync();
        }

        public async Task<Style?> GetByIdAsync(int id)
        {
            return await _context.Styles
                .Include(s => s.Products)
                .FirstOrDefaultAsync(s => s.StyleId == id);
        }

        public async Task AddAsync(Style style)
        {
            await _context.Styles.AddAsync(style);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Style style)
        {
            _context.Styles.Update(style);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Styles.FindAsync(id);
            if (entity != null)
            {
                _context.Styles.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
