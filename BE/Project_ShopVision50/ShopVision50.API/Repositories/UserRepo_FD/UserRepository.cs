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

        public async Task<List<User>> GetAllAsync()
            => await _db.Users.AsNoTracking().ToListAsync();

        public async Task<User?> GetByIdAsync(int id)
            => await _db.Users.FindAsync(id);

        public async Task<User?> GetByEmailAsync(string email)
            => await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

        public async Task AddAsync(User user)
            => await _db.Users.AddAsync(user);

        public void Update(User user)
            => _db.Users.Update(user);

        public void Delete(User user)
            => _db.Users.Remove(user);

        public async Task<bool> SaveChangesAsync()
            => await _db.SaveChangesAsync() > 0;
    }
}
