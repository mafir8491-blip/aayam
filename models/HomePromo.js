const { SupabaseModel, registerModel } = require("./baseModel");

class HomePromoModel extends SupabaseModel {
  constructor() {
    super("home_promos");
  }
}

const HomePromo = new HomePromoModel();
registerModel("HomePromo", HomePromo);

module.exports = HomePromo;