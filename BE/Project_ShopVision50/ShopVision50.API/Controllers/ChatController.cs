using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RabbitMQ.Client;
using System.Text;

namespace ShopVision50.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        [HttpPost("send")]
        public IActionResult SendChat([FromBody] ChatMessage message)
        {
            try
            {
                var factory = new ConnectionFactory()
                {
                    HostName = "160.250.5.26",
                    UserName = "agent_user",
                    Password = "123456"
                };

                using var connection = factory.CreateConnection();
                using var channel = connection.CreateModel();

                channel.QueueDeclare(queue: "question_queue",
                                    durable: true,
                                    exclusive: false,
                                    autoDelete: false,
                                    arguments: null);

                var body = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(message));

                channel.BasicPublish(exchange: "",
                                    routingKey: "question_queue",
                                    basicProperties: null,
                                    body: body);

                return Ok(new { success = true, message = "Đã gửi tin nhắn đến agent!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
    }

    public class ChatMessage
    {
        public string User { get; set; }
        public string Question { get; set; }
    }
}
