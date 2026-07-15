import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  Box, 
  Card, 
  Typography, 
  TextField, 
  Button, 
  FormControlLabel, 
  Checkbox,
  InputAdornment,
  IconButton,
  Grid,
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined, AutoGraph } from '@mui/icons-material';

import { loginAPI } from '../../api/authApi';
import { setCredentials } from '../../redux/slices/authSlice';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const loginMutation = useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      if (data.success && data.data) {
        dispatch(setCredentials({ token: data.data.access_token, user: data.data.user }));
        toast.success('Successfully logged in', {
          icon: '🚀',
          style: { borderRadius: '10px', background: '#1e293b', color: '#fff' }
        });
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      let message = 'Login failed. Please check your credentials.';
      if (error.response?.data?.errors) {
        const firstErrorKey = Object.keys(error.response.data.errors)[0];
        message = error.response.data.errors[firstErrorKey][0];
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message, {
        style: { borderRadius: '10px', background: '#1e293b', color: '#fff' }
      });
    }
  });

  const onSubmit = (data) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', m: 0, p: 0, overflow: 'hidden' }}>
      {/* Left side: Branding / Graphic */}
      <Box 
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          p: 6
        }}
      >
        {/* Abstract shapes for background */}
        <Box sx={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0
        }} />

        <Box sx={{ zIndex: 1, maxWidth: 500 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <AutoGraph sx={{ fontSize: 48, color: '#818cf8', mr: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              LeadFlow
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 300, lineHeight: 1.4 }}>
            The enterprise standard for <span style={{ color: '#818cf8', fontWeight: 600 }}>intelligent</span> lead management.
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 6, fontSize: '1.1rem' }}>
            Accelerate your sales pipeline with AI-driven insights, automated follow-ups, and comprehensive performance analytics.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#818cf8' }}>2.5x</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Conversion Rate</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#a855f7' }}>99%</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Task Automation</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right side: Login Form */}
      <Box 
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#122131',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            p: { xs: 4, sm: 6 },
          }}
        >
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px' }}>
              Welcome back
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Please enter your details to sign in.
            </Typography>
          </Box>

          <Box sx={{ mb: 4, p: 2, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
            <Typography variant="body2" sx={{ color: '#b4c5ff', fontWeight: 600, mb: 1 }}>
              Demo Credentials
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
              Email: admin@leadflow.local<br/>
              Password: password
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              id="email"
              placeholder="admin@leadflow.local"
              name="email"
              autoComplete="email"
              autoFocus
              variant="outlined"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: '#0d1c2d' }
              }}
            />
            
            <TextField
              fullWidth
              placeholder="••••••••"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: '#0d1c2d' }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <FormControlLabel
                control={<Checkbox {...register('rememberMe')} size="small" sx={{ color: 'text.disabled', '&.Mui-checked': { color: 'primary.main' } }} />}
                label={<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Remember for 30 days</Typography>}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ 
                py: 1.5, 
                fontWeight: 600, 
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.23)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {loginMutation.isPending ? 'Authenticating...' : 'Sign in'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
