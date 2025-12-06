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
import type { User } from '@/types'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  isEmailVerified: z.boolean(),
  mfaEnabled: z.boolean(),
})

type UserFormData = z.infer<typeof userSchema>

export function EditUserDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      mfaEnabled: user.mfaEnabled,
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UserFormData) => apiClient.updateUser(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', user.id] })
      addToast({
        title: 'User updated',
        description: 'The user has been updated successfully.',
      })
      setOpen(false)
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: UserFormData) => {
    updateMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Controller
            name="isEmailVerified"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isEmailVerified"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isEmailVerified" className="text-sm font-normal">
                  Email verified
                </Label>
              </div>
            )}
          />

          <Controller
            name="mfaEnabled"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mfaEnabled"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={!user.mfaEnabled}
                  className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                />
                <Label htmlFor="mfaEnabled" className="text-sm font-normal">
                  MFA enabled {!user.mfaEnabled && '(read-only)'}
                </Label>
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
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

