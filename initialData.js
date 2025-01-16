const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const Card = require("./models/cardModel");

const seedData = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/my_database");
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("Test1234", 10);

    const users = [
      {
        name: { first: "Default", last: "User" },
        email: "defaultuser@example.com",
        password: hashedPassword,
        phone: "1234567898",
        address: {
          country: "Country1",
          city: "City1",
          street: "Street1",
          houseNumber: 1,
        },
        isBusiness: false,
      },
      {
        name: { first: "Business", last: "User" },
        email: "businessuser@example.com",
        password: hashedPassword,
        phone: "9876754321",
        address: {
          country: "Country2",
          city: "City2",
          street: "Street2",
          houseNumber: 2,
        },
        isBusiness: true,
      },
      {
        name: { first: "Admin", last: "User" },
        email: "adminuser@example.com",
        password: hashedPassword,
        phone: "5555555555",
        address: {
          country: "Country3",
          city: "City3",
          street: "Street3",
          houseNumber: 3,
        },
        isAdmin: true,
        isBusiness: false,
      },
    ];

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create(user);
        console.log(`User created: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }

    // יצירת כרטיסים אם אינם קיימים
    const cards = [
      {
        title: "Business Card 1",
        description: "Description for card 1",
        phone: "1234556789",
        address: {
          country: "Country1",
          city: "City1",
          street: "Street1",
          houseNumber: 1,
        },
        bizNumber: 1001,
        user_id: await User.findOne({ email: "businessuser@example.com" }).then(
          (u) => u._id
        ),
      },
      {
        title: "Business Card 2",
        description: "Description for card 2",
        phone: "9876543210",
        address: {
          country: "Country2",
          city: "City2",
          street: "Street2",
          houseNumber: 2,
        },
        bizNumber: 1002,
        user_id: await User.findOne({ email: "businessuser@example.com" }).then(
          (u) => u._id
        ),
      },
      {
        title: "Business Card 3",
        description: "Description for card 3",
        phone: "5555555555",
        address: {
          country: "Country3",
          city: "Country3",
          street: "Street3",
          houseNumber: 3,
        },
        bizNumber: 1003,
        user_id: await User.findOne({ email: "businessuser@example.com" }).then(
          (u) => u._id
        ),
      },
    ];

    for (const card of cards) {
      const existingCard = await Card.findOne({ bizNumber: card.bizNumber });
      if (!existingCard) {
        await Card.create(card);
        console.log(`Card created: ${card.title}`);
      } else {
        console.log(`Card already exists: ${card.title}`);
      }
    }

    console.log("Database seeding completed.");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding data:", error);
    mongoose.disconnect();
  }
};

seedData();
