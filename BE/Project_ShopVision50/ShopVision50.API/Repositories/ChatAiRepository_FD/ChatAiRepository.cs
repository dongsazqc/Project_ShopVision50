using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.Domain.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.ChatAiRepository_FD
{
    public class ChatAiRepository : IChatAiRepository
{
        private readonly AppDbContext _context;

    public ChatAiRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddChatAsync(CHATAI chat)
    {
        _context.ChatAis.Add(chat);
        await _context.SaveChangesAsync();
    }
}
}