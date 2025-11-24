using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class ImageDetailDto
{
    public int ImageId { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int ProductId { get; set; }
    public ProductSummaryDto? Product { get; set; }
    public VariantInfoDto? Variant { get; set; }
}

public class ProductSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Brand { get; set; } = string.Empty;
}

public class VariantInfoDto
{
    public int VariantId { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

}