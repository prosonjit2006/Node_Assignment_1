const CategoryServices = require("../services/category.services");
const ContentServices = require("../services/content.services");

class PublicController {
  constructor() {
    this.categoryServices = new CategoryServices();
    this.contentServices = new ContentServices();
  }

  home = (req, res, next) => {
    try {
      const categories = this.categoryServices.getAllCategory();
      const contents = this.contentServices.getAllContent({ status: "published" });
      return res.render("home", { title: "Home", categories });
    } catch (error) { next(error); }
  };
}

module.exports = PublicController;
