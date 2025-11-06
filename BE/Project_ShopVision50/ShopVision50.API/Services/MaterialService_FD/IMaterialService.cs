using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.MaterialService_FD
{
     public interface IMaterialService
    {
        Task<IEnumerable<MaterialDto>> GetAllAsync();
        Task<MaterialDto?> GetByIdAsync(int id);
    }
}