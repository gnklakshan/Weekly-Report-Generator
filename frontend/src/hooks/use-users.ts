import { useState, useEffect, useCallback } from "react";
import type { CreateUserInput, UpdateUserInput, User, UserFilters } from "@/types";
import { usersService } from "@/services";

export function useUsers(initialFilters?: UserFilters) {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilters>(initialFilters || {});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersService.getUsers(filters);
      setUsers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load users.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data-fetching effect
    void fetchUsers();
  }, [fetchUsers]);

  const createUser = async (input: CreateUserInput) => {
    try {
      const created = await usersService.createUser(input);
      setUsers((prev) => [...prev, created]);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create user.";
      setError(msg);
      throw err;
    }
  };

  const updateUser = async (id: string, input: UpdateUserInput) => {
    try {
      const updated = await usersService.updateUser(id, input);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update user.";
      setError(msg);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete user.";
      setError(msg);
      throw err;
    }
  };

  return {
    users,
    filters,
    isLoading,
    error,
    refetch: fetchUsers,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
  };
}
