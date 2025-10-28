using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.PromotionService_FD
{
    /// <summary>
    /// Interface định nghĩa các nghiệp vụ liên quan đến Promotion.
    /// Controller sẽ phụ thuộc vào interface này thay vì implementation trực tiếp.
    /// </summary>
    public interface IPromotionService
    {
        /// <summary>
        /// Lấy danh sách tất cả khuyến mãi.
        /// Trả về IEnumerable<PromotionDto> để controller chuyển tiếp cho client.
        /// </summary>
        Task<IEnumerable<PromotionDto>> GetAllAsync();

        /// <summary>
        /// Lấy chi tiết khuyến mãi theo id.
        /// Kết quả bao gồm thông tin khuyến mãi và (nếu có) các OrderItems / OrderPromotions áp dụng.
        /// Trả về null nếu không tìm thấy.
        /// </summary>
        Task<PromotionDto?> GetByIdAsync(int id);

        /// <summary>
        /// Tạo mới khuyến mãi từ PromotionDto.
        /// Trả về ServiceResult chứa DTO mới (có PromotionId) hoặc lỗi.
        /// </summary>
        Task<ServiceResult<PromotionDto>> CreateAsync(PromotionDto dto);

        /// <summary>
        /// Cập nhật khuyến mãi theo id từ PromotionDto.
        /// Trả về ServiceResult biểu thị thành công/không thành công.
        /// </summary>
        Task<ServiceResult<PromotionDto>> UpdateAsync(int id, PromotionDto dto);
    }
}
