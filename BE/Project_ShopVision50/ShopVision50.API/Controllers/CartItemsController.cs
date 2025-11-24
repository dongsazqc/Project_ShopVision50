using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Shop_Db.Models;
using ShopVision50.API.Services.CartItemService;

namespace ShopVision50.API.Controllers
{
[ApiController]
[Route("api/[controller]")]
public class CartItemsController : ControllerBase
{
    private readonly ICartItemService _cartItemService;

    public CartItemsController(ICartItemService cartItemService)
    {
        _cartItemService = cartItemService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cartItems = await _cartItemService.GetAllAsync();
        return Ok(cartItems);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cartItem = await _cartItemService.GetByIdAsync(id);
        if (cartItem == null) return NotFound();
        return Ok(cartItem);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CartItem cartItem)
    {
        await _cartItemService.AddAsync(cartItem);
        return CreatedAtAction(nameof(GetById), new { id = cartItem.CartItemId }, cartItem);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CartItem cartItem)
    {
        if (id != cartItem.CartItemId) return BadRequest();

        var exist = await _cartItemService.GetByIdAsync(id);
        if (exist == null) return NotFound();

        await _cartItemService.UpdateAsync(cartItem);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var exist = await _cartItemService.GetByIdAsync(id);
        if (exist == null) return NotFound();

        await _cartItemService.DeleteAsync(id);
        return NoContent();
    }
}

}