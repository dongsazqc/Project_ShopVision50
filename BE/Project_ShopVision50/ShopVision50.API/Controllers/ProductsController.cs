using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shop_Db.Models;
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



        [HttpGet("getProductsByName")]
        [Authorize]
        public async Task<IActionResult> GetProductsByName([FromQuery] string productName)
        {
            var products = await _productsService.GetProductByNameAsync(productName);
            if (products.Success)
                return Ok(products.Data);
            return BadRequest(products.Message);
        }


        [HttpPost("addProduct")]
        [Authorize]
        public async Task<IActionResult> AddProduct([FromBody] Product request)
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
        [Authorize]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _productsService.GetAllProductsAsync();
            return Ok(products);
        }


        [HttpGet("ProductDetails/{productsDetailsId}")]
        [Authorize]
        public async Task<IActionResult> GetProductDetails([FromRoute] int productsDetailsId)
        {
            var result = await _productsService.GetProductDetails(productsDetailsId);
            if (result.Success)
            {
                return Ok(result.Data);
            }
            else
            {
                return BadRequest(result.Message);
            }
        }
        [HttpDelete("DeleteProducts/{productId}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct([FromRoute] int productId)
        {
            var result = await _productsService.DeleteProductsAsync(productId);

            if (result.Success)
            {
                return Ok(result.Message); // "Xóa sản phẩm thành công"
            }
            else
            {
                return NotFound(result.Message); // "Không tìm thấy sản phẩm để xóa"
            }
        }
    }
}
