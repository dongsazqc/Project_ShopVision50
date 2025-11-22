using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class ProductWithVariantsDto
    {
         public int ProductId { get; set; }
    public string TenSanPham { get; set; } = string.Empty;

    public List<VariantDto> Variants { get; set; } = new List<VariantDto>();
    }

    public class VariantDto
{
    public int ProductVariantId { get; set; }
    public decimal GiaBan { get; set; }
    public int SoLuongTon { get; set; }
    public string TenMau { get; set; } = "Unknown";
    public string TenKichCo { get; set; } = "Unknown";
}
}