const express = require("express");
const Card = require("../models/cardModel");
const { cardSchema } = require("../validators/cardValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { toggleLike } = require("../controllers/cardController");


const router = express.Router();

/**
 * @swagger
 * /cards:
 *   get:
 *     summary: Retrieve all cards (based on user role)
 *     responses:
 *       200:
 *         description: List of cards
 *       403:
 *         description: Access denied
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { isAdmin, isBusiness, _id } = req.user;

    let cards;
    if (isAdmin) {
      cards = await Card.find();
    } else if (isBusiness) {
      cards = await Card.find({ user_id: _id }); 
    } else {
      return res.status(403).json({ error: "Access denied." }); 
    }

    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /cards/{id}:
 *   get:
 *     summary: Retrieve a card by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the card
 *     responses:
 *       200:
 *         description: Card details
 *       404:
 *         description: Card not found
 *       403:
 *         description: Access denied
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { isAdmin, _id } = req.user;
    const card = await Card.findById(req.params.id);

    if (!card) return res.status(404).json({ error: "Card not found." });

    if (!isAdmin && card.user_id.toString() !== _id) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Create a new card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   street:
 *                     type: string
 *                   houseNumber:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Card created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("business"),
  async (req, res) => {
    const { error } = cardSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const newCard = new Card({
        ...req.body,
        user_id: req.user._id,
      });
      const savedCard = await newCard.save();
      res.status(201).json(savedCard);
    } catch (err) {
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

/**
 * @swagger
 * /cards/{id}:
 *   put:
 *     summary: Update a card
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   street:
 *                     type: string
 *                   houseNumber:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Card updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Card not found
 *       403:
 *         description: Access denied
 */
router.put("/:id", authMiddleware, async (req, res) => {
  const { isAdmin, _id } = req.user;

  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ error: "Card not found." });

    if (!isAdmin && card.user_id.toString() !== _id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const { error } = cardSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    Object.assign(card, req.body);
    const updatedCard = await card.save();
    res.status(200).json(updatedCard);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /cards/{id}:
 *   delete:
 *     summary: Delete a card
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the card to delete
 *     responses:
 *       200:
 *         description: Card deleted successfully
 *       404:
 *         description: Card not found
 *       403:
 *         description: Access denied
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const card = await Card.findById(req.params.id);
      if (!card) return res.status(404).json({ error: "Card not found." });

      await Card.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Card deleted successfully." });
    } catch (err) {
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

/**
 * @swagger
 * /cards/{id}/bizNumber:
 *   put:
 *     summary: Update bizNumber for a card
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the card to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bizNumber:
 *                 type: number
 *     responses:
 *       200:
 *         description: Card updated successfully with new bizNumber
 *       400:
 *         description: bizNumber already taken by another business
 *       404:
 *         description: Card not found
 *       403:
 *         description: Access denied
 */
router.put(
  "/:id/bizNumber",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    const { bizNumber } = req.body;

    if (!bizNumber) {
      return res.status(400).json({ error: "bizNumber is required" });
    }

    try {
      const existingCard = await Card.findOne({ bizNumber });
      if (existingCard) {
        return res
          .status(400)
          .json({ error: "bizNumber already taken by another business" });
      }

      const updatedCard = await Card.findByIdAndUpdate(
        req.params.id,
        { bizNumber },
        { new: true } 
      );

      if (!updatedCard) {
        return res.status(404).json({ error: "Card not found" });
      }

      res.status(200).json(updatedCard);
    } catch (err) {
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

/**
 * @swagger
 * /cards/{id}/like:
 *   patch:
 *     summary: Toggle like on a card
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the card
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       404:
 *         description: Card not found
 *       403:
 *         description: Access denied
 */
router.patch("/:id/like", authMiddleware, toggleLike);

module.exports = router;
