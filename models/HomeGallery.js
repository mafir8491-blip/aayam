const { SupabaseModel, registerModel } = require("./baseModel");

class HomeGalleryModel extends SupabaseModel {
  constructor() {
    super("home_galleries");
  }
}

const HomeGallery = new HomeGalleryModel();
registerModel("HomeGallery", HomeGallery);

module.exports = HomeGallery;
