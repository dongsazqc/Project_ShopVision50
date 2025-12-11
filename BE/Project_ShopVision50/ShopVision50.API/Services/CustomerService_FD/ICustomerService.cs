using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.CustomerService_FD
{
    public interface ICustomerService
    {
        Task<UserReadDto?> GetByPhoneAsync(string phone);
    }
}
