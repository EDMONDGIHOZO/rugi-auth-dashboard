import {useParams} from 'react-router-dom'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {apiClient} from '@/lib/api'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {ArrowLeft, Copy, Check, DeleteIcon} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {formatDate} from '@/lib/utils'
import {copyToClipboard} from '@/lib/utils'
import {useToast} from '@/components/ui/toast'
import {useState} from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export function AppDetail() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()
    const {addToast} = useToast()
    const [copiedId, setCopiedId] = useState(false)
    const queryClient = useQueryClient()

    const {data: app, isLoading} = useQuery({
        queryKey: ['app', id],
        queryFn: () => apiClient.getApp(id!),
        enabled: !!id,
    })

    const {data: appRoles} = useQuery({
        queryKey: ['app', id, 'roles'],
        queryFn: () => apiClient.getAppRoles(id!),
        enabled: !!id,
    })

    const [newRoleName, setNewRoleName] = useState('')

    const createRoleMutation = useMutation({
        mutationFn: (roleName: string) =>
            apiClient.createAppRole(id!, {role_name: roleName}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['app', id, 'roles']})
            addToast({
                title: 'Role created',
                description: 'The role has been created successfully.',
            })
            setNewRoleName('')
        },
        onError: (error: any) => {
            addToast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create role',
                variant: 'destructive',
            })
        },
    })

    const deleteRoleMutation = useMutation({
        mutationFn: (roleId: number) => apiClient.deleteAppRole(id!, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['app', id, 'roles']})
            addToast({
                title: 'Role deleted',
                description: 'The role has been deleted successfully.',
            })
        },
        onError: (error: any) => {
            addToast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete role',
                variant: 'destructive',
            })
        },
    })

    const handleCopy = async (text: string) => {
        const success = await copyToClipboard(text)
        if (success) {
            setCopiedId(true)
            addToast({title: 'Copied!', description: 'Client ID copied to clipboard'})
            setTimeout(() => setCopiedId(false), 2000)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div
                        className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"/>
                    <p className="text-muted-foreground">Loading application...</p>
                </div>
            </div>
        )
    }

    if (!app) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Application not found</p>
                <Button onClick={() => navigate('/apps')}>Back to Applications</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/apps')}>
                    <ArrowLeft className="h-4 w-4"/>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
                    <p className="text-muted-foreground">Application details and management</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Application Information</CardTitle>
                        <CardDescription>Basic application details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-sm">{app.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Client ID</p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                                    {app.client_id}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCopy(app.client_id)}
                                >
                                    {copiedId ? (
                                        <Check className="h-4 w-4"/>
                                    ) : (
                                        <Copy className="h-4 w-4"/>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Type</p>
                            <Badge variant={app.type === 'CONFIDENTIAL' ? 'default' : 'secondary'}>
                                {app.type}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Created</p>
                            <p className="text-sm">{formatDate(app.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Redirect URIs</p>
                            <ul className="mt-1 space-y-1">
                                {app?.redirect_uris && app.redirect_uris.map((uri, index) => (
                                    <li key={index} className="text-sm">
                                        <code className="bg-muted px-2 py-1 rounded">{uri}</code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Roles</CardTitle>
                                <CardDescription>
                                    Manage roles available for this application
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            className="flex flex-col gap-2 sm:flex-row sm:items-center"
                            onSubmit={(e) => {
                                e.preventDefault()
                                if (!newRoleName.trim() || !id) return
                                createRoleMutation.mutate(newRoleName.trim())
                            }}
                        >
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Add new role
                                </p>
                                <input
                                    type="text"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="e.g. editor"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="mt-2 sm:mt-6"
                                disabled={createRoleMutation.isPending}
                            >
                                {createRoleMutation.isPending ? 'Adding...' : 'Add Role'}
                            </Button>
                        </form>

                        {appRoles && appRoles.roles.length > 0 ? (
                            <div className="rounded-md border mt-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Users</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appRoles.roles.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell>
                                                    <Badge>{role.name}</Badge>
                                                </TableCell>
                                                <TableCell>{role.userCount}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteRoleMutation.mutate(role.id)}
                                                    >
                                                        <DeleteIcon className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-4">
                                No roles defined for this application yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

