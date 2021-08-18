<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MineHot | Đổi email</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>
<body>
    <div class="container p-3">
        <h1>Đổi email</h1>
        <?php
        if(!array_key_exists("code", $_GET)) {
            echo "ERROR";
            return;
        }
        $code = $_GET["code"];
        require_once "./api/config.php";

        $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
        if ($conn->connect_error) {
            echo "Lỗi hệ thống, vui lòng liên hệ admin";
            return;
        }

        $stmt = $conn->prepare("SELECT `user_login`, `pending_email` FROM `wp_users` WHERE `verify_code` = ?");
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $stmt->bind_result($user, $email);
        if ($stmt->fetch()) {
            $stmt->close();
            $empty = "";
            $stmt = $conn->prepare("UPDATE `wp_users` SET `pending_email` = ?, `user_email` = ?, `verify_code` = ? WHERE `user_login` = ?");
            $stmt->bind_param("ssss", $empty, $email, $empty, $user);
            if($stmt->execute()){
                $stmt->close();
                ?>
                <p>Đổi email thành công! Nhấn vào đây để quay về trang tài khoản:</p>
                <a href="https://taikhoan.minehot.com">https://taikhoan.minehot.com</a>
                <?php
            } else {
                $stmt->close();
                echo "ERROR";
            }
        } else {
            $stmt->close();
            echo "Mã xác minh bị lỗi hoặc hết hạn.";
        }
        $conn->close();
        ?>
    </div>
</body>
</html>
