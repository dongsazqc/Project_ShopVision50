using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shop_Db.Models;
using ShopVision50.API.Services.CategoriesService_FD;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class CategoryController : ControllerBase
{
    private readonly ICategoriesService _service;

    public CategoryController(ICategoriesService service)
    {
        _service = service;
    }

    [HttpGet("GetAll")]
     [Authorize] 
    public async Task<ActionResult<IEnumerable<Category>>> GetAll()
    {
        var categories = await _service.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
         [Authorize] 

    public async Task<ActionResult<Category>> GetById(int id)
    {
        var category = await _service.GetByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost]
         [Authorize] 

    public async Task<ActionResult> Create(Category category)
    {
        await _service.AddAsync(category);
        return CreatedAtAction(nameof(GetById), new { id = category.CategoryId }, category);
    }

   [HttpPut("Update/{id}")]
        [Authorize] 
public async Task<ActionResult> Update(int id, Category category)
{
    if (id != category.CategoryId)
        return BadRequest(new { success = false, message = "ID trong URL và trong body không khớp." });

    var existing = await _service.GetByIdAsync(id);
    if (existing == null)
        return NotFound(new { success = false, message = "Category không tồn tại." });

    try
    {
        await _service.UpdateAsync(category);
        return Ok(new { success = true, message = "Cập nhật Category thành công." });
    }
    catch (Exception ex)
    {
        // Nếu cần có thể log ex.Message ở đây
        return StatusCode(500, new { success = false, message = "Cập nhật thất bại: " + ex.Message });
    }
}



    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> Delete(int id)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null) return NotFound();

        await _service.DeleteAsync(id);
        return NoContent();
    }
}
