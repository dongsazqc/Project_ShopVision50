// Services/UserService_FD/IUserService.cs
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.UserService_FD
{
    public interface IUserService
    {
        // AuthController đang dùng
        Task<ServiceResult<UserReadDto>> RegisterUserAsync(RegisterDto dto);
        Task<IEnumerable<UserReadDto>> GetAllUsersAsyncSer();

        // Users API
        Task<ServiceResult<UserReadDto>> GetUserByIdAsync(int id);
        Task<ServiceResult<UserReadDto>> UpdateUserAsync(int id, UserUpdateDto dto);
        Task<ServiceResult<bool>> DeleteUserAsync(int id);
    }
}
