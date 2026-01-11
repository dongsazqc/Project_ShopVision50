using Microsoft.AspNetCore.Mvc;
using ShopVision50.Domain.Models;
using ShopVision50.API.Services.ChatAiService_FD; // Đảm bảo đúng namespace service

[ApiController]
[Route("api/[controller]")]
public class ChatAiController : ControllerBase
{
    private readonly IChatAiService _service;

    public ChatAiController(IChatAiService service)
    {
        _service = service;
    }

    [HttpPost("save")]
    public async Task<IActionResult> SaveChat([FromBody] CHATAI request)
    {
        if (string.IsNullOrEmpty(request.UserId) ||
            string.IsNullOrEmpty(request.CauHoi) ||
            string.IsNullOrEmpty(request.Cautraloi))
        {
            return BadRequest("Thông tin không đầy đủ");
        }

        await _service.SaveChatAsync(request.UserId, request.CauHoi, request.Cautraloi);
        return Ok(new { message = "Lưu chat thành công" });
    }
}
