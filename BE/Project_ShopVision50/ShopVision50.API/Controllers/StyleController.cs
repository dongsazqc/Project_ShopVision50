using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shop_Db.Models;
using ShopVision50.API.Services.StyleService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StyleController : ControllerBase   
    {
        private readonly IStyleService _service;

        public StyleController(IStyleService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllStylesAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var style = await _service.GetByIdAsync(id);
            if (style == null) return NotFound();
            return Ok(style);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] Style style)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _service.CreateAsync(style);
            return Ok(new { message = "Style created successfully" });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] Style style)
        {
            if (id != style.StyleId) return BadRequest("ID mismatch");
            var success = await _service.UpdateAsync(style);
            if (!success) return NotFound();
            return Ok(new { message = "Style updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return Ok(new { message = "Style deleted successfully" });
        }
    }
}
