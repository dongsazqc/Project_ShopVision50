using System.Collections.Generic;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.StyleService_FD
{
    public interface IStyleService
    {
        Task<List<StyleDto>> GetAllStylesAsync();
        Task<Style?> GetByIdAsync(int id);
        Task<bool> CreateAsync(Style style);
        Task<bool> UpdateAsync(Style style);
        Task<bool> DeleteAsync(int id);
    }
}
