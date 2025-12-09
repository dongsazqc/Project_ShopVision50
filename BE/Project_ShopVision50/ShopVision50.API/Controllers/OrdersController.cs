using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Service.OrderService_FD;
namespace ShopVision50.API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _service;

        public OrdersController(IOrderService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _service.GetAllAsync();
            return Ok(orders);
        }

       [HttpGet("GetById/{id}")]
       [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _service.GetByIdAsync(id);
            if (order == null)
                return NotFound(new { message = $"Order with ID {id} not found." });

            return Ok(order);
        }

        [HttpPost("Add")]
        [Authorize]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var order = await _service.CreateOrderAsync(request);
        return CreatedAtAction(nameof(GetAll), new { id = order.OrderId }, order);
    }

        [HttpPut("Update/{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, Order order)
        {
            if (id != order.OrderId)
                return BadRequest(new { message = "ID in URL does not match ID in order data." });

            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = $"Order with ID {id} not found." });

            await _service.UpdateAsync(order);
            return Ok(new { message = "Order updated successfully." });
        }

       [HttpDelete("Delete/{id}")]
       [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = $"Order with ID {id} not found." });

            await _service.DeleteAsync(id);
            return Ok(new { message = "Order deleted successfully." });
        }

    [HttpGet("my-orders")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized("User ID không có trong token");

        if (!int.TryParse(userIdClaim.Value, out int userId))
            return BadRequest("User ID không hợp lệ");

        var orders = await _service.GetOrdersByUserIdAsync(userId);

        return Ok(orders);
    }
        [HttpPut("ChangeStatus")]
        [Authorize]
        public async Task<IActionResult> ChangeStatus([FromBody] OrderStatusChangeDto dto)
        {
            var result = await _service.ChangeOrderStatusAsync(dto.OrderId, dto.NewStatus);

            if (result.Contains("Không thể"))
                return BadRequest(new { message = result });

            return Ok(new { message = result });
        }
        [HttpGet("GetRealStatus/{id}")]
        public async Task<IActionResult> GetRealStatus(int id)
        {
            var order = await _service.GetByIdAsync(id);
            if (order == null) return NotFound();

            var status = await _service.GetRealOrderStatusAsync(order);
            return Ok(new { OrderId = id, Status = status });
        }
    }
}