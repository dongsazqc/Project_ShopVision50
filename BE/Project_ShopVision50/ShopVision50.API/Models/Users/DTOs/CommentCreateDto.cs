using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class CommentCreateDto
{
    public int UserId { get; set; }
    public int ProductId { get; set; }
    // public int ProductVariantId { get; set; }
    public string Content { get; set; }
    public int? Rating { get; set; }
}

}