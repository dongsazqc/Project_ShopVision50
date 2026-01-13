using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
public class CommentShowDto
{
    public int CommentId { get; set; }
    public string Content { get; set; }
    public int Rating { get; set; }
    public DateTime CreatedDate { get; set; }
    public UserDtoShow User { get; set; }
    public ProductShowDto Product { get; set; }
}

public class UserDtoShow
{
    public int UserId { get; set; }
    public string FullName { get; set; }
}

public class ProductShowDto
{
    public int ProductId { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}


}