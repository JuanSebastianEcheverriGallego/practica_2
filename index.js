const express = require("express");

const app = express();
app.use(express.json());

const productos = [];
let siguienteId = 1;

app.get("/productos", (req, res) => res.json(productos));

app.get("/productos/:id", (req, res) => {
  const producto = productos.find((p) => p.id === Number(req.params.id));
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(producto);
});

app.post("/productos", (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || precio === undefined) return res.status(400).json({ error: "nombre y precio son requeridos" });
  const producto = { id: siguienteId++, nombre, precio };
  productos.push(producto);
  res.status(201).json(producto);
});

app.delete("/productos/:id", (req, res) => {
  const i = productos.findIndex((p) => p.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Producto no encontrado" });
  productos.splice(i, 1);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en el puerto ${PORT}`));
