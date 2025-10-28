using ShopVision50.API.Models.Users.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopVision50.API.Services.UserService_FD
{
    public interface IUserService
    {
        // GET ALL
        Task<ServiceResult<List<object>>> GetAllUsersAsyncSer();

        // GET BY ID
        Task<ServiceResult<object>> GetUserByIdAsync(int id);

        // REGISTER
        Task<ServiceResult<string>> RegisterUserAsync(UserDto dto);

        // UPDATE/DELETE
        Task<ServiceResult<UserDto>> UpdateUserAsync(int id, UserDto dto);
        Task<ServiceResult<bool>> DeleteUserAsync(int id);
    }
}
