using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.CategoriesRepo_FD;

namespace ShopVision50.API.Services.CategoriesService_FD
{
    public class CategoriesService : ICategoriesService
    {
        private readonly ICategoriesReposirory _repository;

        public CategoriesService(ICategoriesReposirory repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var category = await _repository.GetAllAsync();

            return category.Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name, 
                Description= c.Description 
            });
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(Category category)
        {
            // Có thể validate data ở đây
            await _repository.AddAsync(category);
        }

        public async Task UpdateAsync(Category category)
        {
            await _repository.UpdateAsync(category);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}
