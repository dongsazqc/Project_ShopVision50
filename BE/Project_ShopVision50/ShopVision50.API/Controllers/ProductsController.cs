using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.ProductsService_FD;

namespace ShopVision50.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class ProductsController : Controller
    {
        private readonly IProductsService _productsService;
        public ProductsController(IProductsService productsService)
        {
            _productsService = productsService;
        }



        [HttpPost("getProductsByName")]
        public async Task<IActionResult> GetProductsByName([FromBody] ProductDto request)
        {
            if (string.IsNullOrEmpty(request.Name))
                return BadRequest("Tên sản phẩm không được để trống.");

            var products = await _productsService.GetProductByNameAsync(request.Name);
            return Ok(products);
        }

        [HttpPost("addProduct")]
        public async Task<IActionResult> AddProduct([FromBody] ProductDto request)
        {
            if (string.IsNullOrEmpty(request.Name))
                return BadRequest("Tên sản phẩm không được để trống.");

            var result = await _productsService.AddProductAsync(request);

            if (result)
                return Ok("Thêm sản phẩm thành công!");
            else
                return StatusCode(500, "Thêm sản phẩm thất bại.");
        }
        [HttpGet("getAllProducts")]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _productsService.GetAllProductsAsync();
            return Ok(products);





        }
    }
}
