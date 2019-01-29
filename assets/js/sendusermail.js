// $(".sendUserMail").submit(function (e) { //event for sending form
//     e.preventDefault();
//     $.ajax({
//         type: "POST", //sending method
//         url: "sendUserMail.php", //way to php file of sender
//         data: $(this).serialize()
//     }).done(function () {
//         var form = $('.sendUserMail');
//         form.find('input').val();
//         $('#messageModal').modal('show');
//         setTimeout(function() {form.closest('.modal').modal('hide');}, 500);
//         setTimeout(function() {$('#messageModal').modal('hide');}, 2000);
//         //setTimeout(function() { ShowDemoSite();}, 2500);
//     });
//     return false;
// });
$('.btnSeeDemo').on('click', function (e) {
    e.preventDefault();
    var userEmailField = $("#txtSiteDemoEmail");
    var userEmailVal = userEmailField.val();
    console.log(userEmailVal);
    console.log('click');
    var aHref = $(this).attr('href').replace(/[^a-zA-Z0-9-_\.]/g, '');
    console.log(aHref);
    if (userEmailVal.indexOf("@") > 0) {
        $.ajax({
            type: "POST",
            url: "https://mandrillapp.com/api/1.0/messages/send.json",
            data: {
                'key': 'qUnNKSqipOc7_rXIySQLFw',
                'message': {
                    'from_email': 'info@spjedi.com',
                    'from_name': userEmailVal,
                    'headers': {
                        'Reply-To': userEmailVal
                    },
                    'subject': 'Branding '+ aHref + ' Demo Site',
                    'text': 'Text: I got instant access to the slim site  From Email : ' + userEmailVal,
                    'to': [
                        {
                            'email': 'info@spjedi.com',
                            // 'email': 'yaroslavkryvda@gmail.com',
                            'name': 'Jed Elliott',
                            'type': 'to'
                        }
                    ]
                }
            }
        }).done(function () {
            var form = $('.sendUserMail');
            form.find('input').val();
            userEmailField.val('');
            // form .submit();
            $('#messageModal').modal('show');
            setTimeout(function () {
                form.closest('.modal').modal('hide');
            }, 500);
            setTimeout(function () {
                $('#messageModal').modal('hide');
            }, 2000);
            //setTimeout(function() { ShowDemoSite();}, 2500);

            setTimeout(function() { window.open(aHref, '_blank');}, 2500);
            $('.status-message').addClass('hidden');
            $('.status-message.text-success').removeClass('hidden');
        })
    }
    else {
        $('.status-message').addClass('hidden');
        $('.status-message.text-danger').removeClass('hidden');
        $('#messageModalError').modal('show');
        return false;
    }
    function ShowDemoSite() {
        if ($("#txtSiteDemoEmail").val().indexOf("@") > 0) {
            window.open('http://spjedi.com/project-management.html', '_blank');
        } else {
            $('#messageModalError').modal('show');
            return false;
        }
        return false;
    }
});
// $('#btnSeeDemo').on('click', function () {
//     ShowDemoSite();
// });