using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Repositories;
using ShopVision50.Infrastructure;


// Đây là nơi xử lí logic CRUD thêm sửa xóa... 
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context; // Đây là DbContext kết nối DB

    public UserRepository(AppDbContext context)
    {
        _context = context; // inject AppDbContext vào repo
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.FullName == username);  // tìm user theo FullName
    }

    public async Task AddregisteredAsync(User user)
    {
        _context.Users.Add(user); // thêm user vào DbContext
        await _context.SaveChangesAsync(); // lưu vào DB luôn
    }

    public async Task<List<User>> GetAllUsersAsyncRepo()
    {
        return await _context.Users.ToListAsync(); // Lấy tất cả user từ DB
    }
}
    