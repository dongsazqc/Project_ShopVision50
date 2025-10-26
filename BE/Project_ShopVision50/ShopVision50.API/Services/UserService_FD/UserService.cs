// Services/UserService_FD/UserService.cs
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Services.UserService_FD
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _db;
        public UserService(AppDbContext db) { _db = db; }

        #region AuthController methods
        public async Task<ServiceResult<UserReadDto>> RegisterUserAsync(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return ServiceResult<UserReadDto>.Fail("Email và Password là bắt buộc.");

            var email = dto.Email.Trim().ToLower();
            var existed = await _db.Users.AnyAsync(u => u.Email.ToLower() == email);
            if (existed) return ServiceResult<UserReadDto>.Fail("Email đã tồn tại.");

            var user = new User
            {
                FullName = dto.FullName?.Trim() ?? string.Empty,
                Email = email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                DefaultAddress = dto.DefaultAddress,
                JoinDate = DateTime.UtcNow,
                Status = true,
                RoleId = null
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return ServiceResult<UserReadDto>.Ok(MapToRead(user), "Đăng ký thành công.");
        }

        public async Task<IEnumerable<UserReadDto>> GetAllUsersAsyncSer()
        {
            return await _db.Users
                .AsNoTracking()
                .Select(u => MapToRead(u))
                .ToListAsync();
        }
        #endregion

        #region Users API methods
        public async Task<ServiceResult<UserReadDto>> GetUserByIdAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return ServiceResult<UserReadDto>.Fail("Không tìm thấy user.");
            return ServiceResult<UserReadDto>.Ok(MapToRead(user));
        }

        public async Task<ServiceResult<UserReadDto>> UpdateUserAsync(int id, UserUpdateDto dto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return ServiceResult<UserReadDto>.Fail("User không tồn tại.");

            user.FullName = dto.FullName?.Trim() ?? user.FullName;
            user.Phone = dto.Phone;
            user.DefaultAddress = dto.DefaultAddress;
            user.Status = dto.Status;
            user.RoleId = dto.RoleId;

            await _db.SaveChangesAsync();
            return ServiceResult<UserReadDto>.Ok(MapToRead(user), "Cập nhật thành công.");
        }

        public async Task<ServiceResult<bool>> DeleteUserAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return ServiceResult<bool>.Fail("Không tồn tại user để xóa.");
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true, "Đã xóa user.");
        }
        #endregion

        private static UserReadDto MapToRead(User u) => new()
        {
            UserId = u.UserId,
            FullName = u.FullName,
            Email = u.Email,
            Phone = u.Phone,
            Status = u.Status,
            JoinDate = u.JoinDate,
            RoleId = u.RoleId,
            DefaultAddress = u.DefaultAddress
        };
    }
}
