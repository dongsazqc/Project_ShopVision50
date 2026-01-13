using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopVision50.API.Repositories.ComentRepo_FD;
using ShopVision50.Domain.Models;
using ShopVision50.Infrastructure;

public class CommentRepository : ICommentRepository
{
    private readonly AppDbContext _context;
    public CommentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Comment entity) => await _context.Comments.AddAsync(entity);

    public void Delete(Comment entity) => _context.Comments.Remove(entity);

    public async Task<IEnumerable<Comment>> GetAllAsync()
    {
        return await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Product)
            .ToListAsync();
    }

    public async Task<Comment?> GetByIdAsync(int id)
    {
        return await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Product)
            .FirstOrDefaultAsync(c => c.CommentId == id);
    }

    public void Update(Comment entity) => _context.Comments.Update(entity);

    public async Task<bool> SaveChangesAsync() => (await _context.SaveChangesAsync()) > 0;


    public async Task<IEnumerable<Comment>> GetByProductIdAsync(int productId)
{
    return await _context.Comments
        .Include(c => c.User)
        .Include(c => c.Product)
        .Where(c => c.ProductId == productId)
        .ToListAsync();
}

}
