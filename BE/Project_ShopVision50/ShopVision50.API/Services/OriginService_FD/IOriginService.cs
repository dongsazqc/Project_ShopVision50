using System.Collections.Generic;
using System.Threading.Tasks;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.OriginService_FD
{
    public interface IOriginService
    {
        Task<IEnumerable<OriginDto>> GetAllAsync();
        Task<OriginDto?> GetByIdAsync(int id);
        Task<bool> CreateAsync(OriginDto dto);
        Task<bool> UpdateAsync(int id, OriginDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
