const { SupabaseModel, registerModel } = require("./baseModel");

class EventModel extends SupabaseModel {
  constructor() {
    super("events");
  }
}

const Event = new EventModel();
registerModel("Event", Event);

module.exports = Event;