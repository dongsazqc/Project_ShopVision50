using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Services.TopProductsService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TopSanPhamController : ControllerBase
    {
        private readonly ITopProductsService _service;

        public TopSanPhamController(ITopProductsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetTopSanPham([FromQuery] int limit = 10)
        {
            var data = await _service.GetTopProductsAsync(limit);
            return Ok(data);
        }
    }
}
