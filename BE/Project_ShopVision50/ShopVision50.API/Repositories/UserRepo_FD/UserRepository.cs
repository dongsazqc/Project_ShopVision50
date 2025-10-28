using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _db;
        public UserRepository(AppDbContext db) => _db = db;

        public Task<List<User>> GetAllAsync() =>
            _db.Users.AsNoTracking().ToListAsync();

        public Task<List<User>> GetAllWithDetailAsync() =>
            _db.Users
               .Include(u => u.Orders)
               .Include(u => u.Addresses)
               .Include(u => u.Carts).ThenInclude(c => c.CartItems)
               .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
               .AsNoTracking()
               .ToListAsync();

        public Task<User?> GetByIdAsync(int id) =>
            _db.Users
               .Include(u => u.Orders)
               .Include(u => u.Addresses)
               .Include(u => u.Carts).ThenInclude(c => c.CartItems)
               .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
               .FirstOrDefaultAsync(u => u.UserId == id);

        public Task<User?> GetSimpleByIdAsync(int id) =>
            _db.Users.FirstOrDefaultAsync(u => u.UserId == id);

        public Task<User?> GetByEmailAsync(string email) =>
            _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User> AddAsync(User user)
        {
            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateAsync(User user)
        {
            _db.Users.Update(user);
            await _db.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteAsync(User user)
        {
            _db.Users.Remove(user);
            return await _db.SaveChangesAsync() > 0;
        }
    }
}
