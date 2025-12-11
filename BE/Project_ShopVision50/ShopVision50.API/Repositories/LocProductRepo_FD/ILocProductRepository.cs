using Shop_Db.Models;

namespace ShopVision50.API.Repositories.LocProductRepo_FD
{
    public interface ILocProductRepository
    {
        Task<List<Product>> GetProductsByCategoryNameAsync(string categoryName);
    }
}
