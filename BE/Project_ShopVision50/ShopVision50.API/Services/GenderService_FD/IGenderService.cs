using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.CategoriesService_FD
{
    public interface IGenderService
    {
        Task<IEnumerable<GenderDto>> GetAllAsync();   // có s?n
        Task<GenderDto?> GetByIdAsync(int id);        // m?i
        Task<ServiceResult<GenderDto>> CreateAsync(GenderDto dto);   // m?i
        Task<ServiceResult<GenderDto>> UpdateAsync(int id, GenderDto dto); // m?i
        Task<ServiceResult<bool>> DeleteAsync(int id); // m?i
    }
}