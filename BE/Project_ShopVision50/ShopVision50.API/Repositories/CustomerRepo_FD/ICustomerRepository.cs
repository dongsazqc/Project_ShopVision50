using Shop_Db.Models;

namespace ShopVision50.API.Repositories.CustomerRepo_FD
{
    public interface ICustomerRepository
    {
        Task<User?> GetByPhoneAsync(string phone);
    }
}
