import {useAuth} from '@/contexts/AuthContext'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {LogOut, User} from 'lucide-react'

export function Header() {
    const {user, logout} = useAuth()

    return (
        <header
            className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-primary px-6 text-primary-foreground">
            <div className="flex flex-1 items-center gap-4 justify-end">
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div

                                className="flex items-center gap-2 text-primary-foreground hover:bg-secondary/40 hover:text-primary-foreground"
                            >{user?.email}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <a href="/profile" className="cursor-pointer flex w-full items-center">
                                    <User className="mr-2 h-4 w-4"/>
                                    Profile
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4"/>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}

