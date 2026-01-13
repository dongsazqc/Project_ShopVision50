using System.Collections.Generic;
using System.Threading.Tasks;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.CommentService_FD
{
    public interface ICommentService
    {
        Task<IEnumerable<CommentShowDto>> GetAllCommentsAsync();
        Task<CommentShowDto?> GetCommentByIdAsync(int id);
        Task<CommentShowDto?> CreateCommentAsync(CommentCreateDto dto);
        Task<IEnumerable<CommentShowDto>> GetCommentsByProductIdAsync(int productId);
        Task<bool> UpdateCommentAsync(int id, CommentCreateDto dto);
        Task<bool> DeleteCommentAsync(int id);
    }
}
