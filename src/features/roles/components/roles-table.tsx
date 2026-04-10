import { Alert, Button, Group, Loader, Stack, Table, Text } from '@mantine/core';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { ApiError } from '../../../shared/api/errors';
import { useRolesQuery } from '../api/use-roles';
import type { RoleResponse } from '../types';

export interface RolesTableProps {
  onEdit: (role: RoleResponse) => void;
  onDelete: (role: RoleResponse) => void;
}

export function RolesTable({ onEdit, onDelete }: RolesTableProps) {
  const rolesQuery = useRolesQuery();

  const columns = useMemo<ColumnDef<RoleResponse>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => info.getValue<string>()
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <Group gap="xs">
            <Button
              size="xs"
              variant="subtle"
              aria-label={`Edit ${row.original.name}`}
              onClick={() => onEdit(row.original)}
            >
              Edit
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
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: rolesQuery.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  if (rolesQuery.isPending) {
    return (
      <Group justify="center" py="md">
        <Loader />
      </Group>
    );
  }

  if (rolesQuery.isError) {
    const message =
      rolesQuery.error instanceof ApiError ? rolesQuery.error.message : 'Failed to load roles';
    return <Alert color="red">{message}</Alert>;
  }

  if (rolesQuery.data.length === 0) {
    return (
      <Stack align="center" py="md">
        <Text c="dimmed">No roles yet.</Text>
      </Stack>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.Th
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                style={
                  header.column.getCanSort()
                    ? { cursor: 'pointer', userSelect: 'none' }
                    : undefined
                }
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? null}
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
  );
}