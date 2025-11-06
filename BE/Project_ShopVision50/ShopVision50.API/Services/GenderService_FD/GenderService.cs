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

        public async Task<IEnumerable<GenderDto>> GetAllAsync()
        {
            var genders = await _repo.GetAllAsync();
            return genders.Select(g => new GenderDto
            {
                GenderId = g.GenderId,
                Name = g.Name
            });
        }
    }
}
