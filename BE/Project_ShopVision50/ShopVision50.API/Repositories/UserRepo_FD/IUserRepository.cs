using Shop_Db.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopVision50.API.Repositories
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllAsync();
        Task<List<User>> GetAllWithDetailAsync();
        Task<User?> GetByIdAsync(int id);           // include đầy đủ
        Task<User?> GetSimpleByIdAsync(int id);     // không include (update/delete)
        Task<User?> GetByEmailAsync(string email);
        Task<User> AddAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<bool> DeleteAsync(User user);
    }
}
