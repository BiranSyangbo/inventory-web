import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Truck, Users,
  ArrowDownCircle, ArrowUpCircle, LogOut, Upload,
  BarChart2, ChevronDown, ChevronRight, TrendingUp,
  AlertTriangle, ShoppingCart, FileText, Activity,
  PieChart, Zap, Archive, CreditCard
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

const mainNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
]

const salesNav = [
  { label: 'New Sale', path: '/sales/new', icon: ArrowUpCircle },
  { label: 'Sales List', path: '/sales', icon: ShoppingCart },
]

const inventoryNav = [
  { label: 'Products', path: '/products', icon: ShoppingBag },
  { label: 'Inventory', path: '/inventory', icon: Package },
  { label: 'Suppliers', path: '/suppliers', icon: Truck },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Purchases', path: '/purchases', icon: ArrowDownCircle },
  { label: 'Import', path: '/import', icon: Upload },
]

const reportsNav = [
  { label: 'Daily Sales', path: '/reports/daily-sales', icon: BarChart2 },
  { label: 'Profit & Loss', path: '/reports/profit-loss', icon: TrendingUp },
  { label: 'Category Sales', path: '/reports/category-sales', icon: PieChart },
  { label: 'Fast Moving', path: '/reports/fast-moving', icon: Zap },
  { label: 'Dead Stock', path: '/reports/dead-stock', icon: Archive },
  { label: 'Purchases', path: '/reports/purchases', icon: FileText },
  { label: 'VAT Report', path: '/reports/vat', icon: CreditCard },
  { label: 'Stock Movement', path: '/reports/stock-movement', icon: Activity },
  { label: 'Supplier Outstanding', path: '/reports/supplier-outstanding', icon: AlertTriangle },
]

function NavSection({ label, items, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {label}
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {open && (
        <div className="mt-1 space-y-0.5">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/sales' || path === '/purchases'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 bg-card border-r border-border flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-border">
          <h1 className="text-base font-bold text-foreground">Stock Manager</h1>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{username}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
          {/* Main */}
          {mainNav.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}

          <NavSection label="Sales" items={salesNav} defaultOpen={true} />
          <NavSection label="Inventory" items={inventoryNav} defaultOpen={true} />
          <NavSection label="Reports" items={reportsNav} defaultOpen={true} />
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
