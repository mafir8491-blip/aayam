const { SupabaseModel, registerModel } = require("./baseModel");

class SubEventModel extends SupabaseModel {
  constructor() {
    super("sub_events", {
      eventId: "Event"
    });
  }
}

const SubEvent = new SubEventModel();
registerModel("SubEvent", SubEvent);

module.exports = SubEvent;