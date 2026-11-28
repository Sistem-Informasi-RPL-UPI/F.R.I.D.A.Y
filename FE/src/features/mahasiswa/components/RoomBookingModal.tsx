import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarClock, Loader2, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError } from '../../../shared/api/client';
import { Badge, Button, FormField, Input } from '../../../shared/ui';
import {
  shouldUseBackendApi,
  submitRoomLoanToApi,
} from '../api/roomBookingApi';
import type { BookableRoom, RoomBookingRecord } from '../data/campusBuildings';

export interface RoomBookingModalProps {
  room: BookableRoom | null;
  defaultDate: string;
  onClose: () => void;
  onSubmitBooking: (record: RoomBookingRecord) => void;
}

interface BookingFormValues {
  date: string;
  startTime: string;
  endTime: string;
  attendeeCount: string;
  organizer: string;
  purpose: string;
}

function createBookingSchema(maxCapacity: number) {
  return z
    .object({
      date: z.string().min(1, 'Tanggal peminjaman wajib diisi.'),
      startTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, 'Format jam mulai tidak valid.'),
      endTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, 'Format jam selesai tidak valid.'),
      attendeeCount: z
        .string()
        .min(1, 'Jumlah peserta wajib diisi.')
        .refine(
          (val) => {
            const num = Number(val);
            return Number.isInteger(num) && num >= 1 && num <= maxCapacity;
          },
          {
            message: `Jumlah peserta harus 1–${maxCapacity} orang sesuai kapasitas ruangan.`,
          },
        ),
      organizer: z
        .string()
        .trim()
        .min(2, 'Nama peminjam / organisasi minimal 2 karakter.'),
      purpose: z
        .string()
        .trim()
        .min(5, 'Keperluan kegiatan minimal 5 karakter.'),
    })
    .refine((data) => data.endTime > data.startTime, {
      message: 'Jam selesai harus lebih akhir daripada jam mulai.',
      path: ['endTime'],
    });
}

function createBookingRecord(
  room: BookableRoom,
  values: BookingFormValues,
): RoomBookingRecord {
  return {
    id: `PJM-R-${Date.now()}`,
    roomCode: room.code,
    roomName: room.name,
    buildingId: room.buildingId,
    floor: room.floor,
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime,
    attendeeCount: Number(values.attendeeCount),
    purpose: values.purpose.trim(),
    organizer: values.organizer.trim(),
    status: 'Menunggu Persetujuan',
    submittedAt: new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function RoomBookingModal({
  room,
  defaultDate,
  onClose,
  onSubmitBooking,
}: RoomBookingModalProps) {
  const schema = useMemo(
    () => createBookingSchema(room?.capacity ?? 40),
    [room?.capacity],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate,
      startTime: '09:00',
      endTime: '11:00',
      attendeeCount: '20',
      organizer: 'Alya Rahmadani (RPL)',
      purpose: '',
    },
  });

  useEffect(() => {
    if (!room) return;
    reset({
      date: defaultDate,
      startTime: '09:00',
      endTime: '11:00',
      attendeeCount: String(Math.min(20, room.capacity)),
      organizer: 'Alya Rahmadani (RPL)',
      purpose: '',
    });
  }, [room, defaultDate, reset]);

  async function onValidSubmit(values: BookingFormValues) {
    if (!room) return;

    if (shouldUseBackendApi() && room.backendRoomId !== undefined) {
      try {
        const savedRecord = await submitRoomLoanToApi({
          roomId: room.backendRoomId,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          attendeeCount: Number(values.attendeeCount),
          organizer: values.organizer.trim(),
          purpose: values.purpose.trim(),
        });
        onSubmitBooking(savedRecord);
        toast.success(`Pengajuan peminjaman ${room.code} berhasil dikirim.`);
        onClose();
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Gagal mengirim pengajuan peminjaman ruangan.';
        toast.error(message);
      }
      return;
    }

    const record = createBookingRecord(room, values);
    onSubmitBooking(record);
    toast.success(`Pengajuan peminjaman ${room.code} berhasil dikirim.`);
    onClose();
  }

  return (
    <Dialog.Root
      open={room !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="rmb-modal-overlay" />
        <Dialog.Content className="rmb-modal-content">
          <div className="rmb-modal-header">
            <div>
              <div className="rmb-modal-badges">
                {room && <Badge tone="primary">{room.code}</Badge>}
                {room && (
                  <Badge tone="secondary">
                    Gedung {room.buildingId} • Lantai {room.floor}
                  </Badge>
                )}
              </div>
              <Dialog.Title className="rmb-modal-title">
                Ajukan Peminjaman Ruangan
              </Dialog.Title>
              <Dialog.Description className="rmb-modal-desc">
                {room
                  ? `${room.name} (Kapasitas maksimal ${room.capacity} orang)`
                  : 'Lengkapi detail jadwal peminjaman ruangan.'}
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rmb-modal-close"
                aria-label="Tutup dialog"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <form
            className="rmb-modal-form"
            onSubmit={handleSubmit(onValidSubmit)}
            noValidate
          >
            <div className="rmb-modal-context-strip">
              <CalendarClock size={16} aria-hidden="true" />
              <span>
                Pengajuan akan diteruskan ke admin fasilitas untuk verifikasi
                ketersediaan ruangan.
              </span>
            </div>

            <div className="rmb-form-row">
              <FormField
                id="booking-date"
                label="Tanggal Peminjaman"
                error={errors.date?.message}
              >
                <Input
                  id="booking-date"
                  type="date"
                  hasError={Boolean(errors.date)}
                  {...register('date')}
                />
              </FormField>

              <FormField
                id="booking-attendees"
                label="Perkiraan Jumlah Peserta"
                error={errors.attendeeCount?.message}
              >
                <Input
                  id="booking-attendees"
                  type="number"
                  min={1}
                  max={room?.capacity ?? 60}
                  hasError={Boolean(errors.attendeeCount)}
                  {...register('attendeeCount')}
                />
              </FormField>
            </div>

            <div className="rmb-form-row">
              <FormField
                id="booking-start"
                label="Jam Mulai"
                error={errors.startTime?.message}
              >
                <Input
                  id="booking-start"
                  type="time"
                  hasError={Boolean(errors.startTime)}
                  {...register('startTime')}
                />
              </FormField>

              <FormField
                id="booking-end"
                label="Jam Selesai"
                error={errors.endTime?.message}
              >
                <Input
                  id="booking-end"
                  type="time"
                  hasError={Boolean(errors.endTime)}
                  {...register('endTime')}
                />
              </FormField>
            </div>

            <FormField
              id="booking-organizer"
              label="Penanggung Jawab / Organisasi"
              error={errors.organizer?.message}
            >
              <Input
                id="booking-organizer"
                placeholder="Contoh: HIMARPL / Kelas 5A"
                hasError={Boolean(errors.organizer)}
                {...register('organizer')}
              />
            </FormField>

            <FormField
              id="booking-purpose"
              label="Keperluan Kegiatan"
              error={errors.purpose?.message}
            >
              <Input
                id="booking-purpose"
                placeholder="Contoh: Rapat Persiapan Seminar Teknologi RPL"
                hasError={Boolean(errors.purpose)}
                {...register('purpose')}
              />
            </FormField>

            <div className="rmb-modal-footer">
              <Button variant="outline" size="md" onClick={onClose}>
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 size={16} className="rmb-spin" aria-hidden="true" />
                )}
                <span>Kirim Pengajuan</span>
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
