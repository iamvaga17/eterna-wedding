<?php
/** WEDLETTER private backup API v1. Install as public_html/api/backup.php */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
$accountRoot=dirname(__DIR__,2);
$settingsFile=$accountRoot.'/wedletter-publisher-secret.php';
if(!is_file($settingsFile))reply(503,['error'=>'Не найдена конфигурация сервера']);
$settings=require $settingsFile;
if(!is_array($settings)||empty($settings['token']))reply(503,['error'=>'Недоступна конфигурация']);
$allowed=(string)($settings['origin']??'https://iamvaga17.github.io');
$origin=(string)($_SERVER['HTTP_ORIGIN']??'');
if($origin===$allowed){
 header('Access-Control-Allow-Origin: '.$allowed);
 header('Access-Control-Allow-Methods: POST, OPTIONS');
 header('Access-Control-Allow-Headers: Authorization, Content-Type');
 header('Vary: Origin');
}
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){http_response_code($origin===$allowed?204:403);exit;}
if($_SERVER['REQUEST_METHOD']!=='POST')reply(405,['error'=>'Требуется POST']);
if($origin!==$allowed)reply(403,['error'=>'Запрос из другого источника']);
$auth=(string)($_SERVER['HTTP_AUTHORIZATION']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'');
if(!$auth&&function_exists('getallheaders'))foreach(getallheaders() as $k=>$v){if(strcasecmp($k,'Authorization')===0){$auth=(string)$v;break;}}
if(!hash_equals('Bearer '.(string)$settings['token'],$auth))reply(401,['error'=>'Неверный ключ']);
if((int)($_SERVER['CONTENT_LENGTH']??0)>14000000)reply(413,['error'=>'Слишком большой запрос']);
try{$input=json_decode(file_get_contents('php://input')?:'',true,40,JSON_THROW_ON_ERROR);}
catch(Throwable $e){reply(400,['error'=>'Неверный JSON']);}
if(!is_array($input))reply(400,['error'=>'Некорректный запрос']);
$id=$input['orderId']??null;
if(!is_string($id)||!preg_match('/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/D',$id))reply(400,['error'=>'Неверный ID заказа']);
$action=$input['action']??'';
$private=$accountRoot.'/wedletter-private-backups';
if(!is_dir($private)&&!mkdir($private,0700,true)&&!is_dir($private))reply(500,['error'=>'Недоступно резервное хранилище']);
$dir=$private.'/'.$id;
if(is_link($dir))reply(409,['error'=>'Недопустимый путь']);
if(!is_dir($dir)&&!mkdir($dir,0700,true)&&!is_dir($dir))reply(500,['error'=>'Невозможно создать папку']);
$lock=fopen($dir.'/.lock','c');
if(!$lock||!flock($lock,LOCK_EX))reply(503,['error'=>'Хранилище занято']);
try{
 if($action==='status'){
   $current=is_file($dir.'/current.json')?json_decode((string)file_get_contents($dir.'/current.json'),true):null;
   $photos=[];
   foreach(glob($dir.'/media/*.bin')?:[] as $file){
    if(!is_file($file)||is_link($file))continue;
    $photos[basename($file,'.bin')]=hash_file('sha256',$file);
   }
   reply(200,['ok'=>true,'hasBackup'=>is_array($current),'savedAt'=>$current['savedAt']??null,'mediaHashes'=>$photos]);
 }
 if($action==='config'){
   $config=$input['config']??null;$label=$input['label']??'';
   if(!is_array($config)||!is_string($label)||mb_strlen($label)>120)reply(400,['error'=>'Некорректный черновик']);
   $json=json_encode(['savedAt'=>gmdate('c'),'label'=>$label,'config'=>$config],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
   if(strlen($json)>300000)reply(413,['error'=>'Слишком большой черновик']);
   $versions=$dir.'/versions';if(!is_dir($versions))mkdir($versions,0700,true);
   if(is_file($dir.'/current.json')){
     $old=(string)file_get_contents($dir.'/current.json');
     $history=$versions.'/'.gmdate('YmdHis').'-'.bin2hex(random_bytes(3)).'.json';
     file_put_contents($history,$old,LOCK_EX);
     $versionsList=glob($versions.'/*.json')?:[];rsort($versionsList);
     foreach(array_slice($versionsList,10) as $obsolete)@unlink($obsolete);
   }
   atomicWrite($dir.'/current.json',$json);
   reply(200,['ok'=>true,'savedAt'=>gmdate('c')]);
 }
 if($action==='media'){
   $key=$input['key']??null;$encoded=$input['content']??null;$hash=$input['sha256']??null;
   if(!is_string($key)||!preg_match('/^[a-zA-Z0-9-]{1,64}$/D',$key))reply(400,['error'=>'Неверное имя медиа']);
   if(!is_string($encoded)||!is_string($hash)||!preg_match('/^[a-f0-9]{64}$/D',$hash))reply(400,['error'=>'Некорректный файл']);
   $bytes=base64_decode($encoded,true);
   if($bytes===false||strlen($bytes)<1||strlen($bytes)>9500000||!hash_equals($hash,hash('sha256',$bytes)))reply(400,['error'=>'Повреждённое изображение или аудио']);
   $folder=$dir.'/media';if(!is_dir($folder))mkdir($folder,0700,true);
   atomicWrite($folder.'/'.$key.'.bin',$bytes);
   reply(200,['ok'=>true,'sha256'=>$hash]);
 }
 if($action==='restore'){
   $current=is_file($dir.'/current.json')?json_decode((string)file_get_contents($dir.'/current.json'),true):null;
   if(!is_array($current))reply(404,['error'=>'Резервная копия отсутствует']);
   reply(200,['ok'=>true,'backup'=>$current]);
 }
 if($action==='media-get'){
   $key=$input['key']??null;
   if(!is_string($key)||!preg_match('/^[a-zA-Z0-9-]{1,64}$/D',$key))reply(400,['error'=>'Неверное имя файла']);
   $file=$dir.'/media/'.$key.'.bin';
   if(!is_file($file)||is_link($file))reply(404,['error'=>'Файл не найден']);
   $bytes=file_get_contents($file);
   if($bytes===false||strlen($bytes)>9500000)reply(500,['error'=>'Ошибка чтения']);
   reply(200,['ok'=>true,'content'=>base64_encode($bytes)]);
 }
 reply(400,['error'=>'Неизвестная операция']);
}catch(Throwable $e){error_log('WEDLETTER backup: '.$e->getMessage());reply(500,['error'=>'Ошибка сохранения резервной копии']);}
function atomicWrite(string $path,string $bytes):void {
 $tmp=$path.'.'.bin2hex(random_bytes(5)).'.tmp';
 if(file_put_contents($tmp,$bytes,LOCK_EX)!==strlen($bytes)||!rename($tmp,$path)){@unlink($tmp);throw new RuntimeException('Write failed');}
 @chmod($path,0600);
}
function reply(int $status,array $payload):never{http_response_code($status);echo json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
