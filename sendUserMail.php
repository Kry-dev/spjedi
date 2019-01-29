<?php
    $to = "info@spjedi.com"; // this is your Email address*/
    $email = $_POST['email'];// this is the sender's Email address
    $from = $email; // this is the sender's Email address
    $page = $_SERVER["HTTP_REFERER"];
    $subject = "Branding Demo Site";
    $message = "I got instant access to the slim site\nFrom email: $email \nFrom page: $page";

    $headers = "From:" . $from;
    mail($to,$subject,$message,$headers);
?>

