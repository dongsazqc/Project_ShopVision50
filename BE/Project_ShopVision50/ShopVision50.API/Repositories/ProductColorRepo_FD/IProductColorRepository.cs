using Shop_Db.Models;

namespace ShopVision50.API.Repositories.ProductColorRepo_FD
{
    public interface IProductColorRepository
    {
        Task<IEnumerable<ProductColor>> GetAllAsync();
    }
}
