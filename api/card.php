<?php
/** @noinspection PhpUndefinedVariableInspection */
require_once "config.php";

//1: Thẻ thành công đúng mệnh giá
//2: Thẻ thành công sai mệnh giá
//3: Thẻ lỗi
//4: Hệ thống bảo trì
//99: Thẻ chờ xử lý
//100: Gửi thẻ thất bại - Có lý do đi kèm ở phần thông báo trả về

function handleSentCard(string $user, string $server, string $requestId, int $status, int $amount, int $realAmount, float $bonus, string $code, string $serial, string $telco): bool {
    global $dbHost;
    global $cardDbUser;
    global $cardDbPass;
    global $cardDbName;
    $logs = fopen("sent.log", 'a') or die("cant open file");
    fwrite($logs, json_encode(file_get_contents("php://input")));
    fwrite($logs,"\r\n");
    fclose($logs);

    $conn = new mysqli($dbHost, $cardDbUser, $cardDbPass, $cardDbName);
    if ($conn->connect_error) {
        return false;
    }
    $stmt = $conn->prepare("INSERT INTO `transations`(`USER`, `SERVER`, `REQUEST`, `STATUS`, `REALVALUE`, `SENDVALUE`, `CODE`, `SERI`, `TYPE`)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssiiisss", $user, $server, $requestId, $status, $realAmount, $amount, $code, $serial, $telco);
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        if($status == 1 || $status == 2) {
            addBonusPoints($user, $server, $realAmount);
            return addPoints($user, $server, $realAmount * (1 + $bonus * 0.01) / 1000);
        }
        return true;
    } else {
        $stmt->close();
        $conn->close();
        return false;
    }
}

function addPoints(string $user, string $server, int $points): bool {
    global $dbHost;
    global $servers;
    $logs = fopen("add_points.log", 'a') or die("cant open file");
    fwrite($logs, json_encode(file_get_contents("php://input")));
    fwrite($logs,"\r\n");
    fclose($logs);

    $uuid = offlinePlayerUuid($user);
    $sv = $servers[$server];
    $conn = new mysqli($dbHost, $sv["dbUser"], $sv["dbPass"], $sv["dbName"]);
    if ($conn->connect_error) {
        return false;
    }
    $stmt = $conn->prepare("SELECT points from `playerpoints` WHERE playername=?");
    $stmt->bind_param("s", $uuid);
    $stmt->execute();
    if(!$stmt->fetch()) {
        $stmt->close();
        $stmt = $conn->prepare("insert into playerpoints (playername, points) values (?, ?)");
        $stmt->bind_param("s", $uuid, $points);
        if($stmt->execute()) {
            $stmt->close();
            $conn->close();
            return true;
        } else{
            $stmt->close();
            $conn->close();
            return false;
        }
    }
    $stmt->close();

    $stmt = $conn->prepare("UPDATE `playerpoints` SET `points` = `points` + ? WHERE playername = ?");
    $stmt->bind_param("is", $points, $uuid);
    if($stmt->execute()){
        $stmt->close();
        $conn->close();
        return true;
    } else{
        $stmt->close();
        $conn->close();
        return false;
    }
}

function addBonusPoints($user, $server, $points){
    global $dbHost;
    global $dbUser;
    global $dbPass;
    global $dbName;
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        return;
    }
    $stmt1 = $conn->prepare("select collected from donate_collection where `user`=? and `server`=?");
    $stmt1->bind_param("ss", $user, $server);
    $stmt1->execute();
    if ($stmt1->fetch()) {
        $stmt1->close();
        $stmt2 = $conn->prepare("UPDATE `donate_collection` SET `collected` = `collected` + ? WHERE `user` = ? and `server`=?");
        $stmt2->bind_param("iss", $points, $user, $server);
    } else {
        $stmt1->close();
        $stmt2 = $conn->prepare("insert into `donate_collection` (`user`, `server`, `collected`) values (?, ?, ?)");
        $stmt2->bind_param("ssi", $user, $server, $points);
    }
    $stmt2->execute();
    $stmt2->close();
    $conn->close();
}
