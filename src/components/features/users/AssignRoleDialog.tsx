import { useState, useEffect } from 'react'
import { Controller, useForm } from "react-hook-form";
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const assignRoleSchema = z.object({
  app_id: z.string().min(1, 'Application is required'),
  role_name: z.string().min(1, 'Role is required'),
})

type AssignRoleFormData = z.infer<typeof assignRoleSchema>

export function AssignRoleDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const { data: apps } = useQuery({
    queryKey: ["apps"],
    queryFn: () => apiClient.getApps({ limit: 100 }),
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<AssignRoleFormData>({
    resolver: zodResolver(assignRoleSchema),
  });

  const selectedAppId = watch("app_id");

  // Fetch roles for the selected application
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["app-roles", selectedAppId],
    queryFn: () => apiClient.getAppRoles(selectedAppId),
    enabled: !!selectedAppId,
  });

  // Reset role selection when app changes
  useEffect(() => {
    setValue("role_name", "");
  }, [selectedAppId, setValue]);

  const assignMutation = useMutation({
    mutationFn: (data: AssignRoleFormData) =>
      apiClient.assignRole(userId, {
        app_uuid: data.app_id,
        role_name: data.role_name,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['user', userId, 'roles'] })
      addToast({
        title: 'Role assigned',
        description: 'The role has been assigned successfully.',
      })
      reset()
      setOpen(false)
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to assign role',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: AssignRoleFormData) => {
    assignMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Assign Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
          <DialogDescription>
            Assign a role to this user for a specific application
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="app_id"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="app_id">Application</Label>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent>
                    {apps?.data.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.app_id && (
                  <p className="text-sm text-destructive">
                    {errors.app_id.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="role_name"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="role_name">Role</Label>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  disabled={!selectedAppId || isLoadingRoles}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !selectedAppId 
                          ? "Select an application first" 
                          : isLoadingRoles 
                            ? "Loading roles..." 
                            : "Select role"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name} ({role.userCount} users)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_name && (
                  <p className="text-sm text-destructive">
                    {errors.role_name.message}
                  </p>
                )}
                {selectedAppId && roles?.roles.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No roles found for this application.
                  </p>
                )}
              </div>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={assignMutation.isPending}>
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
