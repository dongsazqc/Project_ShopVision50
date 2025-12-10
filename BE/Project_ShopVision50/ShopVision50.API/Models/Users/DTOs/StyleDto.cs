using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class StyleDto
    {
        [Key]
        public int StyleId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;

    }
}
