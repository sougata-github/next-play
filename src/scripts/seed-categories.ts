import { categoryNames } from "@/constants";
import { db } from "@/db";

async function main() {
  console.log("Seeding categories...");

  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `Videos related to ${name}.`,
    }));

    for (const { name, description } of values) {
      await db.category.create({
        data: {
          name,
          description,
        },
      });
    }

    console.log("Categories seeded successfully.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
