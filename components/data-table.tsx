"use client"

import React, { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export interface ColumnDef<T> {
  header: string
  accessorKey?: keyof T | string
  cell?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  pageSize?: number
  emptyMessage?: string
}

export function DataTable<T>({ columns, data, pageSize = 10, emptyMessage = "No se encontraron resultados" }: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const handleSort = (col: ColumnDef<T>) => {
    if (!col.sortable) return
    const key = String(col.accessorKey)
    if (sortCol === key) {
      if (sortDir === "asc") setSortDir("desc")
      else setSortCol(null)
    } else {
      setSortCol(key)
      setSortDir("asc")
    }
  }

  const processedData = useMemo(() => {
    const result = [...data]
    if (sortCol) {
      result.sort((a, b) => {
        const valA = (a as any)[sortCol]
        const valB = (b as any)[sortCol]
        if (valA < valB) return sortDir === "asc" ? -1 : 1
        if (valA > valB) return sortDir === "asc" ? 1 : -1
        return 0
      })
    }
    return result
  }, [data, sortCol, sortDir])

  const totalPages = Math.ceil(processedData.length / pageSize) || 1
  const paginatedData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-neutral-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead 
                  key={i} 
                  className={col.sortable ? "cursor-pointer select-none hover:text-white transition-colors" : ""}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && sortCol === String(col.accessorKey) && (
                      sortDir === "asc" ? <ChevronUp className="size-3.5 text-violet-400" /> : <ChevronDown className="size-3.5 text-violet-400" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32 text-center text-neutral-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                  {columns.map((col, j) => (
                    <TableCell key={j} className="text-neutral-300">
                      {col.cell ? col.cell(row) : (row as any)[col.accessorKey as string]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-400 px-1">
          <div>
            Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, processedData.length)} de {processedData.length} resultados
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-white/10 bg-neutral-900 hover:bg-white/10"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-white/10 bg-neutral-900 hover:bg-white/10"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-white/10 bg-neutral-900 hover:bg-white/10"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-white/10 bg-neutral-900 hover:bg-white/10"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
