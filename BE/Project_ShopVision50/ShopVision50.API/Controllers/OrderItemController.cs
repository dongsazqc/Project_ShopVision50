using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Shop_Db.Models;
using ShopVision50.API.Services.OrderItemService_FD;

namespace ShopVision50.API.Controllers
{
   [Route("api/[controller]")]
[ApiController]
public class OrderItemController : ControllerBase
{
    private readonly IOrderItemService _service;

    public OrderItemController(IOrderItemService service)
    {
        _service = service;
    }

    [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();

        return Ok(item);
    }

    [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(OrderItem dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.OrderItemId }, created);
    }

    [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, OrderItem dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
    {
        bool success = await _service.DeleteAsync(id);
        if (!success) return NotFound();

        return NoContent();
    }
}

}