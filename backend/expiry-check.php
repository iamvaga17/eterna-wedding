<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
echo json_encode([
 'ok' => true,
 'test' => 'php-running',
 'php' => PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION,
 'time' => gmdate('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE);
