<?php

// Redirect to storybook.
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = getenv('DDEV_HOSTNAME') ?: $_SERVER['HTTP_HOST'];
// DDEV_HOSTNAME can contain comma-separated values; use the first one.
$host = explode(',', $host)[0];

$port = ($protocol === 'https') ? 6006 : 6005;
header("Location: {$protocol}://{$host}:{$port}/", true, 302);
exit;
