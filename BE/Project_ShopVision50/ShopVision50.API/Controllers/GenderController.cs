using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.CategoriesService_FD;
using ShopVision50.API.Services.GenderService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenderController : ControllerBase
    {
        private readonly IGenderService _service;

        public GenderController(IGenderService service)
        {
            _service = service;
        }

        [HttpGet("GetAllGender")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // --------------------------- //
        // NEW: Get by id
        // --------------------------- //
        [HttpGet("GetGenderById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy giới tính" });

            return Ok(result);
        }

        // --------------------------- //
        // NEW: Create
        // --------------------------- //
        [HttpPost("CreateGender")]
        public async Task<IActionResult> Create([FromBody] GenderDto dto)
        {
            var result = await _service.CreateAsync(dto);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // --------------------------- //
        // NEW: Update
        // --------------------------- //
        [HttpPut("UpdateGender/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] GenderDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // --------------------------- //
        // NEW: Delete
        // --------------------------- //
        [HttpDelete("DeleteGender/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}
