using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVision50.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class updatecoment2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_ProductVariants_ProductVariantId",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_Comments_ProductVariantId",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "ProductVariantId",
                table: "Comments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductVariantId",
                table: "Comments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ProductVariantId",
                table: "Comments",
                column: "ProductVariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_ProductVariants_ProductVariantId",
                table: "Comments",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "ProductVariantId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
