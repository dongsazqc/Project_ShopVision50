using Microsoft.AspNetCore.Mvc;
using ShopVision50.API;
using ShopVision50.API.LlamaAiService;

 [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly LlamaAiService _llamaService;
        private readonly MemoryHelper _memoryHelper;

        public ChatController()
        {
            _llamaService = new LlamaAiService(
                "/home/dong/Desktop/Project_ShopVision50/BE/Project_ShopVision50/ShopVision50.AgentPy/llama.cpp/build/bin/llama-cli",
                "/home/dong/Desktop/Project_ShopVision50/BE/Project_ShopVision50/ShopVision50.AgentPy/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"
                
            );
             _memoryHelper = new MemoryHelper();
        }

[HttpPost]
public async Task<IActionResult> Post([FromBody] ChatRequest req)
{
    if (req == null || string.IsNullOrWhiteSpace(req.Message))
        return BadRequest(new { error = "Message is required" });

    try
    {
        var promptWithMemory = await _memoryHelper.BuildPromptWithMemoryAsync(req.Message);

        var rawReply = await _llamaService.QueryAsync(promptWithMemory);

        Console.WriteLine("RAW Llama reply:\n" + rawReply);

        var reply = ExtractCoreAnswer(rawReply);

        Console.WriteLine("Extracted reply:\n" + reply);

        return Ok(new { reply });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}

private string ExtractCoreAnswer(string rawOutput)
{
    if (string.IsNullOrEmpty(rawOutput))
        return "";

    var marker = "*****Trả lời*****:";
    var firstIndex = rawOutput.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
    if (firstIndex < 0)
        return rawOutput.Trim();

    var answerPart = rawOutput.Substring(firstIndex + marker.Length).Trim();

    var questionIndex = answerPart.IndexOf("Câu hỏi:", StringComparison.OrdinalIgnoreCase);
    if (questionIndex >= 0)
    {
        answerPart = answerPart.Substring(0, questionIndex).Trim();
    }

    return answerPart;
}
    }

    

    public class ChatRequest
    {
        public string Message { get; set; }
    }