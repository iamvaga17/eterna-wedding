<?php
/** WEDLETTER expiry manager v2 (safe diagnostics). Install at public_html/api/expiry.php */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
/* Public, non-secret health check. No modifications and no credential disclosure. */
if(($_SERVER['REQUEST_METHOD']??'GET')==='GET'){
 http_response_code(200);
 echo json_encode(['ok'=>true,'service'=>'wedletter-expiry','version'=>2,'message'=>'PHP работает; настройка срока выполняется только через редактор'],JSON_UNESCAPED_UNICODE);
 exit;
}
/* Ensure fatal runtime errors are visible as a generic JSON status, not a white page. */
register_shutdown_function(static function():void {
 $error=error_get_last();
 if(!is_array($error)||!in_array($error['type']??0,[E_ERROR,E_PARSE,E_CORE_ERROR,E_COMPILE_ERROR,E_USER_ERROR],true))return;
 error_log('WEDLETTER expiry fatal: '.($error['message']??'unknown'));
 if(!headers_sent()){
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
 }
 echo json_encode(['ok'=>false,'error'=>'Ошибка выполнения PHP (500). Проверь журнал ошибок сайта.'],JSON_UNESCAPED_UNICODE);
});
$root=dirname(__DIR__,2);
$configFile=$root.'/wedletter-publisher-secret.php';
if(!is_file($configFile))respond(503,['error'=>'Не найден файл настроек сервера']);
try{$settings=require $configFile;}catch(Throwable $e){error_log('WEDLETTER expiry config: '.$e->getMessage());respond(503,['error'=>'Ошибка конфигурации сервера']);}
if(!is_array($settings)||empty($settings['token']))respond(503,['error'=>'Ключ сервера недоступен']);
$allow=(string)($settings['origin']??'https://iamvaga17.github.io');
$origin=(string)($_SERVER['HTTP_ORIGIN']??'');
if($origin===$allow){
 header('Access-Control-Allow-Origin: '.$allow);
 header('Access-Control-Allow-Methods: POST, OPTIONS');
 header('Access-Control-Allow-Headers: Authorization, Content-Type');
 header('Vary: Origin');
}
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){http_response_code($origin===$allow?204:403);exit;}
if($_SERVER['REQUEST_METHOD']!=='POST')respond(405,['error'=>'Требуется POST']);
if($origin!==$allow)respond(403,['error'=>'Источник запроса не разрешён']);
$auth=(string)($_SERVER['HTTP_AUTHORIZATION']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'');
if(!$auth&&function_exists('getallheaders'))foreach(getallheaders() as $k=>$v)if(strcasecmp((string)$k,'Authorization')===0){$auth=(string)$v;break;}
if(!hash_equals('Bearer '.(string)$settings['token'],$auth))respond(401,['error'=>'Неверный ключ']);
try{$input=json_decode(file_get_contents('php://input')?:'',true,12,JSON_THROW_ON_ERROR);}
catch(Throwable $e){respond(400,['error'=>'Некорректный запрос']);}
if(!is_array($input))respond(400,['error'=>'Неверные данные']);
$slug=$input['slug']??null;
if(!is_string($slug)||!preg_match('/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/D',$slug))respond(400,['error'=>'Недопустимый адрес']);
$action=$input['action']??'';
if(!in_array($action,['status','set'],true))respond(400,['error'=>'Неизвестная операция']);
$webroot=$root.'/public_html';
$dir=$webroot.'/'.$slug;
if(!is_dir($dir)||is_link($dir)||!is_file($dir.'/index.html'))respond(404,['error'=>'Сначала опубликуй сайт по этому адресу']);
$store=$root.'/wedletter-private-expiry';
if(!is_dir($store)&&!mkdir($store,0700,true)&&!is_dir($store))respond(500,['error'=>'Не создать закрытую папку']);
$state=$store.'/'.$slug.'.json';
if($action==='status'){
 $current=is_file($state)?json_decode((string)file_get_contents($state),true):null;
 respond(200,['ok'=>true,'expiresOn'=>$current['expiresOn']??'','gateInstalled'=>is_file($dir.'/wedletter-expiry-gate.php')&&is_file($dir.'/.htaccess')]);
}
$date=$input['expiresOn']??'';
if(!is_string($date)||($date!==''&&!validDate($date)))respond(400,['error'=>'Нужна дата в формате ГГГГ-ММ-ДД']);
$htaccess=$dir.'/.htaccess';
$gateFile=$dir.'/wedletter-expiry-gate.php';
if(is_link($htaccess)||is_link($gateFile)||is_link($state))respond(409,['error'=>'Недопустимые ссылки на файлы']);
$begin='# WEDLETTER EXPIRY BEGIN';
$end='# WEDLETTER EXPIRY END';
$rules=$begin."\n".'RewriteEngine On'."\n".'RewriteRule ^(?:index\\.html)?$ wedletter-expiry-gate.php [L]'."\n".$end."\n";
$existing=is_file($htaccess)?file_get_contents($htaccess):'';
if($existing===false)respond(500,['error'=>'Не удалось прочитать .htaccess']);
if($existing!==''&&strpos($existing,$begin)===false)respond(409,['error'=>'У приглашения уже есть отдельный .htaccess. Требуется ручная проверка, автоматическая установка остановлена']);
if(strpos($existing,$begin)!==false&&strpos($existing,$end)===false)respond(409,['error'=>'Некорректный .htaccess']);
$gate=<<<'GATE'
<?php
declare(strict_types=1);
$slug=basename(__DIR__);
$store=dirname(__DIR__,2).'/wedletter-private-expiry/'.$slug.'.json';
$settings=is_file($store)?json_decode((string)file_get_contents($store),true):null;
$expiry=is_array($settings)?($settings['expiresOn']??''):'';
$tz=new DateTimeZone('Europe/Moscow');
$ended=false;
if(is_string($expiry)&&preg_match('/^\d{4}-\d{2}-\d{2}$/D',$expiry)){
 $day=DateTimeImmutable::createFromFormat('!Y-m-d',$expiry,$tz);
 $ended=$day!==false&&$day->format('Y-m-d')===$expiry&&(new DateTimeImmutable('now',$tz)) >= $day->modify('+1 day');
}
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Robots-Tag: noindex, nofollow');
if($ended){
 http_response_code(410);
 header('Content-Type: text/html; charset=utf-8');
 echo '<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Приглашение завершено · WEDLETTER</title><style>body{margin:0;min-height:100svh;display:grid;place-items:center;background:#f6f1e9;color:#372b28;font-family:Georgia,serif;text-align:center;padding:30px;box-sizing:border-box}.wrap{max-width:620px}.tag{font:12px system-ui,sans-serif;letter-spacing:.35em;color:#9b8274}h1{font-size:clamp(40px,9vw,76px);font-weight:400;line-height:1.05;margin:32px 0}p{font:16px/1.7 system-ui,sans-serif;color:#76675e}</style><div class="wrap"><div class="tag">WEDLETTER</div><h1>Наш праздник состоялся</h1><p>Срок действия приглашения завершился. Спасибо, что были частью нашей истории.</p></div></html>';
 exit;
}
$index=__DIR__.'/index.html';
if(!is_file($index)){http_response_code(404);exit;}
header('Content-Type: text/html; charset=utf-8');
readfile($index);
GATE;
try{
 if(!is_file($gateFile))atomic($gateFile,$gate);
 if(!is_file($htaccess))atomic($htaccess,$rules);
 atomic($state,json_encode(['expiresOn'=>$date,'updatedAt'=>gmdate('c')],JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR));
}catch(Throwable $e){error_log('WEDLETTER expiry: '.$e->getMessage());respond(500,['error'=>'Не удалось применить срок']);
respond(200,['ok'=>true,'slug'=>$slug,'expiresOn'=>$date,'gateInstalled'=>true,'rsvpProtected'=>false]);
function validDate(string $s):bool{$date=DateTimeImmutable::createFromFormat('!Y-m-d',$s,new DateTimeZone('Europe/Moscow'));return $date!==false&&$date->format('Y-m-d')===$s;}
function atomic(string $p,string $data):void{$tmp=$p.'.'.bin2hex(random_bytes(6)).'.tmp';if(file_put_contents($tmp,$data,LOCK_EX)!==strlen($data)||!rename($tmp,$p)){@unlink($tmp);throw new RuntimeException('Write failed');}@chmod($p,0600);}
function respond(int $status,array $data):never{http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
