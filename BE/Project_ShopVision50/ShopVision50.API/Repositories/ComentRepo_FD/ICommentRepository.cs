using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.Domain.Models;

namespace ShopVision50.API.Repositories.ComentRepo_FD
{
public interface ICommentRepository
{
    Task<IEnumerable<Comment>> GetAllAsync();
    Task<Comment?> GetByIdAsync(int id);
    Task AddAsync(Comment entity);
    void Update(Comment entity);
    void Delete(Comment entity);
    Task<IEnumerable<Comment>> GetByProductIdAsync(int productId);
    Task<bool> SaveChangesAsync();
}

}