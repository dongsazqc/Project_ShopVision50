using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace ShopVision50.API
{
    public class MemoryHelper
    {
        public async Task<string> BuildPromptWithMemoryAsync(string userInput)
        {
            using var client = new HttpClient();
            var content = new StringContent(
                JsonSerializer.Serialize(new { text = userInput }),
                Encoding.UTF8, "application/json");

            var response = await client.PostAsync("http://127.0.0.1:8000/search", content);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
                var memoryResults = JsonSerializer.Deserialize<MemorySearchResponse>(json);

                // Chống null cực mạnh
                if (memoryResults == null || memoryResults.Results == null)
                {
                    memoryResults = new MemorySearchResponse { Results = new List<string>() };
                }

                int a = 1;
                var promptBuilder = new StringBuilder();
                promptBuilder.AppendLine("Dưới đây là thông tin nhớ của chatbot:");
                    foreach(var memText in memoryResults.Results)
                    {
                        promptBuilder.AppendLine(memText);
                    }
                promptBuilder.AppendLine("\nCâu hỏi:");
                promptBuilder.AppendLine(userInput);
                promptBuilder.AppendLine("*****Trả lời*****:");
    

            return promptBuilder.ToString();
        }
    }

  
        public class MemorySearchResponse
        {
            [JsonPropertyName("results")]
            public List<string> Results { get; set; }
        }
}
