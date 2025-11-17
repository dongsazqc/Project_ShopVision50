using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Services.ProductImageService_FD
{
    public interface IProductImageService
    {
          Task<ProductImage> UploadProductImageAsync(int productId, IFormFile file);
          Task<IEnumerable<ProductImage>> GetImagesByProductIdAsync(int productId);
}
    }
