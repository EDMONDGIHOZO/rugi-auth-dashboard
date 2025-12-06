import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Edit } from 'lucide-react'
import type { App } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const appSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['PUBLIC', 'CONFIDENTIAL']),
  redirect_uris_input: z
    .string()
    .min(1, 'At least one redirect URI is required')
    .refine(
      (value) => {
        const redirectUris = value
          .split('\n')
          .map((uri) => uri.trim())
          .filter((uri) => uri.length > 0)

        if (redirectUris.length === 0) return false

        try {
          redirectUris.forEach((uri) => new URL(uri))
          return true
        } catch {
          return false
        }
      },
      {
        message: 'All redirect URIs must be valid URLs',
      },
    ),
  roles_input: z.string().optional().default(''),
})

type AppFormData = z.infer<typeof appSchema>

export function EditAppDialog({ app }: { app: App }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<AppFormData>({
    resolver: zodResolver(appSchema),
    defaultValues: {
      name: app.name,
      type: app.type,
      redirect_uris_input: app.redirect_uris.join('\n'),
      roles_input: (app.roles ?? []).join('\n'),
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: AppFormData) => {
      const redirect_uris = data.redirect_uris_input
        .split('\n')
        .map((uri) => uri.trim())
        .filter((uri) => uri.length > 0)

      const roles =
        data.roles_input
          ?.split('\n')
          .map((role) => role.trim())
          .filter((role) => role.length > 0) ?? []

      // Always send roles to the update endpoint when present
      const updatePromise = apiClient.updateApp(app.id, {
        name: data.name,
        type: data.type,
        redirect_uris,
        roles: roles.length > 0 ? roles : undefined,
      })

      // If the application currently has no roles defined but the user
      // has provided roles in the form, create them via the dedicated
      // roles endpoint so the backend persists them correctly.
      const shouldCreateRoles = (!app.roles || app.roles.length === 0) && roles.length > 0

      if (shouldCreateRoles) {
        const roleCreatePromises = roles.map((roleName) =>
          apiClient.createAppRole(app.id, { role_name: roleName })
        )

        await Promise.all([updatePromise, ...roleCreatePromises])
      } else {
        await updatePromise
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] })
      queryClient.invalidateQueries({ queryKey: ['app', app.id] })
      addToast({
        title: 'Application updated',
        description: 'The application has been updated successfully.',
      })
      setOpen(false)
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update application',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: AppFormData) => {
    updateMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
          <DialogDescription>
            Update application details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Application"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as 'PUBLIC' | 'CONFIDENTIAL')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">PUBLIC</SelectItem>
                    <SelectItem value="CONFIDENTIAL">CONFIDENTIAL</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="redirect_uris_input">Redirect URIs (one per line)</Label>
            <textarea
              id="redirect_uris_input"
              {...register('redirect_uris_input')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="https://example.com/callback&#10;https://example.com/auth/callback"
              aria-invalid={!!errors.redirect_uris_input}
            />
            {errors.redirect_uris_input && (
              <p className="text-sm text-destructive">{errors.redirect_uris_input.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roles_input">Roles (one per line, optional)</Label>
            <textarea
              id="roles_input"
              {...register('roles_input')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={'admin\nviewer\neditor'}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

