// components/admin/UserColumns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types"
import { UserStatusToggle } from "./UserStatusToggle"
import Link from "next/link"

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <Link href={`/admin/users/${row.original.id}`} className="font-medium">
        {row.getValue("email")}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.getValue("status") === "active"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}>
        {row.getValue("status")}
      </span>
    ),
  },
  {
    accessorKey: "profile.status",
    header: "Profile Status",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.original.profile?.status === "approved"
          ? "bg-green-100 text-green-800"
          : row.original.profile?.status === "refused"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
      }`}>
        {row.original.profile?.status || "N/A"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <UserStatusToggle
          userId={row.original.id}
          initialStatus={row.original.status as "active" | "inactive"}
        />
        {row.original.profile && (
          <Link
            href={`/admin/approvals/${row.original.profile.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            Review Profile
          </Link>
        )}
      </div>
    ),
  },
]