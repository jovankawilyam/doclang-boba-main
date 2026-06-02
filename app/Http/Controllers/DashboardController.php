<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardData;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(DashboardData $dashboardData): Response
    {
        return Inertia::render('dashboard', $dashboardData->toArray());
    }
}
