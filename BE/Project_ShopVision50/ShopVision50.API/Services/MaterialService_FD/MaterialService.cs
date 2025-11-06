using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.MaterialRepo_FD;

namespace ShopVision50.API.Services.MaterialService_FD
{
     public class MaterialService : IMaterialService
    {
        private readonly IMaterialRepository _repo;

        public MaterialService(IMaterialRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MaterialDto>> GetAllAsync()
        {
            var materials = await _repo.GetAllAsync();
            return materials.Select(m => new MaterialDto
            {
                MaterialId = m.MaterialId,
                Name = m.Name
            });
        }

        public async Task<MaterialDto?> GetByIdAsync(int id)
        {
            var material = await _repo.GetByIdAsync(id);
            if (material == null) return null;

            return new MaterialDto
            {
                MaterialId = material.MaterialId,
                Name = material.Name
            };
        }
    }
}