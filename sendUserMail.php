<?php
/*
    $to = 'yaroslavkryvda@gmail.com'; //Почта получателя, через запятую можно указать сколько угодно адресов
    $page = $_SERVER["HTTP_REFERER"];
    $email = trim($_POST["email"]);
    $from = $email;
    $subject = "$email \n From: $page"; //Загаловок сообщения
    $message = "User email is: $email \nFrom page: $page";
    mail($to, $subject, $message, "Content-type: text/plain; charset=\"utf-8\"\n User mail is: $email");
*/

    /*$to = "yaroslavkryvda@gmail.com"; // this is your Email address*/
    $to = "yay89@mail.ru"; // this is your Email address
    $email = $_POST['email'];// this is the sender's Email address
    $from = $email; // this is the sender's Email address
    $page = $_SERVER["HTTP_REFERER"];
    $subject = "Spjedi's user send you email";
    $message = "User email is: $email \nFrom page: $page";

    $headers = "From:" . $from;
    mail($to,$subject,$message,$headers);
?>

