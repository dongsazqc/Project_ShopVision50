using Shop_Db.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopVision50.API.Repositories
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByPhoneAsync(string phone);
        Task<User> AddAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<bool> DeleteAsync(User user);

        Task<bool> CheckEmailExistsAsync(string email);
    }
}
