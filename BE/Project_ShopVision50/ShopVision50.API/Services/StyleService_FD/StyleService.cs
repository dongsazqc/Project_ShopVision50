using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.StyleRepo_FD;

namespace ShopVision50.API.Services.StyleService_FD
{
    public class StyleService : IStyleService
    {
        private readonly IStyleRepo _repository;

        public StyleService(IStyleRepo repository)
        {
            _repository = repository;
        }

        public async Task<List<StyleDto>> GetAllStylesAsync()
        {
            var styles = await _repository.GetAllAsync();

            return styles.Select(s => new StyleDto
            {
                StyleId = s.StyleId,
                Name = s.Name,
            }).ToList();    

        }

        public async Task<Style?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<bool> CreateAsync(Style style)
        {
            await _repository.AddAsync(style);
            return true;
        }

        public async Task<bool> UpdateAsync(Style style)
        {
            var existing = await _repository.GetByIdAsync(style.StyleId);
            if (existing == null) return false;

            existing.Name = style.Name;
            await _repository.UpdateAsync(existing);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
            return true;
        }
    }
}
