using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ShopVision50.API.Services.RevenueService_FD;

namespace ShopVision50.API.Controllers
{
    [Route("api/[controller]")]
    public class RevenueController : Controller
    {
        private readonly IRevenueService _svc ;

            public RevenueController(IRevenueService revenueService)
    {
        _svc = revenueService;
    }
    [HttpGet("summary")]
    public IActionResult GetRevenueSummary([FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        if (from > to)
            return BadRequest("Để ý và chọn khung giờ cho chuẩn nhé");

        var result = _svc.GetRevenueSummary(from, to);
        return Ok(result);
    }
    }
}