<?php

namespace App\Modules\Scheduling\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Scheduling\Models\ScheduleRun;
use App\Modules\Scheduling\Services\MindMappingService;
use App\Modules\Scheduling\Services\OfflineHtmlExporterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MindMappingController extends Controller
{
    public function show(Request $request, MindMappingService $mindMapping): JsonResponse
    {
        $run = $this->resolveApprovedRun($request->integer('schedule_run_id') ?: null);
        if (! $run) {
            return response()->json([
                'message' => 'No approved schedule run is available for Mind Mapping.',
                'code' => 'NO_APPROVED_SCHEDULE',
            ], 404);
        }

        $buildingId = $request->filled('building_id') ? $request->integer('building_id') : null;

        return response()->json([
            'data' => $mindMapping->buildMatrix($run, $buildingId),
        ]);
    }

    public function exportHtml(
        Request $request,
        MindMappingService $mindMapping,
        OfflineHtmlExporterService $exporter,
    ): Response|JsonResponse {
        $run = $this->resolveApprovedRun($request->integer('schedule_run_id') ?: null);
        if (! $run) {
            return response()->json([
                'message' => 'No approved schedule run is available to export.',
                'code' => 'NO_APPROVED_SCHEDULE',
            ], 404);
        }

        $buildingId = $request->filled('building_id') ? $request->integer('building_id') : null;
        $matrix = $mindMapping->buildMatrix($run, $buildingId);
        $html = $exporter->render($matrix);

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="mind-mapping-jadwal.html"',
        ]);
    }

    private function resolveApprovedRun(?int $runId): ?ScheduleRun
    {
        $query = ScheduleRun::query()->with('academicPeriod')->where('status', 'approved');

        if ($runId !== null) {
            return $query->whereKey($runId)->first();
        }

        return $query->latest('approved_at')->first();
    }
}
