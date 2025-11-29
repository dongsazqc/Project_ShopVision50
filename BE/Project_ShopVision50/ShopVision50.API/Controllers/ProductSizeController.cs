using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Services.ProductSizeService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductSizeController : ControllerBase
    {
        private readonly IProductSizeService _service;

        public ProductSizeController(IProductSizeService service)
        {
            _service = service;
        }

        // GET: /api/ProductSize/GetAll
        [HttpGet("GetAll")]
        [Authorize]

        public async Task<IActionResult> GetAll()
        {
            var sizes = await _service.GetAllAsync();
            return Ok(sizes);
        }
    }
}
