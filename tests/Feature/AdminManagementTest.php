<?php

use App\Models\User;

test('super admin can delete another admin account', function () {
    $superAdmin = User::factory()->create([
        'role' => 'super_admin',
    ]);
    $admin = User::factory()->create([
        'role' => 'admin',
        'email' => 'deleted-admin@example.test',
    ]);

    $this->actingAs($superAdmin)
        ->delete(route('admin.destroy', $admin))
        ->assertRedirect();

    expect(User::withTrashed()->find($admin->id)?->trashed())->toBeTrue();
    expect(User::find($admin->id))->toBeNull();
});

test('super admin cannot delete their own account', function () {
    $superAdmin = User::factory()->create([
        'role' => 'super_admin',
    ]);

    $this->actingAs($superAdmin)
        ->delete(route('admin.destroy', $superAdmin))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(User::find($superAdmin->id))->not->toBeNull();
});
