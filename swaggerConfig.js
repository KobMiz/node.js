const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API Documentation",
      version: "1.0.0", 
      description:
        "Comprehensive documentation for my API, which supports user management, business cards, and ticketing functionalities.",
      contact: {
        name: "Your Name",
        email: "your.email@example.com",
      },
      termsOfService: "http://example.com/terms",
    },
    servers: [
      {
        url: "http://localhost:3000", 
        description: "Local development server",
      },
      {
        url: "https://your-production-server.com",
        description: "Production server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
