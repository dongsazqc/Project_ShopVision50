using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.ProductImageService_FD
{
    public interface IProductImageService
    {
    Task<List<ImageDetailDto>> GetImagesByProductIdAsync(int productId);
    Task<bool> AddProductImageAsync(int productId, IFormFile file);
    Task<bool> DeleteProductImageAsync(int productId, int imageId);
    }
    
    }
