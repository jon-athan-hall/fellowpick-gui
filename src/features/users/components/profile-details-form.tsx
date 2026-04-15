import { Alert, Button, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ApiError } from '../../../shared/api/errors';
import { useUpdateUserMutation } from '../api/use-update-user';

export interface ProfileDetailsFormProps {
  userId: string;
  initialName: string;
  initialEmail: string;
  /** Called with the persisted values after a successful save. */
  onUpdated: (patch: { name: string; email: string }) => void;
}

// Renders a form for editing the user's name and email.
export function ProfileDetailsForm({
  userId,
  initialName,
  initialEmail,
  onUpdated
}: ProfileDetailsFormProps) {
  const updateMutation = useUpdateUserMutation();

  const form = useForm({
    initialValues: { name: initialName, email: initialEmail },
    validate: {
      name: (v) => (v.trim().length > 0 && v.length <= 100 ? null : 'Name is required'),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email')
    }
  });

  function handleSubmit(values: typeof form.values) {
    updateMutation.mutate(
      { id: userId, body: values },
      {
        onSuccess: (res) => {
          onUpdated({ name: res.name, email: res.email });
          form.resetDirty(values);
        }
      }
    );
  }

  const errorMessage =
    updateMutation.error instanceof ApiError
      ? updateMutation.error.message
      : updateMutation.isError
        ? 'Update failed'
        : null;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Title order={4}>Account details</Title>
        {errorMessage && <Alert color="red">{errorMessage}</Alert>}
        {updateMutation.isSuccess && !form.isDirty() && (
          <Alert color="green">Profile updated.</Alert>
        )}
        <TextInput label="Name" required {...form.getInputProps('name')} />
        <TextInput label="Email" type="email" required {...form.getInputProps('email')} />
        <Button type="submit" loading={updateMutation.isPending} disabled={!form.isDirty()}>
          Save changes
        </Button>
      </Stack>
    </form>
  );
}