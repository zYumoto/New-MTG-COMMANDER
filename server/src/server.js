import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo conectado");

    app.listen(PORT, () => {
      console.log(`✅ API rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar server:", err.message);
    process.exit(1);
  }
}

start();
