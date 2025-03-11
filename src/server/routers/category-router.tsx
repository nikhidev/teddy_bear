
import { db } from "@/db"
import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"
import { startOfMonth } from "date-fns"
import { z } from "zod"
import { CATEGORY_NAME_VALIDATOR } from "@/app/lib/validators/category-validator"

export const categoryRouter = router({
  getEventCategories: privateProcedure.query(async ({ c, ctx }) => {
    const categories = await db.eventCategory.findMany({
      where: { userId: ctx.user.id },
      select: {
        id: true,
        name: true,
        emoji: true,
        color: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
    })
    const categoriesCountWithCounts = await Promise.all(
      categories.map(async (category) => {
        const now = new Date()
        const firstDaymonth = startOfMonth(now)
        const [uniqueFieldsCount, EventCount, lastPing] = await Promise.all([
          db.event
            .findMany({
              where: {
                EventCategory :{id: category.id},
                createdAt :{gte:firstDaymonth},
              },
              select: {
                fields: true,
              },
              distinct: ["fields"],
            })
            .then((events) => {
              const fieldName = new Set<string>();
              events.forEach((events) => {
                Object.keys(events.fields as object).forEach((fieldname) => {
                  fieldName.add(fieldname)
                })
              })
              return fieldName.size
            }),
          db.event.count({
            where: {
              EventCategory:  {id:category.id },
              createdAt: { gte: firstDaymonth },
            },
          }),
          db.event.findFirst({
            where: { EventCategory: { id: category.id } },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          }),
        ])
        return {
          ...category,
          uniqueFieldsCount,
          EventCount,
          emoji: category.emoji || "",
          color: category.color || "",
          lastPing: lastPing?.createdAt || null,
        }
      })
    )
    return c.superjson({ categories: categoriesCountWithCounts })
  }),
  deleteCategory:privateProcedure.input(z.object({name:z.string()})).mutation(async ({c,ctx,input})=>{ const {name} = input
   await db.eventCategory.delete({
    where:{name_userId:{name,userId:ctx.user.id}},
   })
   return c.json({success:true})
}),
createEventCategory : privateProcedure.input(z.object({
  name: CATEGORY_NAME_VALIDATOR,
  color :z.string()
  .min(1,"Color is required")
  .regex(/^#[0-9a-f]{6}$/,"Color must be a valid hex color"),
  emoji:z.string().emoji("Invalid emoji").optional(),
})).mutation(async({c,ctx,input})=>{
  const {user} = ctx
  const {name,color,emoji} = input

  const eventCategory = await db.eventCategory.create({
    data:{
      name,
      color: parseInt(color.replace('#', ''), 16),
      emoji,
      userId:user.id,
    },
  })
  return c.json({eventCategory})
})})
