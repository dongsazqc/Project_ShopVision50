using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Repositories.MaterialRepo_FD
{
    public interface IMaterialRepository
    {
        Task<IEnumerable<Material>> GetAllAsync();
        Task<Material?> GetByIdAsync(int id);

        // NEW
        Task AddAsync(Material material);

        // NEW
        Task UpdateAsync(Material material);

        // NEW
        Task DeleteAsync(int id);
    }
}   