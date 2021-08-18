<?php
/** @noinspection PhpUndefinedVariableInspection */
require_once "config.php";
$obj = (array) json_decode(file_get_contents("php://input"));

$logs = fopen("callback.log", 'a') or die("cant open file");

fwrite($logs, json_encode(file_get_contents("php://input")));
fwrite($logs,"\r\n");
fclose($logs);

//1: Thẻ thành công đúng mệnh giá
//2: Thẻ thành công sai mệnh giá
//3: Thẻ lỗi
//4: Hệ thống bảo trì
//99: Thẻ chờ xử lý
//100: Gửi thẻ thất bại - Có lý do đi kèm ở phần thông báo trả về

$status = $obj["status"];
$code = $obj["code"];
$serial = $obj["serial"];
$callback_sign = md5($CARD_PARTNER_KEY . $code. $serial);

function getBonusRate(string $provider): float {
    global $dbHost;
    global $dbUser;
    global $dbPass;
    global $dbName;
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        return 0;
    }
    $stmt = $conn->prepare("select bonus from donate_provider where name=?");
    $stmt->bind_param("s", $provider);
    $stmt->execute();
    $stmt->bind_result($bonus);
    if ($stmt->fetch()) {
        $stmt->close();
        $conn->close();
        return $bonus;
    } else {
        $stmt->close();
        $conn->close();
        return 0;
    }
}

if ($callback_sign == $obj["callback_sign"] && $status != 99) {
    $reqId = $obj["request_id"];
    $telco =  $obj["telco"];
    $amount = $obj["value"]; // actual amount without fee

    $conn = new mysqli($dbHost, $cardDbUser, $cardDbPass, $cardDbName);
    if (!$conn->connect_error) {
        $stmt1 = $conn->prepare("SELECT `USER`, `SERVER`, `STATUS` FROM `transations` WHERE REQUEST = ? AND CODE = ? AND SERI = ?");
        $stmt1->bind_param("sss", $reqId, $code, $serial);
        $stmt1->execute();
        $stmt1->bind_result($user, $server, $lastStatus);
        if($stmt1->fetch()){
            $stmt1->close();
            if($lastStatus == 99) {
                if($status == 1 || $status == 2) {
                    $bonus = getBonusRate($telco);
                    $stmt2 = $conn->prepare("UPDATE `transations` SET `STATUS` = ?, `REALVALUE` = ? WHERE REQUEST = ? AND CODE = ? AND SERI = ?");
                    $stmt2->bind_param("iisss", $status, $amount, $reqId, $code, $serial);
                    $stmt2->execute();
                    $stmt2->close();
                    require_once "card.php";
                    addBonusPoints($user, $server, $amount * ($status == 2 ? 0.5 : 1));
                    $points = $amount * ($status == 2 ? 0.5 : 1) * (1 + $bonus * 0.01) / 1000;
                    addPoints($user, $server, $points);
                } else {
                    $stmt2 = $conn->prepare("UPDATE `transations` SET `STATUS` = ? WHERE REQUEST = ? AND CODE = ? AND SERI = ?");
                    $stmt2->bind_param("isss", $status, $reqId, $code, $serial);
                    $stmt2->execute();
                    $stmt2->close();
                }
            }
        }
    }
    $conn->close();
}
