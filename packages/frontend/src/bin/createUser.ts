import "dotenv/config";
import { mongooseConnect } from "../lib/mongoose";
import User from "../models/User";

async function main() {
  await mongooseConnect();

  if (process.argv.length < 3) {
    console.log("USAGE createUser <email> <password>");
    process.exit(1);
  }

  let password = process.argv.splice(-1)[0];
  const email = process.argv.splice(-1)[0].toLowerCase();
  password = await User.generatePasswordHash(password);
  console.log(email, password);

  const user = new User({
    email,
    password,
  });
  await user.save();

  console.log("User created successfully!");
  process.exit(0);
}

// Force exit
const forceExit = async () => {
  console.log("Script cancelled...\b");
  process.exit(0);
};
process.on("SIGTERM", forceExit);
process.on("SIGINT", forceExit);

main();
