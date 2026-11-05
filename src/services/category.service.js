const fs = require("fs/promises");
const path = require("path");
const AppError = require("../utils/AppError");

class JsonFileStore {
  constructor(fileName) {
    this.filePath = path.join(__dirname, "../../data", fileName);
    this.writeQueue = Promise.resolve();
  }

  async readAll() {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      if (!raw.trim()) return [];
      const records = JSON.parse(raw);
      if (!Array.isArray(records)) throw new AppError(`Invalid data format in ${path.basename(this.filePath)}. Expected an array.`, 500);
      return records;
    } catch (error) {
      if (error.code === "ENOENT") { await this.writeAll([]); return []; }
      if (error instanceof SyntaxError) throw new AppError(`The JSON file ${path.basename(this.filePath)} contains invalid JSON.`, 500);
      throw error;
    }
  }

  async writeAll(records) {
    const write = async () => {
      try {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify(records, null, 2), "utf8");
      } catch (error) {
        if (["EACCES", "EPERM"].includes(error.code)) throw new AppError(`Permission denied while writing ${path.basename(this.filePath)}.`, 500);
        throw error;
      }
    };
    this.writeQueue = this.writeQueue.then(write, write);
    return this.writeQueue;
  }

  async create(record) { const records = await this.readAll(); records.push(record); await this.writeAll(records); return record; }
  async update(id, updatedRecord) { const records = await this.readAll(); const index = records.findIndex((record) => record.id === id); if (index === -1) return null; records[index] = updatedRecord; await this.writeAll(records); return updatedRecord; }
  async delete(id) { const records = await this.readAll(); const filtered = records.filter((record) => record.id !== id); if (filtered.length === records.length) return false; await this.writeAll(filtered); return true; }
}

const Category = require("../models/category.model");

class CategoryService {
  constructor() {
    this.store = new JsonFileStore("category.json");
  }

  getAllCategory = async () => {
    return this.store.readAll();
  };

  getCategoryByID = async (id) => {
    const categories = await this.getAllCategory();
    const category = categories.find((item) => item.id === id);

    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    return category;
  };

  createCategory = async (name, description, imageurl) => {
    const categories = await this.getAllCategory();

    const existedCategory = categories.some(
      (item) => item.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existedCategory) {
      throw new AppError("Category name already exists.", 409);
    }

    const category = new Category(name, description, imageurl);

    await this.store.create(category);
    return category;
  };

  updateCategory = async (id, name, description, imageurl) => {
    const categories = await this.getAllCategory();
    const index = categories.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new AppError("Category not found.", 404);
    }

    const duplicate = categories.some(
      (item) =>
        item.id !== id &&
        item.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicate) {
      throw new AppError("Another category already uses this name.", 409);
    }

    const existing = categories[index];
    const updated = {
      ...existing,
      name: name.trim(),
      description: description.trim(),
      imageurl: imageurl.trim()
    };

    await this.store.update(id, updated);
    return updated;
  };

  deleteCategory = async (id) => {
    const ContentService = require("./content.service");
    const contentService = new ContentService();
    const assignedContent = await contentService.getContentByCategory(id);

    if (assignedContent.length > 0) {
      throw new AppError(
        "This category cannot be deleted because content is assigned to it.",
        409
      );
    }

    const deleted = await this.store.delete(id);
    if (!deleted) throw new AppError("Category not found.", 404);

    return true;
  };
}

module.exports = CategoryService;
