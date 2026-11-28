<?php

namespace App\Modules\Loans\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LoanStatusNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $loanType,
        private readonly int $loanId,
        private readonly string $status,
        private readonly string $title,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'loan_type' => $this->loanType,
            'loan_id' => $this->loanId,
            'status' => $this->status,
            'title' => $this->title,
        ];
    }
}
