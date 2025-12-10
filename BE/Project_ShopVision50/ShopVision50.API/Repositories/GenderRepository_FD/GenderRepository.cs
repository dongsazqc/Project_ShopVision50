using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.GenderRepository_FD
{
    public class GenderRepository : IGenderRepository
    {
        private readonly AppDbContext _context;

        public GenderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Gender>> GetAllAsync()
        {
            return await _context.Genders.ToListAsync();
        }

        public async Task<Gender?> GetByIdAsync(int id)
        {
            return await _context.Genders.FindAsync(id);
        }

        public async Task AddAsync(Gender gender)
        {
            _context.Genders.Add(gender);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Gender gender)
        {
            _context.Genders.Update(gender);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var gender = await _context.Genders.FindAsync(id);
            if (gender != null)
            {
                _context.Genders.Remove(gender);
                await _context.SaveChangesAsync();
            }
        }
    }
}
