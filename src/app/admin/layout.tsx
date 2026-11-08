import { AdminLayoutGuard } from "@/components/admin/AdminLayoutGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutGuard>{children}</AdminLayoutGuard>;
}
