using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.PromotionService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhuyenMaiController : ControllerBase
    {
        private readonly IPromotionService _promotionService;

        public KhuyenMaiController(IPromotionService promotionService)
        {
            _promotionService = promotionService;
        }

        // 🔹 [GET] /api/khuyenmai
        // ➜ Lấy danh sách khuyến mãi
        [HttpGet("GetAllPromotions")]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var data = await _promotionService.GetAllAsync();
            return Ok(data);
        }

        // 🔹 [GET] /api/khuyenmai/{id}
        // ➜ Lấy chi tiết khuyến mãi, bao gồm sản phẩm và đơn hàng áp dụng
        [HttpGet("GetPromotionById/{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _promotionService.GetByIdAsync(id);
            if (data == null)
                return NotFound(new { message = "Không tìm thấy khuyến mãi" });

            return Ok(data);
        }

        // 🔹 [POST] /api/khuyenmai
        // ➜ Thêm khuyến mãi mới
        [HttpPost("CreatePromotion")]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] PromotionDto dto)
        {
            var result = await _promotionService.CreateAsync(dto);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        // 🔹 [PUT] /api/khuyenmai/{id}
        // ➜ Cập nhật thông tin khuyến mãi
        [HttpPut("UpdatePromotion/{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] PromotionDto dto)
        {
            var result = await _promotionService.UpdateAsync(id, dto);
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }
    }
}
