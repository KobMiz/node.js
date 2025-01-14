const express = require("express");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { userSchema } = require("../validators/userValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.failedLoginAttempts >= 3 && Date.now() < user.lockUntil) {
      return res.status(403).json({ error: "Account locked for 24 hours" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 3) {
        user.lockUntil = Date.now() + 24 * 60 * 60 * 1000;
      }

      await user.save();
      return res.status(400).json({ error: "Invalid credentials" });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined; 
    await user.save();

    const token = jwt.sign(
      { _id: user._id, isBusiness: user.isBusiness, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   first:
 *                     type: string
 *                   middle:
 *                     type: string
 *                   last:
 *                     type: string
 *               email:
 *                 type: string
 *               password:
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
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/register", async (req, res, next) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      ...req.body,
      password: hashedPassword,
      isAdmin: req.body.isAdmin || false,
      isBusiness: req.body.isBusiness || false,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Access denied
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res, next) => {
    try {
      const users = await User.find().select("-password"); 
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    if (req.user._id !== req.params.id && !req.user.isAdmin)
      return res.status(403).json({ error: "Access denied" });

    const user = await User.findById(req.params.id).select("-password"); 
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password"); 
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });

      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update isBusiness status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isBusiness:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: isBusiness status updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res, next) => {
    try {
      const { isBusiness } = req.body;
      if (typeof isBusiness !== "boolean") {
        return res
          .status(400)
          .json({ error: "isBusiness must be a boolean value." });
      }

      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.isBusiness = isBusiness;
      const updatedUser = await user.save();

      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res, next) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser)
        return res.status(404).json({ error: "User not found" });

      res.json({ message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
