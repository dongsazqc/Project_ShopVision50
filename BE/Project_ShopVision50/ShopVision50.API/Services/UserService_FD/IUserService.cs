using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopVision50.API.Services.UserService_FD
{
    public interface IUserService
    {
        // GET ALL
        Task<ServiceResult<List<User>>> GetAllUsersAsyncSer();

        // GET BY ID
        Task<ServiceResult<User>> GetUserByIdAsync(int id);

        // REGISTER
        Task<ServiceResult<string>> RegisterUserAsync( User user);   

        // UPDATE/DELETE
        Task<ServiceResult<User>> UpdateUserAsync(User id);
        Task<ServiceResult<string>> DeleteUserAsync(int id);
    }
}
