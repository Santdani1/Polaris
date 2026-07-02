"use client";

import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  type Lead,
  type LeadStatus,
} from "@polaris/shared";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, timeAgo } from "@/lib/utils";

const STATUS_BADGE: Partial<Record<LeadStatus, "success" | "warning" | "danger" | "accent">> = {
  WON: "success",
  HOT_FOLLOWUP: "warning",
  LOST: "danger",
  NO_SHOW: "danger",
  OPT_OUT: "danger",
  DISQUALIFIED: "danger",
  MEETING_SET: "accent",
  MEETING_HELD: "accent",
};

const columnHelper = createColumnHelper<Lead>();

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-muted";
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nombre",
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("company", {
        header: "Empresa",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("title", {
        header: "Puesto",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("city", {
        header: "Ciudad",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("source", {
        header: "Fuente",
        cell: (info) => <Badge variant="outline">{LEAD_SOURCE_LABELS[info.getValue()]}</Badge>,
      }),
      columnHelper.accessor("icp_score", {
        header: "Score",
        cell: (info) => (
          <span className={cn("font-mono tabular-nums", scoreColor(info.getValue()))}>
            {info.getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Estado",
        cell: (info) => (
          <Badge variant={STATUS_BADGE[info.getValue()] ?? "default"}>
            {LEAD_STATUS_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Creado",
        cell: (info) => <span className="text-muted">{timeAgo(info.getValue())}</span>,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: leads,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-72">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" />
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar por nombre, empresa, ciudad…"
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border border-border bg-surface">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 uppercase hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : sorted === "desc" ? (
                          <ArrowDown className="size-3" />
                        ) : (
                          <ArrowUpDown className="size-3 opacity-40" />
                        )}
                      </button>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="py-8 text-center text-muted">
                  Ningún prospecto coincide con la búsqueda.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted">
        {table.getFilteredRowModel().rows.length} de {leads.length} prospectos
      </p>
    </div>
  );
}
