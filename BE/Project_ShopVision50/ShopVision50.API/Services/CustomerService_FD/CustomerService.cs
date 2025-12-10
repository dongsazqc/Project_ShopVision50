using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.CustomerRepo_FD;

namespace ShopVision50.API.Services.CustomerService_FD
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repository;

        public CustomerService(ICustomerRepository repository)
        {
            _repository = repository;
        }

        public async Task<UserReadDto?> GetByPhoneAsync(string phone)
        {
            var user = await _repository.GetByPhoneAsync(phone);
            if (user == null) return null;

            return new UserReadDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Status = user.Status,
                JoinDate = user.JoinDate,
                RoleId = user.RoleId,
                DefaultAddress = user.DefaultAddress
            };
        }
    }
}
