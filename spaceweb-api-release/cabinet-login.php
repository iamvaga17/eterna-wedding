<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private, max-age=0');
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
function answer(int $status,array $data): never {
  http_response_code($status);
  echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}
if(($_SERVER['REQUEST_METHOD']??'')!=='POST')answer(405,['ok'=>false,'error'=>'Method not allowed']);
if(!empty($_SERVER['HTTP_ORIGIN'])&&$_SERVER['HTTP_ORIGIN']!=='https://wedletter.ru')
 answer(403,['ok'=>false,'error'=>'Origin not allowed']);
$token=(string)($_SERVER['HTTP_X_WEDLETTER_ACCESS']??'');
if(!preg_match('/^[a-f0-9]{64}$/D',$token))
 answer(401,['ok'=>false,'error'=>'Invalid or expired access link']);
session_name('wedletter_dashboard_v1');
ini_set('session.use_strict_mode','1');
ini_set('session.use_only_cookies','1');
ini_set('session.cookie_httponly','1');
ini_set('session.cookie_secure','1');
session_set_cookie_params(['lifetime'=>0,'path'=>'/api/','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
session_start();
try {
  $c=require dirname(__DIR__,2).'/wedletter-db-secret.php';
  if(!is_array($c))throw new RuntimeException('DB config');
  $get=static function(array $names)use($c){foreach($names as $n)if(isset($c[$n]))return $c[$n];return null;};
  $host=$get(['host','db_host','DB_HOST']);
  $port=$get(['port','db_port','DB_PORT'])?:3308;
  $name=$get(['database','dbname','db_name','DB_NAME']);
  $user=$get(['username','user','db_user','DB_USER']);
  $pass=$get(['password','pass','db_password','DB_PASSWORD']);
  if(!$host||!$name||!$user||$pass===null)throw new RuntimeException('DB settings missing');
  $db=new PDO('mysql:host='.$host.';port='.(int)$port.';dbname='.$name.';charset=utf8mb4',(string)$user,(string)$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>5]);
  $query=$db->prepare('SELECT a.id FROM wedletter_dashboard_access a JOIN wedletter_weddings w ON w.id=a.wedding_id WHERE a.token_hash=? AND a.revoked_at IS NULL AND w.is_active=1 LIMIT 1');
  $query->execute([hash('sha256',$token)]);
  $grant=$query->fetchColumn();
  if(!$grant)answer(401,['ok'=>false,'error'=>'Invalid or expired access link']);
  session_regenerate_id(true);
  $_SESSION['grant']=(int)$grant;
  $_SESSION['login_at']=time();
  answer(200,['ok'=>true,'redirect'=>'/api/dashboard.php']);
}catch(Throwable $e){
  error_log('WEDLETTER magic login: '.get_class($e));
  answer(503,['ok'=>false,'error'=>'The cabinet is temporarily unavailable']);
}
