const Card = require("../models/cardModel");

const toggleLike = async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user._id;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).send({ error: "Card not found" });

    const likes = card.likes || [];
    const userIndex = likes.indexOf(userId);

    if (userIndex === -1) {
      likes.push(userId);
    } else {
      likes.splice(userIndex, 1);
    }

    card.likes = likes;
    await card.save();

    res.send({
      message: "Like toggled successfully",
      cardId: card._id,
      likes: card.likes,
      isLikedByCurrentUser: userIndex === -1,
    });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = { toggleLike };
