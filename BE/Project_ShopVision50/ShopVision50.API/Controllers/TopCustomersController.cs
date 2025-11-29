using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Services.TopCustomersService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TopCustomersController : ControllerBase
    {
        private readonly ITopCustomersService _service;

        public TopCustomersController(ITopCustomersService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetTopCustomers([FromQuery] int limit = 10)
        {
            var data = await _service.GetTopCustomersAsync(limit);
            return Ok(data);
        }
    }
}
