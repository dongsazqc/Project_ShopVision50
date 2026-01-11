using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Services.ChatAiService_FD
{
    public interface IChatAiService
{
    Task SaveChatAsync(string userId, string cauHoi, string cauTraLoi);
}
}