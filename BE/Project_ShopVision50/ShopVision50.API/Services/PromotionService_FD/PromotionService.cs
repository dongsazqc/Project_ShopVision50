using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.PromotionRepo_FD;

namespace ShopVision50.API.Services.PromotionService_FD
{
    // 🔹 Tầng nghiệp vụ (BLL): chỉ làm việc với DTO, không thao tác trực tiếp DB
    public class PromotionService : IPromotionService
    {
        private readonly IPromotionRepository _repo;

        public PromotionService(IPromotionRepository repo)
        {
            _repo = repo;
        }

        // 🔹 Lấy danh sách tất cả khuyến mãi
        public async Task<IEnumerable<PromotionDto>> GetAllAsync()
        {
            var promotions = await _repo.GetAllAsync();
            return promotions.Select(p => new PromotionDto
            {
                PromotionId = p.PromotionId,
                Code = p.Code,
                DiscountType = p.DiscountType,
                DiscountValue = p.DiscountValue,
                Condition = p.Condition,
                Scope = p.Scope,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Status = p.Status
            });

        }

        // 🔹 Lấy chi tiết khuyến mãi (sản phẩm + đơn hàng áp dụng)
        public async Task<PromotionDto?> GetByIdAsync(int id)
        {
            var (promotion, orderItems, orderPromotions) = await _repo.GetPromotionDetailsAsync(id);
            if (promotion == null) return null;

            var dto = new PromotionDto
            {
                PromotionId = promotion.PromotionId,
                Code = promotion.Code,
                DiscountType = promotion.DiscountType,
                DiscountValue = promotion.DiscountValue,
                Condition = promotion.Condition,
                Scope = promotion.Scope,
                StartDate = promotion.StartDate,
                EndDate = promotion.EndDate,
                Status = promotion.Status,
                // 🔹 Dù không có dữ liệu, ta khởi tạo mảng rỗng để không trả null
                OrderItems = new List<OrderItemDto>(),
                OrderPromotions = new List<OrderPromotionDto>()
            };

            // 🔸 Map sản phẩm áp dụng khuyến mãi
            if (orderItems.Any())
            {
                dto.OrderItems = orderItems.Select(oi => new OrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    Quantity = oi.Quantity,
                    DiscountAmount = oi.DiscountAmount,
                    ProductVariantId = oi.ProductVariantId,
                    ProductVariant = new ProductVariantDto
                    {
                        ProductVariantId = oi.ProductVariant.ProductVariantId,
                        SalePrice = oi.ProductVariant.SalePrice,
                        Stock = oi.ProductVariant.Stock,
                        ProductId = oi.ProductVariant.ProductId,
                        Product = new ProductDto
                        {
                            ProductId = oi.ProductVariant.Product.ProductId,
                            Name = oi.ProductVariant.Product.Name,
                            Price = oi.ProductVariant.Product.Price,
                            Description = oi.ProductVariant.Product.Description
                        }
                    }
                }).ToList();
            }

            // 🔸 Map đơn hàng áp dụng khuyến mãi
            if (orderPromotions.Any())
            {
                dto.OrderPromotions = orderPromotions.Select(op => new OrderPromotionDto
                {
                    OrderPromotionId = op.OrderPromotionId,
                    OrderId = op.OrderId,
                    PromotionId = op.PromotionId,
                    Order = new OrderDto
                    {
                        OrderId = op.Order.OrderId,
                        OrderDate = op.Order.OrderDate,
                        OrderType = op.Order.OrderType,
                        TotalAmount = op.Order.TotalAmount,
                        Status = op.Order.IsPaid,
                        RecipientName = op.Order.RecipientName,
                        RecipientPhone = op.Order.RecipientPhone,
                        ShippingAddress = op.Order.ShippingAddress
                    }
                }).ToList();
            }

            return dto;
        }

        // 🔹 Thêm mới khuyến mãi
        public async Task<ServiceResult<PromotionDto>> CreateAsync(PromotionDto dto)
        {
            var entity = new Promotion
            {
                Code = dto.Code,
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                Condition = dto.Condition,
                Scope = dto.Scope,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = dto.Status
            };

            var created = await _repo.AddAsync(entity);
            dto.PromotionId = created.PromotionId;

            return ServiceResult<PromotionDto>.Ok(dto, "Thêm khuyến mãi thành công");
        }

        // 🔹 Cập nhật khuyến mãi
        public async Task<ServiceResult<PromotionDto>> UpdateAsync(int id, PromotionDto dto)
        {
            var (existing, _, _) = await _repo.GetPromotionDetailsAsync(id);
            if (existing == null)
                return ServiceResult<PromotionDto>.Fail("Không tìm thấy khuyến mãi");

            existing.Code = dto.Code;
            existing.DiscountType = dto.DiscountType;
            existing.DiscountValue = dto.DiscountValue;
            existing.Condition = dto.Condition;
            existing.Scope = dto.Scope;
            existing.StartDate = dto.StartDate;
            existing.EndDate = dto.EndDate;
            existing.Status = dto.Status;

            await _repo.UpdateAsync(existing);
            return ServiceResult<PromotionDto>.Ok(dto, "Cập nhật thành công");
        }
    }
}
