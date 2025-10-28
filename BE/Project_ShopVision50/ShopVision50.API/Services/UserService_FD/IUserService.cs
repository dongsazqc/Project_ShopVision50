using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.UserService_FD
{
    public interface IUserService
    {
        Task<ServiceResult<List<UserDto>>> GetAllUsersAsyncSer();

        Task<ServiceResult<object>> GetUserByIdAsync(int id);

<<<<<<< Updated upstream
        // Đăng ký user (dùng chung cho Auth + Users)
        Task<ServiceResult<UserDto>> RegisterUserAsync(UserDto dto);
=======
        Task<ServiceResult<string>>RegisterUserAsync(UserDto dto);
>>>>>>> Stashed changes

        Task<ServiceResult<UserDto>> UpdateUserAsync(int id, UserDto dto);

        Task<ServiceResult<bool>> DeleteUserAsync(int id);
    }
}
