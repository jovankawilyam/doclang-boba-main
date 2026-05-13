<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        $admins = User::whereIn('role', ['super_admin', 'admin'])
            ->orderByRaw("CASE WHEN role = 'super_admin' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'created_at']);

        $stats = [
            'super_admin' => User::where('role', 'super_admin')->count(),
            'admin' => User::where('role', 'admin')->count(),
            'total' => User::whereIn('role', ['super_admin', 'admin'])->count(),
        ];

        return Inertia::render('admin/index', compact('admins', 'stats'));
    }

    public function create(): Response
    {
        return Inertia::render('admin/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:admin,super_admin'],
        ]);

        $this->authorizeSuperAdminRole($validated['role']);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => true,
        ]);

        return redirect()->route('admin.index')
            ->with('success', 'Admin berhasil ditambahkan!');
    }

    public function toggleStatus(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat mengubah status akun Anda sendiri.');
        }

        $this->authorizeSuperAdminRole($user->role);

        $isActive = ! $user->is_active;
        $user->update(['is_active' => $isActive]);

        if (! $isActive) {
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->delete();
        }

        $status = $isActive ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Admin {$user->name} berhasil {$status}.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat menghapus akun Anda sendiri.');
        }

        $this->authorizeSuperAdminRole($user->role);

        try {
            $user->delete();

            return back()->with('success', "Admin {$user->name} berhasil dihapus.");
        } catch (QueryException $e) {
            $sqlState = $e->errorInfo[0] ?? null;
            $driverCode = (int) ($e->errorInfo[1] ?? 0);

            if ($sqlState === '23000' || in_array($driverCode, [1451, 787], true)) {
                return back()->with('error', "Gagal menghapus admin {$user->name} karena masih memiliki data dokumen terkait.");
            }

            return back()->with('error', 'Gagal menghapus admin: Terjadi kesalahan database.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus admin: Terjadi kesalahan.');
        }
    }

    private function authorizeSuperAdminRole(string $role): void
    {
        if ($role === 'super_admin' && auth()->user()?->role !== 'super_admin') {
            abort(403, 'Hanya super admin yang dapat mengelola role super admin.');
        }
    }
}
