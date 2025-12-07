using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.CartService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _service;

        public CartController(ICartService service)
        {
            _service = service;
        }

        // Lấy giỏ hàng theo user
        [HttpGet("GetCartByUser/{userId}")]
            [Authorize]

        public async Task<IActionResult> GetCartByUser(int userId)
        {
            var cart = await _service.GetCartByUserIdAsync(userId);
            if (cart == null)
                return NotFound(new { message = "Cart not found" });

            return Ok(cart);
        }

        // Xóa cart item
        [HttpDelete("RemoveCartItem/{cartItemId}")]
            [Authorize]

        public async Task<IActionResult> RemoveCartItem(int cartItemId)
        {
            var success = await _service.RemoveCartItemAsync(cartItemId);
            if (!success)
                return NotFound(new { message = "Cart item not found" });

            return Ok(new { message = "Deleted successfully" });
        }
        [HttpPost("AddToCart")]
    [Authorize]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized("User ID không có trong token");

        if (!int.TryParse(userIdClaim.Value, out int userId))
            return BadRequest("User ID không hợp lệ");

        await _service.AddToCartAsync(userId, request);
        return Ok(new { message = "Thêm vào giỏ hàng thành công" });
    }

    [HttpPut("increase-quantity/{cartItemId}")]
[Authorize]
public async Task<IActionResult> IncreaseQuantity(int cartItemId, [FromQuery] int quantity)
{
    if (quantity <= 0) return BadRequest("Quantity must be greater than zero");

    var success = await _service.IncreaseQuantityAsync(cartItemId, quantity);
    if (!success) return NotFound("Cart item not found");

    return Ok(new { message = "Quantity increased successfully" });
}

[HttpPut("decrease-quantity/{cartItemId}")]
[Authorize]
public async Task<IActionResult> DecreaseQuantity(int cartItemId, [FromQuery] int quantity)
{
    if (quantity <= 0) return BadRequest("Quantity must be greater than zero");

    var success = await _service.DecreaseQuantityAsync(cartItemId, quantity);
    if (!success) return NotFound("Cart item not found");

    return Ok(new { message = "Quantity decreased successfully" });
}

    }
}
