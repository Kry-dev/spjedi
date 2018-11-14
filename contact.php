<?php
    $recepient = "info@spjedi.com";
//    $recepient = "yaroslavkryvda@gmail.com";
    $subject = trim($_POST["subject"]);

    $name = trim($_POST["name"]);
    $email = trim($_POST["email"]);
    $text = trim($_POST["message"]);
    $message = "Name: $name \nEmail: $email \nMessage: $text";

    $pagetitle = "Subject: \"$subject\"";
    mail($recepient, $pagetitle, $message, "Content-type: text/plain; charset=\"utf-8\"\n From: $recepient");
?>
