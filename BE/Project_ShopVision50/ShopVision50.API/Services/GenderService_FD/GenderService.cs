using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.GenderRepository_FD;
using ShopVision50.API.Services.CategoriesService_FD;

namespace ShopVision50.API.Services.GenderService_FD
{
    public class GenderService : IGenderService
    {
        private readonly IGenderRepository _repo;

        public GenderService(IGenderRepository repo)
        {
            _repo = repo;
        }

        // ----------------------------- //
        // EXISTING: GetAll
        // ----------------------------- //
        public async Task<IEnumerable<GenderDto>> GetAllAsync()
        {
            var genders = await _repo.GetAllAsync();
            return genders.Select(g => new GenderDto
            {
                GenderId = g.GenderId,
                Name = g.Name
            });
        }

        // ----------------------------- //
        // NEW: GetById
        // ----------------------------- //
        public async Task<GenderDto?> GetByIdAsync(int id)
        {
            var g = await _repo.GetByIdAsync(id);
            if (g == null) return null;

            return new GenderDto
            {
                GenderId = g.GenderId,
                Name = g.Name
            };
        }

        // ----------------------------- //
        // NEW: Create
        // ----------------------------- //
        public async Task<ServiceResult<GenderDto>> CreateAsync(GenderDto dto)
        {
            var gender = new Gender
            {
                Name = dto.Name
            };

            await _repo.AddAsync(gender);
            dto.GenderId = gender.GenderId;

            return ServiceResult<GenderDto>.Ok(dto, "Thêm gi?i tính thành công");
        }

        // ----------------------------- //
        // NEW: Update
        // ----------------------------- //
        public async Task<ServiceResult<GenderDto>> UpdateAsync(int id, GenderDto dto)
        {
            var gender = await _repo.GetByIdAsync(id);
            if (gender == null)
                return ServiceResult<GenderDto>.Fail("Không tìm th?y gi?i tính");

            gender.Name = dto.Name;

            await _repo.UpdateAsync(gender);
            return ServiceResult<GenderDto>.Ok(dto, "C?p nh?t thành công");
        }

        // ----------------------------- //
        // NEW: Delete
        // ----------------------------- //
        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var gender = await _repo.GetByIdAsync(id);
            if (gender == null)
                return ServiceResult<bool>.Fail("Không tìm th?y gi?i tính");

            await _repo.DeleteAsync(id);
            return ServiceResult<bool>.Ok(true, "Xóa gi?i tính thành công");
        }
    }
}
