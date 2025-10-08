/**
 * Authentication debugging utilities
 */

export const debugToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const expirationTime = payload.exp;
    const timeUntilExpiry = expirationTime - currentTime;
    
    console.log('🔍 Token Debug Info:', {
      token: token.substring(0, 50) + '...',
      currentTime: new Date(currentTime * 1000).toISOString(),
      expirationTime: new Date(expirationTime * 1000).toISOString(),
      timeUntilExpiry: Math.round(timeUntilExpiry / 60) + ' minutes',
      isExpired: timeUntilExpiry < 0,
      payload: {
        user_id: payload.user_id,
        email: payload.email,
        is_admin: payload.is_admin
      }
    });
    
    return {
      isExpired: timeUntilExpiry < 0,
      timeUntilExpiry,
      payload
    };
  } catch (error) {
    console.error('❌ Token parsing error:', error);
    return {
      isExpired: true,
      timeUntilExpiry: -1,
      payload: null
    };
  }
};

export const checkAuthState = () => {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Auth State Debug:', {
    hasToken: !!token,
    hasUser: !!user,
    tokenLength: token?.length || 0,
    userData: user ? JSON.parse(user) : null
  });
  
  if (token) {
    debugToken(token);
  }
};

