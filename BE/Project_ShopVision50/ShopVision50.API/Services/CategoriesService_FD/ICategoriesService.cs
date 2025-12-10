using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopVision50.API.Services.CategoriesService_FD
{
    public interface ICategoriesService
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<Category?> GetByIdAsync(int id);
        Task AddAsync(Category category);
        Task UpdateAsync(Category category);
        Task DeleteAsync(int id);
    }
}
