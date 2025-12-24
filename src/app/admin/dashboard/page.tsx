"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEditorStore } from '@/lib/store'
import { 
  Users, 
  Code, 
  Bot, 
  TrendingUp, 
  Crown, 
  CreditCard,
  LogOut,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Shield
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const { 
    isAdmin, 
    adminLogout, 
    getAllUsers, 
    updateUserCredits, 
    updateUserSubscription,
    getUserStats,
    users,
    adminStats
  } = useEditorStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newCredits, setNewCredits] = useState(0)
  const [newSubscription, setNewSubscription] = useState<'free' | 'pro' | 'team'>('free')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserSubscription, setNewUserSubscription] = useState<'free' | 'pro' | 'team'>('free')

  useEffect(() => {
    // Check if admin is logged in
    const adminStatus = localStorage.getItem('pycode-admin-token')
    if (!adminStatus) {
      router.push('/admin/login')
      return
    }

    // Set admin status in store
    useEditorStore.setState({ isAdmin: true })

    // Load users and stats
    loadUsersAndStats()
  }, [router])

  const loadUsersAndStats = async () => {
    try {
      setIsLoading(true)
      // Load users from database
      await getAllUsers()
      
      // Load admin stats from database
      await getUserStats()
    } catch (error) {
      console.error('Error loading users and stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setNewCredits(user.credits)
    setNewSubscription(user.subscription)
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (selectedUser) {
      await updateUserCredits(selectedUser.id, newCredits)
      await updateUserSubscription(selectedUser.id, newSubscription)
      setIsEditDialogOpen(false)
      await loadUsersAndStats()
    }
  }

  const handleRefresh = async () => {
    await loadUsersAndStats()
  }

  // Auto-refresh users every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        loadUsersAndStats()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isLoading])

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail) return

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          subscription: newUserSubscription
        })
      })

      if (response.ok) {
        setIsAddUserDialogOpen(false)
        setNewUserName('')
        setNewUserEmail('')
        setNewUserSubscription('free')
        await loadUsersAndStats()
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )


  const stats = adminStats

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
            <Button onClick={() => router.push('/admin/login')} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">PyCode AI Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} active this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                Across all users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Code Runs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCodeRuns}</div>
              <p className="text-xs text-muted-foreground">
                All time executions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Queries</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAiQueries}</div>
              <p className="text-xs text-muted-foreground">
                All time queries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user subscriptions and credit limits
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button onClick={() => setIsAddUserDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search terms' : 'No users in the database yet'}
                  </p>
                  <Button onClick={() => setIsAddUserDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First User
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Code Runs</TableHead>
                    <TableHead>AI Queries</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.subscription === 'free' ? 'secondary' : 'default'}
                        className={user.subscription === 'team' ? 'bg-purple-100 text-purple-800' : ''}
                      >
                        {user.subscription === 'free' && <Crown className="h-3 w-3 mr-1" />}
                        {user.subscription === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                        {user.subscription === 'team' && <Crown className="h-3 w-3 mr-1" />}
                        {user.subscription.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className={user.credits <= 10 ? 'text-red-600 font-medium' : ''}>
                          {user.credits}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {user.creditLimit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user.codeRuns}</TableCell>
                    <TableCell>{user.aiQueries}</TableCell>
                    <TableCell>
                      {new Date(user.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user subscription and credit limits
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label>User</Label>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-medium">{selectedUser.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subscription">Subscription</Label>
                  <Select value={newSubscription} onValueChange={(value: any) => setNewSubscription(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (100 credits)</SelectItem>
                      <SelectItem value="pro">Pro (1000 credits)</SelectItem>
                      <SelectItem value="team">Team (5000 credits)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="0"
                    value={newCredits}
                    onChange={(e) => setNewCredits(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveUser}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-user-name">Name</Label>
                <Input
                  id="new-user-name"
                  placeholder="Enter user name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  placeholder="Enter user email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-user-subscription">Subscription</Label>
                <Select value={newUserSubscription} onValueChange={(value: any) => setNewUserSubscription(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (100 credits)</SelectItem>
                    <SelectItem value="pro">Pro (1000 credits)</SelectItem>
                    <SelectItem value="team">Team (5000 credits)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={!newUserName || !newUserEmail}>
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
