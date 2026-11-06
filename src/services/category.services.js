const fs = require("fs");
const path = require("path");
const AppError = require("../utils/AppErrors");
const Category = require("../model/category.model");

class CategoryServices {
  constructor() {
    this.filePath = path.join(__dirname, "../../data/category.json");
  }

  getAllCategory() {
    const categories = fs.readFileSync(this.filePath, "utf8");
    return JSON.parse(categories || "[]");
  }

  saveCategory(categories) {
    fs.writeFileSync(this.filePath, JSON.stringify(categories, null, 2));
  }

  getCategoryByID(id) {
    const categories = this.getAllCategory();
    const category = categories.find((item) => item.id === id);
    if (!category) throw new AppError("Category not found.", 404);
    return category;
  }

  createCategory(name, description, imageurl) {
    const categories = this.getAllCategory();
    const exists = categories.some(
      (item) => item.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) throw new AppError("Category name already exists.", 409);

    const category = new Category(name, description, imageurl);
    categories.push(category);
    this.saveCategory(categories);
    return category;
  }

  updateCategory(id, name, description, imageurl) {
    const categories = this.getAllCategory();
    const index = categories.findIndex((item) => item.id === id);
    if (index === -1) throw new AppError("Category not found.", 404);

    const exists = categories.some(
      (item) => item.id !== id && item.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) throw new AppError("Another category already uses this name.", 409);

    categories[index] = {
      ...categories[index],
      name: name.trim(),
      description: description.trim(),
      imageurl: imageurl.trim()
    };
    this.saveCategory(categories);
    return categories[index];
  }

  deleteCategory(id) {
    const ContentServices = require("./content.services");
    const contentServices = new ContentServices();
    const assignedContent = contentServices.getContentByCategory(id);
    if (assignedContent.length) {
      throw new AppError("This category cannot be deleted because content is assigned to it.", 409);
    }

    const categories = this.getAllCategory();
    const filtered = categories.filter((item) => item.id !== id);
    if (filtered.length === categories.length) throw new AppError("Category not found.", 404);
    this.saveCategory(filtered);
    return true;
  }
}

module.exports = CategoryServices;
