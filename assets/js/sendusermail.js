$(".sendUserMail").submit(function (e) { //устанавливаем событие отправки для формы
    e.preventDefault();
    $.ajax({
        type: "POST", //Метод отправки
        url: "sendUserMail.php", //путь до php фаила отправителя
        data: $(this).serialize()
    }).done(function () {
        $(this).find('input').val();
        $('#messageModal').modal('show');
        ShowDemoSite();
    });
    return false;
});
function ShowDemoSite() {
    if ($("#txtSiteDemoEmail").val().indexOf("@") > 0) {
        window.open('http://spjedi.com/project-management.html', '_blank');
    }else {
        $('#messageModalError').modal('show');
        return false;
    }
    return false;
}
// $('#btnSeeDemo').on('click', function () {
//     ShowDemoSite();
// });