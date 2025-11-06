using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.Infrastructure;

namespace ShopVision50.API.Repositories.MaterialRepo_FD
{
     public class MaterialRepository : IMaterialRepository
    {
        private readonly AppDbContext _context;

        public MaterialRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Material>> GetAllAsync()
        {
            return await _context.Materials.ToListAsync();
        }

        public async Task<Material?> GetByIdAsync(int id)
        {
            return await _context.Materials.FindAsync(id);
        }
    }
}