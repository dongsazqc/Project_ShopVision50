using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Repositories.OriginRepo_FD
{
     public interface IOriginRepository
    {
        Task<IEnumerable<Origin>> GetAllAsync();
        Task<Origin?> GetByIdAsync(int id);
        Task AddAsync(Origin origin);
        Task UpdateAsync(Origin origin);
        Task DeleteAsync(int id);
    }
}