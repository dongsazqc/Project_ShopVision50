using ShopVision50.API.Modules.Users.DTOs;

namespace ShopVision50.API.Services
{
    public interface IUserService
    {
        Task<(bool Success, string Message)> RegisterAsync(RegisterDto dto);
    }
}
