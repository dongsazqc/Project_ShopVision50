using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Repositories;
using ShopVision50.Infrastructure;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.FullName == username); // hoặc Email tuỳ 
    }

    public async Task AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }
}
