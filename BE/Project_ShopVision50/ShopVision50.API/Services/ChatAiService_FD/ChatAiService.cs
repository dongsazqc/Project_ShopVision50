using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.API.Repositories.ChatAiRepository_FD;
using ShopVision50.Domain.Models;

namespace ShopVision50.API.Services.ChatAiService_FD
{
    public class ChatAiService : IChatAiService
{
    private readonly IChatAiRepository _repo;

    public ChatAiService(IChatAiRepository repo)
    {
        _repo = repo;
    }

    public async Task SaveChatAsync(string userId, string cauHoi, string cauTraLoi)
    {
        var chat = new CHATAI
        {
            UserId = userId,
            CauHoi = cauHoi,
            Cautraloi = cauTraLoi
        };
        await _repo.AddChatAsync(chat);
    }
}
}