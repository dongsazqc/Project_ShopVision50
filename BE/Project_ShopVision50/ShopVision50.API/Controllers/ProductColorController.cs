using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Services.ProductColorService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductColorController : ControllerBase
    {
        private readonly IProductColorService _service;

        public ProductColorController(IProductColorService service)
        {
            _service = service;
        }

        // GET: /api/ProductColor/GetAll
        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var colors = await _service.GetAllAsync();
            return Ok(colors);
        }
    }
}
