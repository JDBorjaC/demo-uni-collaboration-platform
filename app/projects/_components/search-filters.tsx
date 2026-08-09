"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, SlidersHorizontal } from "lucide-react"

type Category = { id: string; name: string }
type Affiliation = { id: string; name: string }

interface SearchFiltersProps {
  categories: Category[]
  affiliations: Affiliation[]
  currentQuery?: string
  currentCategoryId?: string
  currentAffiliationId?: string
}

export function SearchFilters({
  categories,
  affiliations,
  currentQuery,
  currentCategoryId,
  currentAffiliationId,
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentQuery ?? "")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchValue) {
        params.set("query", searchValue)
      } else {
        params.delete("query")
      }
      params.delete("page")
      if (searchValue !== (searchParams.get("query") ?? "")) {
        startTransition(() => {
          router.push(`/projects?${params.toString()}`)
        })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    startTransition(() => {
      router.push(`/projects?${params.toString()}`)
    })
  }

  const hasFilters = !!(currentQuery || currentCategoryId || currentAffiliationId)

  return (
    <div className="flex flex-col gap-3">
      {/* Search row */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="project-search"
          type="search"
          placeholder="Buscar por título, descripción o habilidades..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9 pr-4"
          disabled={isPending}
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />

        <select
          id="category-filter"
          value={currentCategoryId ?? ""}
          onChange={(e) => updateParam("categoryId", e.target.value || null)}
          disabled={isPending}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 sm:flex-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          id="affiliation-filter"
          value={currentAffiliationId ?? ""}
          onChange={(e) => updateParam("affiliationId", e.target.value || null)}
          disabled={isPending}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 sm:flex-none"
        >
          <option value="">Todas las universidades</option>
          {affiliations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchValue("")
              startTransition(() => router.push("/projects"))
            }}
            disabled={isPending}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
