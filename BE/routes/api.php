<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('v1.')->group(function (): void {
    require app_path('Modules/Identity/Routes/api.php');
    require app_path('Modules/Facilities/Routes/api.php');
    require app_path('Modules/Loans/Routes/api.php');
    require app_path('Modules/Academic/Routes/api.php');
    require app_path('Modules/Scheduling/Routes/api.php');
    require app_path('Modules/Notifications/Routes/api.php');
});
