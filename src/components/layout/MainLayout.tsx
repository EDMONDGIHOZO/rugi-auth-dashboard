import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-muted">
          {children}
        </main>
      </div>
    </div>
  )
}

