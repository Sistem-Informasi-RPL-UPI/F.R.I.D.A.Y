import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ApiError } from '../../../shared/api/client';
import { Alert, Button, Card, FormField, Input } from '../../../shared/ui';
import { login } from '../api/authApi';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Tidak dapat terhubung ke server API.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '28rem', margin: '3rem auto' }}>
      <Card>
        <h4 style={{ marginBottom: '0.5rem' }}>Masuk ke FRIDAY</h4>
        <p style={{ color: 'var(--color-ink-secondary)' }}>
          Sistem Informasi Akademik & Peminjaman UPI Kampus Cibiru
        </p>

        {error ? (
          <Alert tone="danger" style={{ marginBottom: '1rem' }}>
            {error}
          </Alert>
        ) : null}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <FormField id="login-email" label="Email">
            <Input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@upi.edu"
            />
          </FormField>

          <FormField id="login-password" label="Kata Sandi">
            <Input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>

          <Button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
