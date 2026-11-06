const CategoryServices = require("../services/category.services");
const ContentServices = require("../services/content.services");
const CategoryValidation = require("../validation/category.validation");

class CategoryController {
  constructor() {
    this.categoryServices = new CategoryServices();
    this.contentServices = new ContentServices();
  }

  // API controllers
  getAllCategory = (req, res) => {
    try {
      return res.status(200).json({ success: true, message: "Categories fetched successfully.", data: this.categoryServices.getAllCategory() });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null });
    }
  };

  getCategoryByID = (req, res) => {
    try {
      return res.status(200).json({ success: true, message: "Category fetched successfully.", data: this.categoryServices.getCategoryByID(req.params.id) });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null });
    }
  };

  createCategoryApi = (req, res) => {
    try {
      const { name, description, imageurl } = req.body;
      CategoryValidation.validate(name, description, imageurl);
      const category = this.categoryServices.createCategory(name, description, imageurl);
      return res.status(201).json({ success: true, message: "Category created successfully.", data: category });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null });
    }
  };

  updateCategoryApi = (req, res) => {
    try {
      const { name, description, imageurl } = req.body;
      CategoryValidation.validate(name, description, imageurl);
      const category = this.categoryServices.updateCategory(req.params.id, name, description, imageurl);
      return res.status(200).json({ success: true, message: "Category updated successfully.", data: category });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null });
    }
  };

  deleteCategoryApi = (req, res) => {
    try {
      this.categoryServices.deleteCategory(req.params.id);
      return res.status(200).json({ success: true, message: "Category deleted successfully.", data: null });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message, data: null });
    }
  };

  // Website controllers
  index = (req, res, next) => {
    try {
      return res.render("category/index", { title: "Categories", categories: this.categoryServices.getAllCategory() });
    } catch (error) { next(error); }
  };

  createForm = (req, res) => res.render("category/form", { title: "Create Category", category: {}, formAction: "/category", submitLabel: "Create Category", error: null });

  create = (req, res, next) => {
    try {
      const { name, description, imageurl } = req.body;
      CategoryValidation.validate(name, description, imageurl);
      this.categoryServices.createCategory(name, description, imageurl);
      return res.redirect("/category");
    } catch (error) {
      if (error.statusCode && error.statusCode < 400) return res.status(error.statusCode).render("category/form", { title: "Create Category", category: req.body, formAction: "/category", submitLabel: "Create Category", error: error.message });
      next(error);
    }
  };

  editForm = (req, res, next) => {
    try {
      const category = this.categoryServices.getCategoryByID(req.params.id);
      return res.render("category/form", { title: "Edit Category", category, formAction: `/category/${category.id}?_method=PATCH`, submitLabel: "Update Category", error: null });
    } catch (error) { next(error); }
  };

  update = (req, res, next) => {
    try {
      const { name, description, imageurl } = req.body;
      CategoryValidation.validate(name, description, imageurl);
      this.categoryServices.updateCategory(req.params.id, name, description, imageurl);
      return res.redirect("/category");
    } catch (error) {
      if (error.statusCode && error.statusCode < 400) return res.status(error.statusCode).render("category/form", { title: "Edit Category", category: { ...req.body, id: req.params.id }, formAction: `/category/${req.params.id}?_method=PATCH`, submitLabel: "Update Category", error: error.message });
      next(error);
    }
  };

  show = (req, res, next) => {
    try {
      const category = this.categoryServices.getCategoryByID(req.params.id);
      const contents = this.contentServices.getContentByCategory(category.id).filter((item) => item.status === "published");
      return res.render("category/show", { title: category.name, category, contents });
    } catch (error) { next(error); }
  };

  delete = (req, res, next) => {
    try { this.categoryServices.deleteCategory(req.params.id); return res.redirect("/category"); }
    catch (error) { next(error); }
  };
}

module.exports = CategoryController;
