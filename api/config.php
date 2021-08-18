<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL ^ E_NOTICE);

$dbHost = "localhost";
$dbUser = "root";
$dbPass = "root";
$dbName = "minehot";

$cardDbUser = "root";
$cardDbPass = "root";
$cardDbName = "card";

/*create table donate_provider
(
	name varchar(30) not null,
	enabled boolean default true not null,
	bonus double default 0 not null,
	constraint donate_provider_pk
		primary key (name)
);*/

/*create table donate_collection
(
    user      varchar(30)      not null,
    server    text             not null,
    collected bigint default 0 not null
);*/

$servers = array(
    "test" => array(
        "name" => "Test Server",
        "dbUser" => "root",
        "dbPass" => "",
        "dbName" => "test"
    )
);

$JWT_PRIVATE_KEY = <<<EOD

EOD;
$JWT_PUBLIC_KEY = <<<EOD
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWwqoUKduJajTA8HJnOiFei5Ox
/RFNVdt2zQgqO9OJFRQlUAQbiFk3O8J5wQeXqMyAMB9fPZTu2igCJXY4F9EFFVhE
raV1P97oEPEIt4zBuj+TjJeo9qPz66chiaUUxd/PSxsVEO0lGsERHlD4G96YZzP6
GzFbTJ5L/vNxSrW5OQIDAQAB
-----END PUBLIC KEY-----
EOD;
$JWT_DURABILITY = 24 * 60 * 60;

$CARD_PARTNER_ID = "";
$CARD_PARTNER_KEY = "";

$CAPTCHA_SECRET = "";

$SMTP_NAME = "";
$SMTP_USER = "";
$SMTP_PASS = "";

function offlinePlayerUuid($username): string{
    $data = hex2bin(md5("OfflinePlayer:" . $username));
    //set the version to 3 -> Name based md5 hash
    $data[6] = chr(ord($data[6]) & 0x0f | 0x30);
    //IETF variant
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return createJavaUuid(bin2hex($data));
}

function createJavaUuid($striped): string{
    $components = array(
        substr($striped, 0, 8),
        substr($striped, 8, 4),
        substr($striped, 12, 4),
        substr($striped, 16, 4),
        substr($striped, 20),
    );
    return implode('-', $components);
}
