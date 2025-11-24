using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Shop_Db.Models;
using ShopVision50.API.Services.PaymentService_FD;

namespace ShopVision50.API.Controllers
{
    [ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var payments = await _paymentService.GetAllAsync();
        return Ok(payments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var payment = await _paymentService.GetByIdAsync(id);
        if (payment == null) return NotFound();
        return Ok(payment);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Payment payment)
    {
        await _paymentService.AddAsync(payment);
        return CreatedAtAction(nameof(GetById), new { id = payment.PaymentId }, payment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Payment payment)
    {
        if (id != payment.PaymentId) return BadRequest();

        var exist = await _paymentService.GetByIdAsync(id);
        if (exist == null) return NotFound();

        await _paymentService.UpdateAsync(payment);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var exist = await _paymentService.GetByIdAsync(id);
        if (exist == null) return NotFound();

        await _paymentService.DeleteAsync(id);
        return NoContent();
    }
}

}