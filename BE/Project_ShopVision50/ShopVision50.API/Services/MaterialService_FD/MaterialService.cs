using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
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

        // ---------------------------- //
        // NEW: Create
        // ---------------------------- //
        public async Task<ServiceResult<MaterialDto>> CreateAsync(MaterialDto dto)
        {
            var model = new Material
            {
                Name = dto.Name
            };

            await _repo.AddAsync(model);
            dto.MaterialId = model.MaterialId;

            return ServiceResult<MaterialDto>.Ok(dto, "Thêm chất liệu thành công");
        }

        // ---------------------------- //
        // NEW: Update
        // ---------------------------- //
        public async Task<ServiceResult<MaterialDto>> UpdateAsync(int id, MaterialDto dto)
        {
            var material = await _repo.GetByIdAsync(id);
            if (material == null)
                return ServiceResult<MaterialDto>.Fail("Không tìm thấy chất liệu");

            material.Name = dto.Name;

            await _repo.UpdateAsync(material);

            return ServiceResult<MaterialDto>.Ok(dto, "Cập nhật thành công");
        }

        // ---------------------------- //
        // NEW: Delete
        // ---------------------------- //
        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var material = await _repo.GetByIdAsync(id);
            if (material == null)
                return ServiceResult<bool>.Fail("Không tìm thấy chất liệu");

            await _repo.DeleteAsync(id);

            return ServiceResult<bool>.Ok(true, "Xóa chất liệu thành công");
        }
    }
}