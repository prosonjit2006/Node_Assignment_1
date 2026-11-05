require("dotenv").config();

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");

const categoryApiRoutes = require("./src/routes/api/category.route");
const contentApiRoutes = require("./src/routes/api/content.route");
const categoryWebRoutes = require("./src/routes/web/category.route");
const contentWebRoutes = require("./src/routes/web/content.route");
const publicRoutes = require("./src/routes/web/public.route");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.formatDate = (value) => value ? new Date(value).toLocaleString() : "";
  next();
});

app.use("/v1/category", categoryApiRoutes);
app.use("/v1/content", contentApiRoutes);
app.use("/category", categoryWebRoutes);
app.use("/content", contentWebRoutes);
app.use("/", publicRoutes);

app.use((req, res) => {
  if (req.originalUrl.startsWith("/v1/")) {
    return res.status(404).json({ success: false, message: "API route not found", data: null });
  }
  return res.status(404).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><title>Not found | Artify</title></head><body class="min-h-screen bg-stone-50 text-stone-900 grid place-items-center p-6"><main class="text-center"><p class="text-sm font-semibold uppercase tracking-widest text-stone-500">404 error</p><h1 class="mt-3 text-4xl font-semibold">Page not found</h1><a class="mt-6 inline-block rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white" href="/">Back to Artify</a></main></body></html>`);
});

app.use((error, req, res, next) => {
  console.error(error);
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === "production" ? "Something went wrong" : error.message;
  if (req.originalUrl.startsWith("/v1/")) return res.status(statusCode).json({ success: false, message, data: null });
  return res.status(statusCode).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><title>Error | Artify</title></head><body class="min-h-screen bg-stone-50 text-stone-900 grid place-items-center p-6"><main class="max-w-lg text-center"><p class="text-sm font-semibold uppercase tracking-widest text-stone-500">${statusCode} error</p><h1 class="mt-3 text-3xl font-semibold">Something went wrong</h1><p class="mt-3 text-stone-600">${message}</p><a class="mt-6 inline-block rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white" href="/">Back to Artify</a></main></body></html>`);
});

app.listen(PORT, () => console.log(`Artify is running at http://localhost:${PORT}`));
