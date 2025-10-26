using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class MaterialDto
    {
        [Key]
        public int MaterialId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;

        public ICollection<ProductDto>? Products { get; set; }
    }
}
