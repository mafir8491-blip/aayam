const { SupabaseModel, registerModel } = require("./baseModel");

class RegistrationModel extends SupabaseModel {
  constructor() {
    super("registrations", {
      subEventId: "SubEvent"
    });
  }
}

const Registration = new RegistrationModel();
registerModel("Registration", Registration);

module.exports = Registration;