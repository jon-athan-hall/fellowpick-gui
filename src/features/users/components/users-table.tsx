import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text
} from '@mantine/core';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { ApiError } from '../../../shared/api/errors';
import { useUsersQuery } from '../api/use-users';
import type { UserResponse } from '../types';

export interface UsersTableProps {
  onManageRoles: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
}

const DEFAULT_PAGE_SIZE = 20;

export function UsersTable({ onManageRoles, onDelete }: UsersTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const usersQuery = useUsersQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: 'createdAt,desc'
  });

  const columns = useMemo<ColumnDef<UserResponse>[]>(
    () => [
      { accessorKey: 'name', header: 'Name', cell: (info) => info.getValue<string>() },
      { accessorKey: 'email', header: 'Email', cell: (info) => info.getValue<string>() },
      {
        accessorKey: 'verified',
        header: 'Verified',
        cell: (info) => (
          <Badge color={info.getValue<boolean>() ? 'green' : 'gray'} variant="light">
            {info.getValue<boolean>() ? 'Yes' : 'No'}
          </Badge>
        )
      },
      {
        accessorKey: 'roles',
        header: 'Roles',
        cell: (info) => (
          <Group gap="xs">
            {info.getValue<string[]>().map((roleName) => (
              <Badge key={roleName} variant="light">
                {roleName}
              </Badge>
            ))}
          </Group>
        )
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: (info) => new Date(info.getValue<string>()).toLocaleDateString()
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Group gap="xs">
            <Button
              size="xs"
              variant="subtle"
              aria-label={`Manage roles for ${row.original.name}`}
              onClick={() => onManageRoles(row.original)}
            >
              Roles
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="red"
              aria-label={`Delete ${row.original.name}`}
              onClick={() => onDelete(row.original)}
            >
              Delete
            </Button>
          </Group>
        )
      }
    ],
    [onManageRoles, onDelete]
  );

  const table = useReactTable({
    data: usersQuery.data?.content ?? [],
    columns,
    pageCount: usersQuery.data?.totalPages ?? -1,
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel()
  });

  if (usersQuery.isPending) {
    return (
      <Group justify="center" py="md">
        <Loader />
      </Group>
    );
  }

  if (usersQuery.isError) {
    const message =
      usersQuery.error instanceof ApiError ? usersQuery.error.message : 'Failed to load users';
    return <Alert color="red">{message}</Alert>;
  }

  if (usersQuery.data.content.length === 0) {
    return (
      <Stack align="center" py="md">
        <Text c="dimmed">No users found.</Text>
      </Stack>
    );
  }

  const { number: currentPage, totalPages, totalElements } = usersQuery.data;

  return (
    <Stack gap="md">
      <Table striped highlightOnHover>
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Table.Th>
              ))}
            </Table.Tr>
          ))}
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          Page {currentPage + 1} of {totalPages} · {totalElements} total
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            size="xs"
            variant="default"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}