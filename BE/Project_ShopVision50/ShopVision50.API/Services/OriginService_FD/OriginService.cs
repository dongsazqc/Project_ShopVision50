using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.OriginRepo_FD;
using Shop_Db.Models;

namespace ShopVision50.API.Services.OriginService_FD
{
    public class OriginService : IOriginService
    {
        private readonly IOriginRepository _repo;

        public OriginService(IOriginRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<OriginDto>> GetAllAsync()
        {
            var origins = await _repo.GetAllAsync();
            return origins.Select(o => new OriginDto
            {
                OriginId = o.OriginId,
                Country = o.Country
            });
        }

        public async Task<OriginDto?> GetByIdAsync(int id)
        {
            var o = await _repo.GetByIdAsync(id);
            if (o == null) return null;
            return new OriginDto
            {
                OriginId = o.OriginId,
                Country = o.Country
            };
        }

        public async Task<bool> CreateAsync(OriginDto dto)
        {
            var entity = new Origin
            {
                Country = dto.Country
            };
            await _repo.AddAsync(entity);
            return true;
        }

        public async Task<bool> UpdateAsync(int id, OriginDto dto)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Country = dto.Country;
            await _repo.UpdateAsync(existing);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            await _repo.DeleteAsync(id);
            return true;
        }
    }
}
