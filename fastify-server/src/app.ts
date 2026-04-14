import buildServer from "./server";
import dotenv from "dotenv";
import connectDB from "./config/db.config";

dotenv.config();

async function main() {
  const server = buildServer();

  try {
    await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/todos-list-application");

    const port = Number(process.env.PORT || 3000);
    await server.listen({ port, host: "0.0.0.0" });

    console.log(`Server ready at http://localhost:${port}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
