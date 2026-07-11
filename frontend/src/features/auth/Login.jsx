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
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  FormControlLabel, 
  Checkbox,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

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
      // The API returns { success: true, data: { token, user }, message: "Login successful" }
      if (data.success && data.data) {
        dispatch(setCredentials({ token: data.data.access_token, user: data.data.user }));
        toast.success('Successfully logged in');
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      let message = 'Login failed. Please check your credentials.';
      
      if (error.response?.data?.errors) {
        // Get the first error message from the validation errors object
        const firstErrorKey = Object.keys(error.response.data.errors)[0];
        message = error.response.data.errors[firstErrorKey][0];
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      toast.error(message);
    }
  });

  const onSubmit = (data) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', p: 2 }}>
        <CardContent>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ mb: 1, fontWeight: 700 }}>
              LeadFlow
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your enterprise account
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 3 }}>
              <FormControlLabel
                control={<Checkbox {...register('rememberMe')} color="primary" />}
                label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
