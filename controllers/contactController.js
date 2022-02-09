const AppError = require("./../utils/appError");

const contactMessage = async (req, res, next) => {
  try {
    await new Email({ email: "mail@gmail.com" }).contactMessage(req.body);
    res.status(200).json({
      status: "success",
      message: `Message sent successfully!`,
    });
  } catch (e) {
    new AppError("Error sending message, try again!");
  }
};

module.exports = contactMessage;
