<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$provided = $_SERVER['HTTP_X_WEDLETTER_PROBE'] ?? '';
if (!is_string($provided) || !hash_equals('__TOKEN_SHA256__', hash('sha256', $provided))) {
  http_response_code(404);
  exit;
}
try {
  $path = dirname(__DIR__, 2) . '/wedletter-db-secret.php';
  if (!is_readable($path)) throw new RuntimeException('db-secret-file-not-found');
  $config = require $path;
  if (!is_array($config)) throw new RuntimeException('db-secret-format-not-array');
  $get = static function(array $names) use ($config) {
    foreach($names as $name) if(isset($config[$name])) return $config[$name];
    return null;
  };
  $host=$get(['host','db_host','DB_HOST']);
  $port=$get(['port','db_port','DB_PORT']) ?: 3308;
  $name=$get(['database','dbname','db_name','DB_NAME']);
  $user=$get(['username','user','db_user','DB_USER']);
  $pass=$get(['password','pass','db_password','DB_PASSWORD']);
  if (!$host || !$name || !$user || $pass === null) throw new RuntimeException('db-secret-keys-mismatch');
  $pdo = new PDO('mysql:host='.$host.';port='.(int)$port.';dbname='.$name.';charset=utf8mb4',(string)$user,(string)$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>5]);
  $requested=['wedletter_weddings','wedletter_rsvp_responses','wedletter_dashboard_access'];
  $query=$pdo->prepare('SELECT TABLE_NAME,COLUMN_NAME,DATA_TYPE,IS_NULLABLE,COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN (?,?,?) ORDER BY TABLE_NAME,ORDINAL_POSITION');
  $query->execute($requested);
  $schema=[];
  foreach($query as $row) {
    $table=$row['TABLE_NAME'];
    $schema[$table][]=['name'=>$row['COLUMN_NAME'],'type'=>$row['DATA_TYPE'],'nullable'=>$row['IS_NULLABLE'],'key'=>$row['COLUMN_KEY']];
  }
  echo json_encode(['ok'=>true,'tables'=>$schema],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
} catch(Throwable $error) {
  http_response_code(503);
  $allowed=['db-secret-file-not-found','db-secret-format-not-array','db-secret-keys-mismatch'];
  $code=in_array($error->getMessage(),$allowed,true)?$error->getMessage():'database-or-query-error';
  echo json_encode(['ok'=>false,'code'=>$code]);
}
