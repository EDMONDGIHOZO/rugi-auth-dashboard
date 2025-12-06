import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { Plus } from 'lucide-react'
import type { App } from '@/types'

const userSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be at most 255 characters'),
  app_ids: z
    .array(z.string().uuid('Invalid app id format'))
    .min(1, 'Select at least one application'),
})

type UserFormData = z.infer<typeof userSchema>

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const { data: apps } = useQuery({
    queryKey: ['apps', { limit: 100 }],
    queryFn: () => apiClient.getApps({ limit: 100 }),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return apiClient.inviteUser({
        email: data.email,
        app_ids: data.app_ids,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      addToast({
        title: 'User created',
        description: 'The user has been created successfully.',
      })
      reset()
      setOpen(false)
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create user',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: UserFormData) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Create a new user account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Controller
            name="app_ids"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="app_ids">Applications</Label>
                <div className="flex flex-col gap-2 rounded-md border border-input p-3">
                  {apps?.data.map((app: App) => {
                    const checked = field.value?.includes(app.id) ?? false
                    return (
                      <label key={app.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={checked}
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            const current = field.value ?? []
                            if (isChecked) {
                              field.onChange([...current, app.id])
                            } else {
                              field.onChange(current.filter((id: string) => id !== app.id))
                            }
                          }}
                        />
                        <span className="text-sm">
                          {app.name}
                        </span>
                      </label>
                    )
                  })}
                  {!apps && (
                    <p className="text-xs text-muted-foreground">
                      Loading applications...
                    </p>
                  )}
                  {apps && apps.data.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No applications available.
                    </p>
                  )}
                </div>
                {errors.app_ids && (
                  <p className="text-sm text-destructive">{errors.app_ids.message}</p>
                )}
              </div>
            )}
          />

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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

