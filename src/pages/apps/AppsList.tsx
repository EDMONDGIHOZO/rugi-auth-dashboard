import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
import { Search, Eye, DeleteIcon, Copy, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { copyToClipboard } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { CreateAppDialog } from '@/components/features/apps/CreateAppDialog'
import { EditAppDialog } from '@/components/features/apps/EditAppDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function AppsList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appToDelete, setAppToDelete] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['apps', search],
    queryFn: () => apiClient.getApps({ search, limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (appId: string) => apiClient.deleteApp(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] })
      addToast({ title: 'Application deleted', description: 'The application has been deleted successfully.' })
      setDeleteDialogOpen(false)
      setAppToDelete(null)
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete application',
        variant: 'destructive',
      })
    },
  })

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedId(id)
      addToast({ title: 'Copied!', description: 'Client ID copied to clipboard' })
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleDelete = (appId: string) => {
    setAppToDelete(appId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (appToDelete) {
      deleteMutation.mutate(appToDelete)
    }
  }

  const filteredApps = data?.data.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Manage your registered applications</p>
        </div>
        <CreateAppDialog />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No applications found</p>
          <CreateAppDialog />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Redirect URIs</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {app.client_id}
                      </code>
                      <button
                        onClick={() => handleCopy(app.client_id, app.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedId === app.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.type === 'CONFIDENTIAL' ? 'default' : 'secondary'}>
                      {app.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm text-muted-foreground">
                      {app.redirect_uris.join(', ')}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(app.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/apps/${app.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <EditAppDialog app={app} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(app.id)}
                      >
                        <DeleteIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

