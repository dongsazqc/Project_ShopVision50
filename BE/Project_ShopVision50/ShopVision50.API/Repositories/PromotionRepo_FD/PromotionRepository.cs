using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.Domain.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.PromotionRepo_FD
{
    public class PromotionRepository : IPromotionRepository
    {
        private readonly AppDbContext _context;

        public PromotionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Promotion>> GetAllAsync()
        {
            return await _context.Promotions.ToListAsync();
        }

        // ✅ Truy vấn thủ công, không phụ thuộc navigation property
        public async Task<(Promotion? promotion, List<OrderItem> orderItems, List<OrderPromotion> orderPromotions)> GetPromotionDetailsAsync(int id)
        {
            var promotion = await _context.Promotions.FirstOrDefaultAsync(p => p.PromotionId == id);
            if (promotion == null)
                return (null, new List<OrderItem>(), new List<OrderPromotion>());

            // Lấy orderItems bằng PromotionId
            var orderItems = await _context.OrderItems
                .Include(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv.Product)
                .Where(oi => oi.PromotionId == id)
                .ToListAsync();

            // Lấy orderPromotions bằng PromotionId
            var orderPromotions = await _context.OrderPromotions
                .Include(op => op.Order)
                .Where(op => op.PromotionId == id)
                .ToListAsync();

            return (promotion, orderItems, orderPromotions);
        }

        public async Task<Promotion> AddAsync(Promotion promotion)
        {
            _context.Promotions.Add(promotion);
            await _context.SaveChangesAsync();
            return promotion;
        }

        public async Task UpdateAsync(Promotion promotion)
        {
            _context.Promotions.Update(promotion);
            await _context.SaveChangesAsync();
        }

        public async Task AssignPromotionToUserAsync(int userId, int promotionId)
        {
            var entity = new UserPromotion
            {
                UserId = userId,
                PromotionId = promotionId
            };

            _context.UserPromotions.Add(entity);
            await _context.SaveChangesAsync();
        }
        public async Task<List<Promotion>> GetPromotionsByUserIdAsync(int userId)
        {
            return await _context.UserPromotions
                .Where(up => up.UserId == userId)
                .Select(up => up.Promotion)
                .ToListAsync();
        }


    }
}
