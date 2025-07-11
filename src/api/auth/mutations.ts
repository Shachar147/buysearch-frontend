import { useMutation } from '@tanstack/react-query';
import { register, login } from '../../services/auth-api-service';

export function useRegister() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      register(username, password),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
  });
} 