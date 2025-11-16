using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.MaterialService_FD;

namespace ShopVision50.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaterialController : ControllerBase
    {
        private readonly IMaterialService _service;

        public MaterialController(IMaterialService service)
        {
            _service = service;
        }

        [HttpGet("GetAllMaterial")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("GetMaterialById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            if (data == null) return NotFound();
            return Ok(data);
        }

        // ---------------------------- //
        // NEW: Create
        // ---------------------------- //
        [HttpPost("CreateMaterial")]
        public async Task<IActionResult> Create([FromBody] MaterialDto dto)
        {
            var result = await _service.CreateAsync(dto);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ---------------------------- //
        // NEW: Update
        // ---------------------------- //
        [HttpPut("UpdateMaterial/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MaterialDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // ---------------------------- //
        // NEW: Delete
        // ---------------------------- //
        [HttpDelete("DeleteMaterial/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}