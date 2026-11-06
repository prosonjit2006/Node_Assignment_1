const ContentServices = require("../services/content.services");
const CategoryServices = require("../services/category.services");
const ContentValidation = require("../validation/content.validation");

class ContentController {
  constructor() {
    this.contentServices = new ContentServices();
    this.categoryServices = new CategoryServices();
  }

  // API controllers
  getAllContent = (req, res) => {
    try {
      const data = this.contentServices.getAllContent({ categoryId: req.query.categoryId, status: req.query.status });
      return res.status(200).json({ success: true, message: "Content fetched successfully.", data });
    } catch (error) { return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null }); }
  };

  getContentByID = (req, res) => {
    try { return res.status(200).json({ success: true, message: "Content fetched successfully.", data: this.contentServices.getContentByID(req.params.id) }); }
    catch (error) { return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null }); }
  };

  createContentApi = (req, res) => {
    try { ContentValidation.validate(req.body); const data = this.contentServices.createContent(req.body); return res.status(201).json({ success: true, message: "Content created successfully.", data }); }
    catch (error) { return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null }); }
  };

  updateContentApi = (req, res) => {
    try { ContentValidation.validate(req.body); const data = this.contentServices.updateContent(req.params.id, req.body); return res.status(200).json({ success: true, message: "Content updated successfully.", data }); }
    catch (error) { return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null }); }
  };

  deleteContentApi = (req, res) => {
    try { this.contentServices.deleteContent(req.params.id); return res.status(200).json({ success: true, message: "Content deleted successfully.", data: null }); }
    catch (error) { return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null }); }
  };

  // Website controllers
  index = (req, res, next) => {
    try {
      const contents = this.contentServices.getAllContent();
      const categories = this.categoryServices.getAllCategory();
      const categoryMap = Object.fromEntries(categories.map((category) => [category.id, category]));
      return res.render("content/index", { title: "Manage Content", contents, categoryMap });
    } catch (error) { next(error); }
  };

  createForm = (req, res, next) => {
    try { return res.render("content/form", { title: "Create Content", item: { status: "draft" }, categories: this.categoryServices.getAllCategory(), formAction: "/content", submitLabel: "Create Content", error: null }); }
    catch (error) { next(error); }
  };

  create = (req, res, next) => {
    try { ContentValidation.validate(req.body); this.contentServices.createContent(req.body); return res.redirect("/content"); }
    catch (error) {
      if (error.statusCode && error.statusCode < 400) return res.status(error.statusCode).render("content/form", { title: "Create Content", item: req.body, categories: this.categoryServices.getAllCategory(), formAction: "/content", submitLabel: "Create Content", error: error.message });
      next(error);
    }
  };

  editForm = (req, res, next) => {
    try {
      const item = this.contentServices.getContentByID(req.params.id);
      return res.render("content/form", { title: "Edit Content", item, categories: this.categoryServices.getAllCategory(), formAction: `/content/${item.id}?_method=PATCH`, submitLabel: "Update Content", error: null });
    } catch (error) { next(error); }
  };

  update = (req, res, next) => {
    try { ContentValidation.validate(req.body); this.contentServices.updateContent(req.params.id, req.body); return res.redirect("/content"); }
    catch (error) {
      if (error.statusCode && error.statusCode < 400) {
        let item = { ...req.body, id: req.params.id };
        try { item = { ...this.contentServices.getContentByID(req.params.id), ...item }; } catch {}
        return res.status(error.statusCode).render("content/form", { title: "Edit Content", item, categories: this.categoryServices.getAllCategory(), formAction: `/content/${req.params.id}?_method=PATCH`, submitLabel: "Update Content", error: error.message });
      }
      next(error);
    }
  };

  show = (req, res, next) => {
    try {
      const item = this.contentServices.getContentByID(req.params.id);
      if (item.status !== "published") return res.status(404).send("Content not found.");
      const category = this.categoryServices.getCategoryByID(item.categoryId);
      return res.render("content/show", { title: item.title, item, category });
    } catch (error) { next(error); }
  };

  delete = (req, res, next) => {
    try { this.contentServices.deleteContent(req.params.id); return res.redirect("/content"); }
    catch (error) { next(error); }
  };
}

module.exports = ContentController;
