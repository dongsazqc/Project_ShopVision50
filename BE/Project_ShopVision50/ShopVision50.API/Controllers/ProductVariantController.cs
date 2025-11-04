using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Shop_Db.Models;
using ShopVision50.API.Services.ProductVariantService_FD;

namespace ShopVision50.API.Controllers
{
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
            var variants = await _service.GetAllAsync();
            return Ok(variants);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var variant = await _service.GetByIdAsync(id);
            if (variant == null) return NotFound();
            return Ok(variant);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] ProductVariant variant)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _service.CreateAsync(variant);
            return Ok(new { message = "Product variant created successfully" });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] ProductVariant variant)
        {
            if (id != variant.ProductVariantId) return BadRequest("ID mismatch");
            var success = await _service.UpdateAsync(variant);
            if (!success) return NotFound();
            return Ok(new { message = "Product variant updated successfully" });
        }
    
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return Ok(new { message = "Product variant deleted successfully" });
        }
    }
}