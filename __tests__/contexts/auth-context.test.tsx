import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  }
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}))

// Test component that uses auth
const TestComponent = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => signUp('test@example.com', 'password')}>
        Sign Up
      </button>
      <button onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide auth context to children', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })
  })

  it('should handle loading state', () => {
    mockSupabaseClient.auth.getSession.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should handle session with user', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: '2024-01-01T00:00:00Z',
      phone: '',
      confirmed_at: '2024-01-01T00:00:00Z',
      last_sign_in_at: '2024-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
      identities: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: mockUser
    }

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com')
    })
  })

  it('should handle sign in', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })

    const signInButton = screen.getByText('Sign In')
    signInButton.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })
  })

  it('should handle sign up', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })

    const signUpButton = screen.getByText('Sign Up')
    signUpButton.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: undefined
        }
      })
    })
  })

  it('should handle sign out', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })

    const signOutButton = screen.getByText('Sign Out')
    signOutButton.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })
  })

  it('should handle auth errors gracefully', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: new Error('Auth error')
    })

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error getting session:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should handle missing Supabase client', async () => {
    // Mock createClient to return null (simulating missing env vars)
    jest.doMock('@/lib/supabase/client', () => ({
      createClient: jest.fn(() => null)
    }))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })
  })
})

describe('useAuth hook', () => {
  it('should throw error when used outside AuthProvider', () => {
    const TestComponentOutsideProvider = () => {
      useAuth()
      return null
    }

    // Suppress the error boundary error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponentOutsideProvider />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})