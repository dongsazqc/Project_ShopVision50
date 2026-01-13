using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.CommentService_FD;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _service;

    public CommentsController(ICommentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var comments = await _service.GetAllCommentsAsync();
        return Ok(comments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var comment = await _service.GetCommentByIdAsync(id);
        if (comment == null) return NotFound();
        return Ok(comment);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CommentCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var createdComment = await _service.CreateCommentAsync(dto);
        if (createdComment == null) return StatusCode(500, "Create comment failed");

        return CreatedAtAction(nameof(GetById), new { id = createdComment.CommentId }, createdComment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CommentCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _service.UpdateCommentAsync(id, dto);
        if (!updated) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteCommentAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }


    [HttpGet("product/{productId}")]
public async Task<IActionResult> GetByProductId(int productId)
{
    var comments = await _service.GetCommentsByProductIdAsync(productId);
    return Ok(comments);
}

}
