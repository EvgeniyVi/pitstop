'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Alert,
  rem,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
  };
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const validateForm = (): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Invalid email format';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };


  const loginRequest = async (payload: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    // Используйте переменную окружения для API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Сервер должен возвращать { message: '...' }
      throw new Error(data.message || 'Invalid email or password');
    }

    return data;
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await loginRequest({
        email: email.trim(),
        password,
      });

      // Редирект и обновление состояния кэша сессии
      router.push('/garage');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Иконка для алерта ошибки
  const alertIcon = <IconAlertTriangle style={{ width: rem(16), height: rem(16) }} />;

  return (
    <Container size={420} my={60}>
      <Title ta="center" order={2}>
        Sign in to Garage
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={6} mb={24}>
        Sign in to manage your maintenance history and find service stations on the map
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="md">
            {errorMessage && (
              <Alert icon={alertIcon} color="red" variant="light" title="Error">
                {errorMessage}
              </Alert>
            )}

            <TextInput
              label="Email address"
              placeholder="driver@example.com"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              disabled={isSubmitting}
              error={errorMessage && email.trim() === ''} // Подсветка поля при ошибке
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              disabled={isSubmitting}
              error={errorMessage && password.length < 6}
            />

            <Button type="submit" fullWidth mt="xl" loading={isSubmitting}>
              Sign In
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="lg">
          Don't have an account yet?{' '}
          <Anchor href="/register" size="sm" fw={500}>
            Create account
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}