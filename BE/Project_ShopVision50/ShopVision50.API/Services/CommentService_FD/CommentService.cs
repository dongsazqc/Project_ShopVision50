using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.ComentRepo_FD;
using ShopVision50.API.Services.CommentService_FD;
using ShopVision50.Domain.Models;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _repo;
    public CommentService(ICommentRepository repo)
    {
        _repo = repo;
    }

    // Helper mapping function (entity -> DTO)
    private CommentShowDto MapToDto(Comment c) => new CommentShowDto
    {
        CommentId = c.CommentId,
        Content = c.Content,
        Rating = c.Rating ?? 0, // nếu nullable thì default 0
        CreatedDate = c.CreatedDate,
        User = new UserDtoShow
        {
            UserId = c.User.UserId,
            FullName = c.User.FullName
        },
        Product = new ProductShowDto
        {
            ProductId = c.Product.ProductId,
            Name = c.Product.Name,
            Price = c.Product.Price
        }
    };

    public async Task<IEnumerable<CommentShowDto>> GetCommentsByProductIdAsync(int productId)
{
    var comments = await _repo.GetByProductIdAsync(productId);
    return comments.Select(MapToDto);
}


    public async Task<IEnumerable<CommentShowDto>> GetAllCommentsAsync()
    {
        var comments = await _repo.GetAllAsync();
        return comments.Select(MapToDto);
    }

    public async Task<CommentShowDto?> GetCommentByIdAsync(int id)
    {
        var comment = await _repo.GetByIdAsync(id);
        if (comment == null) return null;
        return MapToDto(comment);
    }

    public async Task<CommentShowDto?> CreateCommentAsync(CommentCreateDto dto)
    {
        var comment = new Comment
        {
            UserId = dto.UserId,
            ProductId = dto.ProductId,
            Content = dto.Content,
            Rating = dto.Rating,
            CreatedDate = System.DateTime.UtcNow
        };

        await _repo.AddAsync(comment);
        var saved = await _repo.SaveChangesAsync();

        if (!saved) return null;

        // Lấy lại comment mới tạo có đủ dữ liệu user và product để map DTO
        var createdComment = await _repo.GetByIdAsync(comment.CommentId);
        if (createdComment == null) return null;

        return MapToDto(createdComment);
    }

    public async Task<bool> UpdateCommentAsync(int id, CommentCreateDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;

        existing.UserId = dto.UserId;
        existing.ProductId = dto.ProductId;
        existing.Content = dto.Content;
        existing.Rating = dto.Rating;

        _repo.Update(existing);
        return await _repo.SaveChangesAsync();
    }

    public async Task<bool> DeleteCommentAsync(int id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;

        _repo.Delete(existing);
        return await _repo.SaveChangesAsync();
    }
}
