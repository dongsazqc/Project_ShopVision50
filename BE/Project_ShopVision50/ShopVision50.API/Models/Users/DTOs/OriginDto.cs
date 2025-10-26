using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class OriginDto
    {
        [Key]
        public int OriginId { get; set; }
        [Required]
        public string Country { get; set; } = string.Empty;

        public ICollection<ProductDto>? Products { get; set; }
    }
}
