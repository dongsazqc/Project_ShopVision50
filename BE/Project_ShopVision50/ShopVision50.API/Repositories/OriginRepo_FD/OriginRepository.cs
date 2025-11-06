using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.OriginRepo_FD
{
    public class OriginRepository : IOriginRepository
    {
        private readonly AppDbContext _context;

        public OriginRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Origin>> GetAllAsync()
        {
            return await _context.Origins.ToListAsync();
        }

        public async Task<Origin?> GetByIdAsync(int id)
        {
            return await _context.Origins.FindAsync(id);
        }

        public async Task AddAsync(Origin origin)
        {
            await _context.Origins.AddAsync(origin);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Origin origin)
        {
            _context.Origins.Update(origin);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var item = await _context.Origins.FindAsync(id);
            if (item != null)
            {
                _context.Origins.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}
