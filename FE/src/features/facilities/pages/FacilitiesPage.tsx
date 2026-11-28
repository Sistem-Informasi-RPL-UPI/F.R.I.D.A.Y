import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '../../../shared/api/client';
import { Alert, Badge, Card } from '../../../shared/ui';

interface Building {
  id: number;
  code: string;
  name: string;
  rooms_count?: number;
}

interface Room {
  id: number;
  code: string;
  name: string;
  capacity: number;
  room_type: string;
  building?: { code: string };
}

interface Item {
  id: number;
  code: string;
  name: string;
  total_stock: number;
  available_stock: number;
  condition: string;
}

export function FacilitiesPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<{ data: Building[] }>('/api/v1/facilities/buildings'),
      apiRequest<{ data: Room[] }>('/api/v1/facilities/rooms'),
      apiRequest<{ data: Item[] }>('/api/v1/facilities/items'),
    ])
      .then(([b, r, i]) => {
        if (!active) return;
        setBuildings(b.data);
        setRooms(r.data);
        setItems(i.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'Silakan masuk untuk mengakses manajemen fasilitas.',
        );
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h3>Manajemen Fasilitas Kampus</h3>
        <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
          Master data gedung, ruangan kuliah/lab, dan inventaris barang.
        </p>
      </header>

      {error ? <Alert tone="warning">{error}</Alert> : null}

      <div className="ds-grid">
        <div className="ds-col-4">
          <Card>
            <h6>Gedung ({buildings.length})</h6>
            {buildings.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: '0.4rem 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <strong>{b.code}</strong> — {b.name}
              </div>
            ))}
          </Card>
        </div>
        <div className="ds-col-4">
          <Card>
            <h6>Ruangan ({rooms.length})</h6>
            {rooms.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '0.4rem 0',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  <strong>{r.code}</strong> ({r.capacity})
                </span>
                <Badge tone="primary">{r.room_type}</Badge>
              </div>
            ))}
          </Card>
        </div>
        <div className="ds-col-4">
          <Card>
            <h6>Barang ({items.length})</h6>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.4rem 0',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  <strong>{item.name}</strong>
                </span>
                <Badge tone="secondary">
                  {item.available_stock}/{item.total_stock}
                </Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
