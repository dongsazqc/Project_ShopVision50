using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Services.CustomerService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _service;

        public CustomerController(ICustomerService service)
        {
            _service = service;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchByPhone([FromQuery] string phone)
        {
            if (string.IsNullOrEmpty(phone))
                return BadRequest("Vui lòng nhập số điện thoại");

            var result = await _service.GetByPhoneAsync(phone);

            if (result == null)
                return NotFound($"Không tìm thấy khách hàng với số điện thoại: {phone}");

            return Ok(result);
        }
    }
}
