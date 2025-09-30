/**
 * Redux Auth Slice - Complete Rewrite
 * Manages authentication state and async actions
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import authService, { User, LoginData, RegisterData, AuthResponse } from '../services/authService';

// State interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: authService.getUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginData, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux: Starting login async thunk...', { email: credentials.email });
      const response = await authService.login(credentials);
      console.log('✅ Redux: Login async thunk successful');
      return response;
    } catch (error: any) {
      console.error('❌ Redux: Login async thunk failed:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user data');
    }
  }
);

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const newToken = await authService.refreshToken();
      return newToken;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Logout action
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      toast.success('Logged out successfully');
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update user data
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage
        localStorage.setItem('user_data', JSON.stringify(state.user));
      }
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Initialize auth state
    initializeAuth: (state) => {
      // Only initialize if not already initialized
      if (state.user === null && !state.isAuthenticated) {
        const user = authService.getUser();
        const isAuthenticated = authService.isAuthenticated();
        
        state.user = user;
        state.isAuthenticated = isAuthenticated;
        
        console.log('🔍 Redux: Auth initialized:', {
          hasUser: !!user,
          isAuthenticated,
          userEmail: user?.email || 'N/A'
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log('⏳ Redux: Login pending...');
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Redux: Login fulfilled:', action.payload.user);
        toast.success(`Welcome back, ${action.payload.user.firstName}!`);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        console.log('❌ Redux: Login rejected:', action.payload);
        toast.error(action.payload as string || 'Login failed');
      })
      
      // Registration cases
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log('⏳ Redux: Registration pending...');
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        toast.success('Registration successful!');
        console.log('✅ Redux: Registration fulfilled');
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Registration failed');
        console.log('❌ Redux: Registration rejected:', action.payload);
      })
      
      // Get current user cases
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Refresh token cases
      .addCase(refreshTokenAsync.pending, (state) => {
        console.log('⏳ Redux: Token refresh pending...');
      })
      .addCase(refreshTokenAsync.fulfilled, (state) => {
        console.log('✅ Redux: Token refresh successful');
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        console.log('❌ Redux: Token refresh failed:', action.payload);
        state.isAuthenticated = false;
        state.user = null;
        state.error = 'Session expired. Please login again.';
        // Clear storage to prevent refresh loops
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        toast.error('Session expired. Please login again.');
      });
  },
});

// Export actions
export const { 
  logout, 
  clearError, 
  updateUser, 
  setLoading, 
  initializeAuth 
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
