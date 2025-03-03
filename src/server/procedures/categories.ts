import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const data = await db.category.findMany({});

    return data;
  }),
});
