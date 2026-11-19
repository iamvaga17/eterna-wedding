<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Vary: Origin');
$origin=(string)($_SERVER['HTTP_ORIGIN']??'');
$allowed='https://iamvaga17.github.io';
if($origin===$allowed){
 header('Access-Control-Allow-Origin: '.$allowed);
 header('Access-Control-Allow-Headers: Authorization, Content-Type');
 header('Access-Control-Allow-Methods: POST, OPTIONS');
}
function done(int $code,array $body): never{
 http_response_code($code);
 echo json_encode($body,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
 exit;
}
if(($_SERVER['REQUEST_METHOD']??'')==='OPTIONS'){
 if($origin!==$allowed)done(403,['ok'=>false,'error'=>'Источник не разрешён']);
 http_response_code(204);exit;
}
if(($_SERVER['REQUEST_METHOD']??'')!=='POST')done(405,['ok'=>false,'error'=>'Допускается только POST']);
if($origin!==$allowed)done(403,['ok'=>false,'error'=>'Источник не разрешён']);
$accountRoot=dirname(__DIR__,2);
$configPath=$accountRoot.'/wedletter-publisher-secret.php';
if(!is_file($configPath))done(503,['ok'=>false,'error'=>'Публикация не настроена']);
$config=require $configPath;
if(!is_array($config)||!isset($config['token'])||!is_string($config['token']))done(503,['ok'=>false,'error'=>'Ошибка настройки публикации']);
$auth=(string)($_SERVER['HTTP_AUTHORIZATION']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'');
if($auth===''&&function_exists('getallheaders')){
 foreach(getallheaders() as $name=>$value){
  if(strcasecmp((string)$name,'Authorization')===0){$auth=(string)$value;break;}
 }
}
if(!hash_equals('Bearer '.$config['token'],$auth))done(401,['ok'=>false,'error'=>'Неверный ключ публикации']);
if((int)($_SERVER['CONTENT_LENGTH']??0)>8192)done(413,['ok'=>false,'error'=>'Слишком большой запрос']);
$raw=file_get_contents('php://input');
if(!is_string($raw)||strlen($raw)>8192)done(413,['ok'=>false,'error'=>'Слишком большой запрос']);
$body=json_decode($raw,true);
if(!is_array($body))done(400,['ok'=>false,'error'=>'Неверный JSON']);
$slug=$body['slug']??null;
$title=$body['displayName']??null;
if(!is_string($slug)||!preg_match('/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/D',$slug))
 done(400,['ok'=>false,'error'=>'Неверный адрес свадьбы']);
if(!is_string($title)||mb_strlen(trim($title),'UTF-8')<2||mb_strlen($title,'UTF-8')>150)
 done(400,['ok'=>false,'error'=>'Неверное название свадьбы']);
try{
 $c=require $accountRoot.'/wedletter-db-secret.php';
 if(!is_array($c))throw new RuntimeException('Invalid DB config');
 $get=static function(array $names)use($c){foreach($names as $name)if(isset($c[$name]))return $c[$name];return null;};
 $host=$get(['host','db_host','DB_HOST']);
 $port=$get(['port','db_port','DB_PORT'])?:3308;
 $database=$get(['database','dbname','db_name','DB_NAME']);
 $user=$get(['username','user','db_user','DB_USER']);
 $pass=$get(['password','pass','db_password','DB_PASSWORD']);
 if(!$host||!$database||!$user||$pass===null)throw new RuntimeException('Missing DB settings');
 $db=new PDO('mysql:host='.$host.';port='.(int)$port.';dbname='.$database.';charset=utf8mb4',(string)$user,(string)$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>5]);
 $sql='INSERT INTO wedletter_weddings (slug,display_name,is_active) VALUES (?,?,1) ON DUPLICATE KEY UPDATE display_name=VALUES(display_name),is_active=1';
 $stmt=$db->prepare($sql);
 $stmt->execute([$slug,trim($title)]);
 done(200,['ok'=>true,'slug'=>$slug,'registered'=>true,'rsvpEndpoint'=>'https://wedletter.ru/api/rsvp.php?wedding='.$slug]);
}catch(Throwable $e){
 error_log('WEDLETTER registration failed: '.get_class($e));
 done(503,['ok'=>false,'error'=>'Не удалось зарегистрировать свадьбу']);
}
