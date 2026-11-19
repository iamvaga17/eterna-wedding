<?php
/**
 * WEDLETTER guest dashboard v1. PHP 8.2+; expects the three WEDLETTER RSVP schema tables.
 * Login is via a 256-bit random token whose SHA-256 hash is stored in
 * wedletter_dashboard_access. No database or publisher credentials are embedded.
 * Initially deploy only after reviewed authorization tokens have been provisioned.
 */
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
header('Cache-Control: no-store, private, max-age=0');
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', '1');
session_name('wedletter_dashboard_v1');
session_set_cookie_params(['lifetime'=>0,'path'=>'/api/','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
session_start();

function h(string $s): string {return htmlspecialchars($s, ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8');}
function db(): PDO {
  $file=dirname(__DIR__,2).'/wedletter-db-secret.php';
  if(!is_readable($file))throw new RuntimeException('Database settings missing');
  $c=require $file;
  if(!is_array($c))throw new RuntimeException('Invalid database settings');
  foreach(['host','port','database','username','password','charset'] as $key)if(!isset($c[$key])||$c[$key]==='')throw new RuntimeException('Missing database setting');
  return new PDO(sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s',$c['host'],(int)$c['port'],$c['database'],$c['charset']),$c['username'],$c['password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>5,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
}
function activeGrant(PDO $db, int $grantId): ?array {
  $q=$db->prepare('SELECT a.id, w.id AS wedding_id, w.slug, w.display_name FROM wedletter_dashboard_access a JOIN wedletter_weddings w ON w.id=a.wedding_id WHERE a.id=? AND a.revoked_at IS NULL AND w.is_active=1 LIMIT 1');
  $q->execute([$grantId]); $r=$q->fetch();
  return $r?:null;
}
function page(string $title,string $body): never {
  header('Content-Type: text/html; charset=utf-8');
  echo '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'.h($title).' — WEDLETTER</title><style>
  :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f7f3ec;color:#332b24;font:15px/1.5 system-ui,-apple-system,sans-serif}.wrap{max-width:1000px;margin:0 auto;padding:24px 16px 64px}.head{border-bottom:1px solid #ded6ca;margin-bottom:25px;padding:10px 0 22px}h1{font:400 38px Georgia,serif;margin:0}h2{font:400 27px Georgia,serif;margin:0 0 10px}.sub{color:#81766b;font-size:13px}.card{background:#fffdfa;border:1px solid #e4dbcd;border-radius:15px;padding:20px;margin:15px 0}input{display:block;width:100%;padding:13px;border:1px solid #cfc4b5;border-radius:8px;font:inherit;margin:10px 0 16px}button,.btn{background:#342c25;border:0;border-radius:9px;color:#fff;padding:12px 17px;font:600 14px system-ui;cursor:pointer;text-decoration:none;display:inline-block}.secondary{background:#e8e0d5;color:#342c25}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stat{background:#fffdfa;border:1px solid #e4dbcd;border-radius:12px;padding:15px}.stat b{display:block;font:400 35px Georgia}.controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.controls form{margin:0}.error{color:#a32e23}.scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:600px}th,td{text-align:left;padding:12px 9px;border-bottom:1px solid #e6dfd6;vertical-align:top;overflow-wrap:anywhere}th{font-size:12px;color:#756a5e}td{font-size:13px}.empty{padding:25px;color:#71665b}@media(max-width:480px){h1{font-size:30px}.stats{gap:6px}.stat{padding:10px}.stat b{font-size:28px}.card{padding:15px}}</style></head><body><div class="wrap"><header class="head"><h1>WEDLETTER</h1><div class="sub">Личный кабинет гостей · только для владельцев приглашения</div></header>'.$body.'</div></body></html>';
  exit;
}
function csrf(): string {
  if(!isset($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(24));
  return (string)$_SESSION['csrf'];
}
function validCsrf(): bool {return isset($_POST['csrf'])&&is_string($_POST['csrf'])&&hash_equals(csrf(),$_POST['csrf']);}
function loginPage(string $error=''): never {
  $message=$error!==''?'<p class="error">'.h($error).'</p>':'';
  page('Вход','<section class="card"><h2>Ответы гостей</h2><p class="sub">Введите код доступа, полученный от WEDLETTER. Не пересылайте его посторонним.</p>'.$message.'<form method="post" action="/api/dashboard.php"><input type="hidden" name="csrf" value="'.h(csrf()).'"><label for="token">Код доступа</label><input id="token" name="token" type="password" required minlength="32" maxlength="128" autocomplete="off" spellcheck="false"><button type="submit" name="intent" value="login">Открыть кабинет</button></form></section>');
}
$method=$_SERVER['REQUEST_METHOD']??'GET';
if($method==='POST' && ($_POST['intent']??'')==='logout'){
  if(!validCsrf()){http_response_code(403);page('Ошибка','<div class="card">Неверное подтверждение действия.</div>');}
  $_SESSION=[];session_destroy();header('Location: /api/dashboard.php',true,303);exit;
}
if($method==='POST' && ($_POST['intent']??'')==='login'){
  if(!validCsrf()){http_response_code(403);loginPage('Обновите страницу и попробуйте ещё раз.');}
  $token=trim((string)($_POST['token']??''));
  if(!preg_match('/^[a-f0-9]{64}$/iD',$token))loginPage('Неверный код доступа.');
  try{
    $db=db();
    $q=$db->prepare('SELECT a.id FROM wedletter_dashboard_access a JOIN wedletter_weddings w ON w.id=a.wedding_id WHERE a.token_hash=? AND a.revoked_at IS NULL AND w.is_active=1 LIMIT 1');
    $q->execute([hash('sha256',strtolower($token))]);
    $id=$q->fetchColumn();
  }catch(Throwable $e){http_response_code(503);loginPage('Сервис временно недоступен.');}
  if(!$id){http_response_code(401);loginPage('Неверный или отозванный код доступа.');}
  session_regenerate_id(true);
  $_SESSION['grant']=(int)$id;
  $_SESSION['login_at']=time();
  header('Location: /api/dashboard.php',true,303);exit;
}
if($method!=='GET'){header('Allow: GET, POST');http_response_code(405);page('Ошибка','<div class="card">Метод не поддерживается.</div>');}
if(empty($_SESSION['grant'])||time()-(int)($_SESSION['login_at']??0)>43200){unset($_SESSION['grant']);loginPage();}
try{
  $db=db();
  $grant=activeGrant($db,(int)$_SESSION['grant']);
  if(!$grant){$_SESSION=[];session_destroy();loginPage('Доступ отозван.');}
  $q=$db->prepare('SELECT guest_name,attendance,answers_json,submitted_at FROM wedletter_rsvp_responses WHERE wedding_id=? ORDER BY submitted_at DESC, id DESC LIMIT 5000');
  $q->execute([(int)$grant['wedding_id']]);
  $rows=$q->fetchAll();
}catch(Throwable $e){http_response_code(503);page('Недоступно','<div class="card">Не удалось загрузить ответы. Попробуйте позже.</div>');}
$yes=0;$no=0;
foreach($rows as $row){if($row['attendance']==='yes')$yes++;else $no++;}
if(($_GET['download']??'')==='csv'){
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="wedletter-guests-'.$grant['slug'].'.csv"');
  echo "\xEF\xBB\xBF";
  $o=fopen('php://output','w');
  fputcsv($o,['Имя гостя','Присутствие','Дополнительные ответы','Дата ответа'],';');
  foreach($rows as $row){
    $details=json_decode((string)$row['answers_json'],true);
    $extra=[];
    foreach(is_array($details)?$details:[] as $item)if(is_array($item)){
      $value=$item['value']??'';
      if(is_array($value))$value=implode(', ',array_map('strval',$value));
      $extra[]=((string)($item['title']??'Вопрос')).': '.(string)$value;
    }
    $cells=[(string)$row['guest_name'],$row['attendance']==='yes'?'Придёт':'Не придёт',implode(' | ',$extra),(string)$row['submitted_at']];
    foreach($cells as &$cell){
      $cell=preg_replace('/[\x00-\x08\x0b\x0c\x0e-\x1f]/u',' ',$cell)??'';
      if(preg_match('/^\s*[=+\-@]/u',$cell))$cell="'".$cell;
    }unset($cell);
    fputcsv($o,$cells,';');
  }
  fclose($o);exit;
}
$body='<div class="controls"><div><h2>'.h((string)$grant['display_name']).'</h2><div class="sub">Ответы на приглашение · '.h((string)$grant['slug']).'</div></div><a class="btn" href="/api/dashboard.php?download=csv">Скачать CSV для Excel</a><form method="post" action="/api/dashboard.php"><input type="hidden" name="csrf" value="'.h(csrf()).'"><button class="secondary" type="submit" name="intent" value="logout">Выйти</button></form></div>';
$body.='<div class="stats"><div class="stat"><b>'.count($rows).'</b><span class="sub">Ответов</span></div><div class="stat"><b>'.$yes.'</b><span class="sub">Придут</span></div><div class="stat"><b>'.$no.'</b><span class="sub">Не придут</span></div></div>';
$body.='<section class="card"><h2>Список гостей</h2>';
if(!$rows)$body.='<p class="empty">Пока нет ответов гостей.</p>';
else {
  $body.='<div class="scroll"><table><thead><tr><th>Гость</th><th>Ответ</th><th>Детали</th><th>Дата</th></tr></thead><tbody>';
  foreach($rows as $row){
    $details=json_decode((string)$row['answers_json'],true);$answers=[];
    foreach(is_array($details)?$details:[] as $item)if(is_array($item)){
      $value=$item['value']??'';
      if(is_array($value))$value=implode(', ',array_map('strval',$value));
      $answers[]=h((string)($item['title']??'Вопрос')).': '.h((string)$value);
    }
    $body.='<tr><td>'.h((string)$row['guest_name']).'</td><td>'.($row['attendance']==='yes'?'Придёт':'Не придёт').'</td><td>'.implode('<br>',$answers).'</td><td>'.h((string)$row['submitted_at']).'</td></tr>';
  }
  $body.='</tbody></table></div>';
}
$body.='</section><p class="sub">Кабинет показывает ответы, полученные сервером. Не передавайте код доступа третьим лицам.</p>';
page('Ответы гостей',$body);
