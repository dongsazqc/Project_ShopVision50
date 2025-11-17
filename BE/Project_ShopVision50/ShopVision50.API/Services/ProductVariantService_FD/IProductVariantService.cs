using System.Collections.Generic;
using System.Threading.Tasks;
using ShopVision50.API.Models.Users.DTOs;

public interface IProductVariantService
{
    Task<IEnumerable<BienTheResponseDto>> GetAllAsync();
    Task<IEnumerable<BienTheResponseDto>> GetByProductIdAsync(int productId);
    Task<bool> CreateAsync(BienTheDto dto);
}
