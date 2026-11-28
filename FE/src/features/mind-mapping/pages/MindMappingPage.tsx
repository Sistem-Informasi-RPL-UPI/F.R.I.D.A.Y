import { useEffect, useState } from 'react';
import { apiRequest, ApiError, getApiOrigin } from '../../../shared/api/client';
import { Alert, Button, Card } from '../../../shared/ui';

interface MatrixCell {
  course_code: string;
  course_name: string;
  lecturer_name: string;
  class_name: string;
  color_hex: string;
}

interface MatrixResponse {
  schedule_run: { id: number; academic_period: string | null };
  buildings: Array<{ id: number; code: string; name: string }>;
  rooms: Array<{
    id: number;
    building_id: number;
    building_code: string;
    code: string;
    capacity: number;
  }>;
  days: Array<{ day_of_week: number; name: string }>;
  time_slots: Array<{ day_of_week: number; slot_order: number; label: string }>;
  legend: Array<{ id: number; code: string; name: string; color_hex: string }>;
  cells: Record<string, MatrixCell>;
}

export function MindMappingPage() {
  const [matrix, setMatrix] = useState<MatrixResponse | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<{ data: MatrixResponse }>('/api/v1/scheduling/mind-mapping')
      .then((res) => {
        if (active) setMatrix(res.data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Mind Mapping belum tersedia (pastikan sudah ada jadwal yang disetujui).',
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleRooms =
    matrix?.rooms.filter(
      (r) =>
        selectedBuildingId === 'all' ||
        String(r.building_id) === selectedBuildingId,
    ) ?? [];

  const exportUrl = `${getApiOrigin()}/api/v1/scheduling/mind-mapping/export-html${
    selectedBuildingId !== 'all' ? `?building_id=${selectedBuildingId}` : ''
  }`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3>Mind Mapping Jadwal (Matriks Gedung)</h3>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Tampilan matriks seluruh kampus dan per gedung dari jadwal yang
            telah disetujui.
          </p>
        </div>
        <a href={exportUrl} target="_blank" rel="noreferrer">
          <Button variant="accent">Export Offline HTML</Button>
        </a>
      </header>

      {error ? <Alert tone="warning">{error}</Alert> : null}

      {matrix ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Button
              size="sm"
              variant={selectedBuildingId === 'all' ? 'primary' : 'outline'}
              onClick={() => setSelectedBuildingId('all')}
            >
              Seluruh Kampus
            </Button>
            {matrix.buildings.map((b) => (
              <Button
                key={b.id}
                size="sm"
                variant={
                  selectedBuildingId === String(b.id) ? 'primary' : 'outline'
                }
                onClick={() => setSelectedBuildingId(String(b.id))}
              >
                {b.code} — {b.name}
              </Button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {matrix.legend.map((item) => (
              <span
                key={item.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--text-body-sm-size)',
                }}
              >
                <span
                  style={{
                    width: '0.75rem',
                    height: '0.75rem',
                    borderRadius: '50%',
                    backgroundColor: item.color_hex,
                  }}
                />
                {item.code} — {item.name}
              </span>
            ))}
          </div>

          <Card style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: '1px solid var(--color-border)',
                      padding: '0.5rem',
                      textAlign: 'left',
                    }}
                  >
                    Hari
                  </th>
                  <th
                    style={{
                      border: '1px solid var(--color-border)',
                      padding: '0.5rem',
                      textAlign: 'left',
                    }}
                  >
                    Slot
                  </th>
                  {visibleRooms.map((r) => (
                    <th
                      key={r.id}
                      style={{
                        border: '1px solid var(--color-border)',
                        padding: '0.5rem',
                        textAlign: 'left',
                      }}
                    >
                      {r.code} ({r.building_code})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.days.flatMap((d) =>
                  matrix.time_slots
                    .filter((s) => s.day_of_week === d.day_of_week)
                    .map((s) => (
                      <tr key={`${d.day_of_week}-${s.slot_order}`}>
                        <td
                          style={{
                            border: '1px solid var(--color-border)',
                            padding: '0.5rem',
                          }}
                        >
                          {d.name}
                        </td>
                        <td
                          style={{
                            border: '1px solid var(--color-border)',
                            padding: '0.5rem',
                          }}
                        >
                          {s.label}
                        </td>
                        {visibleRooms.map((r) => {
                          const cell =
                            matrix.cells[
                              `${d.day_of_week}:${s.slot_order}:${r.id}`
                            ];
                          return (
                            <td
                              key={r.id}
                              style={{
                                border: '1px solid var(--color-border)',
                                padding: '0.5rem',
                              }}
                            >
                              {cell ? (
                                <div
                                  style={{
                                    borderLeft: `4px solid ${cell.color_hex}`,
                                    paddingLeft: '0.5rem',
                                  }}
                                >
                                  <strong>{cell.course_code}</strong> —{' '}
                                  {cell.course_name}
                                  <div
                                    style={{ color: 'var(--color-ink-muted)' }}
                                  >
                                    {cell.class_name} • {cell.lecturer_name}
                                  </div>
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    )),
                )}
              </tbody>
            </table>
          </Card>
        </>
      ) : null}
    </div>
  );
}
