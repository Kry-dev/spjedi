
<?php
    $to = 'yaroslavkryvda@gmail.com'; //Почта получателя, через запятую можно указать сколько угодно адресов
    $subject = 'User\'s email from portfolio pages spjedi.com'; //Загаловок сообщения
    $email = trim($_POST["email"]);
    $message = '
        <html>
            <head>
                <title>'.$subject.'</title>
            </head>
            <body>
                <p>User Email is: '.$email.'</p>
            </body>
        </html>'; //Текст нащего сообщения можно использовать HTML теги
    $headers  = "Content-type: text/html; charset=utf-8 \r\n"; //Кодировка письма
    $headers .= "From: User Email is: $email\r\n"; //Наименование и почта отправителя
    mail($to, $subject, $message, $headers); //Отправка письма с помощью функции mail
?>