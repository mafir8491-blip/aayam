const { SupabaseModel, registerModel } = require("./baseModel");

class ReviewModel extends SupabaseModel {
  constructor() {
    super("reviews", {
      event: "Event"
    });
  }
}

const Review = new ReviewModel();
registerModel("Review", Review);

module.exports = Review;
