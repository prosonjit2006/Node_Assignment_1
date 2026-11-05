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

const Content = require("../models/content.model");

class ContentService {
  constructor() {
    this.store = new JsonFileStore("content.json");
  }

  getAllContent = async (filters = {}) => {
    let contents = await this.store.readAll();

    if (filters.categoryId) {
      contents = contents.filter((item) => item.categoryId === filters.categoryId);
    }

    if (filters.status) {
      contents = contents.filter((item) => item.status === filters.status);
    }

    return contents;
  };

  getContentByID = async (id) => {
    const contents = await this.store.readAll();
    const content = contents.find((item) => item.id === id);

    if (!content) throw new AppError("Content not found.", 404);
    return content;
  };

  getContentByCategory = async (categoryId) => {
    const contents = await this.store.readAll();
    return contents.filter((item) => item.categoryId === categoryId);
  };

  createContent = async (payload) => {
    const CategoryService = require("./category.service");
    const categoryService = new CategoryService();
    await categoryService.getCategoryByID(payload.categoryId);

    const content = new Content(
      payload.categoryId,
      payload.title,
      payload.description,
      payload.body,
      payload.thumbnail || "",
      payload.status || "draft"
    );

    await this.store.create(content);
    return content;
  };

  updateContent = async (id, payload) => {
    const existing = await this.getContentByID(id);

    const CategoryService = require("./category.service");
    const categoryService = new CategoryService();
    await categoryService.getCategoryByID(payload.categoryId);

    const updated = {
      ...existing,
      categoryId: payload.categoryId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      body: payload.body.trim(),
      thumbnail: (payload.thumbnail || "").trim(),
      status: payload.status || "draft",
      updatedAt: new Date().toISOString()
    };

    await this.store.update(id, updated);
    return updated;
  };

  deleteContent = async (id) => {
    const deleted = await this.store.delete(id);
    if (!deleted) throw new AppError("Content not found.", 404);
    return true;
  };
}

module.exports = ContentService;
