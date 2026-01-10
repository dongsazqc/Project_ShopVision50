using Shop_Db.Models;

namespace ShopVision50.API.Repositories.PromotionRepo_FD
{
    public interface IPromotionRepository
    {
        Task<IEnumerable<Promotion>> GetAllAsync();
        Task<(Promotion? promotion, List<OrderItem> orderItems, List<OrderPromotion> orderPromotions)> GetPromotionDetailsAsync(int id);
        Task<Promotion> AddAsync(Promotion promotion);
        Task AssignPromotionToUserAsync(int userId, int promotionId);
        Task<List<Promotion>> GetPromotionsByUserIdAsync(int userId);

        Task UpdateAsync(Promotion promotion);
    }
}
