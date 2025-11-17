using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ShopVision50.API.Services.ProductImageService_FD;

namespace ShopVision50.API.Controllers
{
    [ApiController]
[Route("api/products/{productId}/images")]
public class ProductImageController : ControllerBase
{
    private readonly IProductImageService _service;

    public ProductImageController(IProductImageService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> UploadImage([FromRoute] int productId, [FromForm] IFormFile file)
    {
        try
        {
            var productImage = await _service.UploadProductImageAsync(productId, file);
            return Ok(productImage);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("checkimages")]
    public async Task<IActionResult> GetProductImages([FromRoute] int productId)
    {
        var images = await _service.GetImagesByProductIdAsync(productId);
        return Ok(images);
    }
}

}

