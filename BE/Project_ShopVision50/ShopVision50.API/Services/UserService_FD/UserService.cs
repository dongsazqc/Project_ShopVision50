using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories;
using ShopVision50.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Services.UserService_FD
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;
        private readonly AppDbContext _db; 

        public UserService(IUserRepository repo, AppDbContext db)
        {
            _repo = repo;
            _db = db;
        }

        public UserService(IUserRepository repo) => _repo = repo;

        private static UserDto ToDto(User u) => new()
        {
            UserId = u.UserId,
            FullName = u.FullName,
            Email = u.Email,
            Password = string.Empty,
            Phone = u.Phone,
            DefaultAddress = u.DefaultAddress,
            JoinDate = u.JoinDate,
            Status = u.Status,
            RoleId = u.RoleId
        };

        // ---------------- GET ALL  ----------------
        public async Task<ServiceResult<List<object>>> GetAllUsersAsyncSer()
        {
            var users = await _repo.GetAllWithDetailAsync();

            var shapedList = users.Select(u => (object)new
            {
                userId = u.UserId,
                fullName = u.FullName,
                email = u.Email,
                phone = u.Phone,
                status = u.Status,
                joinDate = u.JoinDate,
                defaultAddress = u.DefaultAddress,

                orders = u.Orders?
                    .Select(o => (object)new
                    {
                        orderId = o.OrderId,
                        total = o.TotalAmount,
                        createdDate = o.OrderDate
                    })
                    .ToList() ?? new List<object>(),

                addresses = u.Addresses?
                    .Select(a => (object)new
                    {
                        addressId = a.AddressId,
                        city = a.AddressDetail,
                        isDefault = a.IsDefault
                    })
                    .ToList() ?? new List<object>(),

                carts = u.Carts?
                    .SelectMany(c => c.CartItems.Select(ci => (object)new
                    {
                        cartId = c.CartId,
                        productId = ci.ProductVariantId,
                        quantity = ci.Quantity
                    }))
                    .ToList() ?? new List<object>(),

                userRoles = u.UserRoles?
                    .Select(ur => (object)new
                    {
                        role = new
                        {
                            roleId = ur.Role?.RoleId,
                            roleName = ur.Role?.RoleName
                        }
                    })
                    .ToList() ?? new List<object>()
            }).ToList();

            return ServiceResult<List<object>>.Ok(shapedList);
        }

        // ---------------- GET BY ID  ----------------
        public async Task<ServiceResult<object>> GetUserByIdAsync(int id)
        {
            var u = await _repo.GetByIdAsync(id);
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

                orders = u.Orders?
                    .Select(o => (object)new
                    {
                        orderId = o.OrderId,
                        total = o.TotalAmount,
                        createdDate = o.OrderDate
                    })
                    .ToList() ?? new List<object>(),

                addresses = u.Addresses?
                    .Select(a => (object)new
                    {
                        addressId = a.AddressId,
                        city = a.AddressDetail,
                        isDefault = a.IsDefault
                    })
                    .ToList() ?? new List<object>(),

                carts = u.Carts?
                    .SelectMany(c => c.CartItems.Select(ci => (object)new
                    {
                        cartId = c.CartId,
                        productId = ci.ProductVariantId,
                        quantity = ci.Quantity
                    }))
                    .ToList() ?? new List<object>(),

                userRoles = u.UserRoles?
                    .Select(ur => (object)new
                    {
                        role = new
                        {
                            roleId = ur.Role?.RoleId,
                            roleName = ur.Role?.RoleName
                        }
                    })
                    .ToList() ?? new List<object>()
            };

            return ServiceResult<object>.Ok(shaped);
        }

        // ---------------- REGISTER (tạo user + quan hệ ) ----------------
        public async Task<ServiceResult<string>> RegisterUserAsync(UserDto dto)
        {
            try
            {
                if (dto == null) return ServiceResult<string>.Fail("Payload rỗng.");
                if (string.IsNullOrWhiteSpace(dto.Email))
                    return ServiceResult<string>.Fail("Email là bắt buộc.");

                var existed = await _repo.GetByEmailAsync(dto.Email);
                if (existed != null)
                    return ServiceResult<string>.Fail("Email đã tồn tại");

                var user = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Phone = dto.Phone,
                    DefaultAddress = dto.DefaultAddress,
                    JoinDate = dto.JoinDate == default ? DateTime.UtcNow : dto.JoinDate,
                    Status = dto.Status,
                    RoleId = dto.RoleId
                };

                // Addresses
                if (dto.Addresses != null && dto.Addresses.Any())
                    user.Addresses = dto.Addresses.Select(a => new UserAddress
                    {
                        AddressId = 0,
                        RecipientName = a.RecipientName,
                        Phone = a.Phone,
                        AddressDetail = a.AddressDetail,
                        IsDefault = a.IsDefault,
                        User = user
                    }).ToList();

                // Orders
                if (dto.Orders != null && dto.Orders.Any())
                    user.Orders = dto.Orders.Select(o => new Order
                    {
                        OrderId = 0,
                        OrderDate = o.OrderDate == default ? DateTime.UtcNow : o.OrderDate,
                        OrderType = string.IsNullOrWhiteSpace(o.OrderType) ? "Online" : o.OrderType,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        RecipientName = string.IsNullOrWhiteSpace(o.RecipientName) ? dto.FullName : o.RecipientName,
                        RecipientPhone = string.IsNullOrWhiteSpace(o.RecipientPhone) ? dto.Phone ?? "" : o.RecipientPhone,
                        ShippingAddress = string.IsNullOrWhiteSpace(o.ShippingAddress) ? dto.DefaultAddress ?? "" : o.ShippingAddress,
                        User = user
                    }).ToList();

                // Carts + CartItems
                if (dto.Carts != null && dto.Carts.Any())
                    user.Carts = dto.Carts.Select(cdto =>
                    {
                        var cart = new Cart
                        {
                            CartId = 0,
                            CreatedDate = cdto.CreatedDate == default ? DateTime.UtcNow : cdto.CreatedDate,
                            Status = cdto.Status,
                            User = user
                        };

                        if (cdto.CartItems != null && cdto.CartItems.Any())
                            cart.CartItems = cdto.CartItems.Select(ci => new CartItem
                            {
                                CartItemId = 0,
                                Quantity = ci.Quantity,
                                Price = ci.Price,
                                ProductVariantId = ci.ProductVariantId,
                                Cart = cart
                            }).ToList();

                        return cart;
                    }).ToList();

                // UserRoles
                if (dto.UserRoles != null && dto.UserRoles.Any())
                    user.UserRoles = dto.UserRoles.Select(ur => new UserRole
                    {
                        UserRoleId = 0,
                        RoleId = ur.RoleId != 0 ? ur.RoleId : (ur.Role?.RoleId ?? 0),
                        User = user
                    }).ToList();

                var added = await _repo.AddAsync(user);
                if (added == null) return ServiceResult<string>.Fail("Thêm người dùng thất bại");

                return ServiceResult<string>.Ok("Người dùng đã được thêm thành công");
            }
            catch (DbUpdateException dbex)
            {
                var root = dbex.GetBaseException().Message;
                return ServiceResult<string>.Fail("Lỗi DB: " + root);
            }
            catch (Exception ex)
            {
                return ServiceResult<string>.Fail("Có lỗi xảy ra: " + ex.Message);
            }
        }

        // ---------------- UPDATE ----------------
        public async Task<ServiceResult<UserDto>> UpdateUserAsync(int id, UserDto dto)
        {
            var user = await _db.Users
                .Include(u => u.Addresses)
                .Include(u => u.Orders)
                .Include(u => u.Carts).ThenInclude(c => c.CartItems)
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return ServiceResult<UserDto>.Fail("User không tồn tại");

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Phone = dto.Phone;
            user.DefaultAddress = dto.DefaultAddress;
            user.Status = dto.Status;
            user.RoleId = dto.RoleId;
            if (!string.IsNullOrWhiteSpace(dto.Password))
                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // --- Update Addresses ---
            if (dto.Addresses != null)
            {
                user.Addresses.Clear();
                user.Addresses = dto.Addresses.Select(a => new UserAddress
                {
                    RecipientName = a.RecipientName,
                    Phone = a.Phone,
                    AddressDetail = a.AddressDetail,
                    IsDefault = a.IsDefault,
                    User = user
                }).ToList();
            }

            // --- Update Orders ---
            if (dto.Orders != null)
            {
                user.Orders.Clear();
                user.Orders = dto.Orders.Select(o => new Order
                {
                    OrderDate = o.OrderDate,
                    OrderType = o.OrderType ?? "Online",
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    RecipientName = o.RecipientName,
                    RecipientPhone = o.RecipientPhone,
                    ShippingAddress = o.ShippingAddress,
                    User = user
                }).ToList();
            }

            // --- Update Carts + CartItems ---
            if (dto.Carts != null)
            {
                user.Carts.Clear();
                user.Carts = dto.Carts.Select(c => new Cart
                {
                    CreatedDate = c.CreatedDate,
                    Status = c.Status,
                    User = user,
                    CartItems = c.CartItems?.Select(ci => new CartItem
                    {
                        Quantity = ci.Quantity,
                        Price = ci.Price,
                        ProductVariantId = ci.ProductVariantId
                    }).ToList()
                }).ToList();
            }

            // --- Update UserRoles ---
            if (dto.UserRoles != null)
            {
                user.UserRoles.Clear();
                user.UserRoles = dto.UserRoles.Select(ur => new UserRole
                {
                    RoleId = ur.RoleId != 0 ? ur.RoleId : (ur.Role?.RoleId ?? 0),
                    User = user
                }).ToList();
            }

            await _db.SaveChangesAsync();

            return ServiceResult<UserDto>.Ok(dto, "Cập nhật thành công");
        }

        // ---------------- DELETE ----------------
        public async Task<ServiceResult<bool>> DeleteUserAsync(int id)
        {
            var u = await _repo.GetSimpleByIdAsync(id);
            if (u == null) return ServiceResult<bool>.Fail("User không tồn tại");

            var ok = await _repo.DeleteAsync(u);
            return ok ? ServiceResult<bool>.Ok(true, "Xóa thành công")
                      : ServiceResult<bool>.Fail("Xóa thất bại");
        }
    }
}
