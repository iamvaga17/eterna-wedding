<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Vary: Origin');
$origin=(string)($_SERVER['HTTP_ORIGIN']??'');
$allowed='https://iamvaga17.github.io';
if($origin===$allowed){
 header('Access-Control-Allow-Origin: '.$allowed);
 header('Access-Control-Allow-Headers: Authorization, Content-Type');
 header('Access-Control-Allow-Methods: POST, OPTIONS');
}
function finish(int $code,array $body): never {
 http_response_code($code);echo json_encode($body,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;
}
$method=(string)($_SERVER['REQUEST_METHOD']??'GET');
if($method==='OPTIONS'){
 if($origin!==$allowed)finish(403,['ok'=>false,'error'=>'Недопустимый источник']);
 http_response_code(204);exit;
}
if($method!=='POST')finish(405,['ok'=>false,'error'=>'POST required']);
if($origin!==$allowed)finish(403,['ok'=>false,'error'=>'Недопустимый источник']);
$publisherPath=dirname(__DIR__,2).'/wedletter-publisher-secret.php';
if(!is_readable($publisherPath))finish(503,['ok'=>false,'error'=>'Сервер не настроен']);
$pub=require $publisherPath;
if(!is_array($pub)||!isset($pub['token'])||!is_string($pub['token']))
 finish(503,['ok'=>false,'error'=>'Ошибка настройки публикации']);
$auth=(string)($_SERVER['HTTP_AUTHORIZATION']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'');
if($auth===''&&function_exists('getallheaders')){
 foreach(getallheaders() as $key=>$value)if(strcasecmp((string)$key,'Authorization')===0){$auth=(string)$value;break;}
}
if(!hash_equals('Bearer '.$pub['token'],$auth))
 finish(401,['ok'=>false,'error'=>'Неверный ключ публикации']);
if((int)($_SERVER['CONTENT_LENGTH']??0)>4096)
 finish(413,['ok'=>false,'error'=>'Слишком большой запрос']);
$raw=file_get_contents('php://input');
if(!is_string($raw)||strlen($raw)>4096)finish(413,['ok'=>false,'error'=>'Слишком большой запрос']);
$data=json_decode($raw,true);
$slug=$data['slug']??null;
$rotate=($data['action']??'issue')==='rotate';
if(!in_array(($data['action']??'issue'),['issue','rotate'],true))finish(400,['ok'=>false,'error'=>'Неверная операция']);
if(!is_array($data)||!is_string($slug)||!preg_match('/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/D',$slug))
 finish(400,['ok'=>false,'error'=>'Неверный адрес свадьбы']);
try{
 $config=require dirname(__DIR__,2).'/wedletter-db-secret.php';
 if(!is_array($config))throw new RuntimeException('DB config invalid');
 $get=static function(array $names)use($config){foreach($names as $k)if(isset($config[$k]))return $config[$k];return null;};
 $host=$get(['host','db_host','DB_HOST']);
 $port=$get(['port','db_port','DB_PORT'])?:3308;
 $database=$get(['database','dbname','db_name','DB_NAME']);
 $username=$get(['username','user','db_user','DB_USER']);
 $password=$get(['password','pass','db_password','DB_PASSWORD']);
 if(!$host||!$database||!$username||$password===null)throw new RuntimeException('DB settings missing');
 $db=new PDO('mysql:host='.$host.';port='.(int)$port.';dbname='.$database.';charset=utf8mb4',(string)$username,(string)$password,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>5]);
 $db->beginTransaction();
 $q=$db->prepare('SELECT id,display_name FROM wedletter_weddings WHERE slug=? AND is_active=1 LIMIT 1 FOR UPDATE');
 $q->execute([$slug]);$w=$q->fetch(PDO::FETCH_ASSOC);
 if(!$w){$db->rollBack();finish(404,['ok'=>false,'error'=>'Свадьба не найдена в MySQL']);}
 if($rotate){
  // Revoke old links before issuing a new one, in the same DB transaction.
  $revoke=$db->prepare('UPDATE wedletter_dashboard_access SET revoked_at=NOW() WHERE wedding_id=? AND revoked_at IS NULL');
  $revoke->execute([(int)$w['id']]);
 }
 $q=$db->prepare('SELECT COUNT(*) FROM wedletter_dashboard_access WHERE wedding_id=? AND revoked_at IS NULL');
 $q->execute([(int)$w['id']]);
 if((int)$q->fetchColumn()>=5){$db->rollBack();finish(409,['ok'=>false,'error'=>'Для этой свадьбы уже создано 5 активных доступов. Обратись к администратору.']);}
 $token=bin2hex(random_bytes(32));
 $hash=hash('sha256',$token);
 $label='Владелец '.gmdate('Y-m-d H:i');
 $insert=$db->prepare('INSERT INTO wedletter_dashboard_access (wedding_id,label,token_hash) VALUES (?,?,?)');
 $insert->execute([(int)$w['id'],$label,$hash]);
 $db->commit();
 finish(200,['ok'=>true,'slug'=>$slug,'displayName'=>$w['display_name'],'token'=>$token,'dashboardUrl'=>'https://wedletter.ru/api/dashboard.php','cabinetLink'=>'https://wedletter.ru/api/cabinet.html#'.$token]);
}catch(Throwable $e){
 if(isset($db)&&$db instanceof PDO&&$db->inTransaction())$db->rollBack();
 error_log('WEDLETTER dashboard access creation failure: '.get_class($e));
 finish(503,['ok'=>false,'error'=>'Не удалось создать доступ']);
}
