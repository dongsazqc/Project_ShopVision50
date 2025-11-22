using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class ProductVariantController : ControllerBase
{
    private readonly IProductVariantService _service;
    public ProductVariantController(IProductVariantService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{productId}")]
    [Authorize]
    public async Task<IActionResult> GetByProductId(int productId)
    {
        var result = await _service.GetByProductIdAsync(productId);
        if (!result.Any())
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] BienTheDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var success = await _service.CreateAsync(dto);
        if (!success)
            return BadRequest("Màu sắc, kích cỡ hoặc sản phẩm không tồn tại");

        return Ok(new { message = "Tạo biến thể thành công" });
    }

      [HttpGet("{productId}/variants")]
public async Task<IActionResult> GetProductWithVariants(int productId)
{
    var result = await _service.GetProductWithVariantsAsync(productId);

    if (result == null)
        return NotFound("Không tìm thấy sản phẩm hoặc biến thể");

    return Ok(result);
}

}
