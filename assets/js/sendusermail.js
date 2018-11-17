$(".sendUserMail").submit(function (e) { //устанавливаем событие отправки для формы
    e.preventDefault();
    $.ajax({
        type: "POST", //Метод отправки
        url: "sendUserMail.php", //путь до php фаила отправителя
        data: $(this).serialize()
    }).done(function () {
        var form = $('.sendUserMail');
        form.find('input').val();
        $('#messageModal').modal('show');
        setTimeout(function() {form.closest('.modal').modal('hide');}, 500);
        setTimeout(function() {$('#messageModal').modal('hide');}, 2000);
        //setTimeout(function() { ShowDemoSite();}, 2500);
    });
    return false;
});
$('.btnSeeDemo').on('click', function (e) {
    e.preventDefault();
    console.log('click');
    var aHref = $(this).attr('href');
    console.log(aHref);
    if ($("#txtSiteDemoEmail").val().indexOf("@") > 0) {
        $(".sendUserMail").submit();
        setTimeout(function() { window.open(aHref, '_blank');}, 2500);
    } else {
        $('#messageModalError').modal('show');
        return false;
    }
});
function ShowDemoSite() {
    if ($("#txtSiteDemoEmail").val().indexOf("@") > 0) {
        window.open('http://spjedi.com/project-management.html', '_blank');
    } else {
        $('#messageModalError').modal('show');
        return false;
    }
    return false;
}
// $('#btnSeeDemo').on('click', function () {
//     ShowDemoSite();
// });