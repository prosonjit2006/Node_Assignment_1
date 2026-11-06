require("dotenv").config();

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");

const categoryRoutes = require("./src/routes/category.routes");
const categoryApiRoutes = require("./src/routes/category.api.routes");
const contentRoutes = require("./src/routes/content.routes");
const contentApiRoutes = require("./src/routes/content.api.routes");
const publicRoutes = require("./src/routes/public.routes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// EJS configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.formatDate = (value) => value ? new Date(value).toLocaleString() : "";
  next();
});

// Routes
app.use("/v1/category", categoryApiRoutes);
app.use("/v1/content", contentApiRoutes);
app.use("/category", categoryRoutes);
app.use("/content", contentRoutes);
app.use("/", publicRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Artify is running at http://localhost:${PORT}`));
