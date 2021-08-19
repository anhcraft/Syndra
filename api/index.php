<?php
/** @noinspection PhpUndefinedVariableInspection */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

////////////////////////////////////////////////////////////////////////////////

require_once "config.php";
require_once "./vendor/autoload.php";
require_once "PasswordHash.php";

use Firebase\JWT\JWT;
use ReCaptcha\ReCaptcha;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$hasher = new PasswordHash(8, true);

function hideStr(string $in): string {
    $sub = intval(strlen($in) * 0.5);
    $trail = substr($in, $sub);
    return str_repeat('*', strlen($in) - strlen($trail)) . $trail;
}

function getParam($key): ?string {
    if(array_key_exists($key, $_POST)) {
        return trim($_POST[$key]);
    } else {
        return "";
    }
}

$endpoint = getParam("endpoint");

if($endpoint == "get-card-providers") {
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 1));
        return;
    }
    $res = [];
    $stmt = $conn->prepare("select * from donate_provider");
    $stmt->execute();
    $stmt->bind_result($name, $enabled, $bonus);
    while ($stmt->fetch()) {
        array_push($res, array(
            "name" => $name,
            "enabled" => $enabled == 1,
            "bonus" => $bonus
        ));
    }
    $stmt->close();
    $conn->close();
    echo json_encode(array(
        "code" => 0,
        "result" => $res
    ));
}

if($endpoint == "get-server-lists") {
    $res = [];
    foreach ($servers as $id => $sv) {
        $res[$id] = $sv["name"];
    }
    echo json_encode(array(
        "code" => 0,
        "result" => $res
    ));
}

if($endpoint == "get-collections") {
    $token = getParam("token");
    if(strlen($token) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }
    $res = [];
    $payload = (array) JWT::decode($token, $JWT_PUBLIC_KEY, array('RS256'));
    $user = $payload["user_id"];
    $uuid = offlinePlayerUuid($user);
    foreach ($servers as $id => $sv) {
        $coins = 0;
        $conn = new mysqli($dbHost, $sv["dbUser"], $sv["dbPass"], $sv["dbName"]);
        if ($conn->connect_error) {
            continue;
        }
        $stmt = $conn->prepare("select points from playerpoints where playername=?");
        $stmt->bind_param("s", $uuid);
        $stmt->execute();
        $stmt->bind_result($coins);
        $stmt->fetch();
        $stmt->close();
        $conn->close();
        $res[$id] = array(
            "server" => $sv["name"],
            "points" => 0,
            "coins" => $coins
        );
    }
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 2));
        return;
    }
    $stmt = $conn->prepare("select server, collected from donate_collection where user=?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->bind_result($server, $collected);
    while ($stmt->fetch()) {
        if(array_key_exists($server, $res)) {
            $res[$server] = array(
                "server" => $res[$server]["server"],
                "points" => $collected,
                "coins" => $res[$server]["coins"]
            );
        }
    }
    $stmt->close();
    $conn->close();
    echo json_encode(array(
        "code" => 0,
        "result" => $res
    ));
}

if($endpoint == "signup") {
    $user = getParam("user");
    if(strlen($user) < 3 || strlen($user) > 16 || !preg_match("/^[A-Za-z0-9_]{3,16}$/i", $user)) {
        echo json_encode(array("code" => 1));
        return;
    }
    $pass = getParam("pass");
    if(strlen($pass) < 8 || strlen($pass) > 30) {
        echo json_encode(array("code" => 2));
        return;
    }
    $email = getParam("email");
    if(strlen($email) == 0 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(array("code" => 3));
        return;
    }
    $captcha = getParam("captcha");
    if(strlen($captcha) == 0) {
        echo json_encode(array("code" => 6));
        return;
    }

    $recaptcha = new ReCaptcha($CAPTCHA_SECRET);
    $resp = $recaptcha->verify($captcha);
    if (!$resp->isSuccess()) {
        echo json_encode(array("code" => 7));
        return;
    }

    $milliseconds = round(microtime(true) * 1000);
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 5));
        return;
    }

    // check duplication
    $stmt = $conn->prepare("SELECT realname FROM `wp_users` WHERE `user_login` = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    if($stmt->fetch()){
        echo json_encode(array("code" => 4));
        $stmt->close();
        $conn->close();
        return;
    }
    $stmt->close();

    // check email duplication
    $stmt = $conn->prepare("SELECT realname FROM `wp_users` WHERE `user_email` = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if($stmt->fetch()){
        echo json_encode(array("code" => 8));
        $stmt->close();
        $conn->close();
        return;
    }
    $stmt->close();

    $stmt = $conn->prepare("insert into wp_users (user_login, realname, user_pass, user_nicename, user_email, display_name, email, regdate)
values (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssi", $user, $user, $hasher->HashPassword($pass), strtolower($user), $email, $user, $email, $milliseconds);
    if($stmt->execute()){
        echo json_encode(array("code" => 0));
    } else {
        echo json_encode(array("code" => 4));
    }
    $stmt->close();
    $conn->close();
}

if($endpoint == "login") {
    $user = getParam("user");
    $pass = getParam("pass");
    if(strlen($user) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }
    if(strlen($pass) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 4));
        return;
    }
    $stmt = $conn->prepare("select user_pass, user_email from wp_users where user_login=?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->bind_result($hashedPass, $userEmail);
    if ($stmt->fetch()) {
        if($hasher->CheckPassword($pass, $hashedPass)) {
            $payload = array(
                "iss" => "https://minehot.com",
                "aud" => "https://minehot.com",
                "iat" => time(),
                "exp" => time() + $JWT_DURABILITY,
                "user_id" => $user,
                "user_email" => ($userEmail == null ? "" : $userEmail)
            );
            $jwt = JWT::encode($payload, $JWT_PRIVATE_KEY, 'RS256');
            echo json_encode(array(
                "code" => 0,
                "token" => $jwt
            ));
        } else {
            echo json_encode(array("code" => 3));
        }
    } else {
        echo json_encode(array("code" => 2));
    }
    $stmt->close();
    $conn->close();
}

if($endpoint == "send-card") {
    $token = getParam("token");
    if(strlen($token) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }
    $payload = (array) JWT::decode($token, $JWT_PUBLIC_KEY, array('RS256'));
    $user = $payload["user_id"];

    $code = getParam("code");
    $serial = getParam("serial");
    $provider = getParam("provider");
    $server = getParam("server");
    $amount = getParam("amount");
    if(strlen($code) == 0 || strlen($serial) == 0 || strlen($provider) == 0 || strlen($server) == 0 || strlen($amount) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }

    // Check amount
    if(!is_numeric($amount)){
        echo json_encode(array("code" => 1));
        return;
    }
    $amount = intval($amount);
    if(!in_array($amount, [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000, 2000000])){
        echo json_encode(array("code" => 5));
        return;
    }

    // Check server
    if(!array_key_exists($server, $servers)) {
        echo json_encode(array("code" => 3));
        return;
    }

    // Check card provider, check if enabled, get bonus rate
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 6));
        return;
    }
    $res = [];
    $stmt = $conn->prepare("select bonus, enabled from donate_provider where `name`=?");
    $stmt->bind_param("s", $provider);
    $stmt->execute();
    $stmt->bind_result($bonus, $providerEnabled);
    if ($stmt->fetch()) {
        $stmt->close();
        $conn->close();
        if(!$providerEnabled) {
            echo json_encode(array("code" => 4));
            return;
        }
    } else {
        echo json_encode(array("code" => 4));
        $stmt->close();
        $conn->close();
        return;
    }

    // Send & add to queue
    $headers = array('Content-Type' => 'application/json');
    $reqId = rand(100000000, 999999999);
    $data = array(
        "request_id" => $reqId,
        "code" => $code,
        "partner_id" => $CARD_PARTNER_ID,
        "serial" => $serial,
        "telco" => $provider,
        "command" => "charging"
    );
    ksort($data);
    $sign = $CARD_PARTNER_KEY;
    foreach ($data as $item) {
        $sign .= $item;
    }
    $data["sign"] = md5($sign);
    $data["amount"] = $amount;
    $response = Requests::post("https://thesieure.com/chargingws/v2", $headers, json_encode($data));
    if (!$response->success) {
        echo json_encode(array("code" => 6));
        return;
    }

    $logs = fopen("charging.log", 'a') or die("cant open file");

    fwrite($logs, $response->body);
    fwrite($logs,"\r\n");
    fclose($logs);

    $body = (array) json_decode($response->body);
    $status = intval($body["status"]);

    $realAmount = $body["value"];
    $realAmount = $realAmount == null ? 0 : $realAmount;
    $realAmount = ($status == 1 || $status == 2) ? $realAmount : 0;
    require_once "card.php";
    if(handleSentCard($user, $server, $reqId, $status, $amount, $realAmount, $bonus, $code, $serial, $provider)){
        echo json_encode(array("code" => 0));
    } else {
        echo json_encode(array("code" => 6));
    }
}

if($endpoint == "get-transactions") {
    $res = [];
    $conn = new mysqli($dbHost, $cardDbUser, $cardDbPass, $cardDbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 2));
        return;
    }
    $stmt = $conn->prepare("SELECT `USER`, `SENDVALUE`, `SERVER`, `STATUS`, `SERI`, `TYPE`, `DATE` FROM `transations` ORDER BY `DATE` DESC LIMIT 10");
    $stmt->execute();
    $stmt->bind_result($user, $amount, $server, $status, $serial, $type, $date);
    while ($stmt->fetch()) {
        array_push($res, array(
            "user" => hideStr($user),
            "amount" => $amount,
            "server" => array_key_exists($server, $servers) ? $servers[$server]["name"] : $server,
            "status" => $status,
            "type" => $type,
            "date" => $date,
            "serial" => hideStr($serial)
        ));
    }
    $stmt->close();
    $conn->close();
    echo json_encode(array(
        "code" => 0,
        "result" => $res
    ));
}

if($endpoint == "get-info") {
    $token = getParam("token");
    if(strlen($token) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }
    $payload = (array) JWT::decode($token, $JWT_PUBLIC_KEY, array('RS256'));
    $user = $payload["user_id"];

    $res = array();
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 4));
        return;
    }
    $stmt = $conn->prepare("select user_registered, display_name, last_ip, last_login, user_email from wp_users where user_login=?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->bind_result($registerDate, $displayName, $lastIp, $lastLogin, $email);
    if ($stmt->fetch()) {
        $res = array(
            "registerDate" => $registerDate,
            "displayName" => $displayName,
            "lastIp" => $lastIp,
            "lastLogin" => $lastLogin,
            "email" => hideStr($email)
        );
    }
    $stmt->close();
    $conn->close();
    echo json_encode(array(
        "code" => 0,
        "result" => $res
    ));
}

if($endpoint == "get-donation-top") {
    $conn = new mysqli($dbHost, $cardDbUser, $cardDbPass, $cardDbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 1));
        return;
    }
    $res = array();
    $stmt = $conn->prepare("SELECT `USER`, SUM(`REALVALUE`) FROM `transations` WHERE year(`DATE`) = year(NOW()) and month(`DATE`) = month(NOW()) GROUP BY `USER` ORDER BY SUM(`REALVALUE`) DESC LIMIT 5");
    $stmt->execute();
    $stmt->bind_result($user, $sum);
    while ($stmt->fetch()) {
        $res[$user] = $sum;
    }
    $stmt->close();
    $conn->close();
    echo json_encode(array(
        "code" => 0,
        "result" => $res
    ));
}

if($endpoint == "change-password") {
    $token = getParam("token");
    if(strlen($token) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }
    $payload = (array) JWT::decode($token, $JWT_PUBLIC_KEY, array('RS256'));
    $user = $payload["user_id"];

    $pass1 = getParam("pass1");
    if(strlen($pass1) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }

    $pass2 = getParam("pass2");
    if(strlen($pass2) < 8 || strlen($pass2) > 30) {
        echo json_encode(array("code" => 3));
        return;
    }

    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 4));
        return;
    }

    // check duplication
    $stmt = $conn->prepare("SELECT `user_pass` FROM `wp_users` WHERE `user_login` = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->bind_result($currPass);
    if($stmt->fetch()){
        $stmt->close();
        if($hasher->CheckPassword($pass1, $currPass)) {
            $pass2 = $hasher->HashPassword($pass2);
            $stmt = $conn->prepare("UPDATE `wp_users` SET `user_pass` = ? WHERE `user_login` = ?");
            $stmt->bind_param("ss", $pass2, $user);
            echo json_encode(array("code" => $stmt->execute() ? 0 : 4));
            $stmt->close();
        } else {
            echo json_encode(array("code" => 2));
        }
    } else {
        $stmt->close();
        echo json_encode(array("code" => 4));
    }
    $conn->close();
}

if($endpoint == "recover-password") {
    $user = getParam("user");
    if(strlen($user) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }
    $captcha = getParam("captcha");
    if(strlen($captcha) == 0) {
        echo json_encode(array("code" => 3));
        return;
    }
    $recaptcha = new ReCaptcha($CAPTCHA_SECRET);
    $resp = $recaptcha->verify($captcha);
    if (!$resp->isSuccess()) {
        echo json_encode(array("code" => 4));
        return;
    }

    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 5));
        return;
    }

    $stmt = $conn->prepare("SELECT `user_email` FROM `wp_users` WHERE `user_login` = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->bind_result($email);
    if($stmt->fetch()){
        $stmt->close();
        if($email == null || strlen($email) == 0) {
            $conn->close();
            echo json_encode(array("code" => 6));
            return;
        }
        $verifyCode = md5(rand(0, 99999)) . md5($email . $user);
        $stmt = $conn->prepare("UPDATE `wp_users` SET `recovery_code` = ? WHERE `user_login` = ?");
        $stmt->bind_param("ss", $verifyCode, $user);
        if($stmt->execute()){
            $stmt->close();
            $link = "https://taikhoan.minehot.com/recover.php?code=$verifyCode";
            $mail = new PHPMailer(true);
            $body =
<<<EOD
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300&display=swap" rel="stylesheet"> 
<div style="font-family: 'Work Sans', sans-serif;">
  <p>Xin chào <b>$user</b>,</p>
  <p>Gần đây, bạn đã gửi một yêu cầu khôi phục tài khoản.</p>
  <p>Để tiến hành đặt mật khẩu mới cho tài khoản, bạn vui lòng truy cập đường dẫn sau đây:</p>
  <a href="$link" style="border: #c73d28 2px solid; padding: 5px"><b>$link</b></a>
  <p>Nếu bạn cho rằng bức thư này là một sự nhầm lẫn thì rất có thể ai đó đang cố gắng truy cập vào tài khoản của bạn tại Minehot. Bạn có thể bỏ qua bức thư này nếu muốn.</p>
  <p>Chúc bạn chơi game vui vẻ tại server Minehot.</p>
  <p>IP server: minehot.com</p>
</div>
EOD;
            try {
                //$mail->SMTPDebug = SMTP::DEBUG_SERVER;
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = $SMTP_USER;
                $mail->Password   = $SMTP_PASS;
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
                $mail->Port       = 465;
                $mail->CharSet   = "utf-8";
                $mail->setFrom($SMTP_USER, $SMTP_NAME);
                $mail->addAddress($email, $user);
                $mail->addReplyTo($SMTP_USER, $SMTP_NAME);
                $mail->isHTML(true);
                $mail->Subject = 'Xác nhận yêu cầu khôi phục tài khoản';
                $mail->Body    = $body;
                $mail->send();
                echo json_encode(array("code" => 0, "email" => hideStr($email)));
            } catch (Exception $e) {
                echo json_encode(array("code" => 5));
            }
        } else {
            $stmt->close();
            echo json_encode(array("code" => 5));
        }
    } else {
        $stmt->close();
        echo json_encode(array("code" => 2));
    }
    $conn->close();
}

if($endpoint == "change-email") {
    $token = getParam("token");
    if(strlen($token) == 0) {
        echo json_encode(array("code" => 1));
        return;
    }
    $payload = (array) JWT::decode($token, $JWT_PUBLIC_KEY, array('RS256'));
    $user = $payload["user_id"];

    $email = getParam("email");
    if(strlen($email) == 0 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(array("code" => 1));
        return;
    }

    $captcha = getParam("captcha");
    if(strlen($captcha) == 0) {
        echo json_encode(array("code" => 2));
        return;
    }
    $recaptcha = new ReCaptcha($CAPTCHA_SECRET);
    $resp = $recaptcha->verify($captcha);
    if (!$resp->isSuccess()) {
        echo json_encode(array("code" => 3));
        return;
    }

    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        echo json_encode(array("code" => 4));
        return;
    }

    $verifyCode = md5(rand(0, 99999)) . md5($email . $user);
    $stmt = $conn->prepare("UPDATE `wp_users` SET `verify_code` = ?, `pending_email` = ? WHERE `user_login` = ?");
    $stmt->bind_param("sss", $verifyCode, $email, $user);
    if($stmt->execute()){
        $stmt->close();
        $link = "https://taikhoan.minehot.com/change-email.php?code=$verifyCode";
        $mail = new PHPMailer(true);
        $body =
            <<<EOD
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300&display=swap" rel="stylesheet"> 
<div style="font-family: 'Work Sans', sans-serif;">
  <p>Xin chào <b>$user</b>,</p>
  <p>Gần đây, bạn đã gửi một yêu cầu đổi email.</p>
  <p>Để tiến hành xác nhận email mới cho tài khoản, bạn vui lòng truy cập đường dẫn sau đây:</p>
  <a href="$link" style="border: #c73d28 2px solid; padding: 5px"><b>$link</b></a>
  <p>Nếu bạn cho rằng bức thư này là một sự nhầm lẫn thì rất có thể ai đó đang cố gắng truy cập vào tài khoản của bạn tại Minehot. Bạn có thể bỏ qua bức thư này nếu muốn.</p>
  <p>Chúc bạn chơi game vui vẻ tại server Minehot.</p>
  <p>IP server: minehot.com</p>
</div>
EOD;
        try {
            //$mail->SMTPDebug = SMTP::DEBUG_SERVER;
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $SMTP_USER;
            $mail->Password   = $SMTP_PASS;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = 465;
            $mail->CharSet   = "utf-8";
            $mail->setFrom($SMTP_USER, $SMTP_NAME);
            $mail->addAddress($email, $user);
            $mail->addReplyTo($SMTP_USER, $SMTP_NAME);
            $mail->isHTML(true);
            $mail->Subject = 'Xác nhận yêu cầu đổi email';
            $mail->Body    = $body;
            $mail->send();
            echo json_encode(array("code" => 0, "email" => $email));
        } catch (Exception $e) {
            echo json_encode(array("code" => 4));
        }
    } else {
        $stmt->close();
        echo json_encode(array("code" => 4));
    }
    $conn->close();
}
