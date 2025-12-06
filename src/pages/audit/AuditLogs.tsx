import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { exportToCSV, exportToJSON } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const ACTIONS = ['LOGIN', 'REFRESH', 'REVOKE', 'ROLE_ASSIGN', 'REGISTER']

export function AuditLogs() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const limit = 50

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page, actionFilter],
    queryFn: () =>
      apiClient.getAuditLogs({
        page,
        limit,
        action: actionFilter || undefined,
      }),
  })

  const handleExportCSV = () => {
    if (data?.data) {
      exportToCSV(
        data.data.map((log) => ({
          timestamp: log.createdAt,
          user: log.user?.email || 'N/A',
          action: log.action,
          metadata: JSON.stringify(log.metadata || {}),
        })),
        `audit-logs-${new Date().toISOString()}.csv`
      )
    }
  }

  const handleExportJSON = () => {
    if (data?.data) {
      exportToJSON(
        data.data,
        `audit-logs-${new Date().toISOString()}.json`
      )
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'default'
      case 'REFRESH':
        return 'secondary'
      case 'REVOKE':
        return 'destructive'
      case 'ROLE_ASSIGN':
        return 'default'
      case 'REGISTER':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">View and export audit log entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="action-filter">Action</Label>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger id="action-filter" className="w-[180px]">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              {ACTIONS.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading audit logs...</p>
          </div>
        </div>
      ) : !data?.data.length ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No audit logs found</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data
                  .filter((log) => {
                    if (!search) return true
                    return log.user?.email?.toLowerCase().includes(search.toLowerCase())
                  })
                  .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell>{log.user?.email || 'System'}</TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {log.metadata ? JSON.stringify(log.metadata) : '-'}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

