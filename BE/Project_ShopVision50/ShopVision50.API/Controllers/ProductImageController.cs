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

    [HttpPost]  // POST api/products/{productId}/images
    public async Task<IActionResult> AddImage(int productId, IFormFile file)
    {
        if (file == null)
            return BadRequest("File không được để trống");

        var result = await _service.AddProductImageAsync(productId, file);

        if (result) return Ok("Upload thành công");
        return StatusCode(500, "Upload thất bại");
    }

    [HttpGet("checkimages")]  // GET api/products/{productId}/images
    public async Task<IActionResult> GetProductImages(int productId)
    {
        var images = await _service.GetImagesByProductIdAsync(productId);
        return Ok(images);
    }
}

}

