<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MineHot | Khôi phục tài khoản</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>
<body>
    <div class="container p-3">
        <h1>Khôi phục tài khoản</h1>
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

        if(array_key_exists("pass", $_POST)) {
            require_once "./api/PasswordHash.php";
            $hasher = new PasswordHash(8, true);
            $pass = $hasher->HashPassword($_POST["pass"]);
            $codeEmpty = "";
            $stmt = $conn->prepare("UPDATE `wp_users` SET `user_pass` = ?, `recovery_code` = ? WHERE `recovery_code` = ?");
            $stmt->bind_param("sss", $pass, $codeEmpty, $code);
            $stmt->execute();
            $stmt->close();
            ?>
            <p>Khôi phục tài khoản thành công! Nhấn vào đây để đăng nhập:</p>
            <a href="https://taikhoan.minehot.com">https://taikhoan.minehot.com</a>
            <?php
            return;
        } else {
            $stmt = $conn->prepare("SELECT `user_login` FROM `wp_users` WHERE `recovery_code` = ?");
            $stmt->bind_param("s", $code);
            $stmt->execute();
            $stmt->bind_result($user);
            if (!$stmt->fetch()) {
                echo "Mã khôi phục bị lỗi hoặc hết hạn.";
                $stmt->close();
                return;
            }
            $stmt->close();
        }
        $conn->close();
        ?>
        <form method="post" action="#">
            <div class="mb-3">
                <label for="user" class="form-label">Tài khoản</label>
                <input type="text" class="form-control" id="user" value="<?php echo $user; ?>" disabled/>
            </div>
            <div class="mb-3">
                <label for="pass" class="form-label">Mật khẩu mới</label>
                <input type="password" class="form-control" id="pass" name="pass"/>
                <div class="form-text">
                    <ul>
                        <li>Mật khẩu dài từ 8-30 kí tự.</li>
                        <li>Không đặt các mật khẩu dễ như “123456” tránh bị mất tài khoản</li>
                        <li>Nên đặt mật khẩu bao gồm chữ cái, số và ký tự đặc biệt</li>
                    </ul>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Xác nhận</button>
        </form>
    </div>
</body>
</html>
