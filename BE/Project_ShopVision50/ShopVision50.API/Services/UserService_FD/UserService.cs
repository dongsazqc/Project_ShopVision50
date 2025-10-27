using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Services.UserService_FD
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _db;
        public UserService(AppDbContext db) => _db = db;

        // ---- Helpers ----
        private static UserDto ToDto(User u) => new()
        {
            UserId = u.UserId,
            FullName = u.FullName,
            Email = u.Email,
            Password = string.Empty, // ẩn khi trả ra
            Phone = u.Phone,
            DefaultAddress = u.DefaultAddress,
            JoinDate = u.JoinDate,
            Status = u.Status,
            RoleId = u.RoleId,
            Role = null,
            Carts = null,
            Addresses = null,
            Orders = null,
            UserRoles = null
        };

        private static void Apply(UserDto dto, User e, bool allowPasswordChange)
        {
            e.FullName = dto.FullName;
            e.Email = dto.Email;
            e.Phone = dto.Phone;
            e.DefaultAddress = dto.DefaultAddress;
            e.Status = dto.Status;
            e.RoleId = dto.RoleId;
            if (allowPasswordChange && !string.IsNullOrWhiteSpace(dto.Password))
            {
                // TODO: nếu muốn hash -> e.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                e.Password = dto.Password;
            }
        }

        // ---- APIs ----
        public async Task<ServiceResult<List<UserDto>>> GetAllUsersAsyncSer()
        {
            var list = await _db.Users.AsNoTracking().ToListAsync();
            return ServiceResult<List<UserDto>>.Ok(list.Select(ToDto).ToList());
        }

        // Trả JSON detail đã "shape" đúng mẫu bạn yêu cầu
        public async Task<ServiceResult<object>> GetUserByIdAsync(int id)
        {
            var u = await _db.Users
                .Include(x => x.Orders)
                .Include(x => x.Addresses)
                .Include(x => x.Carts).ThenInclude(c => c.CartItems)
                .Include(x => x.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(x => x.UserId == id);

            if (u == null) return ServiceResult<object>.Fail("Không tìm thấy user");

            var shaped = new
            {
                userId = u.UserId,
                fullName = u.FullName,
                email = u.Email,
                phone = u.Phone,
                status = u.Status,
                joinDate = u.JoinDate,
                defaultAddress = u.DefaultAddress,

                orders = u.Orders?.Select(o => new
                {
                    orderId = o.OrderId,
                    // Nếu entity Order của bạn có TotalAmount/OrderDate: dùng đúng tên này
                    total = o.TotalAmount,
                    createdDate = o.OrderDate
                }).ToList(),

                addresses = u.Addresses?.Select(a => new
                {
                    addressId = a.AddressId,
                    city = a.AddressDetail,   // đổi thành a.City nếu model của bạn là City
                    isDefault = a.IsDefault
                }).ToList(),

                // carts theo yêu cầu: { cartId, productId, quantity }
                // Dùng ProductVariantId vì CartItem không có ProductId
                carts = u.Carts?
                    .SelectMany(c => c.CartItems.Select(ci => new
                    {
                        cartId = c.CartId,
                        productId = ci.ProductVariantId,  // <--- ĐÃ SỬA
                        quantity = ci.Quantity
                    }))
                    .ToList(),

                userRoles = u.UserRoles?.Select(ur => new
                {
                    role = new
                    {
                        roleId = ur.Role?.RoleId ?? 0,
                        roleName = ur.Role?.RoleName
                    }
                }).ToList()
            };

            return ServiceResult<object>.Ok(shaped);
        }

        // Dùng chung cho Auth + Users
        public async Task<ServiceResult<UserDto>> RegisterUserAsync(UserDto dto)
        {
            var existed = await _db.Users.AnyAsync(x => x.Email.ToLower() == dto.Email.Trim().ToLower());
            if (existed) return ServiceResult<UserDto>.Fail("Email đã tồn tại.");

            var entity = new User
            {
                JoinDate = dto.JoinDate == default ? DateTime.UtcNow : dto.JoinDate,
                Status = dto.Status == default ? true : dto.Status
            };
            Apply(dto, entity, allowPasswordChange: true);

            _db.Users.Add(entity);
            await _db.SaveChangesAsync();

            return ServiceResult<UserDto>.Ok(ToDto(entity), "Đăng ký thành công");
        }

        public async Task<ServiceResult<UserDto>> UpdateUserAsync(int id, UserDto dto)
        {
            var entity = await _db.Users.FindAsync(id);
            if (entity == null) return ServiceResult<UserDto>.Fail("User không tồn tại.");

            var changePwd = !string.IsNullOrWhiteSpace(dto.Password);
            Apply(dto, entity, allowPasswordChange: changePwd);

            _db.Users.Update(entity);
            await _db.SaveChangesAsync();

            return ServiceResult<UserDto>.Ok(ToDto(entity), "Cập nhật thành công");
        }

        public async Task<ServiceResult<bool>> DeleteUserAsync(int id)
        {
            var entity = await _db.Users.FindAsync(id);
            if (entity == null) return ServiceResult<bool>.Fail("User không tồn tại.");

            _db.Users.Remove(entity);
            await _db.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true, "Xóa thành công");
        }
    }
}
