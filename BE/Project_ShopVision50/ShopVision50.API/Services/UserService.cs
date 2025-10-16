using Shop_Db.Models;
using ShopVision50.API.Modules.Users.DTOs;
using ShopVision50.API.Repositories;
using BCrypt.Net;

namespace ShopVision50.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository; // Repository để lưu vào DB

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<(bool Success, string Message)> RegisterAsync(RegisterDto dto)
        {
            // Check xem user đã tồn tại chưa
            var existing = await _userRepository.GetByUsernameAsync(dto.FullName);
            if (existing != null)
                return (false, "Username already exists");

            // Hash password (dùng BCrypt hoặc bất cứ cái gì)
            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Lưu vào DB
            await _userRepository.AddAsync(new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = hashed
                
            });

            return (true, "User registered successfully");
        }
    }

}
