<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Tampilkan daftar semua admin.
     */
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

    /**
     * Form tambah admin baru.
     */
    public function create(): Response
    {
        return Inertia::render('admin/create');
    }

    /**
     * Simpan admin baru ke database.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:admin,super_admin'],
        ]);

        if ($validated['role'] === 'super_admin' && auth()->user()?->role !== 'super_admin') {
            abort(403, 'Hanya super admin yang dapat membuat super admin baru.');
        }

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

    /**
     * Toggle status aktif/nonaktif admin.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        // Tidak bisa menonaktifkan diri sendiri
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat mengubah status akun Anda sendiri.');
        }

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

    /**
     * Hapus admin bila tidak terkait data lain.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat menghapus akun Anda sendiri.');
        }

        try {
            $user->delete();

            return back()->with('success', "Admin {$user->name} berhasil dihapus.");
        } catch (\Illuminate\Database\QueryException $e) {
            $errorCode = $e->errorInfo[1];
            if ($errorCode == 1451) {
                return back()->with('error', 'Gagal menghapus admin karena masih ada data yang terkait (misal: dokumen). Disarankan menggunakan SoftDeletes.');
            }

            return back()->with('error', 'Gagal menghapus admin: Terjadi kesalahan database.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus admin: Terjadi kesalahan.');
        }
    }
}
