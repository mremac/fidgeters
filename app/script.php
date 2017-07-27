<?php 
header("Access-Control-Allow-Origin: *");
$errors = '';
$myemail = 'nil@fidgeters.co.uk';
if( empty($_POST['title']) ||
    empty($_POST['name'])  ||
    empty($_POST['email']) ||
    empty($_POST['model']))
{
    $errors .= "\n Error: all fields are required";
}
$title = $_POST['title'];
$name = $_POST['name'];
$email_address = $_POST['email'];
$model_id = $_POST['model'];
//if (!preg_match(
//"/ ^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/i",
//$email_address))
//{
//    $errors .= "\n Error: Invalid email address";
//}
//if($errors=='')
//{
    $to = $email_address;
    $email_subject = "Contact form submission: $title. $name";
    $email_body = "$title $name, here is your selected model: $model_id";
    $headers = "From: $myemail";
    $send = mail($to,$email_subject,$email_body,$headers);
    //var_dump($send);
//}
?>