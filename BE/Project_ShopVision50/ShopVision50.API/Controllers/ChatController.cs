using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.LlamaAiService;

 [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly LlamaAiService _llamaService;

        public ChatController()
        {
            _llamaService = new LlamaAiService(
                "/home/dong/Desktop/Project_ShopVision50/BE/Project_ShopVision50/ShopVision50.AgentPy/llama.cpp/build/bin/llama-cli",
                "/home/dong/Desktop/Project_ShopVision50/BE/Project_ShopVision50/ShopVision50.AgentPy/llama.cpp/models/ "
            );
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Message))
                return BadRequest(new { error = "Message is required" });

            try
            {
                var reply = await _llamaService.QueryAsync(req.Message);
                return Ok(new { reply });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

    }

    public class ChatRequest
    {
        public string Message { get; set; }
    }