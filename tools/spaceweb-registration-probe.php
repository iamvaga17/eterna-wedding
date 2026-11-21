<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$nonce=(string)($_SERVER['HTTP_X_WEDLETTER_PROBE']??'');
if(!hash_equals('__TOKEN_SHA256__',hash('sha256',$nonce))){http_response_code(404);exit;}
$result=['ok'=>false,'checks'=>[]];
function checkMark(string $name,bool $success):void{global $result;$result['checks'][$name]=$success;}
try{
  $root=dirname(__DIR__,2);
  checkMark('php_mbstring',function_exists('mb_strlen'));
  checkMark('pdo_mysql',extension_loaded('pdo_mysql'));
  $pubPath=$root.'/wedletter-publisher-secret.php';
  checkMark('publisher_config_readable',is_readable($pubPath));
  if(!is_readable($pubPath))throw new RuntimeException('publisher_config_unavailable');
  $pub=require $pubPath;
  checkMark('publisher_token_configured',is_array($pub)&&isset($pub['token'])&&is_string($pub['token'])&&strlen($pub['token'])>=12);
  unset($pub);
  $dbPath=$root.'/wedletter-db-secret.php';
  checkMark('db_config_readable',is_readable($dbPath));
  if(!is_readable($dbPath))throw new RuntimeException('db_config_unavailable');
  $c=require $dbPath;
  if(!is_array($c))throw new RuntimeException('db_config_unavailable');
  $get=static function(array $names)use($c){foreach($names as $n)if(isset($c[$n]))return $c[$n];return null;};
  $host=$get(['host','db_host','DB_HOST']);
  $port=$get(['port','db_port','DB_PORT'])?:3308;
  $name=$get(['database','dbname','db_name','DB_NAME']);
  $user=$get(['username','user','db_user','DB_USER']);
  $pass=$get(['password','pass','db_password','DB_PASSWORD']);
  checkMark('db_credentials_present',boolval($host&&$name&&$user&&$pass!==null));
  if(!$host||!$name||!$user||$pass===null)throw new RuntimeException('db_credentials_missing');
  $pdo=new PDO('mysql:host='.$host.';port='.(int)$port.';dbname='.$name.';charset=utf8mb4',(string)$user,(string)$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>5]);
  checkMark('mysql_connect',true);
  $pdo->exec('SET SESSION MAX_EXECUTION_TIME=3000');
  $row=$pdo->prepare('SELECT COUNT(*) FROM wedletter_weddings WHERE slug=?');
  $row->execute(['test-premer']);
  $result['test_slug_exists']=((int)$row->fetchColumn())>0;
  checkMark('select_test_order',true);
  $row=$pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='wedletter_weddings' AND COLUMN_NAME IN ('slug','display_name','is_active')");
  checkMark('registration_columns_present',(int)$row->fetchColumn()===3);
  $result['ok']=!in_array(false,$result['checks'],true);
}catch(Throwable $error){
  $result['failure_stage']=array_key_last($result['checks'])?:'initialization';
  $result['error_class']=get_class($error)==='PDOException'?'database':'configuration_or_php';
  http_response_code(503);
}
echo json_encode($result,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
