const { SupabaseModel, registerModel } = require("./baseModel");

class UserModel extends SupabaseModel {
  constructor() {
    super("users");
  }
}

const User = new UserModel();
registerModel("User", User);

module.exports = User;
