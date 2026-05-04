import { useParams } from 'react-router-dom';
import { PreconDetailPage } from '../../../pages/precon-detail-page';

// Keys PreconDetailPage on preconId so navigating between precons remounts
// the component and resets all per-precon state (locked sort order, pagination).
export function PreconDetailRoute() {
  const { preconId } = useParams<{ preconId: string }>();
  return <PreconDetailPage key={preconId} />;
}
