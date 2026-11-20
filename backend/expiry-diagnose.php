<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$file=__DIR__.'/expiry.php';
$result=['ok'=>true,'diagnostic'=>'expiry-php-lint-v1','php'=>PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION];
if(!is_file($file)||!is_readable($file)){
 http_response_code(404);$result['ok']=false;$result['error']='expiry.php not readable';echo json_encode($result,JSON_UNESCAPED_UNICODE);exit;
}
$source=file_get_contents($file);
$result['bytes']=strlen($source);
$result['phpTag']=str_starts_with(ltrim($source),"<?php");
try{
 token_get_all($source,TOKEN_PARSE);
 $result['syntax']='OK';
}catch(ParseError $error){
 $result['ok']=false;$result['syntax']='ERROR';
 $result['line']=$error->getLine();
 $result['message']=$error->getMessage();
 http_response_code(200);
}catch(Throwable $error){
 $result['ok']=false;$result['syntax']='UNKNOWN';
 $result['message']=get_class($error);
}
echo json_encode($result,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);
