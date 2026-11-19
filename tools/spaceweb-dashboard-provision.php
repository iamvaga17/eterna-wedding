<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$proof=(string)($_SERVER['HTTP_X_WEDLETTER_PROBE']??'');
if(!hash_equals('__PROBE_HASH__',hash('sha256',$proof))){http_response_code(404);exit;}
$token=(string)($_SERVER['HTTP_X_WEDLETTER_DASHBOARD_TOKEN']??'');
if(!preg_match('/^[a-f0-9]{64}$/D',$token)){http_response_code(422);echo '{"ok":false,"code":"invalid-dashboard-token"}';exit;}
try{
  $c=require dirname(__DIR__,2).'/wedletter-db-secret.php';
  if(!is_array($c))throw new RuntimeException('invalid-config');
  $get=static function(array $names)use($c){foreach($names as $n)if(isset($c[$n]))return $c[$n];return null;};
  $host=$get(['host','db_host','DB_HOST']);$port=$get(['port','db_port','DB_PORT'])?:3308;
  $name=$get(['database','dbname','db_name','DB_NAME']);$user=$get(['username','user','db_user','DB_USER']);
  $pass=$get(['password','pass','db_password','DB_PASSWORD']);
  if(!$host||!$name||!$user||$pass===null)throw new RuntimeException('missing-config');
  $db=new PDO('mysql:host='.$host.';port='.(int)$port.';dbname='.$name.';charset=utf8mb4',(string)$user,(string)$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>5]);
  $db->beginTransaction();
  $w=$db->prepare('SELECT id FROM wedletter_weddings WHERE slug=? AND is_active=1 LIMIT 1');
  $w->execute(['rsvp-test-wedletter']);
  $weddingId=$w->fetchColumn();
  if(!$weddingId)throw new RuntimeException('test-wedding-not-found');
  $q=$db->prepare('SELECT id FROM wedletter_dashboard_access WHERE wedding_id=? AND label=? ORDER BY id LIMIT 1 FOR UPDATE');
  $q->execute([(int)$weddingId,'WEDLETTER test access']);
  $existing=$q->fetchColumn();
  $hash=hash('sha256',$token);
  if($existing){
    $q=$db->prepare('UPDATE wedletter_dashboard_access SET token_hash=?,revoked_at=NULL WHERE id=?');
    $q->execute([$hash,(int)$existing]);
    $operation='updated';
  }else{
    $q=$db->prepare('INSERT INTO wedletter_dashboard_access (wedding_id,label,token_hash) VALUES (?,?,?)');
    $q->execute([(int)$weddingId,'WEDLETTER test access',$hash]);
    $operation='created';
  }
  $db->commit();
  echo json_encode(['ok'=>true,'wedding_slug'=>'rsvp-test-wedletter','access'=>$operation],JSON_UNESCAPED_SLASHES);
}catch(Throwable $e){
  if(isset($db)&&$db->inTransaction())$db->rollBack();
  http_response_code(503);echo '{"ok":false,"code":"provision-failed"}';
}
