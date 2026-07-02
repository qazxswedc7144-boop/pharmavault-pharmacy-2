import { ApiResponse } from "../../shared/types"
import { useAppStore } from "./offline-store"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const currentUser = useAppStore.getState().currentUser;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (currentUser?.role) {
    headers.set('x-user-role', currentUser.role);
  }
  const res = await fetch(path, { 
    ...init,
    headers 
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed')
  }
  return json.data
}