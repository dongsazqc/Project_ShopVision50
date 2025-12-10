using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
 public class BienTheResponseDto
{
    public int ProductVariantId { get; set; }
    public decimal GiaBan { get; set; }
    public int SoLuongTon { get; set; }
    public string TenMau { get; set; }
    public string TenKichCo { get; set; }
    public int ProductId { get; set; }
    public string TenSanPham { get; set; }
    public decimal DiscountPercent { get; set; }
}
}