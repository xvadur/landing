import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Search, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// DataTable Context
interface DataTableContextValue<TData> {
  table: TanstackTable<TData>
}

const DataTableContext = React.createContext<DataTableContextValue<unknown> | null>(null)

function useDataTable<TData>() {
  const context = React.useContext(DataTableContext)
  if (!context) {
    throw new Error('DataTable components must be used within a <DataTable />')
  }
  return context as DataTableContextValue<TData>
}

// Column Header with sorting
interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: import('@tanstack/react-table').Column<TData, TValue>
  title: string
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('-ml-3 h-8 data-[state=open]:bg-secondary', className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      <span>{title}</span>
      {column.getIsSorted() === 'desc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}

// Texty (predvolene slovensky, prepíš cez `labels`)
export interface DataTableLabels {
  columns: string
  selected: (count: number, total: number) => string
  rowsPerPage: string
  page: (current: number, total: number) => string
  previous: string
  next: string
  selectAll: string
  selectRow: string
}

export const DATA_TABLE_LABELS: DataTableLabels = {
  columns: 'Stĺpce',
  selected: (count, total) => `Vybraté ${count} z ${total}`,
  rowsPerPage: 'Riadkov na stranu',
  page: (current, total) => `Strana ${current} z ${total}`,
  previous: 'Späť',
  next: 'Ďalej',
  selectAll: 'Vybrať všetky',
  selectRow: 'Vybrať riadok',
}

/** Názov stĺpca pre výber viditeľnosti: meta.label → textový header → id. */
function columnLabel<TData>(column: ReturnType<TanstackTable<TData>['getAllColumns']>[number]): string {
  const meta = column.columnDef.meta as { label?: string } | undefined
  if (meta?.label) return meta.label
  const header = column.columnDef.header
  return typeof header === 'string' ? header : column.id
}

// Toolbar
interface DataTableToolbarProps<TData> {
  table: TanstackTable<TData>
  filterPlaceholder?: string
  filterColumn?: string
  showColumnVisibility?: boolean
  labels?: Partial<DataTableLabels>
}

function DataTableToolbar<TData>({
  table,
  filterPlaceholder = 'Filtrovať…',
  filterColumn,
  showColumnVisibility = true,
  labels: labelsProp,
}: DataTableToolbarProps<TData>) {
  const labels = { ...DATA_TABLE_LABELS, ...labelsProp }
  const column = filterColumn ? table.getColumn(filterColumn) : null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="flex flex-1 items-center space-x-2">
        {column && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={filterPlaceholder}
              value={String(column.getFilterValue() ?? '')}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-11 w-[180px] max-w-full pl-9 lg:w-[250px]"
            />
          </div>
        )}
      </div>
      {showColumnVisibility && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Settings2 className="mr-2 h-4 w-4" />
              {labels.columns}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {columnLabel(column)}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

// Pagination
interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>
  pageSizeOptions?: number[]
  labels?: Partial<DataTableLabels>
}

/* flex-wrap: na 375 px sa stránkovanie zalomí namiesto pretečenia */
function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
  labels: labelsProp,
}: DataTablePaginationProps<TData>) {
  const labels = { ...DATA_TABLE_LABELS, ...labelsProp }
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
      <div className="min-w-[10rem] flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 &&
          labels.selected(table.getFilteredSelectedRowModel().rows.length, table.getFilteredRowModel().rows.length)}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:gap-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{labels.rowsPerPage}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-11 w-[85px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center whitespace-nowrap text-sm font-medium">
          {labels.page(table.getState().pagination.pageIndex + 1, Math.max(1, table.getPageCount()))}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {labels.previous}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {labels.next}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main DataTable component
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // Features
  enableSorting?: boolean
  enableFiltering?: boolean
  enableColumnVisibility?: boolean
  enableRowSelection?: boolean
  enablePagination?: boolean

  // Pagination
  pageSize?: number
  pageSizeOptions?: number[]

  // Search
  filterColumn?: string
  filterPlaceholder?: string

  // Empty/Loading
  emptyMessage?: string
  isLoading?: boolean

  /** Texty panelov (predvolene slovensky) */
  labels?: Partial<DataTableLabels>

  // Callbacks
  onRowSelectionChange?: (selectedRows: TData[]) => void
}

function DataTable<TData, TValue>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  enableRowSelection = false,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50],
  filterColumn,
  filterPlaceholder = 'Filtrovať…',
  emptyMessage = 'Žiadne výsledky.',
  isLoading = false,
  labels,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Add selection column if row selection is enabled
  const tableColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns

    const selectionColumn: ColumnDef<TData, unknown> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={labels?.selectAll ?? DATA_TABLE_LABELS.selectAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={labels?.selectRow ?? DATA_TABLE_LABELS.selectRow}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectionColumn, ...columns]
  }, [columns, enableRowSelection, labels?.selectAll, labels?.selectRow])

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(enableFiltering && { getFilteredRowModel: getFilteredRowModel() }),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  // Keep the latest callback in a ref so an inline `onRowSelectionChange` prop
  // does not re-run the effect on every render (which can loop if the parent
  // setStates from it).
  const onRowSelectionChangeRef = React.useRef(onRowSelectionChange)
  React.useEffect(() => {
    onRowSelectionChangeRef.current = onRowSelectionChange
  })

  // Notify parent of selection changes
  React.useEffect(() => {
    const notify = onRowSelectionChangeRef.current
    if (notify) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
      notify(selectedRows)
    }
  }, [rowSelection, table])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({ table: table as TanstackTable<unknown> }),
    [table]
  )

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className="space-y-4">
        {/* Toolbar */}
        {(enableFiltering || enableColumnVisibility) && (
          <DataTableToolbar
            table={table}
            filterPlaceholder={filterPlaceholder}
            filterColumn={filterColumn}
            showColumnVisibility={enableColumnVisibility}
            labels={labels}
          />
        )}

        {/* Table */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin border-3 border-foreground border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {enablePagination && (
          <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} labels={labels} />
        )}
      </div>
    </DataTableContext.Provider>
  )
}

export {
  DataTable,
  DataTableColumnHeader,
  DataTableToolbar,
  DataTablePagination,
  useDataTable,
}
