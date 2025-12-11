using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Services.LocProductService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocProductController : ControllerBase
    {
        private readonly ILocProductService _service;

        public LocProductController(ILocProductService service)
        {
            _service = service;
        }

        [HttpGet("ByCategory")]
        public async Task<IActionResult> GetProductsByCategory([FromQuery] string categoryName)
        {
            if (string.IsNullOrEmpty(categoryName))
                return BadRequest("Category name is required.");

            var result = await _service.GetProductsByCategoryNameAsync(categoryName);

            return Ok(result);
        }
    }
}
