import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '../../../shared/api/client';
import { Alert, Badge, Button, Card } from '../../../shared/ui';

interface RoomLoan {
  id: number;
  purpose: string;
  start_at: string;
  end_at: string;
  status: string;
  room?: { code: string; name: string };
}

interface ItemLoan {
  id: number;
  quantity: number;
  purpose: string;
  borrowed_at: string;
  due_at: string;
  status: string;
  item?: { code: string; name: string };
}

export function LoansPage() {
  const [tab, setTab] = useState<'rooms' | 'items'>('rooms');
  const [roomLoans, setRoomLoans] = useState<RoomLoan[]>([]);
  const [itemLoans, setItemLoans] = useState<ItemLoan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<{ data: RoomLoan[] }>('/api/v1/loans/rooms'),
      apiRequest<{ data: ItemLoan[] }>('/api/v1/loans/items'),
    ])
      .then(([roomsRes, itemsRes]) => {
        if (!active) return;
        setRoomLoans(roomsRes.data);
        setItemLoans(itemsRes.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'Silakan masuk terlebih dahulu untuk melihat data peminjaman.',
        );
      });

    return () => {
      active = false;
    };
  }, []);

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
          <h3>Peminjaman Ruangan & Barang</h3>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Kelola pengajuan dan riwayat peminjaman fasilitas kampus.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant={tab === 'rooms' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTab('rooms')}
          >
            Peminjaman Ruangan
          </Button>
          <Button
            variant={tab === 'items' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTab('items')}
          >
            Peminjaman Barang
          </Button>
        </div>
      </header>

      {error ? <Alert tone="warning">{error}</Alert> : null}

      <Card>
        {tab === 'rooms' ? (
          roomLoans.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-ink-muted)' }}>
              Belum ada data peminjaman ruangan.
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {roomLoans.map((loan) => (
                <li
                  key={loan.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <div>
                    <strong>{loan.room?.name ?? 'Ruangan'}</strong> —{' '}
                    {loan.purpose}
                    <div
                      style={{
                        fontSize: 'var(--text-body-sm-size)',
                        color: 'var(--color-ink-muted)',
                      }}
                    >
                      {loan.start_at} s/d {loan.end_at}
                    </div>
                  </div>
                  <Badge
                    tone={
                      loan.status === 'approved'
                        ? 'success'
                        : loan.status === 'rejected'
                          ? 'danger'
                          : 'accent'
                    }
                  >
                    {loan.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )
        ) : itemLoans.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-ink-muted)' }}>
            Belum ada data peminjaman barang.
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {itemLoans.map((loan) => (
              <li
                key={loan.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '0.75rem',
                }}
              >
                <div>
                  <strong>{loan.item?.name ?? 'Barang'}</strong> (
                  {loan.quantity} unit) — {loan.purpose}
                  <div
                    style={{
                      fontSize: 'var(--text-body-sm-size)',
                      color: 'var(--color-ink-muted)',
                    }}
                  >
                    Pinjam: {loan.borrowed_at} • Jatuh tempo: {loan.due_at}
                  </div>
                </div>
                <Badge
                  tone={
                    loan.status === 'returned'
                      ? 'success'
                      : loan.status === 'rejected'
                        ? 'danger'
                        : 'secondary'
                  }
                >
                  {loan.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
