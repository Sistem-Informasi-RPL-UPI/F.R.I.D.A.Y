import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '../../../shared/api/client';
import { Alert, Badge, Button, Card } from '../../../shared/ui';

interface ScheduleRun {
  id: number;
  status: string;
  hard_conflicts_count: number;
  soft_score: number;
  entries_count?: number;
  academic_period?: { id: number; name: string };
}

export function SchedulingPage() {
  const [runs, setRuns] = useState<ScheduleRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function loadRuns() {
    apiRequest<{ data: ScheduleRun[] }>('/api/v1/scheduling/runs')
      .then((res) => setRuns(res.data))
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : 'Silakan masuk untuk melihat data penjadwalan.',
        ),
      );
  }

  useEffect(() => {
    loadRuns();
  }, []);

  async function handleApprove(runId: number) {
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/v1/scheduling/runs/${runId}/approve`, {
        method: 'POST',
      });
      setMessage(`Jadwal #${runId} berhasil disetujui.`);
      loadRuns();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Gagal menyetujui jadwal.',
      );
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h3>Penjadwalan Akademik</h3>
        <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
          Generate jadwal, validasi Hard Constraints vs Soft Constraints, dan
          approval untuk Mind Mapping.
        </p>
      </header>

      {error ? <Alert tone="warning">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}

      <Card>
        <h6>Riwayat Generate Jadwal</h6>
        {runs.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-ink-muted)' }}>
            Belum ada hasil generate jadwal.
          </p>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {runs.map((run) => (
              <div
                key={run.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '0.75rem',
                }}
              >
                <div>
                  <strong>Run #{run.id}</strong> —{' '}
                  {run.academic_period?.name ?? 'Periode Akademik'}
                  <div
                    style={{
                      fontSize: 'var(--text-body-sm-size)',
                      color: 'var(--color-ink-muted)',
                    }}
                  >
                    Hard Conflicts: {run.hard_conflicts_count} • Soft Score:{' '}
                    {run.soft_score}%
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Badge
                    tone={
                      run.status === 'approved'
                        ? 'success'
                        : run.hard_conflicts_count > 0
                          ? 'danger'
                          : 'accent'
                    }
                  >
                    {run.status}
                  </Badge>
                  {run.status !== 'approved' ? (
                    <Button size="sm" onClick={() => handleApprove(run.id)}>
                      Approve
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
