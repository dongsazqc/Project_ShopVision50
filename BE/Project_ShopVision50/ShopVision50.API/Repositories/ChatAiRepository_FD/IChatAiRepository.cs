using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.Domain.Models;

namespace ShopVision50.API.Repositories.ChatAiRepository_FD
{
public interface IChatAiRepository
{
    Task AddChatAsync(CHATAI chat);
}
}