using Shop_Db.Models;
using ShopVision50.API.Modules.Users.DTOs;
using ShopVision50.API.Repositories;
using BCrypt.Net;
using ShopVision50.API.Models.Users.DTOs;


// đây là nơi dùng để kiểu như validate dữ liệu, format dữ liệu , quyết định xem sẽ lưu những cái gì vào DB
namespace ShopVision50.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository; // Repository để lưu vào DB

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<(bool Success, string Message)> RegisterUserAsync(RegisterDto dto)
        {
            // Check xem user đã tồn tại chưa
            var existing = await _userRepository.GetByUsernameAsync(dto.FullName);
            if (existing != null)
                return (false, "Username already exists");

            // Hash password (dùng BCrypt)
            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Gọi hàm AddregisteredAsync để lưu user mới vào DB
            await _userRepository.AddregisteredAsync(new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = hashed
                
            });

            return (true, "User registered successfully");
        }

        public async Task<List<UserListDto>> GetAllUsersAsyncSer() // hàm này để lấy ra user
        {
            var  user = await _userRepository.GetAllUsersAsyncRepo();  // chổ này định nghĩa biến user là toàn bộ user trong Models User ở Domain

            var userListDtos = new List<UserListDto>(); // khởi tạo userListDtos là 1 list rỗng kiểu UserListDto để chứa dữ liệu trả về

            foreach (var u in user) // chổ này là khởi tạo 1 biến u để duyệt từng thằng user trong biến user
            {
                var userMang = new UserListDto()  // khởi tạo biến userListDto kiểu UserListDto để chứa dữ liệu từng user
                {
                    Id = u.UserId,
                    Username =u.FullName,
                    Email = u.Email
                }; 
                userListDtos.Add(userMang); // thêm từng thằng userMang vào trong userListDtos

            }
            return userListDtos;  // trả về cái thằng userListDtos mà trong hợp đồng có
        }

    }

}
