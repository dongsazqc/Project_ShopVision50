using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Modules.Users.DTOs;

namespace ShopVision50.API.Services
{
    public interface IUserService
    {
        Task<(bool Success, string Message)> RegisterUserAsync(RegisterDto dto); // hợp đồng chức năng đăng ký user


        Task<List<UserListDto>> GetAllUsersAsyncSer();   // hợp đồng chức năng lấy ra user , yêu cầu ai gọi hàm đều phải trả vè 1 list UserListDto
                                                         // Tại sao hàm yêu cầu trả về List vì: để sau này ví trong controller , chỉ cần gõ var users = await _userService.GetAllUsersAsyncSer();  là nhận được toàn bộ user bên trong mà cái hàm bên service nó trả về ý
    }
}
