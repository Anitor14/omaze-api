var mongoose = require("mongoose");

var projectSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    images: [{ type: mongoose.Types.ObjectId, ref: "Images" }],
  },
  { timestamps: true }
);

projectSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.sort("-createdAt");
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
