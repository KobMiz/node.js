const express = require("express");
const router = express.Router();
const Ticket = require("../models/ticket");
const { ticketSchema } = require("../validators/ticketValidator");
const authMiddleware = require("../middlewares/authMiddleware");


const checkAdminOrOwner = (ticket, user) => {
  return ticket.userId.toString() === user._id || user.isAdmin;
};

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket
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
 *               status:
 *                 type: string
 *                 enum: ["פתוח", "בטיפול", "סגור"]
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", authMiddleware, async (req, res) => {
  const { error } = ticketSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const ticket = new Ticket({
      ...req.body,
      userId: req.user._id,
    });

    const savedTicket = await ticket.save();
    res.status(201).json(savedTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Retrieve all tickets
 *     responses:
 *       200:
 *         description: List of tickets
 *       404:
 *         description: No tickets found
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tickets = req.user.isAdmin
      ? await Ticket.find()
      : await Ticket.find({ userId: req.user._id });

    if (!tickets.length) {
      return res.status(404).json({ error: "No tickets found." });
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update a ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *               status:
 *                 type: string
 *                 enum: ["פתוח", "בטיפול", "סגור"]
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Ticket not found
 */
router.put("/:id", authMiddleware, async (req, res) => {
  const { error } = ticketSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    if (!checkAdminOrOwner(ticket, req.user)) {
      return res.status(403).json({ error: "Access denied." });
    }

    Object.assign(ticket, req.body);
    const updatedTicket = await ticket.save();
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["פתוח", "בטיפול", "סגור"]
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Ticket not found
 */
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["פתוח", "בטיפול", "סגור"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    if (!checkAdminOrOwner(ticket, req.user)) {
      return res.status(403).json({ error: "Access denied." });
    }

    ticket.status = status;
    const updatedTicket = await ticket.save();
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       404:
 *         description: Ticket not found
 *       403:
 *         description: Access denied
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    if (!checkAdminOrOwner(ticket, req.user)) {
      return res.status(403).json({ error: "Access denied." });
    }

    await Ticket.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Ticket deleted successfully." });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
