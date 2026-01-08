using System.Collections.Generic;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;

public interface IProductVariantService
{
    Task<IEnumerable<BienTheResponseDto>> GetAllAsync();
    Task<IEnumerable<BienTheResponseDto>> GetByProductIdAsync(int productId);
    Task<ProductWithVariantsDto?> GetProductWithVariantsAsync(int productId);
    Task<bool> Updatestock(int id, int soluongCanTru);
    Task<bool> CreateAsync(BienTheDto dto);
    Task<IEnumerable<BienTheResponseDto>> GetVariantsByCategoryIdAsync(int categoryId);
}
