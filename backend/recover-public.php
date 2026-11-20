<?php
/** WEDLETTER read-only recovery bridge. Install as /public_html/api/recover-public.php */
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Vary: Origin');
$origin=$_SERVER['HTTP_ORIGIN']??'';
if($origin==='https://iamvaga17.github.io'){
 header('Access-Control-Allow-Origin: '.$origin);
}
header('Content-Type: application/json; charset=utf-8');
function fail(int $code,string $message):never {
 http_response_code($code);
 echo json_encode(['ok'=>false,'error'=>$message],JSON_UNESCAPED_UNICODE);
 exit;
}
if(($_SERVER['REQUEST_METHOD']??'GET')!=='GET')fail(405,'Только чтение');
$slug=$_GET['slug']??'';
if(!is_string($slug)||!preg_match('/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/D',$slug))fail(400,'Неверный адрес заказа');
$root=realpath(dirname(__DIR__));
if(!$root)fail(500,'Папка сайта недоступна');
$dir=realpath($root.'/'.$slug);
if(!$dir||!is_dir($dir)||dirname($dir)!==$root)fail(404,'Заказ не найден');
$file=$_GET['file']??'';
if($file!==''){
 if(!is_string($file)||!preg_match('~^(?:wedding-photo-[a-zA-Z0-9-]+\.jpg|assets/custom-(?:cover|cake|archive|forecast)\.jpg)$~D',$file))fail(400,'Неверное имя изображения');
 $image=realpath($dir.'/'.$file);
 if(!$image||!is_file($image)||!str_starts_with($image,$dir.'/'))fail(404,'Фотография не найдена');
 if(filesize($image)>10485760)fail(413,'Слишком большой файл');
 header_remove('Content-Type');
 header('Content-Type: image/jpeg');
 header('Content-Length: '.filesize($image));
 readfile($image);exit;
}
$source=$dir.'/order.js';
if(!is_file($source)||filesize($source)>250000)fail(404,'Файл опубликованного заказа не найден');
$js=file_get_contents($source);
if(!is_string($js))fail(500,'Невозможно прочитать заказ');
if(!preg_match('/^\s*window\.(ETERNA_ORDER|ETERNA_BROADCAST_ORDER)\s*=\s*/',$js,$m))fail(422,'Неизвестный формат заказа');
$json=preg_replace('/^\s*window\.(?:ETERNA_ORDER|ETERNA_BROADCAST_ORDER)\s*=\s*/','',$js,1);
$json=rtrim(trim($json),"; \t\r\n");
$config=json_decode($json,true);
if(!is_array($config))fail(422,'Не удалось прочитать настройки');
unset($config['publicSlugLocked']);
echo json_encode(['ok'=>true,'slug'=>$slug,'template'=>$m[1]==='ETERNA_BROADCAST_ORDER'?'broadcast':'12','config'=>$config],JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);
