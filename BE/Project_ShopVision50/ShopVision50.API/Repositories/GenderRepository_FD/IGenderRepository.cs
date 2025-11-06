using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Repositories.GenderRepository_FD
{
    public interface IGenderRepository
    {
              Task<IEnumerable<Gender>> GetAllAsync();
        Task<Gender?> GetByIdAsync(int id);
        Task AddAsync(Gender gender);
        Task UpdateAsync(Gender gender);
        Task DeleteAsync(int id);
    }
}