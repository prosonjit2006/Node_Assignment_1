const fs = require("fs");
const path = require("path");
const AppError = require("../utils/AppErrors");
const Content = require("../model/content.model");

class ContentServices {
  constructor() {
    this.filePath = path.join(__dirname, "../../data/content.json");
  }

  getAllContent(filters = {}) {
    const raw = fs.readFileSync(this.filePath, "utf8");
    let contents = JSON.parse(raw || "[]");

    if (filters.categoryId) {
      contents = contents.filter((item) => item.categoryId === filters.categoryId);
    }
    if (filters.status) {
      contents = contents.filter((item) => item.status === filters.status);
    }
    return contents;
  }

  saveContent(contents) {
    fs.writeFileSync(this.filePath, JSON.stringify(contents, null, 2));
  }

  getContentByID(id) {
    const content = this.getAllContent().find((item) => item.id === id);
    if (!content) throw new AppError("Content not found.", 404);
    return content;
  }

  getContentByCategory(categoryId) {
    return this.getAllContent().filter((item) => item.categoryId === categoryId);
  }

  createContent(payload) {
    const CategoryServices = require("./category.services");
    new CategoryServices().getCategoryByID(payload.categoryId);

    const content = new Content(
      payload.categoryId, payload.title, payload.description, payload.body,
      payload.thumbnail || "", payload.status || "draft"
    );
    const contents = this.getAllContent();
    contents.push(content);
    this.saveContent(contents);
    return content;
  }

  updateContent(id, payload) {
    const contents = this.getAllContent();
    const index = contents.findIndex((item) => item.id === id);
    if (index === -1) throw new AppError("Content not found.", 404);

    const CategoryServices = require("./category.services");
    new CategoryServices().getCategoryByID(payload.categoryId);

    contents[index] = {
      ...contents[index],
      categoryId: payload.categoryId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      body: payload.body.trim(),
      thumbnail: (payload.thumbnail || "").trim(),
      status: payload.status || "draft",
      updatedAt: new Date().toISOString()
    };
    this.saveContent(contents);
    return contents[index];
  }

  deleteContent(id) {
    const contents = this.getAllContent();
    const filtered = contents.filter((item) => item.id !== id);
    if (filtered.length === contents.length) throw new AppError("Content not found.", 404);
    this.saveContent(filtered);
    return true;
  }
}

module.exports = ContentServices;
