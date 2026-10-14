<?php

use App\Models\User;

test('login page passes recaptcha site key', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('auth/login')
            ->has('recaptchaSiteKey'),
    );
});

test('login succeeds without recaptcha in testing environment', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'username' => $user->username,
        'password' => 'password',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($user);
});

test('login fails with wrong credentials', function () {
    User::factory()->create(['username' => 'testuser']);

    $response = $this->post('/login', [
        'username' => 'testuser',
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors();
    $this->assertGuest();
});

test('rate limit exceeded redirects back with friendly message', function () {
    User::factory()->create(['username' => 'testuser']);

    foreach (range(1, 5) as $i) {
        $this->post('/login', [
            'username' => 'testuser',
            'password' => 'wrong-password',
        ]);
    }

    // 6th attempt: redirect back with friendly error, not 429 page
    $response = $this->post('/login', [
        'username' => 'testuser',
        'password' => 'wrong-password',
    ]);

    $response->assertRedirect('/login');
    $response->assertSessionHasErrors('username');

    $errors = session('errors');
    expect($errors->first('username'))->toContain('Terlalu banyak percobaan login');
});
