using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.OriginService_FD;
using System.Threading.Tasks;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OriginController : ControllerBase
    {
        private readonly IOriginService _service;

        public OriginController(IOriginService service)
        {
            _service = service;
        }

        // GET: api/Origin
        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var origins = await _service.GetAllAsync();
            return Ok(origins);
        }

        // GET: api/Origin/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var origin = await _service.GetByIdAsync(id);
            if (origin == null)
                return NotFound(new { message = "Origin not found" });

            return Ok(origin);
        }

        // POST: api/Origin
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] OriginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _service.CreateAsync(dto);
            if (!success)
                return BadRequest(new { message = "Failed to create origin" });

            return Ok(new { message = "Origin created successfully" });
        }

        // PUT: api/Origin/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] OriginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _service.UpdateAsync(id, dto);
            if (!success)
                return NotFound(new { message = "Origin not found or update failed" });

            return Ok(new { message = "Origin updated successfully" });
        }

        // DELETE: api/Origin/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = "Origin not found or delete failed" });

            return Ok(new { message = "Origin deleted successfully" });
        }
    }
}
