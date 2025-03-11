"use client"
import React, { useState } from "react"
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { client } from "../lib/client"
import { LoadingSpinner } from "@/components/loading-spinner"
import { format, formatDistanceToNow } from "date-fns"
import { ArrowRight, Clock, Database, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardEmptyState } from "./dashboard-empty"

const queryClient = new QueryClient()

export const DashboardPageContent = () => {
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)

  const { data: categories, isPending: isEventCategories } = useQuery({
    queryKey: ["user-event-categories"],
    queryFn: async () => {
      const res = await client.category.getEventCategories.$get()
      const { categories } = await res.json()
      return categories
    },
  })

  const { mutate: deleteCategory, isPending: isDeletingCategories } = useMutation({
    mutationFn: async (name: string) => {
      await client.category.deleteCategory.$post({ name })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-event-categories"] })
      setDeletingCategory(null)
    },
  })

  if (isEventCategories) {
    return (
      <div className="flex items-center justify-center flex-1 h-full w-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return <DashboardEmptyState />
  }

  return (
    <div className="grid max-w-6xl grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {categories.map((category) => (
        <li
          key={category.id}
          className="relative group z-10 duration-200 hover:-translate-y-0-5 "
        >
          <div className="absolute z-0 inset-px rounded-lg bg-white" />
          <div className="pointer pointer-events-none absolute inset-px rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md ring-1 ring-black/5 ">
            <div className="relative p-6 z-10">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="size-12 rounded-full"
                  style={{
                    backgroundColor: category.color
                      ? `#${category.color.toString(16).padStart(6, "0")}`
                      : "#f3f4f6",
                  }}
                />
                <div>
                  <h3 className="text-lg/7 font-medium tracking-tight text-gray-950">
                    {category.emoji || "📂"} {category.name}
                  </h3>
                </div>
                <p className="text-sm/6 text-gray-600">
                  {format(new Date(category.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm/5 text-gray-600">
                <Clock className="size-4 mr-2 text-brand-500" />
                <span className="font-medium">Last Ping:</span>
                <span className="ml-1">
                  {category.lastPing ? formatDistanceToNow(new Date(category.lastPing)) + " ago" : "Never"}
                </span>
              </div>
              <div className="flex items-center text-sm/5 text-gray-600">
                <Database className="size-4 mr-2 text-brand-500" />
                <span className="font-medium">Unique fields:</span>
                <span className="ml-1">{category.uniqueFieldsCount || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Link href={`/dashboard/category/${category.name}`} passHref>
                <Button variant="outline" size="sm" className="flex items-center gap-2 text-sm">
                  View all <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600 transition-colors"
                aria-label={`Delete ${category.name} category`}
                onClick={() => setDeletingCategory(category.name)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </div>
  )
}
