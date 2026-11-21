<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$token=(string)($_SERVER['HTTP_X_WEDLETTER_PROBE']??'');
if(!hash_equals('__TOKEN_SHA256__',hash('sha256',$token))){http_response_code(404);exit;}
$out=['ok'=>false,'checks'=>[]];
try{
 $config=require dirname(__DIR__,2).'/wedletter-db-secret.php';
 if(!is_array($config))throw new RuntimeException('database_settings');
 $get=static function($names)use($config){foreach($names as $n)if(isset($config[$n]))return $config[$n];return null;};
 $host=$get(['host','db_host','DB_HOST']);$port=$get(['port','db_port','DB_PORT'])?:3308;
 $db=$get(['database','dbname','db_name','DB_NAME']);$user=$get(['username','user','db_user','DB_USER']);$pass=$get(['password','pass','db_password','DB_PASSWORD']);
 $pdo=new PDO('mysql:host='.$host.';port='.(int)$port.';dbname='.$db.';charset=utf8mb4',(string)$user,(string)$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>5]);
 $pdo->exec('SET SESSION MAX_EXECUTION_TIME=3000');
 $out['checks']['db_connection']=true;
 $stmt=$pdo->prepare('EXPLAIN INSERT INTO wedletter_weddings (slug,display_name,is_active) VALUES (?,?,1) ON DUPLICATE KEY UPDATE display_name=VALUES(display_name),is_active=1');
 $stmt->execute(['test-premer','WEDLETTER diagnostic only']);
 $out['checks']['insert_statement_explain']=true;
 $out['explain_rows']=count($stmt->fetchAll(PDO::FETCH_ASSOC));
 $stmt=$pdo->query('SHOW GRANTS FOR CURRENT_USER');
 $grants=$stmt->fetchAll(PDO::FETCH_COLUMN);
 $out['checks']['insert_privilege_declared']=false;
 foreach($grants as $grant){
  if(preg_match('/GRANT\\s+ALL\\s+PRIVILEGES/i',$grant)||preg_match('/GRANT\\s+[^\\n]*\\bINSERT\\b/i',$grant)){$out['checks']['insert_privilege_declared']=true;break;}
 }
 $out['checks']['no_database_writes']=true;
 $out['ok']=true;
}catch(Throwable $e){
 $out['error_category']=$e instanceof PDOException?'database_error':'configuration_error';
 $out['error_sqlstate']=$e instanceof PDOException?(string)$e->getCode():'';
 http_response_code(503);
}
echo json_encode($out,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
